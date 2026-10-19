package com.fincore.service.impl;

import com.fincore.dto.account.AccountResponse;
import com.fincore.dto.admin.*;
import com.fincore.dto.auth.UserSummaryDto;
import com.fincore.dto.common.PageResponse;
import com.fincore.dto.transaction.TransactionEntryResponse;
import com.fincore.dto.transaction.TransactionResponse;
import com.fincore.entity.*;
import com.fincore.enums.*;
import com.fincore.exception.ResourceNotFoundException;
import com.fincore.mapper.DtoMapper;
import com.fincore.repository.*;
import com.fincore.service.AdminService;
import com.fincore.service.AuditService;
import com.fincore.service.NotificationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final TransactionEntryRepository entryRepository;
    private final TransactionLimitRepository limitRepository;
    private final SupportTicketRepository ticketRepository;
    private final SystemAnnouncementRepository announcementRepository;
    private final AuditService auditService;
    private final NotificationService notificationService;

    public AdminServiceImpl(UserRepository userRepository,
                            AccountRepository accountRepository,
                            TransactionRepository transactionRepository,
                            TransactionEntryRepository entryRepository,
                            TransactionLimitRepository limitRepository,
                            SupportTicketRepository ticketRepository,
                            SystemAnnouncementRepository announcementRepository,
                            AuditService auditService,
                            NotificationService notificationService) {
        this.userRepository = userRepository;
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
        this.entryRepository = entryRepository;
        this.limitRepository = limitRepository;
        this.ticketRepository = ticketRepository;
        this.announcementRepository = announcementRepository;
        this.auditService = auditService;
        this.notificationService = notificationService;
    }

    @Override
    @Transactional(readOnly = true)
    public AdminDashboardStats getDashboardStats() {
        AdminDashboardStats stats = new AdminDashboardStats();

        stats.setTotalUsers(userRepository.count());
        stats.setActiveUsers(userRepository.countByAccountStatus(UserStatus.ACTIVE));
        stats.setBlockedUsers(userRepository.countByAccountStatus(UserStatus.BLOCKED));

        stats.setTotalAccounts(accountRepository.count());
        stats.setActiveAccounts(accountRepository.countByAccountStatus(AccountStatus.ACTIVE));
        stats.setFrozenAccounts(accountRepository.countByAccountStatus(AccountStatus.FROZEN));
        stats.setClosedAccounts(accountRepository.countByAccountStatus(AccountStatus.CLOSED));

        BigDecimal totalBal = accountRepository.sumTotalSystemBalance();
        stats.setTotalVirtualSystemBalance(totalBal != null ? totalBal : BigDecimal.ZERO);

        stats.setTotalTransactions(transactionRepository.count());
        stats.setCompletedTransactions(transactionRepository.countByStatus(TransactionStatus.COMPLETED));
        stats.setFailedTransactions(transactionRepository.countByStatus(TransactionStatus.FAILED));
        stats.setReversedTransactions(transactionRepository.countByStatus(TransactionStatus.REVERSED));

        stats.setOpenSupportTickets(ticketRepository.countByStatus(TicketStatus.OPEN) + ticketRepository.countByStatus(TicketStatus.IN_PROGRESS));

        Map<String, Long> txByType = new HashMap<>();
        for (TransactionTypeCode type : TransactionTypeCode.values()) {
            txByType.put(type.name(), 0L);
        }
        stats.setTransactionsByType(txByType);

        return stats;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<UserSummaryDto> getUsers(String query, UserStatus status, Pageable pageable) {
        Page<UserSummaryDto> page = userRepository.searchUsers(query, status, pageable)
                .map(DtoMapper::toUserSummaryDto);
        return PageResponse.of(page);
    }

    @Override
    @Transactional
    public UserSummaryDto updateUserStatus(Long userId, UserStatus status, Long adminId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin user not found"));

        user.setAccountStatus(status);
        User updated = userRepository.save(user);

        auditService.logAction(admin, "ADMIN_UPDATE_USER_STATUS", "USER", user.getUserId(),
                "Admin changed user status to " + status + " for user: " + user.getEmail(), null);

        notificationService.createNotification(user, "ACCOUNT_STATUS_CHANGE", "Account Status Updated",
                "Your user status has been updated to: " + status + " by system administration.", null);

        return DtoMapper.toUserSummaryDto(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AccountResponse> getAccounts(String query, AccountStatus status, Pageable pageable) {
        Page<AccountResponse> page = accountRepository.searchAccounts(query, status, pageable)
                .map(DtoMapper::toAccountResponse);
        return PageResponse.of(page);
    }

    @Override
    @Transactional
    public AccountResponse updateAccountStatus(Long accountId, AccountStatus status, Long adminId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with ID: " + accountId));

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin user not found"));

        account.setAccountStatus(status);
        Account updated = accountRepository.save(account);

        auditService.logAction(admin, "ADMIN_UPDATE_ACCOUNT_STATUS", "ACCOUNT", account.getAccountId(),
                "Admin updated account " + account.getAccountNumber() + " status to " + status, null);

        notificationService.createNotification(account.getUser(), "ACCOUNT_STATUS_CHANGE", "Account Status Updated",
                "Account " + account.getAccountNumber() + " status changed to: " + status, null);

        return DtoMapper.toAccountResponse(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<TransactionResponse> getTransactions(String query, TransactionStatus status, TransactionTypeCode type, Pageable pageable) {
        Page<TransactionResponse> page = transactionRepository.searchAdminTransactions(query, status, type, pageable)
                .map(tx -> DtoMapper.toTransactionResponse(tx, null));
        return PageResponse.of(page);
    }

    @Override
    @Transactional(readOnly = true)
    public TransactionResponse getTransactionDetails(String reference) {
        Transaction tx = transactionRepository.findByTransactionReference(reference)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with reference: " + reference));
        return DtoMapper.toTransactionResponse(tx, null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransactionEntryResponse> getTransactionLedgerEntries(String reference) {
        Transaction tx = transactionRepository.findByTransactionReference(reference)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with reference: " + reference));

        return entryRepository.findByTransactionTransactionId(tx.getTransactionId())
                .stream()
                .map(DtoMapper::toTransactionEntryResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransactionLimit> getTransferLimits() {
        return limitRepository.findAll();
    }

    @Override
    @Transactional
    public TransactionLimit updateTransferLimit(Long limitId, TransferLimitUpdateRequest request, Long adminId) {
        TransactionLimit limit = limitRepository.findById(limitId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction limit not found with ID: " + limitId));

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin user not found"));

        limit.setMaximumSingleTransfer(request.getMaximumSingleTransfer());
        limit.setMaximumDailyTransfer(request.getMaximumDailyTransfer());
        limit.setMaximumDailyCount(request.getMaximumDailyCount());
        if (request.getActive() != null) {
            limit.setActive(request.getActive());
        }

        TransactionLimit updated = limitRepository.save(limit);

        auditService.logAction(admin, "ADMIN_UPDATE_TRANSFER_LIMIT", "TRANSACTION_LIMIT", limit.getLimitId(),
                "Updated transfer limit for account type: " + (limit.getAccountType() != null ? limit.getAccountType().getTypeName() : "ALL"), null);

        return updated;
    }

    @Override
    @Transactional(readOnly = true)
    public List<AnnouncementResponse> getPublishedAnnouncements() {
        return announcementRepository.findByStatusOrderByCreatedAtDesc(AnnouncementStatus.PUBLISHED)
                .stream()
                .map(DtoMapper::toAnnouncementResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AnnouncementResponse> getAllAnnouncements(Pageable pageable) {
        Page<AnnouncementResponse> page = announcementRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(DtoMapper::toAnnouncementResponse);
        return PageResponse.of(page);
    }

    @Override
    @Transactional
    public AnnouncementResponse createAnnouncement(AnnouncementRequest request, Long adminId) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin user not found"));

        SystemAnnouncement announcement = new SystemAnnouncement();
        announcement.setTitle(request.getTitle().trim());
        announcement.setContent(request.getContent().trim());
        announcement.setStatus(request.getStatus() != null ? request.getStatus() : AnnouncementStatus.PUBLISHED);
        announcement.setCreatedByAdmin(admin);
        if (announcement.getStatus() == AnnouncementStatus.PUBLISHED) {
            announcement.setPublishedAt(LocalDateTime.now());
        }

        SystemAnnouncement saved = announcementRepository.save(announcement);

        auditService.logAction(admin, "CREATE_ANNOUNCEMENT", "SYSTEM_ANNOUNCEMENT", saved.getAnnouncementId(),
                "Created system announcement: " + saved.getTitle(), null);

        return DtoMapper.toAnnouncementResponse(saved);
    }
}
