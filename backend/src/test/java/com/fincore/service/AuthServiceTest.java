package com.fincore.service;

import com.fincore.dto.auth.AuthResponse;
import com.fincore.dto.auth.LoginRequest;
import com.fincore.dto.auth.RegisterRequest;
import com.fincore.dto.auth.UserSummaryDto;
import com.fincore.entity.Account;
import com.fincore.entity.AccountType;
import com.fincore.entity.Role;
import com.fincore.entity.User;
import com.fincore.enums.RoleName;
import com.fincore.enums.UserStatus;
import com.fincore.exception.BadRequestException;
import com.fincore.repository.*;
import com.fincore.security.JwtTokenProvider;
import com.fincore.security.UserPrincipal;
import com.fincore.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private AccountTypeRepository accountTypeRepository;

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private LoginAttemptRepository loginAttemptRepository;

    @Mock
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider tokenProvider;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private AuthServiceImpl authService;

    private User demoUser;
    private Role customerRole;

    @BeforeEach
    void setUp() {
        customerRole = new Role(RoleName.ROLE_CUSTOMER, "Customer role");
        customerRole.setRoleId(2L);

        demoUser = new User();
        demoUser.setUserId(2L);
        demoUser.setFullName("Aarav Sharma");
        demoUser.setEmail("aarav.sharma@fincore.demo");
        demoUser.setPasswordHash("$2a$10$hashedpassword");
        demoUser.setAccountStatus(UserStatus.ACTIVE);
        demoUser.setRoles(Collections.singleton(customerRole));
    }

    @Test
    @DisplayName("Should successfully authenticate customer and return JWT token")
    void testSuccessfulLogin() {
        LoginRequest request = new LoginRequest("aarav.sharma@fincore.demo", "Password@123");

        when(loginAttemptRepository.countByEmailIdentifierAndSuccessfulFalseAndAttemptedAtAfter(any(), any()))
                .thenReturn(0L);

        Authentication auth = mock(Authentication.class);
        UserPrincipal principal = UserPrincipal.create(demoUser);
        when(auth.getPrincipal()).thenReturn(principal);

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(tokenProvider.generateToken(auth)).thenReturn("mocked.jwt.token");
        when(userRepository.findById(2L)).thenReturn(Optional.of(demoUser));

        AuthResponse response = authService.login(request, "127.0.0.1");

        assertNotNull(response);
        assertEquals("mocked.jwt.token", response.getToken());
        assertEquals("aarav.sharma@fincore.demo", response.getEmail());
    }

    @Test
    @DisplayName("Should fail login on invalid credentials and record failure attempt")
    void testFailedLogin() {
        LoginRequest request = new LoginRequest("aarav.sharma@fincore.demo", "WrongPassword");

        when(loginAttemptRepository.countByEmailIdentifierAndSuccessfulFalseAndAttemptedAtAfter(any(), any()))
                .thenReturn(0L);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThrows(BadCredentialsException.class, () -> authService.login(request, "127.0.0.1"));
        verify(loginAttemptRepository).save(argThat(attempt -> !attempt.getSuccessful()));
    }

    @Test
    @DisplayName("Should register new user and auto-provision virtual savings account")
    void testSuccessfulRegistration() {
        RegisterRequest request = new RegisterRequest();
        request.setFullName("New Customer");
        request.setEmail("new.customer@fincore.demo");
        request.setPassword("Password@123");

        when(userRepository.existsByEmail("new.customer@fincore.demo")).thenReturn(false);
        when(roleRepository.findByRoleName(RoleName.ROLE_CUSTOMER)).thenReturn(Optional.of(customerRole));
        when(passwordEncoder.encode("Password@123")).thenReturn("$2a$10$encodedPassword");

        when(userRepository.save(any(User.class))).thenAnswer(i -> {
            User u = i.getArgument(0);
            u.setUserId(10L);
            return u;
        });

        AccountType savings = new AccountType();
        savings.setAccountTypeId(1L);
        savings.setTypeName("SAVINGS");
        when(accountTypeRepository.findByTypeName("SAVINGS")).thenReturn(Optional.of(savings));

        UserSummaryDto result = authService.register(request, "127.0.0.1");

        assertNotNull(result);
        assertEquals("new.customer@fincore.demo", result.getEmail());
        verify(accountRepository).save(any(Account.class));
    }

    @Test
    @DisplayName("Should reject registration with duplicate email")
    void testDuplicateEmailRegistration() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("aarav.sharma@fincore.demo");
        request.setPassword("Password@123");

        when(userRepository.existsByEmail("aarav.sharma@fincore.demo")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> authService.register(request, "127.0.0.1"));
        verify(userRepository, never()).save(any(User.class));
    }
}
