package com.fincore.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transaction_limits")
public class TransactionLimit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "limit_id")
    private Long limitId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "account_type_id")
    private AccountType accountType;

    @Column(name = "maximum_single_transfer", nullable = false, precision = 19, scale = 2)
    private BigDecimal maximumSingleTransfer;

    @Column(name = "maximum_daily_transfer", nullable = false, precision = 19, scale = 2)
    private BigDecimal maximumDailyTransfer;

    @Column(name = "maximum_daily_count", nullable = false)
    private Integer maximumDailyCount;

    @Column(name = "active", nullable = false)
    private Boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    public TransactionLimit() {}

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getLimitId() {
        return limitId;
    }

    public void setLimitId(Long limitId) {
        this.limitId = limitId;
    }

    public AccountType getAccountType() {
        return accountType;
    }

    public void setAccountType(AccountType accountType) {
        this.accountType = accountType;
    }

    public BigDecimal getMaximumSingleTransfer() {
        return maximumSingleTransfer;
    }

    public void setMaximumSingleTransfer(BigDecimal maximumSingleTransfer) {
        this.maximumSingleTransfer = maximumSingleTransfer;
    }

    public BigDecimal getMaximumDailyTransfer() {
        return maximumDailyTransfer;
    }

    public void setMaximumDailyTransfer(BigDecimal maximumDailyTransfer) {
        this.maximumDailyTransfer = maximumDailyTransfer;
    }

    public Integer getMaximumDailyCount() {
        return maximumDailyCount;
    }

    public void setMaximumDailyCount(Integer maximumDailyCount) {
        this.maximumDailyCount = maximumDailyCount;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
