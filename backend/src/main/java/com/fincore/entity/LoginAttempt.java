package com.fincore.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "login_attempts")
public class LoginAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "login_attempt_id")
    private Long loginAttemptId;

    @Column(name = "email_identifier", nullable = false, length = 150)
    private String emailIdentifier;

    @Column(name = "successful", nullable = false)
    private Boolean successful;

    @Column(name = "attempted_at", nullable = false, updatable = false)
    private LocalDateTime attemptedAt = LocalDateTime.now();

    @Column(name = "source_identifier", length = 100)
    private String sourceIdentifier;

    public LoginAttempt() {}

    public LoginAttempt(String emailIdentifier, Boolean successful, String sourceIdentifier) {
        this.emailIdentifier = emailIdentifier;
        this.successful = successful;
        this.sourceIdentifier = sourceIdentifier;
    }

    public Long getLoginAttemptId() {
        return loginAttemptId;
    }

    public void setLoginAttemptId(Long loginAttemptId) {
        this.loginAttemptId = loginAttemptId;
    }

    public String getEmailIdentifier() {
        return emailIdentifier;
    }

    public void setEmailIdentifier(String emailIdentifier) {
        this.emailIdentifier = emailIdentifier;
    }

    public Boolean getSuccessful() {
        return successful;
    }

    public void setSuccessful(Boolean successful) {
        this.successful = successful;
    }

    public LocalDateTime getAttemptedAt() {
        return attemptedAt;
    }

    public void setAttemptedAt(LocalDateTime attemptedAt) {
        this.attemptedAt = attemptedAt;
    }

    public String getSourceIdentifier() {
        return sourceIdentifier;
    }

    public void setSourceIdentifier(String sourceIdentifier) {
        this.sourceIdentifier = sourceIdentifier;
    }
}
