package com.fincore.repository;

import com.fincore.entity.SystemAnnouncement;
import com.fincore.enums.AnnouncementStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SystemAnnouncementRepository extends JpaRepository<SystemAnnouncement, Long> {
    List<SystemAnnouncement> findByStatusOrderByCreatedAtDesc(AnnouncementStatus status);
    Page<SystemAnnouncement> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
