package com.fincore.repository;

import com.fincore.entity.Transaction;
import com.fincore.enums.TransactionStatus;
import com.fincore.enums.TransactionTypeCode;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    Optional<Transaction> findByTransactionReference(String transactionReference);

    Optional<Transaction> findByIdempotencyKey(String idempotencyKey);

    @Query("SELECT t FROM Transaction t WHERE " +
           "(t.sourceAccount.user.userId = :userId OR t.destinationAccount.user.userId = :userId) " +
           "AND (:typeCode IS NULL OR t.transactionType.typeCode = :typeCode) " +
           "AND (:status IS NULL OR t.status = :status) " +
           "AND (:startDate IS NULL OR t.createdAt >= :startDate) " +
           "AND (:endDate IS NULL OR t.createdAt <= :endDate) " +
           "AND (:reference IS NULL OR LOWER(t.transactionReference) LIKE LOWER(CONCAT('%', :reference, '%')))")
    Page<Transaction> findCustomerTransactions(
            @Param("userId") Long userId,
            @Param("typeCode") TransactionTypeCode typeCode,
            @Param("status") TransactionStatus status,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("reference") String reference,
            Pageable pageable
    );

    @Query("SELECT t FROM Transaction t WHERE " +
           "(t.sourceAccount.accountId = :accountId OR t.destinationAccount.accountId = :accountId) " +
           "ORDER BY t.createdAt DESC")
    Page<Transaction> findByAccountId(@Param("accountId") Long accountId, Pageable pageable);

    @Query("SELECT t FROM Transaction t WHERE " +
           "(t.sourceAccount.user.userId = :userId OR t.destinationAccount.user.userId = :userId) " +
           "ORDER BY t.createdAt DESC")
    List<Transaction> findTop10ByUserId(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT t FROM Transaction t WHERE " +
           "(:query IS NULL OR LOWER(t.transactionReference) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(t.description) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "AND (:status IS NULL OR t.status = :status) " +
           "AND (:typeCode IS NULL OR t.transactionType.typeCode = :typeCode)")
    Page<Transaction> searchAdminTransactions(
            @Param("query") String query,
            @Param("status") TransactionStatus status,
            @Param("typeCode") TransactionTypeCode typeCode,
            Pageable pageable
    );

    @Query("SELECT COALESCE(SUM(t.amount), 0.00) FROM Transaction t " +
           "WHERE t.sourceAccount.accountId = :accountId " +
           "AND t.transactionType.typeCode = 'TRANSFER' " +
           "AND t.status = 'COMPLETED' " +
           "AND t.createdAt >= :startOfDay")
    BigDecimal sumDailyTransferAmount(
            @Param("accountId") Long accountId,
            @Param("startOfDay") LocalDateTime startOfDay
    );

    @Query("SELECT COUNT(t) FROM Transaction t " +
           "WHERE t.sourceAccount.accountId = :accountId " +
           "AND t.transactionType.typeCode = 'TRANSFER' " +
           "AND t.status = 'COMPLETED' " +
           "AND t.createdAt >= :startOfDay")
    long countDailyTransfers(
            @Param("accountId") Long accountId,
            @Param("startOfDay") LocalDateTime startOfDay
    );

    long countByStatus(TransactionStatus status);
}
