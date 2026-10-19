-- ==============================================================================
-- FinCore – Banking and Transaction Management System
-- Database Schema Script (MySQL 8.x)
-- Character Set: utf8mb4 | Collation: utf8mb4_unicode_ci | Storage Engine: InnoDB
-- ==============================================================================

-- Drop tables in reverse dependency order if needed for clean re-creation
DROP TABLE IF EXISTS system_announcements;
DROP TABLE IF EXISTS support_tickets;
DROP TABLE IF EXISTS application_settings;
DROP TABLE IF EXISTS password_reset_tokens;
DROP TABLE IF EXISTS login_attempts;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS transaction_limits;
DROP TABLE IF EXISTS transfer_requests;
DROP TABLE IF EXISTS transaction_entries;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS transaction_types;
DROP TABLE IF EXISTS beneficiaries;
DROP TABLE IF EXISTS accounts;
DROP TABLE IF EXISTS account_types;
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;

-- ==============================================================================
-- 1. ROLES TABLE
-- Defines application authorization roles (CUSTOMER, ADMIN)
-- ==============================================================================
CREATE TABLE roles (
    role_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(30) NOT NULL UNIQUE,
    description VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 2. USERS TABLE
-- Stores user profiles, authentication credentials, and status
-- ==============================================================================
CREATE TABLE users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NULL,
    address_line VARCHAR(255) NULL,
    city VARCHAR(100) NULL,
    state VARCHAR(100) NULL,
    postal_code VARCHAR(20) NULL,
    account_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    INDEX idx_users_email (email),
    INDEX idx_users_status (account_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 3. USER_ROLES TABLE
-- Supports many-to-many role assignments with a composite primary key
-- ==============================================================================
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 4. ACCOUNT_TYPES TABLE
-- Supported virtual account types (SAVINGS, CURRENT, etc.)
-- ==============================================================================
CREATE TABLE account_types (
    account_type_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    type_name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255) NULL,
    minimum_balance DECIMAL(19,2) NOT NULL DEFAULT 0.00,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 5. ACCOUNTS TABLE
-- Simulated bank accounts owned by users
-- Uses DECIMAL(19,2) for money, version column for optimistic concurrency control
-- ==============================================================================
CREATE TABLE accounts (
    account_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    account_type_id BIGINT NOT NULL,
    account_number VARCHAR(30) NOT NULL UNIQUE,
    account_name VARCHAR(100) NOT NULL,
    currency_code VARCHAR(10) NOT NULL DEFAULT 'INR',
    balance DECIMAL(19,2) NOT NULL DEFAULT 0.00,
    account_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    opened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_accounts_balance_non_negative CHECK (balance >= 0.00),
    CONSTRAINT fk_accounts_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE RESTRICT,
    CONSTRAINT fk_accounts_type FOREIGN KEY (account_type_id) REFERENCES account_types(account_type_id) ON DELETE RESTRICT,
    INDEX idx_accounts_user (user_id),
    INDEX idx_accounts_number (account_number),
    INDEX idx_accounts_status (account_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 6. BENEFICIARIES TABLE
-- Saved recipients for internal virtual transfers
-- ==============================================================================
CREATE TABLE beneficiaries (
    beneficiary_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    owner_user_id BIGINT NOT NULL,
    beneficiary_name VARCHAR(100) NOT NULL,
    beneficiary_account_id BIGINT NOT NULL,
    nickname VARCHAR(100) NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uk_owner_recipient UNIQUE (owner_user_id, beneficiary_account_id),
    CONSTRAINT fk_beneficiaries_owner FOREIGN KEY (owner_user_id) REFERENCES users(user_id) ON DELETE RESTRICT,
    CONSTRAINT fk_beneficiaries_account FOREIGN KEY (beneficiary_account_id) REFERENCES accounts(account_id) ON DELETE RESTRICT,
    INDEX idx_beneficiaries_owner (owner_user_id),
    INDEX idx_beneficiaries_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 7. TRANSACTION_TYPES TABLE
-- Master catalog of transaction types (DEPOSIT, WITHDRAWAL, TRANSFER, REVERSAL, ADJUSTMENT)
-- ==============================================================================
CREATE TABLE transaction_types (
    transaction_type_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    type_code VARCHAR(30) NOT NULL UNIQUE,
    display_name VARCHAR(50) NOT NULL,
    description VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 8. TRANSACTIONS TABLE
-- Master transaction records with references, amounts, and statuses
-- ==============================================================================
CREATE TABLE transactions (
    transaction_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    transaction_reference VARCHAR(50) NOT NULL UNIQUE,
    transaction_type_id BIGINT NOT NULL,
    source_account_id BIGINT NULL,
    destination_account_id BIGINT NULL,
    amount DECIMAL(19,2) NOT NULL,
    currency_code VARCHAR(10) NOT NULL DEFAULT 'INR',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    description VARCHAR(255) NULL,
    idempotency_key VARCHAR(100) NULL UNIQUE,
    initiated_by_user_id BIGINT NOT NULL,
    related_transaction_id BIGINT NULL,
    failure_reason VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    completed_at TIMESTAMP NULL,
    CONSTRAINT chk_transactions_amount_positive CHECK (amount > 0.00),
    CONSTRAINT fk_tx_type FOREIGN KEY (transaction_type_id) REFERENCES transaction_types(transaction_type_id) ON DELETE RESTRICT,
    CONSTRAINT fk_tx_source_account FOREIGN KEY (source_account_id) REFERENCES accounts(account_id) ON DELETE RESTRICT,
    CONSTRAINT fk_tx_dest_account FOREIGN KEY (destination_account_id) REFERENCES accounts(account_id) ON DELETE RESTRICT,
    CONSTRAINT fk_tx_initiator FOREIGN KEY (initiated_by_user_id) REFERENCES users(user_id) ON DELETE RESTRICT,
    CONSTRAINT fk_tx_related FOREIGN KEY (related_transaction_id) REFERENCES transactions(transaction_id) ON DELETE RESTRICT,
    INDEX idx_transactions_reference (transaction_reference),
    INDEX idx_transactions_source (source_account_id),
    INDEX idx_transactions_dest (destination_account_id),
    INDEX idx_transactions_initiator (initiated_by_user_id),
    INDEX idx_transactions_status (status),
    INDEX idx_transactions_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 9. TRANSACTION_ENTRIES TABLE
-- Immutable double-entry ledger for every account balance movement
-- ==============================================================================
CREATE TABLE transaction_entries (
    entry_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    transaction_id BIGINT NOT NULL,
    account_id BIGINT NOT NULL,
    entry_type VARCHAR(10) NOT NULL,
    amount DECIMAL(19,2) NOT NULL,
    balance_after DECIMAL(19,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_entries_amount_positive CHECK (amount > 0.00),
    CONSTRAINT chk_entries_balance_after_non_negative CHECK (balance_after >= 0.00),
    CONSTRAINT fk_entries_transaction FOREIGN KEY (transaction_id) REFERENCES transactions(transaction_id) ON DELETE RESTRICT,
    CONSTRAINT fk_entries_account FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON DELETE RESTRICT,
    INDEX idx_entries_tx (transaction_id),
    INDEX idx_entries_account (account_id),
    INDEX idx_entries_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 10. TRANSFER_REQUESTS TABLE
-- Workflow tracking and idempotency enforcement for fund transfer requests
-- ==============================================================================
CREATE TABLE transfer_requests (
    transfer_request_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    transaction_id BIGINT NULL UNIQUE,
    requester_user_id BIGINT NOT NULL,
    source_account_id BIGINT NOT NULL,
    destination_account_id BIGINT NOT NULL,
    requested_amount DECIMAL(19,2) NOT NULL,
    request_status VARCHAR(20) NOT NULL DEFAULT 'INITIATED',
    idempotency_key VARCHAR(100) NOT NULL UNIQUE,
    failure_code VARCHAR(50) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_transfer_req_amount_positive CHECK (requested_amount > 0.00),
    CONSTRAINT fk_req_transaction FOREIGN KEY (transaction_id) REFERENCES transactions(transaction_id) ON DELETE RESTRICT,
    CONSTRAINT fk_req_user FOREIGN KEY (requester_user_id) REFERENCES users(user_id) ON DELETE RESTRICT,
    CONSTRAINT fk_req_source FOREIGN KEY (source_account_id) REFERENCES accounts(account_id) ON DELETE RESTRICT,
    CONSTRAINT fk_req_dest FOREIGN KEY (destination_account_id) REFERENCES accounts(account_id) ON DELETE RESTRICT,
    INDEX idx_transfer_requests_key (idempotency_key),
    INDEX idx_transfer_requests_requester (requester_user_id),
    INDEX idx_transfer_requests_status (request_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 11. TRANSACTION_LIMITS TABLE
-- Configurable transfer limits per account type
-- ==============================================================================
CREATE TABLE transaction_limits (
    limit_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    account_type_id BIGINT NULL,
    maximum_single_transfer DECIMAL(19,2) NOT NULL,
    maximum_daily_transfer DECIMAL(19,2) NOT NULL,
    maximum_daily_count INT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_limits_type FOREIGN KEY (account_type_id) REFERENCES account_types(account_type_id) ON DELETE RESTRICT,
    INDEX idx_limits_type (account_type_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 12. NOTIFICATIONS TABLE
-- In-app notifications for users regarding account, transfer, and security events
-- ==============================================================================
CREATE TABLE notifications (
    notification_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    related_transaction_id BIGINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    read_at TIMESTAMP NULL,
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_notifications_tx FOREIGN KEY (related_transaction_id) REFERENCES transactions(transaction_id) ON DELETE SET NULL,
    INDEX idx_notifications_user (user_id),
    INDEX idx_notifications_read (is_read),
    INDEX idx_notifications_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 13. AUDIT_LOGS TABLE
-- Immutable security and admin audit trail
-- ==============================================================================
CREATE TABLE audit_logs (
    audit_log_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    actor_user_id BIGINT NULL,
    action_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT NULL,
    description VARCHAR(500) NOT NULL,
    ip_address VARCHAR(45) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_audit_user FOREIGN KEY (actor_user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_audit_actor (actor_user_id),
    INDEX idx_audit_action (action_type),
    INDEX idx_audit_entity (entity_type, entity_id),
    INDEX idx_audit_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 14. LOGIN_ATTEMPTS TABLE
-- Security monitoring and brute-force detection
-- ==============================================================================
CREATE TABLE login_attempts (
    login_attempt_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email_identifier VARCHAR(150) NOT NULL,
    successful BOOLEAN NOT NULL,
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    source_identifier VARCHAR(100) NULL,
    INDEX idx_login_email (email_identifier),
    INDEX idx_login_attempted (attempted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 15. PASSWORD_RESET_TOKENS TABLE
-- Single-use password reset tokens with expiration
-- ==============================================================================
CREATE TABLE password_reset_tokens (
    reset_token_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_reset_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_reset_token (token_hash),
    INDEX idx_reset_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 16. APPLICATION_SETTINGS TABLE
-- Configurable demo application key-value settings
-- ==============================================================================
CREATE TABLE application_settings (
    setting_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    description VARCHAR(255) NULL,
    updated_by_user_id BIGINT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_settings_user FOREIGN KEY (updated_by_user_id) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 17. SUPPORT_TICKETS TABLE
-- Customer demo support request management
-- ==============================================================================
CREATE TABLE support_tickets (
    ticket_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    subject VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    assigned_admin_id BIGINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    resolved_at TIMESTAMP NULL,
    CONSTRAINT fk_tickets_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_tickets_admin FOREIGN KEY (assigned_admin_id) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_tickets_user (user_id),
    INDEX idx_tickets_status (status),
    INDEX idx_tickets_priority (priority)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 18. SYSTEM_ANNOUNCEMENTS TABLE
-- Platform-wide notices and broadcast messages
-- ==============================================================================
CREATE TABLE system_announcements (
    announcement_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PUBLISHED',
    created_by_admin_id BIGINT NOT NULL,
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_announcements_admin FOREIGN KEY (created_by_admin_id) REFERENCES users(user_id) ON DELETE RESTRICT,
    INDEX idx_announcements_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
