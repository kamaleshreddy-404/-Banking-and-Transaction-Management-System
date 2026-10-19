package com.fincore.service.impl;

import com.fincore.dto.auth.UserSummaryDto;
import com.fincore.entity.User;
import com.fincore.exception.ResourceNotFoundException;
import com.fincore.mapper.DtoMapper;
import com.fincore.repository.UserRepository;
import com.fincore.service.AuditService;
import com.fincore.service.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final AuditService auditService;

    public UserServiceImpl(UserRepository userRepository, AuditService auditService) {
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    @Override
    @Transactional(readOnly = true)
    public UserSummaryDto getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        return DtoMapper.toUserSummaryDto(user);
    }

    @Override
    @Transactional
    public UserSummaryDto updateUserProfile(Long userId, UserSummaryDto updateDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        // Update allowed profile fields only (never alter balance, role, or credentials here)
        if (updateDto.getFullName() != null && !updateDto.getFullName().trim().isEmpty()) {
            user.setFullName(updateDto.getFullName().trim());
        }
        user.setPhone(updateDto.getPhone());
        user.setAddressLine(updateDto.getAddressLine());
        user.setCity(updateDto.getCity());
        user.setState(updateDto.getState());
        user.setPostalCode(updateDto.getPostalCode());

        User updatedUser = userRepository.save(user);

        auditService.logAction(user, "USER_PROFILE_UPDATED", "USER", user.getUserId(),
                "User updated contact and address profile details", null);

        return DtoMapper.toUserSummaryDto(updatedUser);
    }
}
