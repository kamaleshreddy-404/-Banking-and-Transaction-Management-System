package com.fincore.repository;

import com.fincore.entity.LoginAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface LoginAttemptRepository extends JpaRepository<LoginAttempt, Long> {
    long countByEmailIdentifierAndSuccessfulFalseAndAttemptedAtAfter(String emailIdentifier, LocalDateTime since);
}
