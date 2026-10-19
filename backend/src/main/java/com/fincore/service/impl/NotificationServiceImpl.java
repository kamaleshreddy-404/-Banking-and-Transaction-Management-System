package com.fincore.service.impl;

import com.fincore.dto.common.PageResponse;
import com.fincore.dto.notification.NotificationResponse;
import com.fincore.entity.Notification;
import com.fincore.entity.Transaction;
import com.fincore.entity.User;
import com.fincore.exception.ResourceNotFoundException;
import com.fincore.mapper.DtoMapper;
import com.fincore.repository.NotificationRepository;
import com.fincore.service.NotificationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationServiceImpl(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRED)
    public void createNotification(User user, String type, String title, String message, Transaction relatedTx) {
        if (user == null) return;
        Notification notification = new Notification(user, type, title, message, relatedTx);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<NotificationResponse> getUserNotifications(Long userId, Pageable pageable) {
        Page<NotificationResponse> page = notificationRepository
                .findByUserUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(DtoMapper::toNotificationResponse);
        return PageResponse.of(page);
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserUserIdAndIsReadFalse(userId);
    }

    @Override
    @Transactional
    public void markAsRead(Long userId, Long notificationId) {
        Notification notification = notificationRepository.findByNotificationIdAndUserUserId(notificationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found or unauthorized"));

        notification.setIsRead(true);
        notification.setReadAt(LocalDateTime.now());
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsReadForUser(userId, LocalDateTime.now());
    }
}
