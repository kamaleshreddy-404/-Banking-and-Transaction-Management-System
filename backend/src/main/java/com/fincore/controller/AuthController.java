package com.fincore.controller;

import com.fincore.dto.auth.*;
import com.fincore.dto.common.ApiResponse;
import com.fincore.security.UserPrincipal;
import com.fincore.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication", description = "Endpoints for registration, login, logout, and password recovery")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate user and issue JWT token")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        String clientIp = httpRequest.getRemoteAddr();
        AuthResponse response = authService.login(request, clientIp);
        return ResponseEntity.ok(ApiResponse.success("Authentication successful", response));
    }

    @PostMapping("/register")
    @Operation(summary = "Register new simulated customer profile")
    public ResponseEntity<ApiResponse<UserSummaryDto>> register(@Valid @RequestBody RegisterRequest request, HttpServletRequest httpRequest) {
        String clientIp = httpRequest.getRemoteAddr();
        UserSummaryDto response = authService.register(request, clientIp);
        return new ResponseEntity<>(ApiResponse.success("Registration successful. Virtual savings account created.", response), HttpStatus.CREATED);
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout user and invalidate client session")
    public ResponseEntity<ApiResponse<String>> logout() {
        return ResponseEntity.ok(ApiResponse.success("Logout successful", "Session ended"));
    }

    @GetMapping("/me")
    @Operation(summary = "Get currently authenticated user profile")
    public ResponseEntity<ApiResponse<UserSummaryDto>> getCurrentUser(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        UserSummaryDto user = authService.getCurrentUser(userPrincipal.getUserId());
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Initiate password reset flow")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@Valid @RequestBody PasswordResetRequest request) {
        String resetToken = authService.forgotPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Password reset token generated (Demo mode: " + resetToken + ")", resetToken));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Complete password reset with token")
    public ResponseEntity<ApiResponse<String>> resetPassword(@Valid @RequestBody PasswordResetConfirmRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Password reset successfully. You may now log in.", null));
    }
}
