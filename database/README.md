# FinCore Database Documentation

## Database Overview
- **Name:** `fincore_db`
- **RDBMS Engine:** MySQL 8.x
- **Storage Engine:** InnoDB
- **Default Character Set:** `utf8mb4`
- **Default Collation:** `utf8mb4_unicode_ci`

## Normalization & Integrity
1. **Third Normal Form (3NF):** Every non-key column is transitively dependent only on its candidate primary key.
2. **Double-Entry Financial Ledger:** Every transaction record (`transactions`) is supported by immutable entries in `transaction_entries` specifying the `DEBIT` and `CREDIT` legs with resulting balances.
3. **Monetary Precision:** Stored strictly using `DECIMAL(19, 2)` to eliminate floating-point approximation inaccuracies.
4. **Optimistic Locking:** Accounts table contains a `version` column managed via JPA `@Version` to safeguard concurrent updates.
5. **Idempotency Guarantee:** `transfer_requests` and `transactions` tables contain unique constraints on `idempotency_key` ensuring duplicate HTTP submissions never execute double debits.
6. **Referential Safeguards:** Foreign keys enforce `ON DELETE RESTRICT` for financial and ledger records to prevent accidental deletion of historical audits.

## Files
- `schema.sql`: Full DDL script creating all 18 tables with primary keys, foreign keys, unique constraints, check constraints, and indexes.
- `seed.sql`: Realistic synthetic seed data including 7 users, 8 accounts, 16 beneficiaries, 37 transactions, and 51 ledger entries with mathematical balance reconciliation.
- `er-diagram.md`: Visual Mermaid entity relationship diagram.
