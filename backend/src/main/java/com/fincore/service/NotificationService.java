package com.fincore.service;

import com.fincore.dto.common.PageResponse;
import com.fincore.dto.notification.NotificationResponse;
import com.fincore.entity.Transaction;
import com.fincore.entity.User;
import org.springframework.data.domain.Pageable;

public interface NotificationService {
    void createNotification(User user, String type, String title, String message, Transaction relatedTx);
    PageResponse<NotificationResponse> getUserNotifications(Long userId, Pageable pageable);
    long getUnreadCount(Long userId);
    void markAsRead(Long userId, Long notificationId);
    void markAllAsRead(Long userId);
}
