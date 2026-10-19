package com.fincore.mapper;

import com.fincore.dto.account.AccountResponse;
import com.fincore.dto.admin.AnnouncementResponse;
import com.fincore.dto.auth.UserSummaryDto;
import com.fincore.dto.beneficiary.BeneficiaryResponse;
import com.fincore.dto.notification.NotificationResponse;
import com.fincore.dto.support.SupportTicketResponse;
import com.fincore.dto.transaction.TransactionEntryResponse;
import com.fincore.dto.transaction.TransactionResponse;
import com.fincore.entity.*;
import com.fincore.util.AccountNumberGenerator;

import java.util.stream.Collectors;

public class DtoMapper {

    public static UserSummaryDto toUserSummaryDto(User user) {
        if (user == null) return null;
        UserSummaryDto dto = new UserSummaryDto();
        dto.setUserId(user.getUserId());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setAddressLine(user.getAddressLine());
        dto.setCity(user.getCity());
        dto.setState(user.getState());
        dto.setPostalCode(user.getPostalCode());
        dto.setAccountStatus(user.getAccountStatus());
        dto.setEmailVerified(user.getEmailVerified());
        dto.setCreatedAt(user.getCreatedAt());
        if (user.getRoles() != null) {
            dto.setRoles(user.getRoles().stream().map(r -> r.getRoleName().name()).collect(Collectors.toList()));
        }
        return dto;
    }

    public static AccountResponse toAccountResponse(Account account) {
        if (account == null) return null;
        AccountResponse dto = new AccountResponse();
        dto.setAccountId(account.getAccountId());
        if (account.getUser() != null) {
            dto.setUserId(account.getUser().getUserId());
            dto.setOwnerName(account.getUser().getFullName());
        }
        if (account.getAccountType() != null) {
            dto.setAccountTypeId(account.getAccountType().getAccountTypeId());
            dto.setAccountTypeName(account.getAccountType().getTypeName());
        }
        dto.setAccountNumber(account.getAccountNumber());
        dto.setMaskedAccountNumber(AccountNumberGenerator.mask(account.getAccountNumber()));
        dto.setAccountName(account.getAccountName());
        dto.setCurrencyCode(account.getCurrencyCode());
        dto.setBalance(account.getBalance());
        dto.setAccountStatus(account.getAccountStatus());
        dto.setOpenedAt(account.getOpenedAt());
        dto.setUpdatedAt(account.getUpdatedAt());
        return dto;
    }

    public static BeneficiaryResponse toBeneficiaryResponse(Beneficiary beneficiary) {
        if (beneficiary == null) return null;
        BeneficiaryResponse dto = new BeneficiaryResponse();
        dto.setBeneficiaryId(beneficiary.getBeneficiaryId());
        if (beneficiary.getOwnerUser() != null) {
            dto.setOwnerUserId(beneficiary.getOwnerUser().getUserId());
        }
        dto.setBeneficiaryName(beneficiary.getBeneficiaryName());
        if (beneficiary.getBeneficiaryAccount() != null) {
            dto.setBeneficiaryAccountId(beneficiary.getBeneficiaryAccount().getAccountId());
            dto.setBeneficiaryAccountNumber(beneficiary.getBeneficiaryAccount().getAccountNumber());
            dto.setMaskedAccountNumber(AccountNumberGenerator.mask(beneficiary.getBeneficiaryAccount().getAccountNumber()));
        }
        dto.setNickname(beneficiary.getNickname());
        dto.setStatus(beneficiary.getStatus());
        dto.setCreatedAt(beneficiary.getCreatedAt());
        return dto;
    }

    public static TransactionResponse toTransactionResponse(Transaction tx, Long currentUserId) {
        if (tx == null) return null;
        TransactionResponse dto = new TransactionResponse();
        dto.setTransactionId(tx.getTransactionId());
        dto.setTransactionReference(tx.getTransactionReference());
        if (tx.getTransactionType() != null) {
            dto.setTransactionType(tx.getTransactionType().getTypeCode());
            dto.setTransactionTypeDisplay(tx.getTransactionType().getDisplayName());
        }
        if (tx.getSourceAccount() != null) {
            dto.setSourceAccountId(tx.getSourceAccount().getAccountId());
            dto.setSourceAccountNumber(tx.getSourceAccount().getAccountNumber());
            dto.setSourceMaskedAccountNumber(AccountNumberGenerator.mask(tx.getSourceAccount().getAccountNumber()));
            if (tx.getSourceAccount().getUser() != null) {
                dto.setSourceAccountOwnerName(tx.getSourceAccount().getUser().getFullName());
            }
        }
        if (tx.getDestinationAccount() != null) {
            dto.setDestinationAccountId(tx.getDestinationAccount().getAccountId());
            dto.setDestinationAccountNumber(tx.getDestinationAccount().getAccountNumber());
            dto.setDestinationMaskedAccountNumber(AccountNumberGenerator.mask(tx.getDestinationAccount().getAccountNumber()));
            if (tx.getDestinationAccount().getUser() != null) {
                dto.setDestinationAccountOwnerName(tx.getDestinationAccount().getUser().getFullName());
            }
        }
        dto.setAmount(tx.getAmount());
        dto.setCurrencyCode(tx.getCurrencyCode());
        dto.setStatus(tx.getStatus());
        dto.setDescription(tx.getDescription());
        dto.setFailureReason(tx.getFailureReason());
        dto.setCreatedAt(tx.getCreatedAt());
        dto.setCompletedAt(tx.getCompletedAt());

        // Direction logic relative to current authenticated user
        if (currentUserId != null) {
            boolean isSourceOwner = tx.getSourceAccount() != null && tx.getSourceAccount().getUser() != null && tx.getSourceAccount().getUser().getUserId().equals(currentUserId);
            boolean isDestOwner = tx.getDestinationAccount() != null && tx.getDestinationAccount().getUser() != null && tx.getDestinationAccount().getUser().getUserId().equals(currentUserId);

            if (isSourceOwner && isDestOwner) {
                dto.setDirection("INTERNAL");
            } else if (isSourceOwner) {
                dto.setDirection("DEBIT");
            } else if (isDestOwner) {
                dto.setDirection("CREDIT");
            } else {
                dto.setDirection("TRANSFER");
            }
        } else {
            dto.setDirection("TRANSFER");
        }

        return dto;
    }

    public static TransactionEntryResponse toTransactionEntryResponse(TransactionEntry entry) {
        if (entry == null) return null;
        TransactionEntryResponse dto = new TransactionEntryResponse();
        dto.setEntryId(entry.getEntryId());
        if (entry.getTransaction() != null) {
            dto.setTransactionId(entry.getTransaction().getTransactionId());
            dto.setTransactionReference(entry.getTransaction().getTransactionReference());
        }
        if (entry.getAccount() != null) {
            dto.setAccountId(entry.getAccount().getAccountId());
            dto.setAccountNumber(entry.getAccount().getAccountNumber());
        }
        dto.setEntryType(entry.getEntryType());
        dto.setAmount(entry.getAmount());
        dto.setBalanceAfter(entry.getBalanceAfter());
        dto.setCreatedAt(entry.getCreatedAt());
        return dto;
    }

    public static NotificationResponse toNotificationResponse(Notification n) {
        if (n == null) return null;
        NotificationResponse dto = new NotificationResponse();
        dto.setNotificationId(n.getNotificationId());
        dto.setNotificationType(n.getNotificationType());
        dto.setTitle(n.getTitle());
        dto.setMessage(n.getMessage());
        dto.setIsRead(n.getIsRead());
        if (n.getRelatedTransaction() != null) {
            dto.setRelatedTransactionId(n.getRelatedTransaction().getTransactionId());
        }
        dto.setCreatedAt(n.getCreatedAt());
        dto.setReadAt(n.getReadAt());
        return dto;
    }

    public static SupportTicketResponse toSupportTicketResponse(SupportTicket ticket) {
        if (ticket == null) return null;
        SupportTicketResponse dto = new SupportTicketResponse();
        dto.setTicketId(ticket.getTicketId());
        if (ticket.getUser() != null) {
            dto.setUserId(ticket.getUser().getUserId());
            dto.setUserFullName(ticket.getUser().getFullName());
            dto.setUserEmail(ticket.getUser().getEmail());
        }
        dto.setSubject(ticket.getSubject());
        dto.setDescription(ticket.getDescription());
        dto.setPriority(ticket.getPriority());
        dto.setStatus(ticket.getStatus());
        if (ticket.getAssignedAdmin() != null) {
            dto.setAssignedAdminId(ticket.getAssignedAdmin().getUserId());
            dto.setAssignedAdminName(ticket.getAssignedAdmin().getFullName());
        }
        dto.setCreatedAt(ticket.getCreatedAt());
        dto.setUpdatedAt(ticket.getUpdatedAt());
        dto.setResolvedAt(ticket.getResolvedAt());
        return dto;
    }

    public static AnnouncementResponse toAnnouncementResponse(SystemAnnouncement announcement) {
        if (announcement == null) return null;
        AnnouncementResponse dto = new AnnouncementResponse();
        dto.setAnnouncementId(announcement.getAnnouncementId());
        dto.setTitle(announcement.getTitle());
        dto.setContent(announcement.getContent());
        dto.setStatus(announcement.getStatus());
        if (announcement.getCreatedByAdmin() != null) {
            dto.setCreatedByAdminId(announcement.getCreatedByAdmin().getUserId());
            dto.setCreatedByAdminName(announcement.getCreatedByAdmin().getFullName());
        }
        dto.setPublishedAt(announcement.getPublishedAt());
        dto.setCreatedAt(announcement.getCreatedAt());
        dto.setUpdatedAt(announcement.getUpdatedAt());
        return dto;
    }
}
