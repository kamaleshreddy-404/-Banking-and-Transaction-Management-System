package com.fincore.repository;

import com.fincore.entity.Account;
import com.fincore.enums.AccountStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {

    Optional<Account> findByAccountNumber(String accountNumber);

    List<Account> findByUserUserId(Long userId);

    List<Account> findByUserUserIdAndAccountStatus(Long userId, AccountStatus status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM Account a WHERE a.accountId = :accountId")
    Optional<Account> findAccountForUpdate(@Param("accountId") Long accountId);

    @Query("SELECT COALESCE(SUM(a.balance), 0.00) FROM Account a WHERE a.user.userId = :userId AND a.accountStatus = 'ACTIVE'")
    BigDecimal sumActiveBalanceByUserId(@Param("userId") Long userId);

    @Query("SELECT COALESCE(SUM(a.balance), 0.00) FROM Account a")
    BigDecimal sumTotalSystemBalance();

    long countByAccountStatus(AccountStatus status);

    @Query("SELECT a FROM Account a WHERE " +
           "(:query IS NULL OR a.accountNumber LIKE CONCAT('%', :query, '%') OR LOWER(a.accountName) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(a.user.email) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "AND (:status IS NULL OR a.accountStatus = :status)")
    Page<Account> searchAccounts(@Param("query") String query, @Param("status") AccountStatus status, Pageable pageable);
}
