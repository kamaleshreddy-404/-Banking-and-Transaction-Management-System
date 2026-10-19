# FinCore – Relational Database Design Specification

## 1. Executive Summary & Design Principles

The FinCore relational schema (`fincore_db`) is designed for transactional integrity, high concurrent consistency, and compliance with double-entry accounting standards.

- **Engine:** MySQL 8.4 InnoDB (Row-level locking, ACID transactions, foreign keys)
- **Character Encoding:** `utf8mb4` with `utf8mb4_unicode_ci`
- **Monetary Precision:** `DECIMAL(19, 2)` throughout (never floating-point types)
- **Data Model Normalization:** Fully normalized up to Third Normal Form (3NF) / Boyce-Codd Normal Form (BCNF)

---

## 2. Table Catalog (18 Tables)

| # | Table Name | Purpose | Primary Key | Key Foreign Keys |
|---|------------|---------|-------------|-------------------|
| 1 | `roles` | System authorization roles (CUSTOMER, ADMIN) | `role_id` | - |
| 2 | `users` | User credentials and contact profiles | `user_id` | - |
| 3 | `user_roles` | Many-to-many relationship mapping | `(user_id, role_id)` | `user_id` → `users`, `role_id` → `roles` |
| 4 | `account_types` | Account catalog (SAVINGS, CURRENT) | `account_type_id` | - |
| 5 | `accounts` | Simulated customer accounts | `account_id` | `user_id` → `users`, `account_type_id` → `account_types` |
| 6 | `beneficiaries` | Saved transfer recipients | `beneficiary_id` | `owner_user_id` → `users`, `beneficiary_account_id` → `accounts` |
| 7 | `transaction_types` | Operations catalog (TRANSFER, DEPOSIT) | `transaction_type_id` | - |
| 8 | `transactions` | Master financial transaction log | `transaction_id` | `source_account_id` → `accounts`, `destination_account_id` → `accounts`, `initiated_by_user_id` → `users` |
| 9 | `transaction_ledger` | Immutable append-only double-entry ledger | `ledger_entry_id` | `account_id` → `accounts`, `transaction_id` → `transactions` |
| 10 | `audit_logs` | Security and administrative audit trail | `audit_log_id` | `user_id` → `users` |
| 11 | `notifications` | In-app alerts and notifications | `notification_id` | `user_id` → `users` |
| 12 | `transfer_limits` | Tiered transactional limit policies | `limit_id` | - |
| 13 | `account_status_history` | Historical log of freezes and activations | `history_id` | `account_id` → `accounts`, `changed_by_user_id` → `users` |
| 14 | `user_status_history` | Historical log of profile suspensions | `history_id` | `user_id` → `users`, `changed_by_user_id` → `users` |
| 15 | `support_tickets` | Customer inquiry master tickets | `ticket_id` | `user_id` → `users`, `assigned_to_user_id` → `users` |
| 16 | `ticket_messages` | Threaded conversation messages | `message_id` | `ticket_id` → `support_tickets`, `sender_user_id` → `users` |
| 17 | `system_announcements`| Maintenance advisories | `announcement_id` | `created_by_user_id` → `users` |
| 18 | `password_resets` | Password reset tokens | `reset_id` | `user_id` → `users` |

---

## 3. Double-Entry Accounting & Mathematical Invariants

In real banking platforms, accounts are backed by an immutable ledger. FinCore adheres to this principle:

1. **Atomic Dual-Entry:** Every inter-account transfer produces two rows in `transaction_ledger`:
   - One `DEBIT` entry against the source account with the new decreased running balance.
   - One `CREDIT` entry against the destination account with the new increased running balance.
2. **Append-Only Immutability:** Ledger entries are never updated or deleted. Corrections require offsetting reversing transactions.
3. **Mathematical Invariant Equation:**
   $$\sum \text{DEBITS} - \sum \text{CREDITS} = 0.00$$

### Live Verification SQL Query:
```sql
SELECT 
    COALESCE(SUM(CASE WHEN entry_type = 'DEBIT' THEN amount ELSE 0 END), 0.00) AS total_debits,
    COALESCE(SUM(CASE WHEN entry_type = 'CREDIT' THEN amount ELSE 0 END), 0.00) AS total_credits,
    (COALESCE(SUM(CASE WHEN entry_type = 'DEBIT' THEN amount ELSE 0 END), 0.00) - 
     COALESCE(SUM(CASE WHEN entry_type = 'CREDIT' THEN amount ELSE 0 END), 0.00)) AS discrepancy
FROM transaction_ledger;
```

---

## 4. Concurrency & Deadlock Prevention Strategy

Under high concurrent load, simultaneous opposite transfers between Account A (ID: 10) and Account B (ID: 25) can lead to a circular wait deadlock if locked arbitrarily.

**FinCore Deadlock-Free Guarantee:**
In `TransferServiceImpl.java`, accounts are locked using `SELECT ... FOR UPDATE` ordered strictly by primary key ID:

```java
Long firstId = Math.min(sourceId, destId);
Long secondId = Math.max(sourceId, destId);

Account firstLocked = accountRepository.findAccountForUpdate(firstId)
    .orElseThrow(...);
Account secondLocked = accountRepository.findAccountForUpdate(secondId)
    .orElseThrow(...);
```

Because both threads request locks in ascending order (10, then 25), cyclic dependencies cannot form.

---

## 5. Performance Indexing

1. `users(email)`: `UNIQUE INDEX` for $O(1)$ login lookups.
2. `accounts(account_number)`: `UNIQUE INDEX` for transfer routing.
3. `transactions(idempotency_key)`: `UNIQUE INDEX` to prevent network retry duplicates.
4. `transactions(transaction_reference)`: `UNIQUE INDEX` for voucher lookups.
5. `transaction_ledger(account_id, created_at)`: Composite B-Tree index for statement queries.
6. `audit_logs(action, created_at)`: Optimized index for administrative security searches.
