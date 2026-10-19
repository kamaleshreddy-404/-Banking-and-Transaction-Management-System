package com.fincore.dto.admin;

import java.math.BigDecimal;
import java.util.Map;

public class AdminDashboardStats {

    private long totalUsers;
    private long activeUsers;
    private long blockedUsers;
    private long totalAccounts;
    private long activeAccounts;
    private long frozenAccounts;
    private long closedAccounts;
    private BigDecimal totalVirtualSystemBalance;
    private long totalTransactions;
    private long completedTransactions;
    private long failedTransactions;
    private long reversedTransactions;
    private long openSupportTickets;
    private Map<String, Long> transactionsByType;

    public AdminDashboardStats() {}

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getActiveUsers() {
        return activeUsers;
    }

    public void setActiveUsers(long activeUsers) {
        this.activeUsers = activeUsers;
    }

    public long getBlockedUsers() {
        return blockedUsers;
    }

    public void setBlockedUsers(long blockedUsers) {
        this.blockedUsers = blockedUsers;
    }

    public long getTotalAccounts() {
        return totalAccounts;
    }

    public void setTotalAccounts(long totalAccounts) {
        this.totalAccounts = totalAccounts;
    }

    public long getActiveAccounts() {
        return activeAccounts;
    }

    public void setActiveAccounts(long activeAccounts) {
        this.activeAccounts = activeAccounts;
    }

    public long getFrozenAccounts() {
        return frozenAccounts;
    }

    public void setFrozenAccounts(long frozenAccounts) {
        this.frozenAccounts = frozenAccounts;
    }

    public long getClosedAccounts() {
        return closedAccounts;
    }

    public void setClosedAccounts(long closedAccounts) {
        this.closedAccounts = closedAccounts;
    }

    public BigDecimal getTotalVirtualSystemBalance() {
        return totalVirtualSystemBalance;
    }

    public void setTotalVirtualSystemBalance(BigDecimal totalVirtualSystemBalance) {
        this.totalVirtualSystemBalance = totalVirtualSystemBalance;
    }

    public long getTotalTransactions() {
        return totalTransactions;
    }

    public void setTotalTransactions(long totalTransactions) {
        this.totalTransactions = totalTransactions;
    }

    public long getCompletedTransactions() {
        return completedTransactions;
    }

    public void setCompletedTransactions(long completedTransactions) {
        this.completedTransactions = completedTransactions;
    }

    public long getFailedTransactions() {
        return failedTransactions;
    }

    public void setFailedTransactions(long failedTransactions) {
        this.failedTransactions = failedTransactions;
    }

    public long getReversedTransactions() {
        return reversedTransactions;
    }

    public void setReversedTransactions(long reversedTransactions) {
        this.reversedTransactions = reversedTransactions;
    }

    public long getOpenSupportTickets() {
        return openSupportTickets;
    }

    public void setOpenSupportTickets(long openSupportTickets) {
        this.openSupportTickets = openSupportTickets;
    }

    public Map<String, Long> getTransactionsByType() {
        return transactionsByType;
    }

    public void setTransactionsByType(Map<String, Long> transactionsByType) {
        this.transactionsByType = transactionsByType;
    }
}
