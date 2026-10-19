package com.fincore.dto.transfer;

import com.fincore.enums.TransactionStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class TransferResponseDto {

    private String transactionReference;
    private String sourceAccountNumber;
    private String destinationAccountNumber;
    private String destinationAccountName;
    private BigDecimal amount;
    private String currencyCode;
    private TransactionStatus status;
    private String description;
    private BigDecimal sourceRemainingBalance;
    private LocalDateTime timestamp;
    private String disclaimer = "DEMO BANKING ENVIRONMENT — VIRTUAL MONEY ONLY";

    public TransferResponseDto() {}

    public String getTransactionReference() {
        return transactionReference;
    }

    public void setTransactionReference(String transactionReference) {
        this.transactionReference = transactionReference;
    }

    public String getSourceAccountNumber() {
        return sourceAccountNumber;
    }

    public void setSourceAccountNumber(String sourceAccountNumber) {
        this.sourceAccountNumber = sourceAccountNumber;
    }

    public String getDestinationAccountNumber() {
        return destinationAccountNumber;
    }

    public void setDestinationAccountNumber(String destinationAccountNumber) {
        this.destinationAccountNumber = destinationAccountNumber;
    }

    public String getDestinationAccountName() {
        return destinationAccountName;
    }

    public void setDestinationAccountName(String destinationAccountName) {
        this.destinationAccountName = destinationAccountName;
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

    public BigDecimal getSourceRemainingBalance() {
        return sourceRemainingBalance;
    }

    public void setSourceRemainingBalance(BigDecimal sourceRemainingBalance) {
        this.sourceRemainingBalance = sourceRemainingBalance;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getDisclaimer() {
        return disclaimer;
    }

    public void setDisclaimer(String disclaimer) {
        this.disclaimer = disclaimer;
    }
}
