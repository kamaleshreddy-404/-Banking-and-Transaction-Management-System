package com.fincore.service;

import com.fincore.dto.auth.UserSummaryDto;

public interface UserService {
    UserSummaryDto getUserProfile(Long userId);
    UserSummaryDto updateUserProfile(Long userId, UserSummaryDto updateDto);
}
