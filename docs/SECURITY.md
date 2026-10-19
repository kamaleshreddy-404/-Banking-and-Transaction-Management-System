# FinCore – Security Architecture & Compliance Guidelines

## 1. Strict Financial Safety & Simulation Isolation

FinCore is an independent academic and portfolio project intended strictly for simulated educational demonstrations.

- **Zero Fiat/Real Money:** All accounts, balances, beneficiaries, and transactions exist purely as virtual numbers in the local database.
- **No External Banking Connections:** No connections to UPI, SWIFT, NEFT, RTGS, payment gateways, or card networks.
- **Never Request Real Credentials:** No real PINs, CVVs, passwords, or OTPs are ever requested.
- **Prominent Banner:** Every view prominently displays:
  > **DEMO BANKING ENVIRONMENT — VIRTUAL MONEY ONLY**

---

## 2. Authentication & Credential Storage

### 2.1 BCrypt Password Hashing
FinCore never stores plaintext passwords. Credentials pass through Spring Security's `BCryptPasswordEncoder` with strength factor 12.

```java
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder(12);
}
```

### 2.2 Stateless JWT Token Architecture
- **Algorithm:** HMAC-SHA256 (`HS256`) with a minimum 256-bit cryptographically secure secret.
- **Expiration:** 24 hours (configurable in `application.yml`).
- **Subject:** User email address.
- **Claims:** User ID, role (`CUSTOMER` or `ADMIN`), and assigned authorities.
- **Validation:** Inspected on every incoming HTTP request via `JwtAuthenticationFilter`.

---

## 3. Authorization & Role-Based Access Control (RBAC)

FinCore enforces role separation across two principal roles:

1. `ROLE_CUSTOMER`:
   - Can access only their own accounts and beneficiaries.
   - Can initiate transfers where their account is the source.
   - Cannot view other users' records or system audit logs.
2. `ROLE_ADMIN`:
   - Can monitor all transactions and double-entry ledger audits.
   - Can manage user and account operational statuses (suspend / freeze).
   - Can configure system-wide transfer limits and broadcast announcements.
   - Can review health telemetry and database connection pools.

### Method-Level Security
Endpoints use declarative Spring Security annotations:
```java
@PreAuthorize("hasRole('ADMIN')")
@GetMapping("/stats")
public ResponseEntity<AdminStatsDto> getAdminStats() { ... }
```

---

## 4. OWASP Top 10 Mitigations

| Vulnerability | FinCore Defense Strategy |
|---|---|
| **A01: Broken Access Control (BOLA/IDOR)** | Services verify that the requested account or beneficiary belongs to `userPrincipal.getUserId()`. Unauthorized access triggers a `403 Forbidden` response. |
| **A02: Cryptographic Failures** | Passwords salted and hashed with BCrypt. JWTs signed with 256-bit keys. Sensitive fields excluded from JSON responses. |
| **A03: SQL Injection** | 100% parameterized queries via Spring Data JPA and Hibernate ORM. No raw string SQL concatenation. |
| **A04: Insecure Design** | Double-entry bookkeeping guarantees zero balance loss. Deadlock-free locking (`min(A,B)` then `max(A,B)`). Client-provided idempotency keys prevent duplicate payments. |
| **A05: Security Misconfiguration** | Actuator endpoints restricted to authorized staff. CORS configured with strict whitelist. Stack traces suppressed in production error responses. |
| **A06: Vulnerable Components** | All dependencies pinned to modern, patched versions (Spring Boot 3.3.4, Spring Security 6, React 18, Vite 5). |
| **A07: Identification & Auth Failures** | Stateless JWT tokens, rate-limited login endpoints, and account freeze capability on suspicious activity. |
| **A08: Software & Data Integrity** | Database migrations versioned and checked via Flyway checksums. |
| **A09: Security Logging & Monitoring** | Dedicated `audit_logs` table records IP address, timestamp, user ID, and action for every sensitive mutation. |
| **A10: SSRF** | No arbitrary external HTTP calls made by the application backend. |
