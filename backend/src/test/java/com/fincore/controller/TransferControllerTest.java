package com.fincore.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fincore.dto.transfer.ReceiptDto;
import com.fincore.dto.transfer.TransferRequestDto;
import com.fincore.dto.transfer.TransferResponseDto;
import com.fincore.enums.TransactionStatus;
import com.fincore.security.CustomUserDetailsService;
import com.fincore.security.JwtTokenProvider;
import com.fincore.service.TransferService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(TransferController.class)
@AutoConfigureMockMvc(addFilters = false)
public class TransferControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private TransferService transferService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @Test
    @DisplayName("POST /api/v1/transfers should reject invalid transfer request with negative or zero amount")
    void testInvalidTransferAmount() throws Exception {
        TransferRequestDto invalidRequest = new TransferRequestDto();
        invalidRequest.setSourceAccountId(1L);
        invalidRequest.setDestinationAccountNumber("ACC1000000002");
        invalidRequest.setAmount(new BigDecimal("0.00")); // Minimum is 1.00

        mockMvc.perform(post("/api/v1/transfers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorCode").value("VALIDATION_FAILED"));
    }

    @Test
    @DisplayName("GET /api/v1/transfers/{ref} should return transfer summary and simulated receipt")
    void testGetTransferReceipt() throws Exception {
        ReceiptDto receipt = new ReceiptDto();
        receipt.setTransactionReference("TXN-20260112-001");
        receipt.setTransactionType("Virtual Transfer");
        receipt.setAmount(new BigDecimal("15000.00"));
        receipt.setStatus(TransactionStatus.COMPLETED);

        when(transferService.getTransferReceipt(eq("TXN-20260112-001"), any())).thenReturn(receipt);

        mockMvc.perform(get("/api/v1/transfers/TXN-20260112-001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.transactionReference").value("TXN-20260112-001"))
                .andExpect(jsonPath("$.data.amount").value(15000.00));
    }
}
