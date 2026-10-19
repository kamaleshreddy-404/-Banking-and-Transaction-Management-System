package com.fincore.controller;

import com.fincore.dto.account.AccountResponse;
import com.fincore.dto.admin.*;
import com.fincore.dto.auth.UserSummaryDto;
import com.fincore.dto.common.ApiResponse;
import com.fincore.dto.common.PageResponse;
import com.fincore.dto.support.SupportTicketResponse;
import com.fincore.dto.support.SupportTicketStatusUpdateRequest;
import com.fincore.dto.transaction.TransactionEntryResponse;
import com.fincore.dto.transaction.TransactionResponse;
import com.fincore.entity.AuditLog;
import com.fincore.entity.TransactionLimit;
import com.fincore.enums.*;
import com.fincore.security.UserPrincipal;
import com.fincore.service.AdminService;
import com.fincore.service.AuditService;
import com.fincore.service.SupportTicketService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Administration", description = "Protected administrative operations and system management")
public class AdminController {

    private final AdminService adminService;
    private final AuditService auditService;
    private final SupportTicketService supportTicketService;

    public AdminController(AdminService adminService, AuditService auditService, SupportTicketService supportTicketService) {
        this.adminService = adminService;
        this.auditService = auditService;
        this.supportTicketService = supportTicketService;
    }

    // Public announcement endpoint for all visitors
    @GetMapping("/public/announcements")
    @Operation(summary = "Get published system announcements for all users")
    public ResponseEntity<ApiResponse<List<AnnouncementResponse>>> getPublicAnnouncements() {
        List<AnnouncementResponse> list = adminService.getPublishedAnnouncements();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/admin/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get administrator system-wide dashboard statistics")
    public ResponseEntity<ApiResponse<AdminDashboardStats>> getDashboardStats() {
        AdminDashboardStats stats = adminService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/admin/users")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Search and list system users")
    public ResponseEntity<ApiResponse<PageResponse<UserSummaryDto>>> getUsers(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) UserStatus status,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponse<UserSummaryDto> users = adminService.getUsers(query, status, pageable);
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @PatchMapping("/admin/users/{userId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update user status (ACTIVE, BLOCKED, PENDING)")
    public ResponseEntity<ApiResponse<UserSummaryDto>> updateUserStatus(
            @PathVariable Long userId,
            @Valid @RequestBody UserStatusUpdateRequest request,
            @AuthenticationPrincipal UserPrincipal adminPrincipal) {
        UserSummaryDto updated = adminService.updateUserStatus(userId, request.getStatus(), adminPrincipal.getUserId());
        return ResponseEntity.ok(ApiResponse.success("User status updated successfully", updated));
    }

    @GetMapping("/admin/accounts")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Search and list system accounts")
    public ResponseEntity<ApiResponse<PageResponse<AccountResponse>>> getAccounts(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) AccountStatus status,
            @PageableDefault(size = 20, sort = "openedAt", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponse<AccountResponse> accounts = adminService.getAccounts(query, status, pageable);
        return ResponseEntity.ok(ApiResponse.success(accounts));
    }

    @PatchMapping("/admin/accounts/{accountId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update account status (ACTIVE, FROZEN, CLOSED)")
    public ResponseEntity<ApiResponse<AccountResponse>> updateAccountStatus(
            @PathVariable Long accountId,
            @Valid @RequestBody AccountStatusUpdateRequest request,
            @AuthenticationPrincipal UserPrincipal adminPrincipal) {
        AccountResponse updated = adminService.updateAccountStatus(accountId, request.getStatus(), adminPrincipal.getUserId());
        return ResponseEntity.ok(ApiResponse.success("Account status updated successfully", updated));
    }

    @GetMapping("/admin/transactions")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Monitor and search all system transactions")
    public ResponseEntity<ApiResponse<PageResponse<TransactionResponse>>> getTransactions(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) TransactionStatus status,
            @RequestParam(required = false) TransactionTypeCode type,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponse<TransactionResponse> txs = adminService.getTransactions(query, status, type, pageable);
        return ResponseEntity.ok(ApiResponse.success(txs));
    }

    @GetMapping("/admin/transactions/{transactionReference}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get transaction details for admin")
    public ResponseEntity<ApiResponse<TransactionResponse>> getTransactionDetails(@PathVariable String transactionReference) {
        TransactionResponse tx = adminService.getTransactionDetails(transactionReference);
        return ResponseEntity.ok(ApiResponse.success(tx));
    }

    @GetMapping("/admin/transactions/{transactionReference}/ledger")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get double-entry ledger entries for a transaction")
    public ResponseEntity<ApiResponse<List<TransactionEntryResponse>>> getTransactionLedger(@PathVariable String transactionReference) {
        List<TransactionEntryResponse> entries = adminService.getTransactionLedgerEntries(transactionReference);
        return ResponseEntity.ok(ApiResponse.success(entries));
    }

    @GetMapping("/admin/audit-logs")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "View security and administrative audit trail")
    public ResponseEntity<ApiResponse<PageResponse<AuditLog>>> getAuditLogs(
            @RequestParam(required = false) String actionType,
            @RequestParam(required = false) String entityType,
            @PageableDefault(size = 25, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<AuditLog> page = auditService.getAuditLogs(actionType, entityType, pageable);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.of(page)));
    }

    @GetMapping("/admin/limits")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get configured transfer limits")
    public ResponseEntity<ApiResponse<List<TransactionLimit>>> getLimits() {
        List<TransactionLimit> limits = adminService.getTransferLimits();
        return ResponseEntity.ok(ApiResponse.success(limits));
    }

    @PutMapping("/admin/limits/{limitId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update transfer limit configuration")
    public ResponseEntity<ApiResponse<TransactionLimit>> updateLimit(
            @PathVariable Long limitId,
            @Valid @RequestBody TransferLimitUpdateRequest request,
            @AuthenticationPrincipal UserPrincipal adminPrincipal) {
        TransactionLimit updated = adminService.updateTransferLimit(limitId, request, adminPrincipal.getUserId());
        return ResponseEntity.ok(ApiResponse.success("Transfer limit updated successfully", updated));
    }

    @GetMapping("/admin/support/tickets")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Review support tickets across the platform")
    public ResponseEntity<ApiResponse<PageResponse<SupportTicketResponse>>> getTickets(
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) TicketPriority priority,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponse<SupportTicketResponse> tickets = supportTicketService.getAllTicketsForAdmin(status, priority, pageable);
        return ResponseEntity.ok(ApiResponse.success(tickets));
    }

    @PatchMapping("/admin/support/tickets/{ticketId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update ticket resolution status")
    public ResponseEntity<ApiResponse<SupportTicketResponse>> updateTicket(
            @PathVariable Long ticketId,
            @Valid @RequestBody SupportTicketStatusUpdateRequest request,
            @AuthenticationPrincipal UserPrincipal adminPrincipal) {
        SupportTicketResponse updated = supportTicketService.updateTicketStatusByAdmin(ticketId, request, adminPrincipal.getUserId());
        return ResponseEntity.ok(ApiResponse.success("Ticket status updated", updated));
    }

    @PostMapping("/admin/announcements")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Publish new system announcement")
    public ResponseEntity<ApiResponse<AnnouncementResponse>> createAnnouncement(
            @Valid @RequestBody AnnouncementRequest request,
            @AuthenticationPrincipal UserPrincipal adminPrincipal) {
        AnnouncementResponse response = adminService.createAnnouncement(request, adminPrincipal.getUserId());
        return new ResponseEntity<>(ApiResponse.success("Announcement published successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/admin/announcements")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all announcements for administration")
    public ResponseEntity<ApiResponse<PageResponse<AnnouncementResponse>>> getAllAnnouncements(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponse<AnnouncementResponse> page = adminService.getAllAnnouncements(pageable);
        return ResponseEntity.ok(ApiResponse.success(page));
    }
}
