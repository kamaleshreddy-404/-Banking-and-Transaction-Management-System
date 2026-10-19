package com.fincore.repository;

import com.fincore.entity.TransactionType;
import com.fincore.enums.TransactionTypeCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TransactionTypeRepository extends JpaRepository<TransactionType, Long> {
    Optional<TransactionType> findByTypeCode(TransactionTypeCode typeCode);
}
