package com.fincore.service.impl;

import com.fincore.dto.account.AccountBalanceResponse;
import com.fincore.dto.account.AccountResponse;
import com.fincore.dto.account.CreateAccountRequest;
import com.fincore.dto.common.PageResponse;
import com.fincore.dto.transaction.TransactionEntryResponse;
import com.fincore.entity.Account;
import com.fincore.entity.AccountType;
import com.fincore.entity.User;
import com.fincore.enums.AccountStatus;
import com.fincore.exception.BadRequestException;
import com.fincore.exception.ResourceNotFoundException;
import com.fincore.exception.UnauthorizedAccessException;
import com.fincore.mapper.DtoMapper;
import com.fincore.repository.AccountRepository;
import com.fincore.repository.AccountTypeRepository;
import com.fincore.repository.TransactionEntryRepository;
import com.fincore.repository.UserRepository;
import com.fincore.service.AccountService;
import com.fincore.service.AuditService;
import com.fincore.util.AccountNumberGenerator;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AccountServiceImpl implements AccountService {

    private final AccountRepository accountRepository;
    private final AccountTypeRepository accountTypeRepository;
    private final UserRepository userRepository;
    private final TransactionEntryRepository entryRepository;
    private final AuditService auditService;

    public AccountServiceImpl(AccountRepository accountRepository,
                              AccountTypeRepository accountTypeRepository,
                              UserRepository userRepository,
                              TransactionEntryRepository entryRepository,
                              AuditService auditService) {
        this.accountRepository = accountRepository;
        this.accountTypeRepository = accountTypeRepository;
        this.userRepository = userRepository;
        this.entryRepository = entryRepository;
        this.auditService = auditService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<AccountResponse> getUserAccounts(Long userId) {
        List<Account> accounts = accountRepository.findByUserUserId(userId);
        return accounts.stream().map(DtoMapper::toAccountResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public AccountResponse getAccountById(Long accountId, Long userId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with ID: " + accountId));

        if (!account.getUser().getUserId().equals(userId)) {
            throw new UnauthorizedAccessException("You are not authorized to view this account");
        }

        return DtoMapper.toAccountResponse(account);
    }

    @Override
    @Transactional(readOnly = true)
    public AccountBalanceResponse getAccountBalance(Long accountId, Long userId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with ID: " + accountId));

        if (!account.getUser().getUserId().equals(userId)) {
            throw new UnauthorizedAccessException("You are not authorized to access this account balance");
        }

        return new AccountBalanceResponse(
                account.getAccountId(),
                account.getAccountNumber(),
                account.getCurrencyCode(),
                account.getBalance()
        );
    }

    @Override
    @Transactional
    public AccountResponse createAccount(Long userId, CreateAccountRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        AccountType type = accountTypeRepository.findById(request.getAccountTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Account type not found with ID: " + request.getAccountTypeId()));

        if (!type.getActive()) {
            throw new BadRequestException("Requested account type is currently inactive");
        }

        Account account = new Account();
        account.setUser(user);
        account.setAccountType(type);
        account.setAccountNumber(AccountNumberGenerator.generate());
        account.setAccountName(request.getAccountName().trim());
        account.setCurrencyCode("INR");
        account.setBalance(BigDecimal.ZERO);
        account.setAccountStatus(AccountStatus.ACTIVE);

        Account saved = accountRepository.save(account);

        auditService.logAction(user, "CREATE_ACCOUNT", "ACCOUNT", saved.getAccountId(),
                "New simulated account opened: " + saved.getAccountNumber(), null);

        return DtoMapper.toAccountResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<TransactionEntryResponse> getAccountLedger(Long accountId, Long userId, Pageable pageable) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with ID: " + accountId));

        if (!account.getUser().getUserId().equals(userId)) {
            throw new UnauthorizedAccessException("You are not authorized to view the ledger for this account");
        }

        Page<TransactionEntryResponse> page = entryRepository
                .findByAccountAccountIdOrderByCreatedAtDesc(accountId, pageable)
                .map(DtoMapper::toTransactionEntryResponse);

        return PageResponse.of(page);
    }
}
