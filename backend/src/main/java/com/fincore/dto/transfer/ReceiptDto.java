package com.fincore.dto.transfer;

import com.fincore.enums.TransactionStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ReceiptDto {

    private String transactionReference;
    private String transactionType;
    private String sourceAccountNumberMasked;
    private String sourceAccountHolder;
    private String destinationAccountNumberMasked;
    private String destinationAccountHolder;
    private BigDecimal amount;
    private String currencyCode;
    private TransactionStatus status;
    private String description;
    private LocalDateTime timestamp;
    private String disclaimer = "DEMO BANKING ENVIRONMENT — VIRTUAL MONEY ONLY. THIS IS A SIMULATED RECEIPT.";

    public ReceiptDto() {}

    public String getTransactionReference() {
        return transactionReference;
    }

    public void setTransactionReference(String transactionReference) {
        this.transactionReference = transactionReference;
    }

    public String getTransactionType() {
        return transactionType;
    }

    public void setTransactionType(String transactionType) {
        this.transactionType = transactionType;
    }

    public String getSourceAccountNumberMasked() {
        return sourceAccountNumberMasked;
    }

    public void setSourceAccountNumberMasked(String sourceAccountNumberMasked) {
        this.sourceAccountNumberMasked = sourceAccountNumberMasked;
    }

    public String getSourceAccountHolder() {
        return sourceAccountHolder;
    }

    public void setSourceAccountHolder(String sourceAccountHolder) {
        this.sourceAccountHolder = sourceAccountHolder;
    }

    public String getDestinationAccountNumberMasked() {
        return destinationAccountNumberMasked;
    }

    public void setDestinationAccountNumberMasked(String destinationAccountNumberMasked) {
        this.destinationAccountNumberMasked = destinationAccountNumberMasked;
    }

    public String getDestinationAccountHolder() {
        return destinationAccountHolder;
    }

    public void setDestinationAccountHolder(String destinationAccountHolder) {
        this.destinationAccountHolder = destinationAccountHolder;
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
