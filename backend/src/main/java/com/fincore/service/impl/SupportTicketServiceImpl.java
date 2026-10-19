package com.fincore.service.impl;

import com.fincore.dto.common.PageResponse;
import com.fincore.dto.support.SupportTicketRequest;
import com.fincore.dto.support.SupportTicketResponse;
import com.fincore.dto.support.SupportTicketStatusUpdateRequest;
import com.fincore.entity.SupportTicket;
import com.fincore.entity.User;
import com.fincore.enums.TicketPriority;
import com.fincore.enums.TicketStatus;
import com.fincore.exception.ResourceNotFoundException;
import com.fincore.exception.UnauthorizedAccessException;
import com.fincore.mapper.DtoMapper;
import com.fincore.repository.SupportTicketRepository;
import com.fincore.repository.UserRepository;
import com.fincore.service.AuditService;
import com.fincore.service.NotificationService;
import com.fincore.service.SupportTicketService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class SupportTicketServiceImpl implements SupportTicketService {

    private final SupportTicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final AuditService auditService;

    public SupportTicketServiceImpl(SupportTicketRepository ticketRepository,
                                    UserRepository userRepository,
                                    NotificationService notificationService,
                                    AuditService auditService) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.auditService = auditService;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<SupportTicketResponse> getUserTickets(Long userId, Pageable pageable) {
        Page<SupportTicketResponse> page = ticketRepository
                .findByUserUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(DtoMapper::toSupportTicketResponse);
        return PageResponse.of(page);
    }

    @Override
    @Transactional
    public SupportTicketResponse createTicket(Long userId, SupportTicketRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        SupportTicket ticket = new SupportTicket();
        ticket.setUser(user);
        ticket.setSubject(request.getSubject().trim());
        ticket.setDescription(request.getDescription().trim());
        ticket.setPriority(request.getPriority() != null ? request.getPriority() : TicketPriority.MEDIUM);
        ticket.setStatus(TicketStatus.OPEN);

        SupportTicket saved = ticketRepository.save(ticket);

        auditService.logAction(user, "CREATE_SUPPORT_TICKET", "SUPPORT_TICKET", saved.getTicketId(),
                "Support ticket opened: " + saved.getSubject(), null);

        notificationService.createNotification(user, "SUPPORT_TICKET_OPENED", "Support Ticket Created",
                "Your support ticket #" + saved.getTicketId() + " has been submitted to demo administrators.", null);

        return DtoMapper.toSupportTicketResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public SupportTicketResponse getTicketById(Long ticketId, Long userId, boolean isAdmin) {
        SupportTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Support ticket not found with ID: " + ticketId));

        if (!isAdmin && !ticket.getUser().getUserId().equals(userId)) {
            throw new UnauthorizedAccessException("You are not authorized to view this ticket");
        }

        return DtoMapper.toSupportTicketResponse(ticket);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<SupportTicketResponse> getAllTicketsForAdmin(TicketStatus status, TicketPriority priority, Pageable pageable) {
        Page<SupportTicketResponse> page = ticketRepository.searchTickets(status, priority, pageable)
                .map(DtoMapper::toSupportTicketResponse);
        return PageResponse.of(page);
    }

    @Override
    @Transactional
    public SupportTicketResponse updateTicketStatusByAdmin(Long ticketId, SupportTicketStatusUpdateRequest request, Long adminId) {
        SupportTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Support ticket not found with ID: " + ticketId));

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin user not found"));

        ticket.setStatus(request.getStatus());
        if (request.getStatus() == TicketStatus.RESOLVED || request.getStatus() == TicketStatus.CLOSED) {
            ticket.setResolvedAt(LocalDateTime.now());
        }

        if (request.getAssignedAdminId() != null) {
            User assigned = userRepository.findById(request.getAssignedAdminId()).orElse(admin);
            ticket.setAssignedAdmin(assigned);
        } else {
            ticket.setAssignedAdmin(admin);
        }

        SupportTicket saved = ticketRepository.save(ticket);

        notificationService.createNotification(ticket.getUser(), "SUPPORT_TICKET_UPDATED", "Support Ticket Status Updated",
                "Your ticket #" + ticket.getTicketId() + " status was updated to: " + request.getStatus(), null);

        auditService.logAction(admin, "UPDATE_SUPPORT_TICKET", "SUPPORT_TICKET", saved.getTicketId(),
                "Admin updated ticket status to: " + request.getStatus(), null);

        return DtoMapper.toSupportTicketResponse(saved);
    }
}
