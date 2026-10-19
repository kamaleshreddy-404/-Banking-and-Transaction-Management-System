package com.fincore.service;

import com.fincore.dto.auth.*;

public interface AuthService {
    AuthResponse login(LoginRequest request, String clientIp);
    UserSummaryDto register(RegisterRequest request, String clientIp);
    UserSummaryDto getCurrentUser(Long userId);
    String forgotPassword(PasswordResetRequest request);
    void resetPassword(PasswordResetConfirmRequest request);
    void changePassword(Long userId, ChangePasswordRequest request);
}
