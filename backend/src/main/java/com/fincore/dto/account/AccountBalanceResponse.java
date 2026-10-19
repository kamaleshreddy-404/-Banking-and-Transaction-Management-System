package com.fincore.dto.account;

import java.math.BigDecimal;

public class AccountBalanceResponse {

    private Long accountId;
    private String accountNumber;
    private String currencyCode;
    private BigDecimal balance;

    public AccountBalanceResponse() {}

    public AccountBalanceResponse(Long accountId, String accountNumber, String currencyCode, BigDecimal balance) {
        this.accountId = accountId;
        this.accountNumber = accountNumber;
        this.currencyCode = currencyCode;
        this.balance = balance;
    }

    public Long getAccountId() {
        return accountId;
    }

    public void setAccountId(Long accountId) {
        this.accountId = accountId;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public String getCurrencyCode() {
        return currencyCode;
    }

    public void setCurrencyCode(String currencyCode) {
        this.currencyCode = currencyCode;
    }

    public BigDecimal getBalance() {
        return balance;
    }

    public void setBalance(BigDecimal balance) {
        this.balance = balance;
    }
}
