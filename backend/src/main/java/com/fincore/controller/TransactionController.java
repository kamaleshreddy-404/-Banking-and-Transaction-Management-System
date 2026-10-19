package com.fincore.controller;

import com.fincore.dto.common.ApiResponse;
import com.fincore.dto.common.PageResponse;
import com.fincore.dto.transaction.TransactionResponse;
import com.fincore.enums.TransactionStatus;
import com.fincore.enums.TransactionTypeCode;
import com.fincore.security.UserPrincipal;
import com.fincore.service.TransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/transactions")
@Tag(name = "Transactions", description = "Endpoints for customer transaction history, filtering, and CSV export")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping
    @Operation(summary = "Query customer transaction history with pagination, filters, and search")
    public ResponseEntity<ApiResponse<PageResponse<TransactionResponse>>> getTransactions(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(required = false) TransactionTypeCode type,
            @RequestParam(required = false) TransactionStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(required = false) String reference,
            @PageableDefault(size = 15, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        PageResponse<TransactionResponse> page = transactionService.getCustomerTransactions(
                userPrincipal.getUserId(), type, status, startDate, endDate, reference, pageable
        );
        return ResponseEntity.ok(ApiResponse.success(page));
    }

    @GetMapping("/recent")
    @Operation(summary = "Get recent 10 transactions for customer dashboard")
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> getRecent(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<TransactionResponse> recent = transactionService.getRecentTransactions(userPrincipal.getUserId());
        return ResponseEntity.ok(ApiResponse.success(recent));
    }

    @GetMapping("/{transactionReference}")
    @Operation(summary = "Get single transaction details by reference")
    public ResponseEntity<ApiResponse<TransactionResponse>> getTransaction(
            @PathVariable String transactionReference,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        TransactionResponse tx = transactionService.getTransactionByReference(transactionReference, userPrincipal.getUserId());
        return ResponseEntity.ok(ApiResponse.success(tx));
    }

    @GetMapping("/export")
    @Operation(summary = "Export authorized customer transaction history as CSV")
    public ResponseEntity<byte[]> exportCsv(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

        byte[] csvData = transactionService.exportTransactionsCsv(userPrincipal.getUserId(), startDate, endDate);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"fincore_transactions.csv\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(csvData);
    }
}
