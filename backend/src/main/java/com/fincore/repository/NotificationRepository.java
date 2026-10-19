package com.fincore.repository;

import com.fincore.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Page<Notification> findByUserUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    long countByUserUserIdAndIsReadFalse(Long userId);

    Optional<Notification> findByNotificationIdAndUserUserId(Long notificationId, Long userId);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = :now WHERE n.user.userId = :userId AND n.isRead = false")
    int markAllAsReadForUser(@Param("userId") Long userId, @Param("now") LocalDateTime now);
}
