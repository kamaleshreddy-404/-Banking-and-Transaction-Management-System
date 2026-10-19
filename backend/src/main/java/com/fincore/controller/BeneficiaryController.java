package com.fincore.controller;

import com.fincore.dto.beneficiary.BeneficiaryRequest;
import com.fincore.dto.beneficiary.BeneficiaryResponse;
import com.fincore.dto.common.ApiResponse;
import com.fincore.enums.BeneficiaryStatus;
import com.fincore.security.UserPrincipal;
import com.fincore.service.BeneficiaryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/beneficiaries")
@Tag(name = "Beneficiaries", description = "Endpoints for saved transfer recipients")
public class BeneficiaryController {

    private final BeneficiaryService beneficiaryService;

    public BeneficiaryController(BeneficiaryService beneficiaryService) {
        this.beneficiaryService = beneficiaryService;
    }

    @GetMapping
    @Operation(summary = "List all beneficiaries saved by authenticated user")
    public ResponseEntity<ApiResponse<List<BeneficiaryResponse>>> getBeneficiaries(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<BeneficiaryResponse> list = beneficiaryService.getUserBeneficiaries(userPrincipal.getUserId());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PostMapping
    @Operation(summary = "Add a new beneficiary recipient")
    public ResponseEntity<ApiResponse<BeneficiaryResponse>> addBeneficiary(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody BeneficiaryRequest request) {
        BeneficiaryResponse response = beneficiaryService.addBeneficiary(userPrincipal.getUserId(), request);
        return new ResponseEntity<>(ApiResponse.success("Beneficiary added successfully", response), HttpStatus.CREATED);
    }

    @PutMapping("/{beneficiaryId}")
    @Operation(summary = "Update beneficiary details")
    public ResponseEntity<ApiResponse<BeneficiaryResponse>> updateBeneficiary(
            @PathVariable Long beneficiaryId,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody BeneficiaryRequest request) {
        BeneficiaryResponse response = beneficiaryService.updateBeneficiary(userPrincipal.getUserId(), beneficiaryId, request);
        return ResponseEntity.ok(ApiResponse.success("Beneficiary updated successfully", response));
    }

    @PatchMapping("/{beneficiaryId}/status")
    @Operation(summary = "Toggle or update beneficiary active status")
    public ResponseEntity<ApiResponse<BeneficiaryResponse>> updateStatus(
            @PathVariable Long beneficiaryId,
            @RequestParam BeneficiaryStatus status,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        BeneficiaryResponse response = beneficiaryService.updateBeneficiaryStatus(userPrincipal.getUserId(), beneficiaryId, status);
        return ResponseEntity.ok(ApiResponse.success("Beneficiary status updated", response));
    }

    @DeleteMapping("/{beneficiaryId}")
    @Operation(summary = "Delete saved beneficiary")
    public ResponseEntity<ApiResponse<Void>> deleteBeneficiary(
            @PathVariable Long beneficiaryId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        beneficiaryService.deleteBeneficiary(userPrincipal.getUserId(), beneficiaryId);
        return ResponseEntity.ok(ApiResponse.success("Beneficiary removed successfully", null));
    }
}
