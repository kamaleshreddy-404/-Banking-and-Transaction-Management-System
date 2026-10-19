# FinCore – Local Development & Setup Guide

This guide walks you through setting up and running FinCore on your local machine.

---

## 1. Prerequisites

Ensure you have the following installed on your machine:

- **Java Development Kit (JDK):** Version 21 or 22 (LTS)
- **Build Tool:** Apache Maven 3.9+
- **Database:** MySQL Server 8.0 or 8.4
- **Node.js:** Node.js 18+ or 20+ and `npm`
- **Git:** Git 2.3+

---

## 2. Database Initialization (MySQL)

1. Open your MySQL client (Command Line, MySQL Workbench, or DBeaver):
   ```bash
   mysql -u root -p
   ```

2. Create the FinCore database:
   ```sql
   CREATE DATABASE IF NOT EXISTS fincore_db
     CHARACTER SET utf8mb4
     COLLATE utf8mb4_unicode_ci;
   ```

3. Ensure user credentials match your local setup. The default configuration uses:
   - **Host:** `localhost:3306`
   - **Database:** `fincore_db`
   - **User:** `root`
   - **Password:** `root` (or set your custom password in `.env` / `application.yml`)

*(Note: Spring Boot will automatically run Flyway migrations `V1__create_schema.sql` and `V2__seed_demo_data.sql` upon launch).*

---

## 3. Backend Setup & Launch

1. Open terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```

2. (Optional) Configure environment variables:
   Copy `.env.example` to `.env` or set environment variables:
   ```properties
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=fincore_db
   DB_USERNAME=root
   DB_PASSWORD=root
   JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
   ```

3. Run automated backend tests:
   ```bash
   mvn test
   ```
   *(All 16 unit and MockMvc integration tests should pass with 0 failures).*

4. Package and run the Spring Boot server:
   ```bash
   mvn clean package -DskipTests
   java -jar target/fincore-backend-1.0.0.jar
   ```
   *Or directly via Spring Boot plugin:*
   ```bash
   mvn spring-boot:run
   ```

5. Verify the backend is operational:
   - **Health Check:** `http://localhost:8080/actuator/health` (should return `{"status":"UP"}`)
   - **API Docs (JSON):** `http://localhost:8080/api-docs`
   - **Swagger UI:** `http://localhost:8080/swagger-ui.html`

---

## 4. Frontend Setup & Launch

1. Open a new terminal window and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run automated frontend unit tests:
   ```bash
   npm run test
   ```

4. Verify production bundling:
   ```bash
   npm run build
   ```

5. Start the Vite development server:
   ```bash
   npm run dev
   ```

6. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

---

## 5. Demo Credentials for Immediate Evaluation

| Role | Name | Email | Password | Pre-Seeded Accounts |
|---|---|---|---|---|
| **ADMIN** | Super Admin | `admin@fincore.demo` | `Admin@12345` | Administrative Master Account |
| **CUSTOMER** | Aarav Sharma | `aarav.sharma@fincore.demo` | `Password@123` | `FC10010001` (Savings: ₹45,250.00)<br>`FC10010002` (Current: ₹1,12,000.00) |
| **CUSTOMER** | Diya Patel | `diya.patel@fincore.demo` | `Password@123` | `FC10020001` (Savings: ₹28,400.00) |
| **CUSTOMER** | Vikram Malhotra | `vikram.malhotra@fincore.demo` | `Password@123` | `FC10030001` (Current: ₹2,35,000.00) |
| **CUSTOMER** | Rohan Mehra | `rohan.mehra@fincore.demo` | `Password@123` | `FC10050001` (Savings: ₹6,500.00 - FROZEN) |

---

## 6. Verifying Double-Entry Reconciliation in MySQL

Run the following query in MySQL to confirm the ledger balance invariant holds true:

```sql
USE fincore_db;

SELECT 
    COALESCE(SUM(CASE WHEN entry_type = 'DEBIT' THEN amount ELSE 0 END), 0.00) AS total_debits,
    COALESCE(SUM(CASE WHEN entry_type = 'CREDIT' THEN amount ELSE 0 END), 0.00) AS total_credits,
    (COALESCE(SUM(CASE WHEN entry_type = 'DEBIT' THEN amount ELSE 0 END), 0.00) - 
     COALESCE(SUM(CASE WHEN entry_type = 'CREDIT' THEN amount ELSE 0 END), 0.00)) AS discrepancy
FROM transaction_ledger;
```
*(Result: discrepancy should equal `0.00`)*.
