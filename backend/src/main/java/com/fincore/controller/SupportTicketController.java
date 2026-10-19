package com.fincore.controller;

import com.fincore.dto.common.ApiResponse;
import com.fincore.dto.common.PageResponse;
import com.fincore.dto.support.SupportTicketRequest;
import com.fincore.dto.support.SupportTicketResponse;
import com.fincore.security.UserPrincipal;
import com.fincore.service.SupportTicketService;
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

@RestController
@RequestMapping("/api/v1/support/tickets")
@Tag(name = "Support", description = "Endpoints for customer support tickets and issue reporting")
public class SupportTicketController {

    private final SupportTicketService supportTicketService;

    public SupportTicketController(SupportTicketService supportTicketService) {
        this.supportTicketService = supportTicketService;
    }

    @GetMapping
    @Operation(summary = "Get tickets submitted by authenticated customer")
    public ResponseEntity<ApiResponse<PageResponse<SupportTicketResponse>>> getMyTickets(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PageableDefault(size = 15, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponse<SupportTicketResponse> response = supportTicketService.getUserTickets(userPrincipal.getUserId(), pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    @Operation(summary = "Create a new support ticket")
    public ResponseEntity<ApiResponse<SupportTicketResponse>> createTicket(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody SupportTicketRequest request) {
        SupportTicketResponse response = supportTicketService.createTicket(userPrincipal.getUserId(), request);
        return new ResponseEntity<>(ApiResponse.success("Support ticket submitted", response), HttpStatus.CREATED);
    }

    @GetMapping("/{ticketId}")
    @Operation(summary = "Get single support ticket by ID")
    public ResponseEntity<ApiResponse<SupportTicketResponse>> getTicket(
            @PathVariable Long ticketId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        boolean isAdmin = userPrincipal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        SupportTicketResponse response = supportTicketService.getTicketById(ticketId, userPrincipal.getUserId(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
