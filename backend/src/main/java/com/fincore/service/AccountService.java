package com.fincore.service;

import com.fincore.dto.account.AccountBalanceResponse;
import com.fincore.dto.account.AccountResponse;
import com.fincore.dto.account.CreateAccountRequest;
import com.fincore.dto.common.PageResponse;
import com.fincore.dto.transaction.TransactionEntryResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface AccountService {
    List<AccountResponse> getUserAccounts(Long userId);
    AccountResponse getAccountById(Long accountId, Long userId);
    AccountBalanceResponse getAccountBalance(Long accountId, Long userId);
    AccountResponse createAccount(Long userId, CreateAccountRequest request);
    PageResponse<TransactionEntryResponse> getAccountLedger(Long accountId, Long userId, Pageable pageable);
}
