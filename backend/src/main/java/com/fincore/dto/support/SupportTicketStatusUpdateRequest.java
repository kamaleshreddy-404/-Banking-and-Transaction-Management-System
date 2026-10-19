package com.fincore.dto.support;

import com.fincore.enums.TicketStatus;
import jakarta.validation.constraints.NotNull;

public class SupportTicketStatusUpdateRequest {

    @NotNull(message = "Ticket status is required")
    private TicketStatus status;

    private Long assignedAdminId;

    public SupportTicketStatusUpdateRequest() {}

    public TicketStatus getStatus() {
        return status;
    }

    public void setStatus(TicketStatus status) {
        this.status = status;
    }

    public Long getAssignedAdminId() {
        return assignedAdminId;
    }

    public void setAssignedAdminId(Long assignedAdminId) {
        this.assignedAdminId = assignedAdminId;
    }
}
