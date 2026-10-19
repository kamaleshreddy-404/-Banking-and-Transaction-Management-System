package com.fincore.dto.admin;

import com.fincore.enums.AccountStatus;
import jakarta.validation.constraints.NotNull;

public class AccountStatusUpdateRequest {

    @NotNull(message = "Account status is required")
    private AccountStatus status;

    public AccountStatusUpdateRequest() {}

    public AccountStatus getStatus() {
        return status;
    }

    public void setStatus(AccountStatus status) {
        this.status = status;
    }
}
