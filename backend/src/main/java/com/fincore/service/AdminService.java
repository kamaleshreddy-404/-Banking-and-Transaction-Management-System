package com.fincore.service;

import com.fincore.dto.account.AccountResponse;
import com.fincore.dto.admin.*;
import com.fincore.dto.auth.UserSummaryDto;
import com.fincore.dto.common.PageResponse;
import com.fincore.dto.transaction.TransactionEntryResponse;
import com.fincore.dto.transaction.TransactionResponse;
import com.fincore.entity.TransactionLimit;
import com.fincore.enums.AccountStatus;
import com.fincore.enums.TransactionStatus;
import com.fincore.enums.TransactionTypeCode;
import com.fincore.enums.UserStatus;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface AdminService {
    AdminDashboardStats getDashboardStats();
    PageResponse<UserSummaryDto> getUsers(String query, UserStatus status, Pageable pageable);
    UserSummaryDto updateUserStatus(Long userId, UserStatus status, Long adminId);
    PageResponse<AccountResponse> getAccounts(String query, AccountStatus status, Pageable pageable);
    AccountResponse updateAccountStatus(Long accountId, AccountStatus status, Long adminId);
    PageResponse<TransactionResponse> getTransactions(String query, TransactionStatus status, TransactionTypeCode type, Pageable pageable);
    TransactionResponse getTransactionDetails(String reference);
    List<TransactionEntryResponse> getTransactionLedgerEntries(String reference);
    List<TransactionLimit> getTransferLimits();
    TransactionLimit updateTransferLimit(Long limitId, TransferLimitUpdateRequest request, Long adminId);
    List<AnnouncementResponse> getPublishedAnnouncements();
    PageResponse<AnnouncementResponse> getAllAnnouncements(Pageable pageable);
    AnnouncementResponse createAnnouncement(AnnouncementRequest request, Long adminId);
}
