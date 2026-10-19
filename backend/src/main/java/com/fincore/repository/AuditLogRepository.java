package com.fincore.repository;

import com.fincore.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    @Query("SELECT a FROM AuditLog a WHERE " +
           "(:actionType IS NULL OR a.actionType = :actionType) " +
           "AND (:entityType IS NULL OR a.entityType = :entityType) " +
           "ORDER BY a.createdAt DESC")
    Page<AuditLog> filterAuditLogs(
            @Param("actionType") String actionType,
            @Param("entityType") String entityType,
            Pageable pageable
    );
}
