package com.fincore.service.impl;

import com.fincore.entity.AuditLog;
import com.fincore.entity.User;
import com.fincore.repository.AuditLogRepository;
import com.fincore.service.AuditService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuditServiceImpl implements AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditServiceImpl(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logAction(User actor, String actionType, String entityType, Long entityId, String description, String ipAddress) {
        try {
            AuditLog log = new AuditLog(actor, actionType, entityType, entityId, description, ipAddress);
            auditLogRepository.save(log);
        } catch (Exception e) {
            // Audit logging failure should not break critical transactions
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AuditLog> getAuditLogs(String actionType, String entityType, Pageable pageable) {
        return auditLogRepository.filterAuditLogs(actionType, entityType, pageable);
    }
}
