package com.fincore.util;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

public class ReferenceGenerator {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd");

    public static String generateTransactionReference() {
        String datePart = LocalDate.now().format(DATE_FORMATTER);
        int randomPart = 100000 + RANDOM.nextInt(900000);
        return "TXN-" + datePart + "-" + randomPart;
    }

    public static String generateIdempotencyKey() {
        long timestamp = System.currentTimeMillis();
        int randomPart = 100000 + RANDOM.nextInt(900000);
        return "IDEMP-" + timestamp + "-" + randomPart;
    }
}
