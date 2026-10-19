package com.fincore.dto.transaction;

import com.fincore.enums.TransactionStatus;
import com.fincore.enums.TransactionTypeCode;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class TransactionResponse {

    private Long transactionId;
    private String transactionReference;
    private TransactionTypeCode transactionType;
    private String transactionTypeDisplay;
    private Long sourceAccountId;
    private String sourceAccountNumber;
    private String sourceMaskedAccountNumber;
    private String sourceAccountOwnerName;
    private Long destinationAccountId;
    private String destinationAccountNumber;
    private String destinationMaskedAccountNumber;
    private String destinationAccountOwnerName;
    private BigDecimal amount;
    private String currencyCode;
    private TransactionStatus status;
    private String description;
    private String failureReason;
    private String direction; // CREDIT, DEBIT, or TRANSFER
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;

    public TransactionResponse() {}

    public Long getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(Long transactionId) {
        this.transactionId = transactionId;
    }

    public String getTransactionReference() {
        return transactionReference;
    }

    public void setTransactionReference(String transactionReference) {
        this.transactionReference = transactionReference;
    }

    public TransactionTypeCode getTransactionType() {
        return transactionType;
    }

    public void setTransactionType(TransactionTypeCode transactionType) {
        this.transactionType = transactionType;
    }

    public String getTransactionTypeDisplay() {
        return transactionTypeDisplay;
    }

    public void setTransactionTypeDisplay(String transactionTypeDisplay) {
        this.transactionTypeDisplay = transactionTypeDisplay;
    }

    public Long getSourceAccountId() {
        return sourceAccountId;
    }

    public void setSourceAccountId(Long sourceAccountId) {
        this.sourceAccountId = sourceAccountId;
    }

    public String getSourceAccountNumber() {
        return sourceAccountNumber;
    }

    public void setSourceAccountNumber(String sourceAccountNumber) {
        this.sourceAccountNumber = sourceAccountNumber;
    }

    public String getSourceMaskedAccountNumber() {
        return sourceMaskedAccountNumber;
    }

    public void setSourceMaskedAccountNumber(String sourceMaskedAccountNumber) {
        this.sourceMaskedAccountNumber = sourceMaskedAccountNumber;
    }

    public String getSourceAccountOwnerName() {
        return sourceAccountOwnerName;
    }

    public void setSourceAccountOwnerName(String sourceAccountOwnerName) {
        this.sourceAccountOwnerName = sourceAccountOwnerName;
    }

    public Long getDestinationAccountId() {
        return destinationAccountId;
    }

    public void setDestinationAccountId(Long destinationAccountId) {
        this.destinationAccountId = destinationAccountId;
    }

    public String getDestinationAccountNumber() {
        return destinationAccountNumber;
    }

    public void setDestinationAccountNumber(String destinationAccountNumber) {
        this.destinationAccountNumber = destinationAccountNumber;
    }

    public String getDestinationMaskedAccountNumber() {
        return destinationMaskedAccountNumber;
    }

    public void setDestinationMaskedAccountNumber(String destinationMaskedAccountNumber) {
        this.destinationMaskedAccountNumber = destinationMaskedAccountNumber;
    }

    public String getDestinationAccountOwnerName() {
        return destinationAccountOwnerName;
    }

    public void setDestinationAccountOwnerName(String destinationAccountOwnerName) {
        this.destinationAccountOwnerName = destinationAccountOwnerName;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getCurrencyCode() {
        return currencyCode;
    }

    public void setCurrencyCode(String currencyCode) {
        this.currencyCode = currencyCode;
    }

    public TransactionStatus getStatus() {
        return status;
    }

    public void setStatus(TransactionStatus status) {
        this.status = status;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getFailureReason() {
        return failureReason;
    }

    public void setFailureReason(String failureReason) {
        this.failureReason = failureReason;
    }

    public String getDirection() {
        return direction;
    }

    public void setDirection(String direction) {
        this.direction = direction;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }
}
