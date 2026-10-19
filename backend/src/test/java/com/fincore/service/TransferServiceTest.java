package com.fincore.service;

import com.fincore.dto.transfer.TransferRequestDto;
import com.fincore.dto.transfer.TransferResponseDto;
import com.fincore.entity.*;
import com.fincore.enums.AccountStatus;
import com.fincore.enums.TransactionStatus;
import com.fincore.enums.TransactionTypeCode;
import com.fincore.enums.TransferRequestStatus;
import com.fincore.enums.UserStatus;
import com.fincore.exception.AccountLockedException;
import com.fincore.exception.InsufficientFundsException;
import com.fincore.exception.InvalidTransactionException;
import com.fincore.exception.UnauthorizedAccessException;
import com.fincore.repository.*;
import com.fincore.service.impl.TransferServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TransferServiceTest {

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private TransactionEntryRepository entryRepository;

    @Mock
    private TransactionTypeRepository transactionTypeRepository;

    @Mock
    private TransferRequestRepository transferRequestRepository;

    @Mock
    private TransactionLimitRepository limitRepository;

    @Mock
    private NotificationService notificationService;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private TransferServiceImpl transferService;

    private User senderUser;
    private User recipientUser;
    private Account sourceAccount;
    private Account destinationAccount;
    private TransactionType transferType;
    private TransactionLimit transactionLimit;

    @BeforeEach
    void setUp() {
        senderUser = new User();
        senderUser.setUserId(2L);
        senderUser.setFullName("Aarav Sharma");
        senderUser.setEmail("aarav.sharma@fincore.demo");
        senderUser.setAccountStatus(UserStatus.ACTIVE);

        recipientUser = new User();
        recipientUser.setUserId(3L);
        recipientUser.setFullName("Priya Patel");
        recipientUser.setEmail("priya.patel@fincore.demo");
        recipientUser.setAccountStatus(UserStatus.ACTIVE);

        AccountType savingsType = new AccountType();
        savingsType.setAccountTypeId(1L);
        savingsType.setTypeName("SAVINGS");

        sourceAccount = new Account();
        sourceAccount.setAccountId(1L);
        sourceAccount.setUser(senderUser);
        sourceAccount.setAccountType(savingsType);
        sourceAccount.setAccountNumber("ACC1000000001");
        sourceAccount.setBalance(new BigDecimal("10000.00"));
        sourceAccount.setAccountStatus(AccountStatus.ACTIVE);

        destinationAccount = new Account();
        destinationAccount.setAccountId(2L);
        destinationAccount.setUser(recipientUser);
        destinationAccount.setAccountType(savingsType);
        destinationAccount.setAccountNumber("ACC1000000002");
        destinationAccount.setBalance(new BigDecimal("5000.00"));
        destinationAccount.setAccountStatus(AccountStatus.ACTIVE);

        transferType = new TransactionType();
        transferType.setTransactionTypeId(3L);
        transferType.setTypeCode(TransactionTypeCode.TRANSFER);
        transferType.setDisplayName("Virtual Transfer");

        transactionLimit = new TransactionLimit();
        transactionLimit.setMaximumSingleTransfer(new BigDecimal("50000.00"));
        transactionLimit.setMaximumDailyTransfer(new BigDecimal("100000.00"));
        transactionLimit.setMaximumDailyCount(10);
        transactionLimit.setActive(true);
    }

    @Test
    @DisplayName("Should successfully transfer virtual funds between accounts and record entries")
    void testSuccessfulTransfer() {
        TransferRequestDto request = new TransferRequestDto();
        request.setSourceAccountId(1L);
        request.setDestinationAccountNumber("ACC1000000002");
        request.setAmount(new BigDecimal("2000.00"));
        request.setDescription("Test transfer");
        request.setIdempotencyKey("KEY-123");

        when(transferRequestRepository.findByIdempotencyKey("KEY-123")).thenReturn(Optional.empty());
        when(userRepository.findById(2L)).thenReturn(Optional.of(senderUser));
        when(accountRepository.findById(1L)).thenReturn(Optional.of(sourceAccount));
        when(accountRepository.findByAccountNumber("ACC1000000002")).thenReturn(Optional.of(destinationAccount));
        when(limitRepository.findByAccountTypeAccountTypeIdAndActiveTrue(1L)).thenReturn(Optional.of(transactionLimit));
        when(transactionRepository.sumDailyTransferAmount(eq(1L), any())).thenReturn(BigDecimal.ZERO);
        when(transactionRepository.countDailyTransfers(eq(1L), any())).thenReturn(0L);

        when(accountRepository.findAccountForUpdate(1L)).thenReturn(Optional.of(sourceAccount));
        when(accountRepository.findAccountForUpdate(2L)).thenReturn(Optional.of(destinationAccount));

        when(transactionTypeRepository.findByTypeCode(TransactionTypeCode.TRANSFER)).thenReturn(Optional.of(transferType));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(i -> {
            Transaction t = i.getArgument(0);
            t.setTransactionId(100L);
            return t;
        });

        TransferResponseDto result = transferService.executeTransfer(2L, request, "127.0.0.1");

        assertNotNull(result);
        assertEquals(TransactionStatus.COMPLETED, result.getStatus());
        assertEquals(new BigDecimal("8000.00"), sourceAccount.getBalance());
        assertEquals(new BigDecimal("7000.00"), destinationAccount.getBalance());

        // Verify two double-entry ledger records were persisted
        verify(entryRepository, times(2)).save(any(TransactionEntry.class));
        verify(transferRequestRepository).save(any(TransferRequest.class));
    }

    @Test
    @DisplayName("Should reject transfer when funds are insufficient")
    void testInsufficientFunds() {
        TransferRequestDto request = new TransferRequestDto();
        request.setSourceAccountId(1L);
        request.setDestinationAccountNumber("ACC1000000002");
        request.setAmount(new BigDecimal("25000.00")); // Balance is 10,000

        when(transferRequestRepository.findByIdempotencyKey(any())).thenReturn(Optional.empty());
        when(userRepository.findById(2L)).thenReturn(Optional.of(senderUser));
        when(accountRepository.findById(1L)).thenReturn(Optional.of(sourceAccount));
        when(accountRepository.findByAccountNumber("ACC1000000002")).thenReturn(Optional.of(destinationAccount));
        when(limitRepository.findByAccountTypeAccountTypeIdAndActiveTrue(1L)).thenReturn(Optional.empty());
        when(accountRepository.findAccountForUpdate(1L)).thenReturn(Optional.of(sourceAccount));
        when(accountRepository.findAccountForUpdate(2L)).thenReturn(Optional.of(destinationAccount));

        assertThrows(InsufficientFundsException.class, () -> transferService.executeTransfer(2L, request, "127.0.0.1"));

        // Balances must remain unaltered
        assertEquals(new BigDecimal("10000.00"), sourceAccount.getBalance());
        assertEquals(new BigDecimal("5000.00"), destinationAccount.getBalance());
        verify(entryRepository, never()).save(any(TransactionEntry.class));
    }

    @Test
    @DisplayName("Should reject transfer when source and destination are the same account")
    void testSameSourceAndDestination() {
        TransferRequestDto request = new TransferRequestDto();
        request.setSourceAccountId(1L);
        request.setDestinationAccountNumber("ACC1000000001"); // same account number
        request.setAmount(new BigDecimal("100.00"));

        when(transferRequestRepository.findByIdempotencyKey(any())).thenReturn(Optional.empty());
        when(userRepository.findById(2L)).thenReturn(Optional.of(senderUser));
        when(accountRepository.findById(1L)).thenReturn(Optional.of(sourceAccount));
        when(accountRepository.findByAccountNumber("ACC1000000001")).thenReturn(Optional.of(sourceAccount));

        assertThrows(InvalidTransactionException.class, () -> transferService.executeTransfer(2L, request, "127.0.0.1"));
    }

    @Test
    @DisplayName("Should reject transfer when source account does not belong to authenticated user")
    void testUnauthorizedAccountOwnership() {
        TransferRequestDto request = new TransferRequestDto();
        request.setSourceAccountId(1L);
        request.setDestinationAccountNumber("ACC1000000002");
        request.setAmount(new BigDecimal("100.00"));

        when(transferRequestRepository.findByIdempotencyKey(any())).thenReturn(Optional.empty());
        when(userRepository.findById(999L)).thenReturn(Optional.of(new User())); // Different caller
        when(accountRepository.findById(1L)).thenReturn(Optional.of(sourceAccount)); // owned by user 2

        assertThrows(UnauthorizedAccessException.class, () -> transferService.executeTransfer(999L, request, "127.0.0.1"));
    }

    @Test
    @DisplayName("Should reject transfer from frozen or inactive account")
    void testFrozenAccountRejection() {
        sourceAccount.setAccountStatus(AccountStatus.FROZEN);

        TransferRequestDto request = new TransferRequestDto();
        request.setSourceAccountId(1L);
        request.setDestinationAccountNumber("ACC1000000002");
        request.setAmount(new BigDecimal("100.00"));

        when(transferRequestRepository.findByIdempotencyKey(any())).thenReturn(Optional.empty());
        when(userRepository.findById(2L)).thenReturn(Optional.of(senderUser));
        when(accountRepository.findById(1L)).thenReturn(Optional.of(sourceAccount));
        when(accountRepository.findByAccountNumber("ACC1000000002")).thenReturn(Optional.of(destinationAccount));

        assertThrows(AccountLockedException.class, () -> transferService.executeTransfer(2L, request, "127.0.0.1"));
    }

    @Test
    @DisplayName("Should return existing completed transaction on duplicate idempotency key without duplicate debit")
    void testDuplicateIdempotencyKey() {
        TransferRequest prevRequest = new TransferRequest();
        prevRequest.setRequestStatus(TransferRequestStatus.COMPLETED);
        Transaction completedTx = new Transaction();
        completedTx.setTransactionReference("TXN-DUP-001");
        completedTx.setSourceAccount(sourceAccount);
        completedTx.setDestinationAccount(destinationAccount);
        completedTx.setAmount(new BigDecimal("500.00"));
        completedTx.setStatus(TransactionStatus.COMPLETED);
        prevRequest.setTransaction(completedTx);

        when(transferRequestRepository.findByIdempotencyKey("KEY-EXISTS")).thenReturn(Optional.of(prevRequest));

        TransferRequestDto request = new TransferRequestDto();
        request.setIdempotencyKey("KEY-EXISTS");
        request.setAmount(new BigDecimal("500.00"));

        TransferResponseDto result = transferService.executeTransfer(2L, request, "127.0.0.1");

        assertNotNull(result);
        assertEquals("TXN-DUP-001", result.getTransactionReference());
        verify(accountRepository, never()).findAccountForUpdate(anyLong());
        verify(entryRepository, never()).save(any(TransactionEntry.class));
    }
}
