package com.fincore.repository;

import com.fincore.entity.TransactionEntry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionEntryRepository extends JpaRepository<TransactionEntry, Long> {

    List<TransactionEntry> findByTransactionTransactionId(Long transactionId);

    Page<TransactionEntry> findByAccountAccountIdOrderByCreatedAtDesc(Long accountId, Pageable pageable);

    List<TransactionEntry> findByAccountAccountIdOrderByCreatedAtAsc(Long accountId);
}
