package com.fincore.service;

import com.fincore.dto.common.PageResponse;
import com.fincore.dto.support.SupportTicketRequest;
import com.fincore.dto.support.SupportTicketResponse;
import com.fincore.dto.support.SupportTicketStatusUpdateRequest;
import com.fincore.enums.TicketPriority;
import com.fincore.enums.TicketStatus;
import org.springframework.data.domain.Pageable;

public interface SupportTicketService {
    PageResponse<SupportTicketResponse> getUserTickets(Long userId, Pageable pageable);
    SupportTicketResponse createTicket(Long userId, SupportTicketRequest request);
    SupportTicketResponse getTicketById(Long ticketId, Long userId, boolean isAdmin);
    PageResponse<SupportTicketResponse> getAllTicketsForAdmin(TicketStatus status, TicketPriority priority, Pageable pageable);
    SupportTicketResponse updateTicketStatusByAdmin(Long ticketId, SupportTicketStatusUpdateRequest request, Long adminId);
}
