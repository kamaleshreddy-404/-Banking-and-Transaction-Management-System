package com.fincore.repository;

import com.fincore.entity.Beneficiary;
import com.fincore.enums.BeneficiaryStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BeneficiaryRepository extends JpaRepository<Beneficiary, Long> {

    List<Beneficiary> findByOwnerUserUserId(Long userId);

    List<Beneficiary> findByOwnerUserUserIdAndStatus(Long userId, BeneficiaryStatus status);

    Optional<Beneficiary> findByOwnerUserUserIdAndBeneficiaryAccountAccountId(Long userId, Long beneficiaryAccountId);

    Optional<Beneficiary> findByBeneficiaryIdAndOwnerUserUserId(Long beneficiaryId, Long userId);

    boolean existsByOwnerUserUserIdAndBeneficiaryAccountAccountId(Long userId, Long beneficiaryAccountId);
}
