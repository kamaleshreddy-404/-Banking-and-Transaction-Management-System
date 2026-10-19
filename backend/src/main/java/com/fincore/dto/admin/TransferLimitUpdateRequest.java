package com.fincore.dto.admin;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class TransferLimitUpdateRequest {

    @NotNull(message = "Maximum single transfer is required")
    @DecimalMin(value = "100.00", message = "Single transfer limit must be at least ₹100.00")
    private BigDecimal maximumSingleTransfer;

    @NotNull(message = "Maximum daily transfer is required")
    @DecimalMin(value = "100.00", message = "Daily transfer limit must be at least ₹100.00")
    private BigDecimal maximumDailyTransfer;

    @NotNull(message = "Maximum daily count is required")
    @Min(value = 1, message = "Daily count limit must be at least 1")
    private Integer maximumDailyCount;

    private Boolean active;

    public TransferLimitUpdateRequest() {}

    public BigDecimal getMaximumSingleTransfer() {
        return maximumSingleTransfer;
    }

    public void setMaximumSingleTransfer(BigDecimal maximumSingleTransfer) {
        this.maximumSingleTransfer = maximumSingleTransfer;
    }

    public BigDecimal getMaximumDailyTransfer() {
        return maximumDailyTransfer;
    }

    public void setMaximumDailyTransfer(BigDecimal maximumDailyTransfer) {
        this.maximumDailyTransfer = maximumDailyTransfer;
    }

    public Integer getMaximumDailyCount() {
        return maximumDailyCount;
    }

    public void setMaximumDailyCount(Integer maximumDailyCount) {
        this.maximumDailyCount = maximumDailyCount;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
