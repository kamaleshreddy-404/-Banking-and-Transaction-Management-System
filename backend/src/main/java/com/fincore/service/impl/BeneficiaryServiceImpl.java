package com.fincore.service.impl;

import com.fincore.dto.beneficiary.BeneficiaryRequest;
import com.fincore.dto.beneficiary.BeneficiaryResponse;
import com.fincore.entity.Account;
import com.fincore.entity.Beneficiary;
import com.fincore.entity.User;
import com.fincore.enums.AccountStatus;
import com.fincore.enums.BeneficiaryStatus;
import com.fincore.exception.BadRequestException;
import com.fincore.exception.ResourceNotFoundException;
import com.fincore.exception.UnauthorizedAccessException;
import com.fincore.mapper.DtoMapper;
import com.fincore.repository.AccountRepository;
import com.fincore.repository.BeneficiaryRepository;
import com.fincore.repository.UserRepository;
import com.fincore.service.AuditService;
import com.fincore.service.BeneficiaryService;
import com.fincore.service.NotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BeneficiaryServiceImpl implements BeneficiaryService {

    private final BeneficiaryRepository beneficiaryRepository;
    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;
    private final NotificationService notificationService;

    public BeneficiaryServiceImpl(BeneficiaryRepository beneficiaryRepository,
                                  AccountRepository accountRepository,
                                  UserRepository userRepository,
                                  AuditService auditService,
                                  NotificationService notificationService) {
        this.beneficiaryRepository = beneficiaryRepository;
        this.accountRepository = accountRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
        this.notificationService = notificationService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<BeneficiaryResponse> getUserBeneficiaries(Long userId) {
        return beneficiaryRepository.findByOwnerUserUserId(userId)
                .stream()
                .map(DtoMapper::toBeneficiaryResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public BeneficiaryResponse addBeneficiary(Long userId, BeneficiaryRequest request) {
        User owner = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Account targetAccount = accountRepository.findByAccountNumber(request.getAccountNumber().trim())
                .orElseThrow(() -> new BadRequestException("Beneficiary account number does not exist"));

        if (targetAccount.getUser().getUserId().equals(userId)) {
            throw new BadRequestException("You cannot add your own account as a beneficiary");
        }

        if (targetAccount.getAccountStatus() != AccountStatus.ACTIVE) {
            throw new BadRequestException("Destination account is currently inactive or frozen");
        }

        if (beneficiaryRepository.existsByOwnerUserUserIdAndBeneficiaryAccountAccountId(userId, targetAccount.getAccountId())) {
            throw new BadRequestException("Beneficiary account is already registered in your list");
        }

        Beneficiary beneficiary = new Beneficiary();
        beneficiary.setOwnerUser(owner);
        beneficiary.setBeneficiaryName(request.getBeneficiaryName().trim());
        beneficiary.setBeneficiaryAccount(targetAccount);
        beneficiary.setNickname(request.getNickname() != null ? request.getNickname().trim() : null);
        beneficiary.setStatus(BeneficiaryStatus.ACTIVE);

        Beneficiary saved = beneficiaryRepository.save(beneficiary);

        auditService.logAction(owner, "ADD_BENEFICIARY", "BENEFICIARY", saved.getBeneficiaryId(),
                "Added beneficiary: " + saved.getBeneficiaryName() + " (" + targetAccount.getAccountNumber() + ")", null);

        notificationService.createNotification(owner, "BENEFICIARY_ADDED", "Beneficiary Added",
                "Successfully added " + saved.getBeneficiaryName() + " as a virtual transfer recipient.", null);

        return DtoMapper.toBeneficiaryResponse(saved);
    }

    @Override
    @Transactional
    public BeneficiaryResponse updateBeneficiary(Long userId, Long beneficiaryId, BeneficiaryRequest request) {
        Beneficiary beneficiary = beneficiaryRepository.findByBeneficiaryIdAndOwnerUserUserId(beneficiaryId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Beneficiary not found or unauthorized"));

        if (request.getBeneficiaryName() != null && !request.getBeneficiaryName().trim().isEmpty()) {
            beneficiary.setBeneficiaryName(request.getBeneficiaryName().trim());
        }
        beneficiary.setNickname(request.getNickname() != null ? request.getNickname().trim() : beneficiary.getNickname());

        Beneficiary updated = beneficiaryRepository.save(beneficiary);
        return DtoMapper.toBeneficiaryResponse(updated);
    }

    @Override
    @Transactional
    public BeneficiaryResponse updateBeneficiaryStatus(Long userId, Long beneficiaryId, BeneficiaryStatus status) {
        Beneficiary beneficiary = beneficiaryRepository.findByBeneficiaryIdAndOwnerUserUserId(beneficiaryId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Beneficiary not found or unauthorized"));

        beneficiary.setStatus(status);
        Beneficiary updated = beneficiaryRepository.save(beneficiary);
        return DtoMapper.toBeneficiaryResponse(updated);
    }

    @Override
    @Transactional
    public void deleteBeneficiary(Long userId, Long beneficiaryId) {
        Beneficiary beneficiary = beneficiaryRepository.findByBeneficiaryIdAndOwnerUserUserId(beneficiaryId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Beneficiary not found or unauthorized"));

        beneficiaryRepository.delete(beneficiary);
    }
}
