package com.fincore.repository;

import com.fincore.entity.SupportTicket;
import com.fincore.enums.TicketPriority;
import com.fincore.enums.TicketStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> {

    Page<SupportTicket> findByUserUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    Optional<SupportTicket> findByTicketIdAndUserUserId(Long ticketId, Long userId);

    @Query("SELECT t FROM SupportTicket t WHERE " +
           "(:status IS NULL OR t.status = :status) " +
           "AND (:priority IS NULL OR t.priority = :priority) " +
           "ORDER BY t.createdAt DESC")
    Page<SupportTicket> searchTickets(
            @Param("status") TicketStatus status,
            @Param("priority") TicketPriority priority,
            Pageable pageable
    );

    long countByStatus(TicketStatus status);
}
