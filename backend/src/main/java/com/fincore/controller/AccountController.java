package com.fincore.controller;

import com.fincore.dto.account.AccountBalanceResponse;
import com.fincore.dto.account.AccountResponse;
import com.fincore.dto.account.CreateAccountRequest;
import com.fincore.dto.common.ApiResponse;
import com.fincore.dto.common.PageResponse;
import com.fincore.dto.transaction.TransactionEntryResponse;
import com.fincore.security.UserPrincipal;
import com.fincore.service.AccountService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/accounts")
@Tag(name = "Accounts", description = "Endpoints for customer virtual account management")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @GetMapping
    @Operation(summary = "Get all accounts owned by authenticated customer")
    public ResponseEntity<ApiResponse<List<AccountResponse>>> getMyAccounts(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<AccountResponse> accounts = accountService.getUserAccounts(userPrincipal.getUserId());
        return ResponseEntity.ok(ApiResponse.success(accounts));
    }

    @PostMapping
    @Operation(summary = "Open a new simulated virtual account")
    public ResponseEntity<ApiResponse<AccountResponse>> createAccount(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody CreateAccountRequest request) {
        AccountResponse response = accountService.createAccount(userPrincipal.getUserId(), request);
        return new ResponseEntity<>(ApiResponse.success("Virtual account created successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/{accountId}")
    @Operation(summary = "Get details of an owned account by ID")
    public ResponseEntity<ApiResponse<AccountResponse>> getAccountById(
            @PathVariable Long accountId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        AccountResponse account = accountService.getAccountById(accountId, userPrincipal.getUserId());
        return ResponseEntity.ok(ApiResponse.success(account));
    }

    @GetMapping("/{accountId}/balance")
    @Operation(summary = "Get real-time balance for an owned account")
    public ResponseEntity<ApiResponse<AccountBalanceResponse>> getAccountBalance(
            @PathVariable Long accountId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        AccountBalanceResponse balance = accountService.getAccountBalance(accountId, userPrincipal.getUserId());
        return ResponseEntity.ok(ApiResponse.success(balance));
    }

    @GetMapping("/{accountId}/ledger")
    @Operation(summary = "Get immutable double-entry ledger entries for an owned account")
    public ResponseEntity<ApiResponse<PageResponse<TransactionEntryResponse>>> getAccountLedger(
            @PathVariable Long accountId,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponse<TransactionEntryResponse> ledger = accountService.getAccountLedger(accountId, userPrincipal.getUserId(), pageable);
        return ResponseEntity.ok(ApiResponse.success(ledger));
    }
}
