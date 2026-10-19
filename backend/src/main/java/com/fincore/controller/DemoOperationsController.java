package com.fincore.controller;

import com.fincore.dto.common.ApiResponse;
import com.fincore.dto.transfer.DepositRequestDto;
import com.fincore.dto.transfer.TransferResponseDto;
import com.fincore.dto.transfer.WithdrawalRequestDto;
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
@RequestMapping("/api/v1/demo")
@Tag(name = "Demo Operations", description = "Simulated deposit and withdrawal endpoints for testing and demonstration")
public class DemoOperationsController {

    private final TransferService transferService;

    public DemoOperationsController(TransferService transferService) {
        this.transferService = transferService;
    }

    @PostMapping("/deposits")
    @Operation(summary = "Execute simulated virtual deposit credit")
    public ResponseEntity<ApiResponse<TransferResponseDto>> deposit(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody DepositRequestDto request,
            HttpServletRequest httpRequest) {
        String clientIp = httpRequest.getRemoteAddr();
        TransferResponseDto response = transferService.executeDeposit(userPrincipal.getUserId(), request, clientIp);
        return ResponseEntity.ok(ApiResponse.success("Virtual deposit credited successfully", response));
    }

    @PostMapping("/withdrawals")
    @Operation(summary = "Execute simulated virtual withdrawal debit")
    public ResponseEntity<ApiResponse<TransferResponseDto>> withdraw(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody WithdrawalRequestDto request,
            HttpServletRequest httpRequest) {
        String clientIp = httpRequest.getRemoteAddr();
        TransferResponseDto response = transferService.executeWithdrawal(userPrincipal.getUserId(), request, clientIp);
        return ResponseEntity.ok(ApiResponse.success("Virtual withdrawal processed successfully", response));
    }
}
