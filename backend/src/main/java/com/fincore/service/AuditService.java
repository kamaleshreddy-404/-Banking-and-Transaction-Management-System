package com.fincore.service;

import com.fincore.entity.AuditLog;
import com.fincore.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AuditService {
    void logAction(User actor, String actionType, String entityType, Long entityId, String description, String ipAddress);
    Page<AuditLog> getAuditLogs(String actionType, String entityType, Pageable pageable);
}
