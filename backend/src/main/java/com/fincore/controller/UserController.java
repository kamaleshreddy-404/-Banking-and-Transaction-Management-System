package com.fincore.controller;

import com.fincore.dto.auth.ChangePasswordRequest;
import com.fincore.dto.auth.UserSummaryDto;
import com.fincore.dto.common.ApiResponse;
import com.fincore.security.UserPrincipal;
import com.fincore.service.AuthService;
import com.fincore.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@Tag(name = "Customer Profile", description = "Endpoints for managing user profile and credentials")
public class UserController {

    private final UserService userService;
    private final AuthService authService;

    public UserController(UserService userService, AuthService authService) {
        this.userService = userService;
        this.authService = authService;
    }

    @GetMapping("/me")
    @Operation(summary = "Get user profile details")
    public ResponseEntity<ApiResponse<UserSummaryDto>> getProfile(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        UserSummaryDto profile = userService.getUserProfile(userPrincipal.getUserId());
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @PutMapping("/me")
    @Operation(summary = "Update allowed user profile fields")
    public ResponseEntity<ApiResponse<UserSummaryDto>> updateProfile(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody UserSummaryDto updateDto) {
        UserSummaryDto updated = userService.updateUserProfile(userPrincipal.getUserId(), updateDto);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updated));
    }

    @PutMapping("/me/password")
    @Operation(summary = "Change customer password")
    public ResponseEntity<ApiResponse<String>> changePassword(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(userPrincipal.getUserId(), request);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
    }
}
