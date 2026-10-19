package com.fincore.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fincore.dto.auth.AuthResponse;
import com.fincore.dto.auth.LoginRequest;
import com.fincore.dto.auth.RegisterRequest;
import com.fincore.dto.auth.UserSummaryDto;
import com.fincore.security.CustomUserDetailsService;
import com.fincore.security.JwtTokenProvider;
import com.fincore.service.AuthService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false) // Bypass security filters for focused controller unit tests
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @Test
    @DisplayName("POST /api/v1/auth/login should return 200 with JWT token for valid credentials")
    void testLoginSuccess() throws Exception {
        LoginRequest request = new LoginRequest("aarav.sharma@fincore.demo", "Password@123");
        AuthResponse response = new AuthResponse("mocked.jwt.token", 2L, "Aarav Sharma", "aarav.sharma@fincore.demo", Collections.singletonList("ROLE_CUSTOMER"));

        when(authService.login(any(LoginRequest.class), any())).thenReturn(response);

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").value("mocked.jwt.token"))
                .andExpect(jsonPath("$.data.email").value("aarav.sharma@fincore.demo"));
    }

    @Test
    @DisplayName("POST /api/v1/auth/login should return 401 when authentication fails")
    void testLoginFailure() throws Exception {
        LoginRequest request = new LoginRequest("aarav.sharma@fincore.demo", "WrongPassword");

        when(authService.login(any(LoginRequest.class), any()))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.errorCode").value("INVALID_CREDENTIALS"));
    }

    @Test
    @DisplayName("POST /api/v1/auth/register should return 201 for valid registration")
    void testRegisterSuccess() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setFullName("Test User");
        request.setEmail("test.user@fincore.demo");
        request.setPassword("Password@123");

        UserSummaryDto summary = new UserSummaryDto();
        summary.setUserId(20L);
        summary.setEmail("test.user@fincore.demo");
        summary.setFullName("Test User");

        when(authService.register(any(RegisterRequest.class), any())).thenReturn(summary);

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value("test.user@fincore.demo"));
    }

    @Test
    @DisplayName("POST /api/v1/auth/register should return 400 when validation fails")
    void testRegisterValidationFailure() throws Exception {
        RegisterRequest invalidRequest = new RegisterRequest();
        invalidRequest.setEmail("invalid-email"); // Missing name and short password

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorCode").value("VALIDATION_FAILED"));
    }
}
