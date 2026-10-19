package com.fincore.dto.admin;

import com.fincore.enums.UserStatus;
import jakarta.validation.constraints.NotNull;

public class UserStatusUpdateRequest {

    @NotNull(message = "User status is required")
    private UserStatus status;

    public UserStatusUpdateRequest() {}

    public UserStatus getStatus() {
        return status;
    }

    public void setStatus(UserStatus status) {
        this.status = status;
    }
}
