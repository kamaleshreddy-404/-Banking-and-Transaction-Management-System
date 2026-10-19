package com.fincore.service;

import com.fincore.dto.common.PageResponse;
import com.fincore.dto.transaction.TransactionResponse;
import com.fincore.enums.TransactionStatus;
import com.fincore.enums.TransactionTypeCode;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

public interface TransactionService {
    PageResponse<TransactionResponse> getCustomerTransactions(
            Long userId,
            TransactionTypeCode type,
            TransactionStatus status,
            LocalDateTime startDate,
            LocalDateTime endDate,
            String reference,
            Pageable pageable
    );
    TransactionResponse getTransactionByReference(String reference, Long userId);
    List<TransactionResponse> getRecentTransactions(Long userId);
    byte[] exportTransactionsCsv(Long userId, LocalDateTime startDate, LocalDateTime endDate);
}
