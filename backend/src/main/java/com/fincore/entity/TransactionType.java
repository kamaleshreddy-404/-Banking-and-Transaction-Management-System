package com.fincore.entity;

import com.fincore.enums.TransactionTypeCode;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "transaction_types")
public class TransactionType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "transaction_type_id")
    private Long transactionTypeId;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_code", nullable = false, unique = true, length = 30)
    private TransactionTypeCode typeCode;

    @Column(name = "display_name", nullable = false, length = 50)
    private String displayName;

    @Column(name = "description")
    private String description;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public TransactionType() {}

    public Long getTransactionTypeId() {
        return transactionTypeId;
    }

    public void setTransactionTypeId(Long transactionTypeId) {
        this.transactionTypeId = transactionTypeId;
    }

    public TransactionTypeCode getTypeCode() {
        return typeCode;
    }

    public void setTypeCode(TransactionTypeCode typeCode) {
        this.typeCode = typeCode;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
