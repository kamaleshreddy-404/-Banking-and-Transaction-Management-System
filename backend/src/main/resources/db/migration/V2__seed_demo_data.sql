-- ==============================================================================
-- FinCore – Banking and Transaction Management System
-- Synthetic Seed Data Script (MySQL 8.x)
-- Character Set: utf8mb4 | Collation: utf8mb4_unicode_ci
-- ALL DATA IS SIMULATED FOR EDUCATIONAL AND PORTFOLIO USE ONLY
-- ==============================================================================


-- ------------------------------------------------------------------------------
-- 1. ROLES
-- ------------------------------------------------------------------------------
INSERT IGNORE INTO roles (role_id, role_name, description, created_at) VALUES
(1, 'ROLE_ADMIN', 'Administrative access for system oversight, audits, and configuration', '2026-01-01 00:00:00'),
(2, 'ROLE_CUSTOMER', 'Standard customer access for simulated banking and transaction operations', '2026-01-01 00:00:00');

-- ------------------------------------------------------------------------------
-- 2. USERS (Password for all demo accounts: 'Password@123')
-- BCrypt Hash: $2a$10$tfPPezegAxTrSuoMT6yNzOAiB8N0rUDrtjpBMRL9uOcfp6tuA6oHa
-- ------------------------------------------------------------------------------
INSERT IGNORE INTO users (user_id, full_name, email, password_hash, phone, address_line, city, state, postal_code, account_status, email_verified, created_at, updated_at) VALUES
(1, 'System Administrator', 'admin@fincore.demo', '$2a$10$tfPPezegAxTrSuoMT6yNzOAiB8N0rUDrtjpBMRL9uOcfp6tuA6oHa', '+91 98765 00001', 'FinCore Tech Park, Tower A', 'Bengaluru', 'Karnataka', '560100', 'ACTIVE', TRUE, '2026-01-01 00:00:00', '2026-01-01 00:00:00'),
(2, 'Aarav Sharma', 'aarav.sharma@fincore.demo', '$2a$10$tfPPezegAxTrSuoMT6yNzOAiB8N0rUDrtjpBMRL9uOcfp6tuA6oHa', '+91 98765 11111', '42, MG Road, Indiranagar', 'Bengaluru', 'Karnataka', '560038', 'ACTIVE', TRUE, '2026-01-05 10:00:00', '2026-01-05 10:00:00'),
(3, 'Priya Patel', 'priya.patel@fincore.demo', '$2a$10$tfPPezegAxTrSuoMT6yNzOAiB8N0rUDrtjpBMRL9uOcfp6tuA6oHa', '+91 98765 22222', '18, CG Road, Navrangpura', 'Ahmedabad', 'Gujarat', '380009', 'ACTIVE', TRUE, '2026-01-06 11:30:00', '2026-01-06 11:30:00'),
(4, 'Rohit Verma', 'rohit.verma@fincore.demo', '$2a$10$tfPPezegAxTrSuoMT6yNzOAiB8N0rUDrtjpBMRL9uOcfp6tuA6oHa', '+91 98765 33333', '104, Park Street', 'Kolkata', 'West Bengal', '700016', 'ACTIVE', TRUE, '2026-01-07 09:15:00', '2026-01-07 09:15:00'),
(5, 'Ananya Iyer', 'ananya.iyer@fincore.demo', '$2a$10$tfPPezegAxTrSuoMT6yNzOAiB8N0rUDrtjpBMRL9uOcfp6tuA6oHa', '+91 98765 44444', '27, Anna Salai, T. Nagar', 'Chennai', 'Tamil Nadu', '600017', 'ACTIVE', TRUE, '2026-01-08 14:20:00', '2026-01-08 14:20:00'),
(6, 'Vikram Singh', 'vikram.singh@fincore.demo', '$2a$10$tfPPezegAxTrSuoMT6yNzOAiB8N0rUDrtjpBMRL9uOcfp6tuA6oHa', '+91 98765 55555', '55, Civil Lines', 'Jaipur', 'Rajasthan', '302006', 'ACTIVE', TRUE, '2026-01-09 16:45:00', '2026-01-09 16:45:00'),
(7, 'Sneha Reddy', 'sneha.reddy@fincore.demo', '$2a$10$tfPPezegAxTrSuoMT6yNzOAiB8N0rUDrtjpBMRL9uOcfp6tuA6oHa', '+91 98765 66666', '88, Jubilee Hills', 'Hyderabad', 'Telangana', '500033', 'ACTIVE', TRUE, '2026-01-10 12:10:00', '2026-01-10 12:10:00');

-- ------------------------------------------------------------------------------
-- 3. USER_ROLES
-- ------------------------------------------------------------------------------
INSERT IGNORE INTO user_roles (user_id, role_id) VALUES
(1, 1), -- Admin has ROLE_ADMIN
(1, 2), -- Admin also has ROLE_CUSTOMER for testing
(2, 2),
(3, 2),
(4, 2),
(5, 2),
(6, 2),
(7, 2);

-- ------------------------------------------------------------------------------
-- 4. ACCOUNT_TYPES
-- ------------------------------------------------------------------------------
INSERT IGNORE INTO account_types (account_type_id, type_name, description, minimum_balance, active, created_at) VALUES
(1, 'SAVINGS', 'Simulated standard individual savings account with interest simulation', 1000.00, TRUE, '2026-01-01 00:00:00'),
(2, 'CURRENT', 'Simulated business operating current account with higher limits', 5000.00, TRUE, '2026-01-01 00:00:00'),
(3, 'SALARY', 'Simulated corporate salary account with zero balance requirement', 0.00, TRUE, '2026-01-01 00:00:00');

-- ------------------------------------------------------------------------------
-- 5. ACCOUNTS (8 Accounts across 6 customers)
-- Reconciled balances based on transaction history
-- ------------------------------------------------------------------------------
INSERT IGNORE INTO accounts (account_id, user_id, account_type_id, account_number, account_name, currency_code, balance, account_status, opened_at, updated_at, version) VALUES
(1, 2, 1, 'ACC1000000001', 'Aarav Primary Savings', 'INR', 97500.00, 'ACTIVE', '2026-01-05 10:30:00', '2026-02-15 11:30:00', 0),
(2, 2, 2, 'ACC1000000002', 'Aarav Business Current', 'INR', 150000.00, 'ACTIVE', '2026-01-05 11:00:00', '2026-02-15 11:30:00', 0),
(3, 3, 1, 'ACC1000000003', 'Priya Wealth Savings', 'INR', 70000.00, 'ACTIVE', '2026-01-06 12:00:00', '2026-02-16 14:00:00', 0),
(4, 3, 3, 'ACC1000000004', 'Priya Corporate Salary', 'INR', 100000.00, 'ACTIVE', '2026-01-06 12:30:00', '2026-02-14 16:30:00', 0),
(5, 4, 1, 'ACC1000000005', 'Rohit Everyday Savings', 'INR', 50000.00, 'ACTIVE', '2026-01-07 10:00:00', '2026-02-12 10:15:00', 0),
(6, 5, 1, 'ACC1000000006', 'Ananya Premium Savings', 'INR', 62500.00, 'ACTIVE', '2026-01-08 15:00:00', '2026-02-13 18:00:00', 0),
(7, 6, 2, 'ACC1000000007', 'Vikram Trading Current', 'INR', 120000.00, 'ACTIVE', '2026-01-09 17:00:00', '2026-02-14 11:20:00', 0),
(8, 7, 1, 'ACC1000000008', 'Sneha Flexi Savings', 'INR', 86500.00, 'ACTIVE', '2026-01-10 13:00:00', '2026-02-16 14:00:00', 0);

-- ------------------------------------------------------------------------------
-- 6. BENEFICIARIES (16 Beneficiaries)
-- ------------------------------------------------------------------------------
INSERT IGNORE INTO beneficiaries (beneficiary_id, owner_user_id, beneficiary_name, beneficiary_account_id, nickname, status, created_at, updated_at) VALUES
(1, 2, 'Priya Patel', 3, 'Priya Personal', 'ACTIVE', '2026-01-10 10:00:00', '2026-01-10 10:00:00'),
(2, 2, 'Rohit Verma', 5, 'Rohit Friend', 'ACTIVE', '2026-01-11 11:00:00', '2026-01-11 11:00:00'),
(3, 2, 'Sneha Reddy', 8, 'Sneha Sister', 'ACTIVE', '2026-01-12 09:30:00', '2026-01-12 09:30:00'),
(4, 2, 'Vikram Singh', 7, 'Vikram Consultant', 'ACTIVE', '2026-01-13 15:00:00', '2026-01-13 15:00:00'),
(5, 3, 'Aarav Sharma', 1, 'Aarav Savings', 'ACTIVE', '2026-01-11 12:00:00', '2026-01-11 12:00:00'),
(6, 3, 'Rohit Verma', 5, 'Rohit Colleague', 'ACTIVE', '2026-01-12 14:00:00', '2026-01-12 14:00:00'),
(7, 3, 'Sneha Reddy', 8, 'Sneha Designer', 'ACTIVE', '2026-01-13 16:30:00', '2026-01-13 16:30:00'),
(8, 4, 'Vikram Singh', 7, 'Vikram Business', 'ACTIVE', '2026-01-14 10:30:00', '2026-01-14 10:30:00'),
(9, 4, 'Aarav Sharma', 1, 'Aarav Client', 'ACTIVE', '2026-01-14 11:45:00', '2026-01-14 11:45:00'),
(10, 5, 'Aarav Sharma', 1, 'Aarav Mentor', 'ACTIVE', '2026-01-15 09:00:00', '2026-01-15 09:00:00'),
(11, 5, 'Sneha Reddy', 8, 'Sneha Partner', 'ACTIVE', '2026-01-15 13:20:00', '2026-01-15 13:20:00'),
(12, 6, 'Sneha Reddy', 8, 'Sneha Supplier', 'ACTIVE', '2026-01-16 10:10:00', '2026-01-16 10:10:00'),
(13, 6, 'Rohit Verma', 5, 'Rohit Vendor', 'ACTIVE', '2026-01-16 11:20:00', '2026-01-16 11:20:00'),
(14, 7, 'Priya Patel', 3, 'Priya Consultant', 'ACTIVE', '2026-01-17 14:00:00', '2026-01-17 14:00:00'),
(15, 7, 'Aarav Sharma', 1, 'Aarav Brother', 'ACTIVE', '2026-01-17 15:30:00', '2026-01-17 15:30:00'),
(16, 2, 'Priya Salary Acc', 4, 'Priya Corporate', 'ACTIVE', '2026-01-18 10:00:00', '2026-01-18 10:00:00');

-- ------------------------------------------------------------------------------
-- 7. TRANSACTION_TYPES
-- ------------------------------------------------------------------------------
INSERT IGNORE INTO transaction_types (transaction_type_id, type_code, display_name, description, created_at) VALUES
(1, 'DEPOSIT', 'Virtual Deposit', 'Simulated fund credit to customer account', '2026-01-01 00:00:00'),
(2, 'WITHDRAWAL', 'Virtual Withdrawal', 'Simulated cash withdrawal or debit from account', '2026-01-01 00:00:00'),
(3, 'TRANSFER', 'Virtual Transfer', 'Simulated fund transfer between two FinCore accounts', '2026-01-01 00:00:00'),
(4, 'REVERSAL', 'Virtual Reversal', 'Simulated reversal of a previous transfer', '2026-01-01 00:00:00'),
(5, 'ADJUSTMENT', 'Balance Adjustment', 'Administrative balance correction or adjustment', '2026-01-01 00:00:00');

-- ------------------------------------------------------------------------------
-- 8. TRANSACTIONS & 9. TRANSACTION_ENTRIES (Double-entry reconciled)
-- Master records and ledger entries
-- ------------------------------------------------------------------------------

-- INITIAL VIRTUAL OPENING DEPOSITS FOR ALL 8 ACCOUNTS
-- TX 1: Deposit to Acc 1 (Aarav): 75,000.00
INSERT IGNORE INTO transactions (transaction_id, transaction_reference, transaction_type_id, source_account_id, destination_account_id, amount, currency_code, status, description, idempotency_key, initiated_by_user_id, created_at, completed_at)
VALUES (1, 'TXN-20260105-001', 1, NULL, 1, 75000.00, 'INR', 'COMPLETED', 'Initial simulated account credit', 'IDEMP-OPEN-ACC1', 2, '2026-01-05 10:35:00', '2026-01-05 10:35:01');
INSERT IGNORE INTO transaction_entries (entry_id, transaction_id, account_id, entry_type, amount, balance_after, created_at)
VALUES (1, 1, 1, 'CREDIT', 75000.00, 75000.00, '2026-01-05 10:35:01');

-- TX 2: Deposit to Acc 2 (Aarav Business): 150,000.00
INSERT IGNORE INTO transactions (transaction_id, transaction_reference, transaction_type_id, source_account_id, destination_account_id, amount, currency_code, status, description, idempotency_key, initiated_by_user_id, created_at, completed_at)
VALUES (2, 'TXN-20260105-002', 1, NULL, 2, 150000.00, 'INR', 'COMPLETED', 'Initial business account seed credit', 'IDEMP-OPEN-ACC2', 2, '2026-01-05 11:05:00', '2026-01-05 11:05:01');
INSERT IGNORE INTO transaction_entries (entry_id, transaction_id, account_id, entry_type, amount, balance_after, created_at)
VALUES (2, 2, 2, 'CREDIT', 150000.00, 150000.00, '2026-01-05 11:05:01');

-- TX 3: Deposit to Acc 3 (Priya): 50,000.00
INSERT IGNORE INTO transactions (transaction_id, transaction_reference, transaction_type_id, source_account_id, destination_account_id, amount, currency_code, status, description, idempotency_key, initiated_by_user_id, created_at, completed_at)
VALUES (3, 'TXN-20260106-001', 1, NULL, 3, 50000.00, 'INR', 'COMPLETED', 'Initial simulated account credit', 'IDEMP-OPEN-ACC3', 3, '2026-01-06 12:05:00', '2026-01-06 12:05:01');
INSERT IGNORE INTO transaction_entries (entry_id, transaction_id, account_id, entry_type, amount, balance_after, created_at)
VALUES (3, 3, 3, 'CREDIT', 50000.00, 50000.00, '2026-01-06 12:05:01');

-- TX 4: Deposit to Acc 4 (Priya Salary): 85,000.00
INSERT IGNORE INTO transactions (transaction_id, transaction_reference, transaction_type_id, source_account_id, destination_account_id, amount, currency_code, status, description, idempotency_key, initiated_by_user_id, created_at, completed_at)
VALUES (4, 'TXN-20260106-002', 1, NULL, 4, 85000.00, 'INR', 'COMPLETED', 'Initial simulated salary deposit', 'IDEMP-OPEN-ACC4', 3, '2026-01-06 12:35:00', '2026-01-06 12:35:01');
INSERT IGNORE INTO transaction_entries (entry_id, transaction_id, account_id, entry_type, amount, balance_after, created_at)
VALUES (4, 4, 4, 'CREDIT', 85000.00, 85000.00, '2026-01-06 12:35:01');

-- TX 5: Deposit to Acc 5 (Rohit): 40,000.00
INSERT IGNORE INTO transactions (transaction_id, transaction_reference, transaction_type_id, source_account_id, destination_account_id, amount, currency_code, status, description, idempotency_key, initiated_by_user_id, created_at, completed_at)
VALUES (5, 'TXN-20260107-001', 1, NULL, 5, 40000.00, 'INR', 'COMPLETED', 'Initial simulated account credit', 'IDEMP-OPEN-ACC5', 4, '2026-01-07 10:05:00', '2026-01-07 10:05:01');
INSERT IGNORE INTO transaction_entries (entry_id, transaction_id, account_id, entry_type, amount, balance_after, created_at)
VALUES (5, 5, 5, 'CREDIT', 40000.00, 40000.00, '2026-01-07 10:05:01');

-- TX 6: Deposit to Acc 6 (Ananya): 60,000.00
INSERT IGNORE INTO transactions (transaction_id, transaction_reference, transaction_type_id, source_account_id, destination_account_id, amount, currency_code, status, description, idempotency_key, initiated_by_user_id, created_at, completed_at)
VALUES (6, 'TXN-20260108-001', 1, NULL, 6, 60000.00, 'INR', 'COMPLETED', 'Initial simulated account credit', 'IDEMP-OPEN-ACC6', 5, '2026-01-08 15:05:00', '2026-01-08 15:05:01');
INSERT IGNORE INTO transaction_entries (entry_id, transaction_id, account_id, entry_type, amount, balance_after, created_at)
VALUES (6, 6, 6, 'CREDIT', 60000.00, 60000.00, '2026-01-08 15:05:01');

-- TX 7: Deposit to Acc 7 (Vikram): 110,000.00
INSERT IGNORE INTO transactions (transaction_id, transaction_reference, transaction_type_id, source_account_id, destination_account_id, amount, currency_code, status, description, idempotency_key, initiated_by_user_id, created_at, completed_at)
VALUES (7, 'TXN-20260109-001', 1, NULL, 7, 110000.00, 'INR', 'COMPLETED', 'Initial simulated capital credit', 'IDEMP-OPEN-ACC7', 6, '2026-01-09 17:05:00', '2026-01-09 17:05:01');
INSERT IGNORE INTO transaction_entries (entry_id, transaction_id, account_id, entry_type, amount, balance_after, created_at)
VALUES (7, 7, 7, 'CREDIT', 110000.00, 110000.00, '2026-01-09 17:05:01');

-- TX 8: Deposit to Acc 8 (Sneha): 45,000.00
INSERT IGNORE INTO transactions (transaction_id, transaction_reference, transaction_type_id, source_account_id, destination_account_id, amount, currency_code, status, description, idempotency_key, initiated_by_user_id, created_at, completed_at)
VALUES (8, 'TXN-20260110-001', 1, NULL, 8, 45000.00, 'INR', 'COMPLETED', 'Initial simulated account credit', 'IDEMP-OPEN-ACC8', 7, '2026-01-10 13:05:00', '2026-01-10 13:05:01');
INSERT IGNORE INTO transaction_entries (entry_id, transaction_id, account_id, entry_type, amount, balance_after, created_at)
VALUES (8, 8, 8, 'CREDIT', 45000.00, 45000.00, '2026-01-10 13:05:01');

-- SUBSEQUENT ACTIVITY (TRANSFERS, WITHDRAWALS, DEPOSITS, REVERSALS, FAILED)
-- TX 9: Deposit to Acc 1 (Aarav): +25,000.00 (Acc 1 bal: 75000 -> 100000)
INSERT IGNORE INTO transactions (transaction_id, transaction_reference, transaction_type_id, source_account_id, destination_account_id, amount, currency_code, status, description, idempotency_key, initiated_by_user_id, created_at, completed_at)
VALUES (9, 'TXN-20260111-001', 1, NULL, 1, 25000.00, 'INR', 'COMPLETED', 'Virtual savings deposit via demo portal', 'IDEMP-DEP-001', 2, '2026-01-11 10:15:00', '2026-01-11 10:15:02');
INSERT IGNORE INTO transaction_entries (entry_id, transaction_id, account_id, entry_type, amount, balance_after, created_at)
VALUES (9, 9, 1, 'CREDIT', 25000.00, 100000.00, '2026-01-11 10:15:02');

-- TX 10: Transfer from Acc 1 (Aarav) to Acc 3 (Priya): 15,000.00 (Acc 1 bal: 85000, Acc 3 bal: 65000)
INSERT IGNORE INTO transactions (transaction_id, transaction_reference, transaction_type_id, source_account_id, destination_account_id, amount, currency_code, status, description, idempotency_key, initiated_by_user_id, created_at, completed_at)
VALUES (10, 'TXN-20260112-001', 3, 1, 3, 15000.00, 'INR', 'COMPLETED', 'Freelance UI design service payment', 'IDEMP-TRF-001', 2, '2026-01-12 11:00:00', '2026-01-12 11:00:02');
INSERT IGNORE INTO transaction_entries (entry_id, transaction_id, account_id, entry_type, amount, balance_after, created_at) VALUES
(10, 10, 1, 'DEBIT', 15000.00, 85000.00, '2026-01-12 11:00:02'),
(11, 10, 3, 'CREDIT', 15000.00, 65000.00, '2026-01-12 11:00:02');

-- TX 11: Transfer from Acc 1 (Aarav) to Acc 5 (Rohit): 5,000.00 (Acc 1 bal: 80000, Acc 5 bal: 45000)
INSERT IGNORE INTO transactions (transaction_id, transaction_reference, transaction_type_id, source_account_id, destination_account_id, amount, currency_code, status, description, idempotency_key, initiated_by_user_id, created_at, completed_at)
VALUES (11, 'TXN-20260113-001', 3, 1, 5, 5000.00, 'INR', 'COMPLETED', 'Dinner bill reimbursement', 'IDEMP-TRF-002', 2, '2026-01-13 14:20:00', '2026-01-13 14:20:02');
INSERT IGNORE INTO transaction_entries (entry_id, transaction_id, account_id, entry_type, amount, balance_after, created_at) VALUES
(12, 11, 1, 'DEBIT', 5000.00, 80000.00, '2026-01-13 14:20:02'),
(13, 11, 5, 'CREDIT', 5000.00, 45000.00, '2026-01-13 14:20:02');

-- TX 12: Transfer from Acc 6 (Ananya) to Acc 1 (Aarav): 10,000.00 (Acc 6 bal: 50000, Acc 1 bal: 90000)
INSERT IGNORE INTO transactions (transaction_id, transaction_reference, transaction_type_id, source_account_id, destination_account_id, amount, currency_code, status, description, idempotency_key, initiated_by_user_id, created_at, completed_at)
VALUES (12, 'TXN-20260114-001', 3, 6, 1, 10000.00, 'INR', 'COMPLETED', 'Course mentorship fee', 'IDEMP-TRF-003', 5, '2026-01-14 09:45:00', '2026-01-14 09:45:02');
INSERT IGNORE INTO transaction_entries (entry_id, transaction_id, account_id, entry_type, amount, balance_after, created_at) VALUES
(14, 12, 6, 'DEBIT', 10000.00, 50000.00, '2026-01-14 09:45:02'),
(15, 12, 1, 'CREDIT', 10000.00, 90000.00, '2026-01-14 09:45:02');

-- TX 13: Withdrawal from Acc 1 (Aarav): 5,000.00 (Acc 1 bal: 85000)
INSERT IGNORE INTO transactions (transaction_id, transaction_reference, transaction_type_id, source_account_id, destination_account_id, amount, currency_code, status, description, idempotency_key, initiated_by_user_id, created_at, completed_at)
VALUES (13, 'TXN-20260115-001', 2, 1, NULL, 5000.00, 'INR', 'COMPLETED', 'ATM virtual cash withdrawal', 'IDEMP-WTH-001', 2, '2026-01-15 16:30:00', '2026-01-15 16:30:01');
INSERT IGNORE INTO transaction_entries (entry_id, transaction_id, account_id, entry_type, amount, balance_after, created_at)
VALUES (16, 13, 1, 'DEBIT', 5000.00, 85000.00, '2026-01-15 16:30:01');

-- TX 14: Transfer from Acc 1 (Aarav) to Acc 8 (Sneha): 10,000.00 (Acc 1 bal: 75000, Acc 8 bal: 55000)
INSERT IGNORE INTO transactions (transaction_id, transaction_reference, transaction_type_id, source_account_id, destination_account_id, amount, currency_code, status, description, idempotency_key, initiated_by_user_id, created_at, completed_at)
VALUES (14, 'TXN-20260116-001', 3, 1, 8, 10000.00, 'INR', 'COMPLETED', 'Birthday gift transfer', 'IDEMP-TRF-004', 2, '2026-01-16 11:15:00', '2026-01-16 11:15:02');
INSERT IGNORE INTO transaction_entries (entry_id, transaction_id, account_id, entry_type, amount, balance_after, created_at) VALUES
(17, 14, 1, 'DEBIT', 10000.00, 75000.00, '2026-01-16 11:15:02'),
(18, 14, 8, 'CREDIT', 10000.00, 55000.00, '2026-01-16 11:15:02');

-- TX 15: Transfer from Acc 2 (Aarav Business) to Acc 7 (Vikram): 25,000.00 (Acc 2 bal: 125000, Acc 7 bal: 135000)
INSERT IGNORE INTO transactions (transaction_id, transaction_reference, transaction_type_id, source_account_id, destination_account_id, amount, currency_code, status, description, idempotency_key, initiated_by_user_id, created_at, completed_at)
VALUES (15, 'TXN-20260117-001', 3, 2, 7, 25000.00, 'INR', 'COMPLETED', 'IT equipment invoice settlement', 'IDEMP-TRF-005', 2, '2026-01-17 15:00:00', '2026-01-17 15:00:02');
INSERT IGNORE INTO transaction_entries (entry_id, transaction_id, account_id, entry_type, amount, balance_after, created_at) VALUES
(19, 15, 2, 'DEBIT', 25000.00, 125000.00, '2026-01-17 15:00:02'),
(20, 15, 7, 'CREDIT', 25000.00, 135000.00, '2026-01-17 15:00:02');

-- TX 16: Deposit to Acc 2 (Aarav Business): +50,000.00 (Acc 2 bal: 175000)
INSERT IGNORE INTO transactions (transaction_id, transaction_reference, transaction_type_id, source_account_id, destination_account_id, amount, currency_code, status, description, idempotency_key, initiated_by_user_id, created_at, completed_at)
VALUES (16, 'TXN-20260118-001', 1, NULL, 2, 50000.00, 'INR', 'COMPLETED', 'Client project milestone remittance', 'IDEMP-DEP-002', 2, '2026-01-18 10:30:00', '2026-01-18 10:30:02');
INSERT IGNORE INTO transaction_entries (entry_id, transaction_id, account_id, entry_type, amount, balance_after, created_at)
VALUES (21, 16, 2, 'CREDIT', 50000.00, 175000.00, '2026-01-18 10:30:02');

-- TX 17: Transfer from Acc 3 (Priya) to Acc 5 (Rohit): 8,000.00 (Acc 3 bal: 57000, Acc 5 bal: 53000)
INSERT IGNORE INTO transactions (transaction_id, transaction_reference, transaction_type_id, source_account_id, destination_account_id, amount, currency_code, status, description, idempotency_key, initiated_by_user_id, created_at, completed_at)
VALUES (17, 'TXN-20260119-001', 3, 3, 5, 8000.00, 'INR', 'COMPLETED', 'Shared apartment expenses', 'IDEMP-TRF-006', 3, '2026-01-19 12:10:00', '2026-01-19 12:10:02');
INSERT IGNORE INTO transaction_entries (entry_id, transaction_id, account_id, entry_type, amount, balance_after, created_at) VALUES
(22, 17, 3, 'DEBIT', 8000.00, 57000.00, '2026-01-19 12:10:02'),
(23, 17, 5, 'CREDIT', 8000.00, 53000.00, '2026-01-19 12:10:02');

-- TX 18: Transfer from Acc 3 (Priya) to Acc 8 (Sneha): 4,000.00 (Acc 3 bal: 53000, Acc 8 bal: 59000)
INSERT IGNORE INTO transactions (transaction_id, transaction_reference, transaction_type_id, source_account_id, destination_account_id, amount, currency_code, status, description, idempotency_key, initiated_by_user_id, created_at, completed_at)
VALUES (18, 'TXN-20260120-001', 3, 3, 8, 4000.00, 'INR', 'COMPLETED', 'Event photography advance', 'IDEMP-TRF-007', 3, '2026-01-20 14:00:00', '2026-01-20 14:00:02');
INSERT IGNORE INTO transaction_entries (entry_id, transaction_id, account_id, entry_type, amount, balance_after, created_at) VALUES
(24, 18, 3, 'DEBIT', 4000.00, 53000.00, '2026-01-20 14:00:02'),
(25, 18, 8, 'CREDIT', 4000.00, 59000.00, '2026-01-20 14:00:02');

-- TX 19: Deposit to Acc 3 (Priya): +20,000.00 (Acc 3 bal: 73000)
INSERT IGNORE INTO transactions (transaction_id, transaction_reference, transaction_type_id, source_account_id, destination_account_id, amount, currency_code, status, description, idempotency_key, initiated_by_user_id, created_at, completed_at)
VALUES (19, 'TXN-20260121-001', 1, NULL, 3, 20000.00, 'INR', 'COMPLETED', 'Quarterly bonus simulated credit', 'IDEMP-DEP-003', 3, '2026-01-21 16:40:00', '2026-01-21 16:40:02');
INSERT IGNORE INTO transaction_entries (entry_id, transaction_id, account_id, entry_type, amount, balance_after, created_at)
VALUES (26, 19, 3, 'CREDIT', 20000.00, 73000.00, '2026-01-21 16:40:02');

-- TX 20: Withdrawal from Acc 3 (Priya): 3,000.00 (Acc 3 bal: 70000)
INSERT IGNORE INTO transactions (transaction_id, transaction_reference, transaction_type_id, source_account_id, destination_account_id, amount, currency_code, status, description, idempotency_key, initiated_by_user_id, created_at, completed_at)
VALUES (20, 'TXN-20260122-001', 2, 3, NULL, 3000.00, 'INR', 'COMPLETED', 'Cash withdrawal', 'IDEMP-WTH-002', 3, '2026-01-22 11:20:00', '2026-01-22 11:20:01');
INSERT IGNORE INTO transaction_entries (entry_id, transaction_id, account_id, entry_type, amount, balance_after, created_at)
VALUES (27, 20, 3, 'DEBIT', 3000.00, 70000.00, '2026-01-22 11:20:01');

-- TX 21: Transfer from Acc 1 (Aarav) to Acc 4 (Priya Salary): 5,000.00 (Acc 1 bal: 70000, Acc 4 bal: 90000)
INSERT IGNORE INTO transactions (transaction_id, transaction_reference, transaction_type_id, source_account_id, destination_account_id, amount, currency_code, status, description, idempotency_key, initiated_by_user_id, created_at, completed_at)
VALUES (21, 'TXN-20260123-001', 3, 1, 4, 5000.00, 'INR', 'COMPLETED', 'Consultancy fee transfer', 'IDEMP-TRF-008', 2, '2026-01-23 10:10:00', '2026-01-23 10:10:02');
INSERT IGNORE INTO transaction_entries (entry_id, transaction_id, account_id, entry_type, amount, balance_after, created_at) VALUES
(28, 21, 1, 'DEBIT', 5000.00, 70000.00, '2026-01-23 10:10:02'),
(29, 21, 4, 'CREDIT', 5000.00, 90000.00, '2026-01-23 10:10:02');

-- TX 22: Transfer from Acc 4 (Priya Salary) to Acc 6 (Ananya): 10,000.00 (Acc 4 bal: 80000, Acc 6 bal: 60000)
INSERT IGNORE INTO transactions (transaction_id, transaction_reference, transaction_type_id, source_account_id, destination_account_id, amount, currency_code, status, description, idempotency_key, initiated_by_user_id, created_at, completed_at)
VALUES (22, 'TXN-20260124-001', 3, 4, 6, 10000.00, 'INR', 'COMPLETED', 'Graphic design contract payment', 'IDEMP-TRF-009', 3, '2026-01-24 13:15:00', '2026-01-24 13:15:02');
INSERT IGNORE INTO transaction_entries (entry_id, transaction_id, account_id, entry_type, amount, balance_after, created_at) VALUES
(30, 22, 4, 'DEBIT', 10000.00, 80000.00, '2026-01-24 13:15:02'),
(31, 22, 6, 'CREDIT', 10000.00, 60000.00, '2026-01-24 13:15:02');

-- TX 23: Deposit to Acc 4 (Priya Salary): +35,000.00 (Acc 4 bal: 115000)
INSERT IGNORE INTO transactions (transaction_id, transaction_reference, transaction_type_id, source_account_id, destination_account_id, amount, currency_code, status, description, idempotency_key, initiated_by_user_id, created_at, completed_at)
VALUES (23, 'TXN-20260125-001', 1, NULL, 4, 35000.00, 'INR', 'COMPLETED', 'Monthly corporate stipend simulated credit', 'IDEMP-DEP-004', 3, '2026-01-25 15:00:00', '2026-01-25 15:00:02');
INSERT IGNORE INTO transaction_entries (entry_id, transaction_id, account_id, entry_type, amount, balance_after, created_at)
VALUES (32, 23, 4, 'CREDIT', 35000.00, 115000.00, '2026-01-25 15:00:02');

-- TX 24: Withdrawal from Acc 4 (Priya Salary): 15,000.00 (Acc 4 bal: 100000)
INSERT IGNORE INTO transactions (transaction_id, transaction_reference, transaction_type_id, source_account_id, destination_account_id, amount, currency_code, status, description, idempotency_key, initiated_by_user_id, created_at, completed_at)
VALUES (24, 'TXN-20260126-001', 2, 4, NULL, 15000.00, 'INR', 'COMPLETED', 'Cash withdrawal for personal expenses', 'IDEMP-WTH-003', 3, '2026-01-26 12:45:00', '2026-01-26 12:45:01');
INSERT IGNORE INTO transaction_entries (entry_id, transaction_id, account_id, entry_type, amount, balance_after, created_at)
VALUES (33, 24, 4, 'DEBIT', 15000.00, 100000.00, '2026-01-26 12:45:01');

-- TX 25: Transfer from Acc 5 (Rohit) to Acc 7 (Vikram): 12,000.00 (Acc 5 bal: 41000, Acc 7 bal: 147000)
INSERT IGNORE INTO transactions (transaction_id, transaction_reference, transaction_type_id, source_account_id, destination_account_id, amount, currency_code, status, description, idempotency_key, initiated_by_user_id, created_at, completed_at)
VALUES (25, 'TXN-20260127-001', 3, 5, 7, 12000.00, 'INR', 'COMPLETED', 'Electronics purchase share', 'IDEMP-TRF-010', 4, '2026-01-27 10:20:00', '2026-01-27 10:20:02');
INSERT IGNORE INTO transaction_entries (entry_id, transaction_id, account_id, entry_type, amount, balance_after, created_at) VALUES
(34, 25, 5, 'DEBIT', 12000.00, 41000.00, '2026-01-27 10:20:02'),
(35, 25, 7, 'CREDIT', 12000.00, 147000.00, '2026-01-27 10:20:02');

-- TX 26: Withdrawal from Acc 5 (Rohit): 6,000.00 (Acc 5 bal: 35000)
INSERT IGNORE INTO transactions (transaction_id, transaction_reference, transaction_type_id, source_account_id, destination_account_id, amount, currency_code, status, description, idempotency_key, initiated_by_user_id, created_at, completed_at)
VALUES (26, 'TXN-20260128-001', 2, 5, NULL, 6000.00, 'INR', 'COMPLETED', 'Personal shopping debit', 'IDEMP-WTH-004', 4, '2026-01-28 17:10:00', '2026-01-28 17:10:01');
INSERT IGNORE INTO transaction_entries (entry_id, transaction_id, account_id, entry_type, amount, balance_after, created_at)
VALUES (36, 26, 5, 'DEBIT', 6000.00, 35000.00, '2026-01-28 17:10:01');

-- TX 27: Deposit to Acc 5 (Rohit): +15,000.00 (Acc 5 bal: 50000)
INSERT IGNORE INTO transactions (transaction_id, transaction_reference, transaction_type_id, source_account_id, destination_account_id, amount, currency_code, status, description, idempotency_key, initiated_by_user_id, created_at, completed_at)
VALUES (27, 'TXN-20260129-001', 1, NULL, 5, 15000.00, 'INR', 'COMPLETED', 'Cashback bonus deposit', 'IDEMP-DEP-005', 4, '2026-01-29 11:30:00', '2026-01-29 11:30:02');
INSERT IGNORE INTO transaction_entries (entry_id, transaction_id, account_id, entry_type, amount, balance_after, created_at)
VALUES (37, 27, 5, 'CREDIT', 15000.00, 50000.00, '2026-01-29 11:30:02');

-- TX 28: Transfer from Acc 6 (Ananya) to Acc 8 (Sneha): 7,500.00 (Acc 6 bal: 52500, Acc 8 bal: 66500)
INSERT IGNORE INTO transactions (transaction_id, transaction_reference, transaction_type_id, source_account_id, destination_account_id, amount, currency_code, status, description, idempotency_key, initiated_by_user_id, created_at, completed_at)
VALUES (28, 'TXN-20260130-001', 3, 6, 8, 7500.00, 'INR', 'COMPLETED', 'Photography workshop fee', 'IDEMP-TRF-011', 5, '2026-01-30 14:40:00', '2026-01-30 14:40:02');
INSERT IGNORE INTO transaction_entries (entry_id, transaction_id, account_id, entry_type, amount, balance_after, created_at) VALUES
(38, 28, 6, 'DEBIT', 7500.00, 52500.00, '2026-01-30 14:40:02'),
(39, 28, 8, 'CREDIT', 7500.00, 66500.00, '2026-01-30 14:40:02');

-- TX 29: Deposit to Acc 6 (Ananya): +10,000.00 (Acc 6 bal: 62500)
INSERT IGNORE INTO transactions (transaction_id, transaction_reference, transaction_type_id, source_account_id, destination_account_id, amount, currency_code, status, description, idempotency_key, initiated_by_user_id, created_at, completed_at)
VALUES (29, 'TXN-20260131-001', 1, NULL, 6, 10000.00, 'INR', 'COMPLETED', 'Virtual savings deposit', 'IDEMP-DEP-006', 5, '2026-01-31 16:00:00', '2026-01-31 16:00:02');
INSERT IGNORE INTO transaction_entries (entry_id, transaction_id, account_id, entry_type, amount, balance_after, created_at)
VALUES (40, 29, 6, 'CREDIT', 10000.00, 62500.00, '2026-01-31 16:00:02');

-- TX 30: Transfer from Acc 7 (Vikram) to Acc 8 (Sneha): 20,000.00 (Acc 7 bal: 127000, Acc 8 bal: 86500)
INSERT IGNORE INTO transactions (transaction_id, transaction_reference, transaction_type_id, source_account_id, destination_account_id, amount, currency_code, status, description, idempotency_key, initiated_by_user_id, created_at, completed_at)
VALUES (30, 'TXN-20260201-001', 3, 7, 8, 20000.00, 'INR', 'COMPLETED', 'Logistics supply chain settlement', 'IDEMP-TRF-012', 6, '2026-02-01 11:20:00', '2026-02-01 11:20:02');
INSERT IGNORE INTO transaction_entries (entry_id, transaction_id, account_id, entry_type, amount, balance_after, created_at) VALUES
(41, 30, 7, 'DEBIT', 20000.00, 127000.00, '2026-02-01 11:20:02'),
(42, 30, 8, 'CREDIT', 20000.00, 86500.00, '2026-02-01 11:20:02');

-- TX 31: Withdrawal from Acc 7 (Vikram): 7,000.00 (Acc 7 bal: 120000)
INSERT IGNORE INTO transactions (transaction_id, transaction_reference, transaction_type_id, source_account_id, destination_account_id, amount, currency_code, status, description, idempotency_key, initiated_by_user_id, created_at, completed_at)
VALUES (31, 'TXN-20260202-001', 2, 7, NULL, 7000.00, 'INR', 'COMPLETED', 'Business petty cash simulated withdrawal', 'IDEMP-WTH-005', 6, '2026-02-02 15:30:00', '2026-02-02 15:30:01');
INSERT IGNORE INTO transaction_entries (entry_id, transaction_id, account_id, entry_type, amount, balance_after, created_at)
VALUES (43, 31, 7, 'DEBIT', 7000.00, 120000.00, '2026-02-02 15:30:01');

-- TX 32: Deposit to Acc 1 (Aarav): +12,500.00 (Acc 1 bal: 82500)
INSERT IGNORE INTO transactions (transaction_id, transaction_reference, transaction_type_id, source_account_id, destination_account_id, amount, currency_code, status, description, idempotency_key, initiated_by_user_id, created_at, completed_at)
VALUES (32, 'TXN-20260203-001', 1, NULL, 1, 12500.00, 'INR', 'COMPLETED', 'Client retainer simulated deposit', 'IDEMP-DEP-007', 2, '2026-02-03 10:15:00', '2026-02-03 10:15:02');
INSERT IGNORE INTO transaction_entries (entry_id, transaction_id, account_id, entry_type, amount, balance_after, created_at)
VALUES (44, 32, 1, 'CREDIT', 12500.00, 82500.00, '2026-02-03 10:15:02');

-- TX 33: Internal Transfer from Acc 2 (Aarav Business) to Acc 1 (Aarav Savings): 15,000.00
-- (Acc 2 bal: 160000, Acc 1 bal: 97500)
INSERT IGNORE INTO transactions (transaction_id, transaction_reference, transaction_type_id, source_account_id, destination_account_id, amount, currency_code, status, description, idempotency_key, initiated_by_user_id, created_at, completed_at)
VALUES (33, 'TXN-20260204-001', 3, 2, 1, 15000.00, 'INR', 'COMPLETED', 'Owner drawings transfer to personal savings', 'IDEMP-TRF-013', 2, '2026-02-04 14:00:00', '2026-02-04 14:00:02');
INSERT IGNORE INTO transaction_entries (entry_id, transaction_id, account_id, entry_type, amount, balance_after, created_at) VALUES
(45, 33, 2, 'DEBIT', 15000.00, 160000.00, '2026-02-04 14:00:02'),
(46, 33, 1, 'CREDIT', 15000.00, 97500.00, '2026-02-04 14:00:02');

-- TX 34: Withdrawal from Acc 2 (Aarav Business): 10,000.00 (Acc 2 bal: 150000)
INSERT IGNORE INTO transactions (transaction_id, transaction_reference, transaction_type_id, source_account_id, destination_account_id, amount, currency_code, status, description, idempotency_key, initiated_by_user_id, created_at, completed_at)
VALUES (34, 'TXN-20260205-001', 2, 2, NULL, 10000.00, 'INR', 'COMPLETED', 'Branch vendor cash payment', 'IDEMP-WTH-006', 2, '2026-02-05 16:45:00', '2026-02-05 16:45:01');
INSERT IGNORE INTO transaction_entries (entry_id, transaction_id, account_id, entry_type, amount, balance_after, created_at)
VALUES (47, 34, 2, 'DEBIT', 10000.00, 150000.00, '2026-02-05 16:45:01');

-- TX 35: FAILED TRANSFER (Simulated Insufficient funds attempt: Aarav attempted 900,000.00 transfer)
-- No ledger entry, balance unchanged
INSERT IGNORE INTO transactions (transaction_id, transaction_reference, transaction_type_id, source_account_id, destination_account_id, amount, currency_code, status, description, idempotency_key, initiated_by_user_id, failure_reason, created_at, completed_at)
VALUES (35, 'TXN-20260206-001', 3, 1, 3, 900000.00, 'INR', 'FAILED', 'House deposit attempt', 'IDEMP-TRF-FAIL-001', 2, 'INSUFFICIENT_FUNDS: Requested amount exceeds available balance', '2026-02-06 11:00:00', '2026-02-06 11:00:01');

-- TX 36: REVERSED TRANSFER EXAMPLE
-- Original Transfer: Acc 8 to Acc 3: 5,000.00
INSERT IGNORE INTO transactions (transaction_id, transaction_reference, transaction_type_id, source_account_id, destination_account_id, amount, currency_code, status, description, idempotency_key, initiated_by_user_id, created_at, completed_at)
VALUES (36, 'TXN-20260207-001', 3, 8, 3, 5000.00, 'INR', 'REVERSED', 'Erroneous duplicate invoice transfer', 'IDEMP-TRF-014', 7, '2026-02-07 10:00:00', '2026-02-07 10:00:02');
INSERT IGNORE INTO transaction_entries (entry_id, transaction_id, account_id, entry_type, amount, balance_after, created_at) VALUES
(48, 36, 8, 'DEBIT', 5000.00, 81500.00, '2026-02-07 10:00:02'),
(49, 36, 3, 'CREDIT', 5000.00, 75000.00, '2026-02-07 10:00:02');

-- TX 37: Reversal transaction linked to TX 36
-- Returns funds: Acc 3 debited 5000 (bal 70000), Acc 8 credited 5000 (bal 86500)
INSERT IGNORE INTO transactions (transaction_id, transaction_reference, transaction_type_id, source_account_id, destination_account_id, amount, currency_code, status, description, idempotency_key, initiated_by_user_id, related_transaction_id, created_at, completed_at)
VALUES (37, 'TXN-20260207-002', 4, 3, 8, 5000.00, 'INR', 'COMPLETED', 'Reversal of erroneous transaction TXN-20260207-001', 'IDEMP-REV-001', 1, 36, '2026-02-07 14:00:00', '2026-02-07 14:00:02');
INSERT IGNORE INTO transaction_entries (entry_id, transaction_id, account_id, entry_type, amount, balance_after, created_at) VALUES
(50, 37, 3, 'DEBIT', 5000.00, 70000.00, '2026-02-07 14:00:02'),
(51, 37, 8, 'CREDIT', 5000.00, 86500.00, '2026-02-07 14:00:02');

-- ------------------------------------------------------------------------------
-- 10. TRANSFER_REQUESTS
-- Workflow tracking for transfers
-- ------------------------------------------------------------------------------
INSERT IGNORE INTO transfer_requests (transfer_request_id, transaction_id, requester_user_id, source_account_id, destination_account_id, requested_amount, request_status, idempotency_key, failure_code, created_at, updated_at) VALUES
(1, 10, 2, 1, 3, 15000.00, 'COMPLETED', 'IDEMP-TRF-001', NULL, '2026-01-12 11:00:00', '2026-01-12 11:00:02'),
(2, 11, 2, 1, 5, 5000.00, 'COMPLETED', 'IDEMP-TRF-002', NULL, '2026-01-13 14:20:00', '2026-01-13 14:20:02'),
(3, 12, 5, 6, 1, 10000.00, 'COMPLETED', 'IDEMP-TRF-003', NULL, '2026-01-14 09:45:00', '2026-01-14 09:45:02'),
(4, 14, 2, 1, 8, 10000.00, 'COMPLETED', 'IDEMP-TRF-004', NULL, '2026-01-16 11:15:00', '2026-01-16 11:15:02'),
(5, 15, 2, 2, 7, 25000.00, 'COMPLETED', 'IDEMP-TRF-005', NULL, '2026-01-17 15:00:00', '2026-01-17 15:00:02'),
(6, 17, 3, 3, 5, 8000.00, 'COMPLETED', 'IDEMP-TRF-006', NULL, '2026-01-19 12:10:00', '2026-01-19 12:10:02'),
(7, 18, 3, 3, 8, 4000.00, 'COMPLETED', 'IDEMP-TRF-007', NULL, '2026-01-20 14:00:00', '2026-01-20 14:00:02'),
(8, 21, 2, 1, 4, 5000.00, 'COMPLETED', 'IDEMP-TRF-008', NULL, '2026-01-23 10:10:00', '2026-01-23 10:10:02'),
(9, 22, 3, 4, 6, 10000.00, 'COMPLETED', 'IDEMP-TRF-009', NULL, '2026-01-24 13:15:00', '2026-01-24 13:15:02'),
(10, 25, 4, 5, 7, 12000.00, 'COMPLETED', 'IDEMP-TRF-010', NULL, '2026-01-27 10:20:00', '2026-01-27 10:20:02'),
(11, 28, 5, 6, 8, 7500.00, 'COMPLETED', 'IDEMP-TRF-011', NULL, '2026-01-30 14:40:00', '2026-01-30 14:40:02'),
(12, 30, 6, 7, 8, 20000.00, 'COMPLETED', 'IDEMP-TRF-012', NULL, '2026-02-01 11:20:00', '2026-02-01 11:20:02'),
(13, 33, 2, 2, 1, 15000.00, 'COMPLETED', 'IDEMP-TRF-013', NULL, '2026-02-04 14:00:00', '2026-02-04 14:00:02'),
(14, 35, 2, 1, 3, 900000.00, 'FAILED', 'IDEMP-TRF-FAIL-001', 'INSUFFICIENT_FUNDS', '2026-02-06 11:00:00', '2026-02-06 11:00:01'),
(15, 36, 7, 8, 3, 5000.00, 'COMPLETED', 'IDEMP-TRF-014', NULL, '2026-02-07 10:00:00', '2026-02-07 10:00:02');

-- ------------------------------------------------------------------------------
-- 11. TRANSACTION_LIMITS
-- ------------------------------------------------------------------------------
INSERT IGNORE INTO transaction_limits (limit_id, account_type_id, maximum_single_transfer, maximum_daily_transfer, maximum_daily_count, active, created_at, updated_at) VALUES
(1, 1, 100000.00, 250000.00, 10, TRUE, '2026-01-01 00:00:00', '2026-01-01 00:00:00'),
(2, 2, 500000.00, 1500000.00, 25, TRUE, '2026-01-01 00:00:00', '2026-01-01 00:00:00'),
(3, 3, 100000.00, 250000.00, 10, TRUE, '2026-01-01 00:00:00', '2026-01-01 00:00:00');

-- ------------------------------------------------------------------------------
-- 12. NOTIFICATIONS
-- ------------------------------------------------------------------------------
INSERT IGNORE INTO notifications (notification_id, user_id, notification_type, title, message, is_read, related_transaction_id, created_at, read_at) VALUES
(1, 2, 'TRANSFER_SUCCESS', 'Virtual Transfer Completed', 'Your virtual transfer of ₹15,000.00 to Priya Patel was successful. Ref: TXN-20260112-001', TRUE, 10, '2026-01-12 11:00:02', '2026-01-12 11:05:00'),
(2, 3, 'TRANSFER_RECEIVED', 'Virtual Funds Received', 'You received ₹15,000.00 from Aarav Sharma. Ref: TXN-20260112-001', TRUE, 10, '2026-01-12 11:00:02', '2026-01-12 11:10:00'),
(3, 2, 'DEPOSIT_CREDIT', 'Virtual Deposit Credited', '₹12,500.00 was credited to your Primary Savings account. Ref: TXN-20260203-001', FALSE, 32, '2026-02-03 10:15:02', NULL),
(4, 2, 'TRANSFER_FAILED', 'Transfer Attempt Failed', 'Virtual transfer of ₹900,000.00 failed due to insufficient funds in account ACC1000000001.', TRUE, 35, '2026-02-06 11:00:01', '2026-02-06 11:02:00'),
(5, 7, 'REVERSAL_COMPLETED', 'Transfer Reversal Processed', 'Transfer of ₹5,000.00 (Ref: TXN-20260207-001) has been reversed. Funds have been returned to your account.', FALSE, 37, '2026-02-07 14:00:02', NULL),
(6, 2, 'SECURITY_ALERT', 'Password Login Notice', 'A successful login was recorded for your account from IP 192.168.1.10.', TRUE, NULL, '2026-02-10 09:00:00', '2026-02-10 09:05:00');

-- ------------------------------------------------------------------------------
-- 13. AUDIT_LOGS
-- ------------------------------------------------------------------------------
INSERT IGNORE INTO audit_logs (audit_log_id, actor_user_id, action_type, entity_type, entity_id, description, ip_address, created_at) VALUES
(1, 1, 'SYSTEM_INIT', 'SYSTEM', NULL, 'Database schema and seed data loaded successfully', '127.0.0.1', '2026-01-01 00:00:00'),
(2, 2, 'USER_LOGIN', 'USER', 2, 'User Aarav Sharma authenticated successfully', '192.168.1.10', '2026-01-05 10:05:00'),
(3, 2, 'CREATE_BENEFICIARY', 'BENEFICIARY', 1, 'Beneficiary Priya Patel added for user Aarav Sharma', '192.168.1.10', '2026-01-10 10:00:00'),
(4, 2, 'EXECUTE_TRANSFER', 'TRANSACTION', 10, 'Virtual transfer of ₹15,000.00 executed from ACC1000000001 to ACC1000000003', '192.168.1.10', '2026-01-12 11:00:02'),
(5, 1, 'EXECUTE_REVERSAL', 'TRANSACTION', 37, 'Administrator processed reversal of transaction TXN-20260207-001', '127.0.0.1', '2026-02-07 14:00:02'),
(6, 1, 'UPDATE_LIMITS', 'TRANSACTION_LIMITS', 1, 'Admin updated single transfer limit for SAVINGS account type', '127.0.0.1', '2026-02-08 10:00:00');

-- ------------------------------------------------------------------------------
-- 14. LOGIN_ATTEMPTS
-- ------------------------------------------------------------------------------
INSERT IGNORE INTO login_attempts (login_attempt_id, email_identifier, successful, attempted_at, source_identifier) VALUES
(1, 'aarav.sharma@fincore.demo', TRUE, '2026-02-10 09:00:00', '192.168.1.10'),
(2, 'priya.patel@fincore.demo', TRUE, '2026-02-10 09:30:00', '192.168.1.15'),
(3, 'admin@fincore.demo', TRUE, '2026-02-10 10:00:00', '127.0.0.1'),
(4, 'aarav.sharma@fincore.demo', FALSE, '2026-02-11 08:45:00', '192.168.1.10'),
(5, 'aarav.sharma@fincore.demo', TRUE, '2026-02-11 08:46:00', '192.168.1.10');

-- ------------------------------------------------------------------------------
-- 15. APPLICATION_SETTINGS
-- ------------------------------------------------------------------------------
INSERT IGNORE INTO application_settings (setting_id, setting_key, setting_value, description, updated_by_user_id, updated_at) VALUES
(1, 'DEMO_MODE_ACTIVE', 'true', 'Indicates simulated demo banking environment with virtual money', 1, '2026-01-01 00:00:00'),
(2, 'DEFAULT_CURRENCY', 'INR', 'Standard simulated currency code', 1, '2026-01-01 00:00:00'),
(3, 'ENABLE_INSTANT_TRANSFER', 'true', 'Allows synchronous atomic settlement of virtual demo transfers', 1, '2026-01-01 00:00:00'),
(4, 'MAINTENANCE_WINDOW', 'Sundays 02:00-04:00 IST', 'Documented virtual maintenance schedule', 1, '2026-01-01 00:00:00');

-- ------------------------------------------------------------------------------
-- 16. SUPPORT_TICKETS
-- ------------------------------------------------------------------------------
INSERT IGNORE INTO support_tickets (ticket_id, user_id, subject, description, priority, status, assigned_admin_id, created_at, updated_at, resolved_at) VALUES
(1, 2, 'Query on daily transfer limit', 'Hello, could you clarify how the daily transfer limit is calculated across multiple savings accounts?', 'LOW', 'RESOLVED', 1, '2026-01-20 10:00:00', '2026-01-20 15:30:00', '2026-01-20 15:30:00'),
(2, 3, 'Beneficiary nickname modification', 'I would like to update the nickname of my saved beneficiary Rohit.', 'LOW', 'OPEN', NULL, '2026-02-10 11:15:00', '2026-02-10 11:15:00', NULL),
(3, 4, 'Failed transfer explanation request', 'My simulated transfer attempt was rejected yesterday. Requesting details.', 'MEDIUM', 'IN_PROGRESS', 1, '2026-02-11 14:00:00', '2026-02-11 16:00:00', NULL);

-- ------------------------------------------------------------------------------
-- 17. SYSTEM_ANNOUNCEMENTS
-- ------------------------------------------------------------------------------
INSERT IGNORE INTO system_announcements (announcement_id, title, content, status, created_by_admin_id, published_at, created_at, updated_at) VALUES
(1, 'Welcome to FinCore Demo Banking', 'FinCore is a simulated banking environment designed for learning, demonstration, and technical interviews. All accounts, balances, beneficiaries, and transactions are strictly virtual.', 'PUBLISHED', 1, '2026-01-01 00:00:00', '2026-01-01 00:00:00', '2026-01-01 00:00:00'),
(2, 'Enhanced Double-Entry Ledger Introduced', 'All virtual transfers now feature an immutable audit ledger with instantaneous balance recalculation and debit/credit entry pairs.', 'PUBLISHED', 1, '2026-01-15 09:00:00', '2026-01-15 09:00:00', '2026-01-15 09:00:00'),
(3, 'Scheduled Virtual System Maintenance', 'Simulated routine maintenance is scheduled for Sunday at 02:00 AM IST. Application APIs will remain operational in demo test mode.', 'PUBLISHED', 1, '2026-02-01 10:00:00', '2026-02-01 10:00:00', '2026-02-01 10:00:00');
