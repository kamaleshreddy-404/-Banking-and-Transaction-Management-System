package com.fincore.service.impl;

import com.fincore.dto.common.PageResponse;
import com.fincore.dto.transaction.TransactionResponse;
import com.fincore.entity.Transaction;
import com.fincore.enums.TransactionStatus;
import com.fincore.enums.TransactionTypeCode;
import com.fincore.exception.ResourceNotFoundException;
import com.fincore.exception.UnauthorizedAccessException;
import com.fincore.mapper.DtoMapper;
import com.fincore.repository.TransactionRepository;
import com.fincore.service.TransactionService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;

    public TransactionServiceImpl(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<TransactionResponse> getCustomerTransactions(
            Long userId,
            TransactionTypeCode type,
            TransactionStatus status,
            LocalDateTime startDate,
            LocalDateTime endDate,
            String reference,
            Pageable pageable) {

        Page<TransactionResponse> page = transactionRepository.findCustomerTransactions(
                userId, type, status, startDate, endDate, reference, pageable
        ).map(tx -> DtoMapper.toTransactionResponse(tx, userId));

        return PageResponse.of(page);
    }

    @Override
    @Transactional(readOnly = true)
    public TransactionResponse getTransactionByReference(String reference, Long userId) {
        Transaction tx = transactionRepository.findByTransactionReference(reference)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with reference: " + reference));

        boolean isAuthorized = (tx.getSourceAccount() != null && tx.getSourceAccount().getUser().getUserId().equals(userId))
                || (tx.getDestinationAccount() != null && tx.getDestinationAccount().getUser().getUserId().equals(userId))
                || tx.getInitiatedByUser().getUserId().equals(userId);

        if (!isAuthorized) {
            throw new UnauthorizedAccessException("You are not authorized to view details for this transaction");
        }

        return DtoMapper.toTransactionResponse(tx, userId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransactionResponse> getRecentTransactions(Long userId) {
        Pageable top10 = PageRequest.of(0, 10);
        return transactionRepository.findTop10ByUserId(userId, top10)
                .stream()
                .map(tx -> DtoMapper.toTransactionResponse(tx, userId))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportTransactionsCsv(Long userId, LocalDateTime startDate, LocalDateTime endDate) {
        Pageable pageable = PageRequest.of(0, 1000);
        Page<Transaction> page = transactionRepository.findCustomerTransactions(
                userId, null, null, startDate, endDate, null, pageable);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (PrintWriter writer = new PrintWriter(out, true, StandardCharsets.UTF_8)) {
            writer.println("Transaction Reference,Type,Source Account,Destination Account,Amount (INR),Status,Direction,Date,Description");

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

            for (Transaction tx : page.getContent()) {
                TransactionResponse resp = DtoMapper.toTransactionResponse(tx, userId);
                writer.printf("\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"%n",
                        resp.getTransactionReference(),
                        resp.getTransactionTypeDisplay() != null ? resp.getTransactionTypeDisplay() : "",
                        resp.getSourceMaskedAccountNumber() != null ? resp.getSourceMaskedAccountNumber() : "-",
                        resp.getDestinationMaskedAccountNumber() != null ? resp.getDestinationMaskedAccountNumber() : "-",
                        resp.getAmount() != null ? resp.getAmount().toPlainString() : "0.00",
                        resp.getStatus() != null ? resp.getStatus().name() : "",
                        resp.getDirection() != null ? resp.getDirection() : "",
                        resp.getCreatedAt() != null ? resp.getCreatedAt().format(formatter) : "",
                        resp.getDescription() != null ? resp.getDescription().replace("\"", "\"\"") : ""
                );
            }
        }

        return out.toByteArray();
    }
}
