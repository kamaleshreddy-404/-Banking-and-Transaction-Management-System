package com.fincore.controller;

import com.fincore.dto.common.ApiResponse;
import com.fincore.dto.transfer.ReceiptDto;
import com.fincore.dto.transfer.TransferRequestDto;
import com.fincore.dto.transfer.TransferResponseDto;
import com.fincore.security.UserPrincipal;
import com.fincore.service.TransferService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/transfers")
@Tag(name = "Transfers", description = "Endpoints for simulated money transfers and transfer receipts")
public class TransferController {

    private final TransferService transferService;

    public TransferController(TransferService transferService) {
        this.transferService = transferService;
    }

    @PostMapping
    @Operation(summary = "Execute atomic simulated fund transfer")
    public ResponseEntity<ApiResponse<TransferResponseDto>> executeTransfer(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody TransferRequestDto request,
            HttpServletRequest httpRequest) {
        String clientIp = httpRequest.getRemoteAddr();
        Long userId = (userPrincipal != null) ? userPrincipal.getUserId() : 0L;
        TransferResponseDto response = transferService.executeTransfer(userId, request, clientIp);
        return ResponseEntity.ok(ApiResponse.success("Transfer completed successfully", response));
    }

    @GetMapping("/{transactionReference}")
    @Operation(summary = "Get transfer status and summary by transaction reference")
    public ResponseEntity<ApiResponse<ReceiptDto>> getTransferByReference(
            @PathVariable String transactionReference,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Long userId = (userPrincipal != null) ? userPrincipal.getUserId() : 0L;
        ReceiptDto receipt = transferService.getTransferReceipt(transactionReference, userId);
        return ResponseEntity.ok(ApiResponse.success(receipt));
    }

    @PostMapping("/{transactionReference}/receipt")
    @Operation(summary = "Generate simulated printable transfer receipt")
    public ResponseEntity<ApiResponse<ReceiptDto>> generateReceipt(
            @PathVariable String transactionReference,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Long userId = (userPrincipal != null) ? userPrincipal.getUserId() : 0L;
        ReceiptDto receipt = transferService.getTransferReceipt(transactionReference, userId);
        return ResponseEntity.ok(ApiResponse.success(receipt));
    }
}
