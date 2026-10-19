package com.fincore.util;

import java.security.SecureRandom;

public class AccountNumberGenerator {

    private static final SecureRandom RANDOM = new SecureRandom();

    public static String generate() {
        // Generates an account number in format ACC + 10 digits
        long number = 1000000000L + (long) (RANDOM.nextDouble() * 9000000000L);
        return "ACC" + number;
    }

    public static String mask(String accountNumber) {
        if (accountNumber == null || accountNumber.length() < 7) {
            return "****";
        }
        int len = accountNumber.length();
        String prefix = accountNumber.substring(0, 3);
        String suffix = accountNumber.substring(len - 4);
        return prefix + "•••" + suffix;
    }
}
