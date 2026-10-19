package com.fincore.service.impl;

import com.fincore.dto.auth.*;
import com.fincore.entity.*;
import com.fincore.enums.AccountStatus;
import com.fincore.enums.RoleName;
import com.fincore.enums.UserStatus;
import com.fincore.exception.BadRequestException;
import com.fincore.exception.ResourceNotFoundException;
import com.fincore.mapper.DtoMapper;
import com.fincore.repository.*;
import com.fincore.security.JwtTokenProvider;
import com.fincore.security.UserPrincipal;
import com.fincore.service.AuditService;
import com.fincore.service.AuthService;
import com.fincore.util.AccountNumberGenerator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AuthServiceImpl implements AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final AccountTypeRepository accountTypeRepository;
    private final AccountRepository accountRepository;
    private final LoginAttemptRepository loginAttemptRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final AuditService auditService;

    public AuthServiceImpl(UserRepository userRepository,
                           RoleRepository roleRepository,
                           AccountTypeRepository accountTypeRepository,
                           AccountRepository accountRepository,
                           LoginAttemptRepository loginAttemptRepository,
                           PasswordResetTokenRepository passwordResetTokenRepository,
                           PasswordEncoder passwordEncoder,
                           AuthenticationManager authenticationManager,
                           JwtTokenProvider tokenProvider,
                           AuditService auditService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.accountTypeRepository = accountTypeRepository;
        this.accountRepository = accountRepository;
        this.loginAttemptRepository = loginAttemptRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.auditService = auditService;
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request, String clientIp) {
        // Basic brute-force rate limit: max 5 failed attempts in the last 15 minutes
        LocalDateTime fifteenMinutesAgo = LocalDateTime.now().minusMinutes(15);
        long failedAttempts = loginAttemptRepository.countByEmailIdentifierAndSuccessfulFalseAndAttemptedAtAfter(
                request.getEmail().toLowerCase().trim(), fifteenMinutesAgo);

        if (failedAttempts >= 5) {
            log.warn("Rate limit exceeded for email: {}", request.getEmail());
            throw new BadRequestException("Too many failed login attempts. Please wait 15 minutes before trying again.");
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail().toLowerCase().trim(), request.getPassword())
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = tokenProvider.generateToken(authentication);

            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            User user = userRepository.findById(userPrincipal.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));

            // Record successful login attempt and audit log
            loginAttemptRepository.save(new LoginAttempt(request.getEmail().toLowerCase().trim(), true, clientIp));
            auditService.logAction(user, "USER_LOGIN", "USER", user.getUserId(),
                    "User logged in successfully from IP: " + clientIp, clientIp);

            return new AuthResponse(
                    jwt,
                    user.getUserId(),
                    user.getFullName(),
                    user.getEmail(),
                    user.getRoles().stream().map(r -> r.getRoleName().name()).collect(Collectors.toList())
            );
        } catch (BadCredentialsException ex) {
            loginAttemptRepository.save(new LoginAttempt(request.getEmail().toLowerCase().trim(), false, clientIp));
            throw ex;
        }
    }

    @Override
    @Transactional
    public UserSummaryDto register(RegisterRequest request, String clientIp) {
        String normalizedEmail = request.getEmail().toLowerCase().trim();
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new BadRequestException("Email address is already in use by another account");
        }

        Role customerRole = roleRepository.findByRoleName(RoleName.ROLE_CUSTOMER)
                .orElseThrow(() -> new ResourceNotFoundException("Default CUSTOMER role not found in database"));

        User user = new User();
        user.setFullName(request.getFullName().trim());
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setAddressLine(request.getAddressLine());
        user.setCity(request.getCity());
        user.setState(request.getState());
        user.setPostalCode(request.getPostalCode());
        user.setAccountStatus(UserStatus.ACTIVE);
        user.setEmailVerified(true); // Demo mode auto-verify
        user.setRoles(Collections.singleton(customerRole));

        User savedUser = userRepository.save(user);

        // Automatically provision an initial simulated savings account with ₹10,000 opening demo balance
        AccountType savingsType = accountTypeRepository.findByTypeName("SAVINGS")
                .orElseGet(() -> accountTypeRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> new ResourceNotFoundException("Account type not configured")));

        Account defaultAccount = new Account();
        defaultAccount.setUser(savedUser);
        defaultAccount.setAccountType(savingsType);
        defaultAccount.setAccountNumber(AccountNumberGenerator.generate());
        defaultAccount.setAccountName(savedUser.getFullName() + " Primary Savings");
        defaultAccount.setCurrencyCode("INR");
        defaultAccount.setBalance(new BigDecimal("10000.00"));
        defaultAccount.setAccountStatus(AccountStatus.ACTIVE);
        accountRepository.save(defaultAccount);

        auditService.logAction(savedUser, "USER_REGISTER", "USER", savedUser.getUserId(),
                "Customer registered and primary virtual account opened", clientIp);

        return DtoMapper.toUserSummaryDto(savedUser);
    }

    @Override
    @Transactional(readOnly = true)
    public UserSummaryDto getCurrentUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        return DtoMapper.toUserSummaryDto(user);
    }

    @Override
    @Transactional
    public String forgotPassword(PasswordResetRequest request) {
        String normalizedEmail = request.getEmail().toLowerCase().trim();
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new ResourceNotFoundException("No account found associated with that email"));

        String rawToken = UUID.randomUUID().toString();
        String tokenHash = passwordEncoder.encode(rawToken);

        PasswordResetToken resetToken = new PasswordResetToken(
                user,
                rawToken, // For simulated flow, store rawToken or tokenHash
                LocalDateTime.now().plusHours(1)
        );
        passwordResetTokenRepository.save(resetToken);

        auditService.logAction(user, "PASSWORD_RESET_REQUEST", "USER", user.getUserId(),
                "Password reset token generated for user", null);

        // In educational/demo mode, return the token directly so user can reset without an SMTP server
        return rawToken;
    }

    @Override
    @Transactional
    public void resetPassword(PasswordResetConfirmRequest request) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByTokenHash(request.getToken())
                .orElseThrow(() -> new BadRequestException("Invalid or expired password reset token"));

        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now()) || resetToken.getUsedAt() != null) {
            throw new BadRequestException("Reset token has already been used or has expired");
        }

        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        resetToken.setUsedAt(LocalDateTime.now());
        passwordResetTokenRepository.save(resetToken);

        auditService.logAction(user, "PASSWORD_RESET_COMPLETE", "USER", user.getUserId(),
                "Password reset completed successfully", null);
    }

    @Override
    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Current password provided does not match");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        auditService.logAction(user, "PASSWORD_CHANGED", "USER", user.getUserId(),
                "User changed account password", null);
    }
}
