package com.fincore.service.impl;

import com.fincore.dto.transfer.*;
import com.fincore.entity.*;
import com.fincore.enums.*;
import com.fincore.exception.*;
import com.fincore.repository.*;
import com.fincore.service.AuditService;
import com.fincore.service.NotificationService;
import com.fincore.service.TransferService;
import com.fincore.util.AccountNumberGenerator;
import com.fincore.util.ReferenceGenerator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class TransferServiceImpl implements TransferService {

    private static final Logger log = LoggerFactory.getLogger(TransferServiceImpl.class);

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final TransactionEntryRepository entryRepository;
    private final TransactionTypeRepository transactionTypeRepository;
    private final TransferRequestRepository transferRequestRepository;
    private final TransactionLimitRepository limitRepository;
    private final NotificationService notificationService;
    private final AuditService auditService;

    public TransferServiceImpl(AccountRepository accountRepository,
                               UserRepository userRepository,
                               TransactionRepository transactionRepository,
                               TransactionEntryRepository entryRepository,
                               TransactionTypeRepository transactionTypeRepository,
                               TransferRequestRepository transferRequestRepository,
                               TransactionLimitRepository limitRepository,
                               NotificationService notificationService,
                               AuditService auditService) {
        this.accountRepository = accountRepository;
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
        this.entryRepository = entryRepository;
        this.transactionTypeRepository = transactionTypeRepository;
        this.transferRequestRepository = transferRequestRepository;
        this.limitRepository = limitRepository;
        this.notificationService = notificationService;
        this.auditService = auditService;
    }

    @Override
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public TransferResponseDto executeTransfer(Long userId, TransferRequestDto request, String clientIp) {
        log.info("Processing transfer request from user {} for amount {}", userId, request.getAmount());

        // 1. Idempotency Check
        String idempotencyKey = (request.getIdempotencyKey() != null && !request.getIdempotencyKey().trim().isEmpty())
                ? request.getIdempotencyKey().trim()
                : ReferenceGenerator.generateIdempotencyKey();

        Optional<TransferRequest> existingRequest = transferRequestRepository.findByIdempotencyKey(idempotencyKey);
        if (existingRequest.isPresent()) {
            TransferRequest prev = existingRequest.get();
            if (prev.getRequestStatus() == TransferRequestStatus.COMPLETED && prev.getTransaction() != null) {
                log.info("Duplicate idempotency key '{}' received. Returning previous transaction.", idempotencyKey);
                Transaction tx = prev.getTransaction();
                TransferResponseDto response = new TransferResponseDto();
                response.setTransactionReference(tx.getTransactionReference());
                response.setSourceAccountNumber(tx.getSourceAccount().getAccountNumber());
                response.setDestinationAccountNumber(tx.getDestinationAccount().getAccountNumber());
                response.setDestinationAccountName(tx.getDestinationAccount().getAccountName());
                response.setAmount(tx.getAmount());
                response.setCurrencyCode(tx.getCurrencyCode());
                response.setStatus(tx.getStatus());
                response.setDescription(tx.getDescription());
                response.setSourceRemainingBalance(tx.getSourceAccount().getBalance());
                response.setTimestamp(tx.getCompletedAt());
                return response;
            } else if (prev.getRequestStatus() == TransferRequestStatus.PROCESSING) {
                throw new DuplicateRequestException("Transfer request with idempotency key is currently processing. Please wait.");
            }
        }

        // 2. Validate requester user
        User requester = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (requester.getAccountStatus() != UserStatus.ACTIVE) {
            throw new AccountLockedException("Your user profile is blocked or pending verification");
        }

        // 3. Pre-validate accounts existence
        Account preSource = accountRepository.findById(request.getSourceAccountId())
                .orElseThrow(() -> new ResourceNotFoundException("Source account not found"));

        if (!preSource.getUser().getUserId().equals(userId)) {
            throw new UnauthorizedAccessException("You are not the authorized owner of source account: " + preSource.getAccountNumber());
        }

        Account preDest = accountRepository.findByAccountNumber(request.getDestinationAccountNumber().trim())
                .orElseThrow(() -> new BadRequestException("Destination account number does not exist"));

        if (preSource.getAccountId().equals(preDest.getAccountId())) {
            throw new InvalidTransactionException("Source and destination accounts must be distinct");
        }

        if (preSource.getAccountStatus() != AccountStatus.ACTIVE) {
            throw new AccountLockedException("Source account is not active (Status: " + preSource.getAccountStatus() + ")");
        }

        if (preDest.getAccountStatus() != AccountStatus.ACTIVE) {
            throw new AccountLockedException("Destination account is currently inactive or frozen");
        }

        BigDecimal transferAmount = request.getAmount();

        // 4. Validate Transfer Limits
        if (preSource.getAccountType() != null) {
            Optional<TransactionLimit> limitOpt = limitRepository.findByAccountTypeAccountTypeIdAndActiveTrue(
                    preSource.getAccountType().getAccountTypeId());

            if (limitOpt.isPresent()) {
                TransactionLimit limit = limitOpt.get();
                if (transferAmount.compareTo(limit.getMaximumSingleTransfer()) > 0) {
                    throw new InvalidTransactionException("Transfer amount exceeds maximum single transfer limit of ₹" + limit.getMaximumSingleTransfer());
                }

                LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
                BigDecimal dailyTransferred = transactionRepository.sumDailyTransferAmount(preSource.getAccountId(), startOfDay);
                if (dailyTransferred.add(transferAmount).compareTo(limit.getMaximumDailyTransfer()) > 0) {
                    throw new InvalidTransactionException("Transfer exceeds maximum daily transfer limit of ₹" + limit.getMaximumDailyTransfer());
                }

                long dailyCount = transactionRepository.countDailyTransfers(preSource.getAccountId(), startOfDay);
                if (dailyCount >= limit.getMaximumDailyCount()) {
                    throw new InvalidTransactionException("Maximum daily transfer count of " + limit.getMaximumDailyCount() + " reached for today");
                }
            }
        }

        // 5. Deterministic Deadlock-Free Locking: Order account locks by lowest accountId first
        Long firstLockId = Math.min(preSource.getAccountId(), preDest.getAccountId());
        Long secondLockId = Math.max(preSource.getAccountId(), preDest.getAccountId());

        Account firstLocked = accountRepository.findAccountForUpdate(firstLockId)
                .orElseThrow(() -> new ResourceNotFoundException("Account locking error"));
        Account secondLocked = accountRepository.findAccountForUpdate(secondLockId)
                .orElseThrow(() -> new ResourceNotFoundException("Account locking error"));

        Account sourceAccount = preSource.getAccountId().equals(firstLockId) ? firstLocked : secondLocked;
        Account destinationAccount = preDest.getAccountId().equals(firstLockId) ? firstLocked : secondLocked;

        // 6. Check available balance under lock
        if (sourceAccount.getBalance().compareTo(transferAmount) < 0) {
            // Record failed attempt
            recordFailedTransaction(requester, sourceAccount, destinationAccount, transferAmount,
                    "INSUFFICIENT_FUNDS: Available balance ₹" + sourceAccount.getBalance() + " is less than requested ₹" + transferAmount,
                    idempotencyKey, request.getDescription());
            throw new InsufficientFundsException("Insufficient funds. Available virtual balance: ₹" + sourceAccount.getBalance());
        }

        // 7. Atomic balance updates
        BigDecimal sourceBalanceAfter = sourceAccount.getBalance().subtract(transferAmount);
        BigDecimal destBalanceAfter = destinationAccount.getBalance().add(transferAmount);

        sourceAccount.setBalance(sourceBalanceAfter);
        destinationAccount.setBalance(destBalanceAfter);

        accountRepository.save(sourceAccount);
        accountRepository.save(destinationAccount);

        // 8. Create Master Transaction record
        TransactionType transferType = transactionTypeRepository.findByTypeCode(TransactionTypeCode.TRANSFER)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction type TRANSFER not found"));

        String reference = ReferenceGenerator.generateTransactionReference();
        Transaction transaction = new Transaction();
        transaction.setTransactionReference(reference);
        transaction.setTransactionType(transferType);
        transaction.setSourceAccount(sourceAccount);
        transaction.setDestinationAccount(destinationAccount);
        transaction.setAmount(transferAmount);
        transaction.setCurrencyCode(sourceAccount.getCurrencyCode());
        transaction.setStatus(TransactionStatus.COMPLETED);
        transaction.setDescription(request.getDescription() != null ? request.getDescription().trim() : "Virtual transfer to " + destinationAccount.getAccountNumber());
        transaction.setIdempotencyKey(idempotencyKey);
        transaction.setInitiatedByUser(requester);
        transaction.setCompletedAt(LocalDateTime.now());

        Transaction savedTx = transactionRepository.save(transaction);

        // 9. Create Double-Entry Ledger entries (Immutable Debit and Credit)
        TransactionEntry debitEntry = new TransactionEntry(savedTx, sourceAccount, EntryType.DEBIT, transferAmount, sourceBalanceAfter);
        TransactionEntry creditEntry = new TransactionEntry(savedTx, destinationAccount, EntryType.CREDIT, transferAmount, destBalanceAfter);

        entryRepository.save(debitEntry);
        entryRepository.save(creditEntry);

        // 10. Record TransferRequest workflow
        TransferRequest transferRequest = new TransferRequest();
        transferRequest.setTransaction(savedTx);
        transferRequest.setRequesterUser(requester);
        transferRequest.setSourceAccount(sourceAccount);
        transferRequest.setDestinationAccount(destinationAccount);
        transferRequest.setRequestedAmount(transferAmount);
        transferRequest.setRequestStatus(TransferRequestStatus.COMPLETED);
        transferRequest.setIdempotencyKey(idempotencyKey);
        transferRequestRepository.save(transferRequest);

        // 11. In-app notifications
        notificationService.createNotification(requester, "TRANSFER_DEBIT", "Virtual Transfer Sent",
                "₹" + transferAmount + " transferred from " + sourceAccount.getAccountNumber() + " to " + destinationAccount.getAccountNumber() + ". Ref: " + reference, savedTx);

        notificationService.createNotification(destinationAccount.getUser(), "TRANSFER_CREDIT", "Virtual Funds Received",
                "You received ₹" + transferAmount + " into " + destinationAccount.getAccountNumber() + " from " + requester.getFullName() + ". Ref: " + reference, savedTx);

        // 12. Security Audit Log
        auditService.logAction(requester, "EXECUTE_TRANSFER", "TRANSACTION", savedTx.getTransactionId(),
                "Transferred ₹" + transferAmount + " from " + sourceAccount.getAccountNumber() + " to " + destinationAccount.getAccountNumber(), clientIp);

        log.info("Transfer completed successfully. Reference: {}", reference);

        TransferResponseDto response = new TransferResponseDto();
        response.setTransactionReference(reference);
        response.setSourceAccountNumber(sourceAccount.getAccountNumber());
        response.setDestinationAccountNumber(destinationAccount.getAccountNumber());
        response.setDestinationAccountName(destinationAccount.getAccountName());
        response.setAmount(transferAmount);
        response.setCurrencyCode(sourceAccount.getCurrencyCode());
        response.setStatus(TransactionStatus.COMPLETED);
        response.setDescription(savedTx.getDescription());
        response.setSourceRemainingBalance(sourceBalanceAfter);
        response.setTimestamp(savedTx.getCompletedAt());
        return response;
    }

    private void recordFailedTransaction(User requester, Account source, Account dest, BigDecimal amount, String failureReason, String idempotencyKey, String description) {
        try {
            TransactionType transferType = transactionTypeRepository.findByTypeCode(TransactionTypeCode.TRANSFER).orElse(null);
            Transaction failedTx = new Transaction();
            failedTx.setTransactionReference(ReferenceGenerator.generateTransactionReference());
            failedTx.setTransactionType(transferType);
            failedTx.setSourceAccount(source);
            failedTx.setDestinationAccount(dest);
            failedTx.setAmount(amount);
            failedTx.setCurrencyCode(source.getCurrencyCode());
            failedTx.setStatus(TransactionStatus.FAILED);
            failedTx.setDescription(description);
            failedTx.setIdempotencyKey(idempotencyKey);
            failedTx.setInitiatedByUser(requester);
            failedTx.setFailureReason(failureReason);
            failedTx.setCompletedAt(LocalDateTime.now());
            transactionRepository.save(failedTx);
        } catch (Exception e) {
            log.error("Failed to persist failed transaction audit: ", e);
        }
    }

    @Override
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public TransferResponseDto executeDeposit(Long userId, DepositRequestDto request, String clientIp) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Account destinationAccount = accountRepository.findAccountForUpdate(request.getDestinationAccountId())
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with ID: " + request.getDestinationAccountId()));

        if (!destinationAccount.getUser().getUserId().equals(userId)) {
            throw new UnauthorizedAccessException("You are not authorized to deposit to this account");
        }

        if (destinationAccount.getAccountStatus() != AccountStatus.ACTIVE) {
            throw new AccountLockedException("Account is not active");
        }

        BigDecimal depositAmount = request.getAmount();
        BigDecimal balanceAfter = destinationAccount.getBalance().add(depositAmount);
        destinationAccount.setBalance(balanceAfter);
        accountRepository.save(destinationAccount);

        TransactionType depositType = transactionTypeRepository.findByTypeCode(TransactionTypeCode.DEPOSIT)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction type DEPOSIT not found"));

        String reference = ReferenceGenerator.generateTransactionReference();
        Transaction transaction = new Transaction();
        transaction.setTransactionReference(reference);
        transaction.setTransactionType(depositType);
        transaction.setDestinationAccount(destinationAccount);
        transaction.setAmount(depositAmount);
        transaction.setCurrencyCode(destinationAccount.getCurrencyCode());
        transaction.setStatus(TransactionStatus.COMPLETED);
        transaction.setDescription(request.getDescription() != null ? request.getDescription().trim() : "Simulated virtual demo deposit");
        transaction.setInitiatedByUser(user);
        transaction.setCompletedAt(LocalDateTime.now());

        Transaction savedTx = transactionRepository.save(transaction);

        // Double-entry ledger: Credit entry for deposit
        TransactionEntry creditEntry = new TransactionEntry(savedTx, destinationAccount, EntryType.CREDIT, depositAmount, balanceAfter);
        entryRepository.save(creditEntry);

        notificationService.createNotification(user, "DEPOSIT_CREDIT", "Virtual Deposit Credited",
                "₹" + depositAmount + " credited to " + destinationAccount.getAccountNumber() + ". Ref: " + reference, savedTx);

        auditService.logAction(user, "EXECUTE_DEPOSIT", "TRANSACTION", savedTx.getTransactionId(),
                "Virtual deposit of ₹" + depositAmount + " to " + destinationAccount.getAccountNumber(), clientIp);

        TransferResponseDto response = new TransferResponseDto();
        response.setTransactionReference(reference);
        response.setDestinationAccountNumber(destinationAccount.getAccountNumber());
        response.setDestinationAccountName(destinationAccount.getAccountName());
        response.setAmount(depositAmount);
        response.setCurrencyCode(destinationAccount.getCurrencyCode());
        response.setStatus(TransactionStatus.COMPLETED);
        response.setDescription(savedTx.getDescription());
        response.setSourceRemainingBalance(balanceAfter);
        response.setTimestamp(savedTx.getCompletedAt());
        return response;
    }

    @Override
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public TransferResponseDto executeWithdrawal(Long userId, WithdrawalRequestDto request, String clientIp) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Account sourceAccount = accountRepository.findAccountForUpdate(request.getSourceAccountId())
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with ID: " + request.getSourceAccountId()));

        if (!sourceAccount.getUser().getUserId().equals(userId)) {
            throw new UnauthorizedAccessException("You are not authorized to withdraw from this account");
        }

        if (sourceAccount.getAccountStatus() != AccountStatus.ACTIVE) {
            throw new AccountLockedException("Account is not active");
        }

        BigDecimal withdrawAmount = request.getAmount();
        if (sourceAccount.getBalance().compareTo(withdrawAmount) < 0) {
            throw new InsufficientFundsException("Insufficient funds. Available virtual balance: ₹" + sourceAccount.getBalance());
        }

        BigDecimal balanceAfter = sourceAccount.getBalance().subtract(withdrawAmount);
        sourceAccount.setBalance(balanceAfter);
        accountRepository.save(sourceAccount);

        TransactionType withdrawType = transactionTypeRepository.findByTypeCode(TransactionTypeCode.WITHDRAWAL)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction type WITHDRAWAL not found"));

        String reference = ReferenceGenerator.generateTransactionReference();
        Transaction transaction = new Transaction();
        transaction.setTransactionReference(reference);
        transaction.setTransactionType(withdrawType);
        transaction.setSourceAccount(sourceAccount);
        transaction.setAmount(withdrawAmount);
        transaction.setCurrencyCode(sourceAccount.getCurrencyCode());
        transaction.setStatus(TransactionStatus.COMPLETED);
        transaction.setDescription(request.getDescription() != null ? request.getDescription().trim() : "Simulated virtual cash withdrawal");
        transaction.setInitiatedByUser(user);
        transaction.setCompletedAt(LocalDateTime.now());

        Transaction savedTx = transactionRepository.save(transaction);

        // Double-entry ledger: Debit entry for withdrawal
        TransactionEntry debitEntry = new TransactionEntry(savedTx, sourceAccount, EntryType.DEBIT, withdrawAmount, balanceAfter);
        entryRepository.save(debitEntry);

        notificationService.createNotification(user, "WITHDRAWAL_DEBIT", "Virtual Withdrawal Processed",
                "₹" + withdrawAmount + " withdrawn from " + sourceAccount.getAccountNumber() + ". Ref: " + reference, savedTx);

        auditService.logAction(user, "EXECUTE_WITHDRAWAL", "TRANSACTION", savedTx.getTransactionId(),
                "Virtual withdrawal of ₹" + withdrawAmount + " from " + sourceAccount.getAccountNumber(), clientIp);

        TransferResponseDto response = new TransferResponseDto();
        response.setTransactionReference(reference);
        response.setSourceAccountNumber(sourceAccount.getAccountNumber());
        response.setAmount(withdrawAmount);
        response.setCurrencyCode(sourceAccount.getCurrencyCode());
        response.setStatus(TransactionStatus.COMPLETED);
        response.setDescription(savedTx.getDescription());
        response.setSourceRemainingBalance(balanceAfter);
        response.setTimestamp(savedTx.getCompletedAt());
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public ReceiptDto getTransferReceipt(String transactionReference, Long userId) {
        Transaction tx = transactionRepository.findByTransactionReference(transactionReference)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with reference: " + transactionReference));

        boolean isAuthorized = (tx.getSourceAccount() != null && tx.getSourceAccount().getUser().getUserId().equals(userId))
                || (tx.getDestinationAccount() != null && tx.getDestinationAccount().getUser().getUserId().equals(userId))
                || tx.getInitiatedByUser().getUserId().equals(userId);

        if (!isAuthorized) {
            throw new UnauthorizedAccessException("You are not authorized to view the receipt for this transaction");
        }

        ReceiptDto receipt = new ReceiptDto();
        receipt.setTransactionReference(tx.getTransactionReference());
        receipt.setTransactionType(tx.getTransactionType().getDisplayName());
        if (tx.getSourceAccount() != null) {
            receipt.setSourceAccountNumberMasked(AccountNumberGenerator.mask(tx.getSourceAccount().getAccountNumber()));
            receipt.setSourceAccountHolder(tx.getSourceAccount().getUser().getFullName());
        }
        if (tx.getDestinationAccount() != null) {
            receipt.setDestinationAccountNumberMasked(AccountNumberGenerator.mask(tx.getDestinationAccount().getAccountNumber()));
            receipt.setDestinationAccountHolder(tx.getDestinationAccount().getUser().getFullName());
        }
        receipt.setAmount(tx.getAmount());
        receipt.setCurrencyCode(tx.getCurrencyCode());
        receipt.setStatus(tx.getStatus());
        receipt.setDescription(tx.getDescription());
        receipt.setTimestamp(tx.getCompletedAt() != null ? tx.getCompletedAt() : tx.getCreatedAt());
        return receipt;
    }
}
