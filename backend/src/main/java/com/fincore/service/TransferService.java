package com.fincore.service;

import com.fincore.dto.transfer.*;

public interface TransferService {
    TransferResponseDto executeTransfer(Long userId, TransferRequestDto request, String clientIp);
    TransferResponseDto executeDeposit(Long userId, DepositRequestDto request, String clientIp);
    TransferResponseDto executeWithdrawal(Long userId, WithdrawalRequestDto request, String clientIp);
    ReceiptDto getTransferReceipt(String transactionReference, Long userId);
}
