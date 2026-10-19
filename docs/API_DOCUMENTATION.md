# FinCore – RESTful API Documentation

## 1. Overview & Base URL
The FinCore API exposes RESTful endpoints for simulated core banking, account management, fund transfers, immutable double-entry ledger audits, support inquiries, and administrative oversight.

- **Base URL:** `http://localhost:8080/api/v1`
- **OpenAPI Specification JSON:** `http://localhost:8080/api-docs`
- **Interactive Swagger UI:** `http://localhost:8080/swagger-ui.html`
- **Actuator Health Endpoint:** `http://localhost:8080/actuator/health`

---

## 2. Authentication & Headers

FinCore uses stateless JWT authentication. All secured endpoints require an `Authorization` HTTP header:

```http
Authorization: Bearer <your_jwt_token>
```

### Idempotency Control Header
For fund mutation endpoints (e.g., `POST /api/v1/transfers`), clients supply an `Idempotency-Key` header:
```http
Idempotency-Key: tx_1729378291024_x8f2a1
```
If a duplicate request with the identical key is retransmitted, FinCore returns the existing transaction without executing double balance mutations.

---

## 3. Endpoints Catalog

### 3.1 Authentication & Profile (`/api/v1/auth`, `/api/v1/users`)

#### `POST /auth/login`
Authenticates user with email and BCrypt password, returning JWT bearer token.
- **Request Body:**
  ```json
  {
    "email": "aarav.sharma@fincore.demo",
    "password": "Password@123"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "tokenType": "Bearer",
    "userId": 2,
    "fullName": "Aarav Sharma",
    "email": "aarav.sharma@fincore.demo",
    "role": "CUSTOMER",
    "roles": ["CUSTOMER"],
    "accountStatus": "ACTIVE"
  }
  ```

#### `POST /auth/register`
Opens a new synthetic customer profile with an automatic welcome deposit in MySQL.
- **Request Body:**
  ```json
  {
    "fullName": "Rahul Verma",
    "email": "rahul.verma@example.com",
    "password": "Password@123",
    "phone": "+91 98765 00000",
    "accountType": "SAVINGS",
    "city": "Mumbai",
    "state": "Maharashtra",
    "postalCode": "400001"
  }
  ```

#### `POST /auth/forgot-password`
Generates a simulated password reset token.
- **Request Body:** `{"email": "aarav.sharma@fincore.demo"}`

#### `POST /auth/reset-password`
Updates password using reset token with BCrypt hashing.
- **Request Body:** `{"token": "token_string", "newPassword": "NewPassword@123"}`

#### `GET /users/profile`
Returns authenticated user's profile details.

#### `PUT /users/profile`
Updates address, contact phone, or full name.

#### `POST /users/change-password`
Modifies existing password with old password verification.

---

### 3.2 Account Management (`/api/v1/accounts`)

#### `GET /accounts`
Returns all virtual accounts owned by the authenticated customer.
- **Response (200 OK):**
  ```json
  [
    {
      "accountId": 1,
      "accountNumber": "FC10010001",
      "accountName": "Primary Savings",
      "accountType": "SAVINGS",
      "balance": 45250.00,
      "currencyCode": "INR",
      "accountStatus": "ACTIVE",
      "openedAt": "2026-06-15T09:30:00"
    }
  ]
  ```

#### `GET /accounts/{id}`
Returns details for a specific account owned by the user.

#### `GET /accounts/{id}/ledger`
Returns paginated double-entry ledger entries for the specified account.
- **Query Parameters:** `page` (default 0), `size` (default 15)
- **Response (200 OK):**
  ```json
  {
    "content": [
      {
        "ledgerEntryId": 101,
        "accountId": 1,
        "accountNumber": "FC10010001",
        "entryType": "DEBIT",
        "amount": 1500.00,
        "runningBalance": 45250.00,
        "transactionReference": "TX-20261019-1001",
        "description": "Virtual transfer to Diya Patel",
        "createdAt": "2026-10-19T14:30:00"
      }
    ],
    "page": 0,
    "size": 15,
    "totalElements": 24,
    "totalPages": 2
  }
  ```

#### `POST /accounts`
Opens an additional virtual deposit account for the current user.

---

### 3.3 Transfers & Transactions (`/api/v1/transfers`, `/api/v1/transactions`)

#### `POST /transfers`
Executes an atomic fund transfer between two virtual accounts with row-level pessimistic locking (`PESSIMISTIC_WRITE`) in deadlock-free ID order.
- **Headers:** `Idempotency-Key: <unique_key>`
- **Request Body:**
  ```json
  {
    "sourceAccountId": 1,
    "destinationAccountNumber": "FC10020001",
    "amount": 2500.00,
    "currencyCode": "INR",
    "description": "Simulated monthly utility settlement"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "transactionId": 52,
    "transactionReference": "TX-20261020-0052",
    "transactionType": "TRANSFER",
    "sourceAccountNumber": "FC10010001",
    "sourceAccountName": "Primary Savings",
    "destinationAccountNumber": "FC10020001",
    "destinationAccountName": "Diya Patel Savings",
    "amount": 2500.00,
    "currencyCode": "INR",
    "status": "COMPLETED",
    "description": "Simulated monthly utility settlement",
    "createdAt": "2026-10-20T00:15:30"
  }
  ```

#### `GET /transfers/limits`
Returns user's tier limits (e.g. Standard: ₹50,000 per day, ₹25,000 per transfer).

#### `GET /transactions`
Returns filtered paginated transaction history.
- **Query Parameters:** `page`, `size`, `accountId`, `type`, `status`, `startDate`, `endDate`.

#### `GET /transactions/{id}`
Returns full transaction details.

#### `GET /transactions/{id}/receipt`
Returns formatted receipt data for PDF/print generation.

---

### 3.4 Beneficiaries (`/api/v1/beneficiaries`)

#### `GET /beneficiaries`
Returns saved recipients for the current user.

#### `POST /beneficiaries`
Adds a new recipient with 10-digit account number validation against MySQL.

#### `DELETE /beneficiaries/{id}`
Removes saved beneficiary.

#### `PATCH /beneficiaries/{id}/toggle`
Toggles beneficiary status between `ACTIVE` and `DISABLED`.

---

### 3.5 In-App Notifications & Announcements (`/api/v1/notifications`)

#### `GET /notifications`
Returns paginated user notifications.

#### `PATCH /notifications/{id}/read`
Marks single notification as read.

#### `POST /notifications/mark-all-read`
Marks all user notifications as read.

#### `GET /notifications/announcements`
Returns active system broadcast announcements.

---

### 3.6 Support Desk (`/api/v1/support`)

#### `GET /support/tickets`
Returns user's open and resolved support tickets.

#### `POST /support/tickets`
Opens a new support ticket (`category`, `subject`, `priority`, `message`).

#### `POST /support/tickets/{id}/messages`
Appends a message to the support conversation thread.

---

### 3.7 Administrator Endpoints (`/api/v1/admin`)
*(Protected by `@PreAuthorize("hasRole('ADMIN')")`)*

- `GET /admin/stats`: Total users, active accounts, transaction count, open tickets.
- `GET /admin/users`: Directory search with pagination.
- `PATCH /admin/users/{id}/status`: Block or activate user profile with reason.
- `GET /admin/accounts`: System-wide account liquidity search.
- `PATCH /admin/accounts/{id}/status`: Freeze or activate account.
- `GET /admin/transactions`: Real-time transaction monitoring.
- `GET /admin/ledger`: System-wide append-only double-entry ledger oversight.
- `GET /admin/audit-logs`: Security audit logs (`IP`, `action`, `timestamp`).
- `GET /admin/limits` & `PUT /admin/limits/{tier}`: Manage risk policy limits.
- `GET /admin/tickets`, `PATCH /admin/tickets/{id}/status`, `POST /admin/tickets/{id}/messages`: Staff resolution queue.
- `POST /admin/announcements` & `DELETE /admin/announcements/{id}`: Broadcast advisories.
- `GET /admin/system/health`: Telemetry and database connectivity check.
