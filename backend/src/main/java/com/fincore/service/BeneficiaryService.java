package com.fincore.service;

import com.fincore.dto.beneficiary.BeneficiaryRequest;
import com.fincore.dto.beneficiary.BeneficiaryResponse;
import com.fincore.enums.BeneficiaryStatus;

import java.util.List;

public interface BeneficiaryService {
    List<BeneficiaryResponse> getUserBeneficiaries(Long userId);
    BeneficiaryResponse addBeneficiary(Long userId, BeneficiaryRequest request);
    BeneficiaryResponse updateBeneficiary(Long userId, Long beneficiaryId, BeneficiaryRequest request);
    BeneficiaryResponse updateBeneficiaryStatus(Long userId, Long beneficiaryId, BeneficiaryStatus status);
    void deleteBeneficiary(Long userId, Long beneficiaryId);
}
