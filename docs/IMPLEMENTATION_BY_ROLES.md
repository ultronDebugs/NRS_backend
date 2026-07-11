# Genius-Excel – Project Documentation

## 1. Overview

Genius-Excel is an e-invoicing platform that integrates with FIRS (Federal Inland Revenue Service) for Nigerian tax-compliant invoices. It has role-based access and uses JWT for authentication.

---

## 2. Roles

| Role | Description | Backend (Prisma) | Frontend |
|------|-------------|------------------|----------|
| **USER** | Regular taxpayers – create, sign, transmit, confirm invoices | `USER` | `USER` |
| **ADMIN** | System administrators – manage users, view system stats | `ADMIN` | `ADMIN` |
| **PARTNER** | Integration partners – access invoice APIs via API keys | `PARTNER` | `PARTNER` |
| **Super Admin** | Highest privilege – full admin access | — | `super_admin` |

---

## 3. Implementation by Role

### 3.1 USER

**Purpose:** Create and manage invoices via the web UI.

**Backend (JWT Required):**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/invoice/my-invoices` | GET | Paginated list of user's invoices |
| `/api/v1/invoice/create` | POST | Create new invoice |
| `/api/v1/invoice/:id` | GET | Get invoice by ID (includes QR code) |
| `/api/v1/invoice/:id/sign` | POST | Sign invoice via FIRS |
| `/api/v1/invoice/:id/confirm` | POST | Confirm invoice via FIRS |
| `/api/v1/invoice/:id/transmit` | POST | Transmit invoice to involved parties |
| `/api/v1/invoice/:id/transmit/lookup` | GET | Lookup invoice for transmit |
| `/api/v1/invoice/:id/transmit/confirm` | PATCH | Confirm receipt of transmitted invoice |
| `/api/v1/invoice/:id/update` | POST | Update pending invoice |

**Frontend:**

- **Dashboard** – Stats: Total, Pending, Signed, Confirmed invoices
- **Invoices** – List, create, view, sign, transmit, confirm invoices
- Flow: PENDING → Sign → SIGNED → Transmit/Confirm → TRANSMITTED/CONFIRMED

---

### 3.2 PARTNER

**Purpose:** Third-party integrations (ERPs, accounting software) – access invoice APIs via API keys.

**Backend (JWT + API Key):**

- JWT for key management and logs
- API Key (`x-partner-key`, `x-partner-secret`) for invoice operations

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/v1/partners/invoice/validate` | POST | API Key | Validate invoice via FIRS |
| `/api/v1/partners/invoice/sign` | POST | API Key | Sign invoice via FIRS |
| `/api/v1/partners/invoice/confirm/:irn` | GET | API Key | Get invoice confirmation |
| `/api/v1/partners/invoice/irn/validate` | POST | API Key | Validate IRN |
| `/api/v1/partners/invoice/transmit/self-health-check` | GET | API Key | Transmit readiness check |
| `/api/v1/partners/invoice/transmit/lookup/tin/:tin` | GET | API Key | Lookup by TIN |
| `/api/v1/partners/invoice/:id/transmit/lookup` | GET | API Key | Lookup by invoice ID |
| `/api/v1/partners/invoice/transmit/pull` | GET | API Key | Pull invoices in transit |
| `/api/v1/partners/invoice/:id/transmit` | POST | API Key | Transmit invoice |
| `/api/v1/partners/invoice/:id/transmit/confirm` | PATCH | API Key | Confirm transmit receipt |
| `/api/v1/partners/keys` | POST/GET | JWT | Create/rotate or retrieve API keys |
| `/api/v1/partners/logs` | GET | JWT | View API call logs |

**Frontend:**

- **Developers** – API keys, usage stats
- **Invoices** – Same as USER
- **Dashboard** – API usage: total calls, success/fail, per-endpoint counts

---

### 3.3 ADMIN

**Purpose:** Manage users and monitor the system.

**Backend (JWT Required):**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/dashboard/summary` | GET | Admin dashboard (users, partners, invoices, API calls) |
| `/api/v1/users` | GET/POST/PUT/DELETE | User CRUD |

**Dashboard Summary (Admin):**

- Total users, partners, invoices
- Total API calls
- Recent users, recent API calls
- System health (DB, FIRS config)

**Frontend:**

- **Dashboard** – Same as USER
- **User Management** – List, edit users, assign roles (ADMIN/USER)

---

### 3.4 System Integrator (External API)

**Purpose:** External integrations with FIRS – uses system-integrator credentials (no role checks in app).

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/system-integrator/validate-invoice` | POST | Validate invoice via FIRS |
| `/api/v1/system-integrator/qr-code` | POST | Generate QR code (optional payload keys) |
| `/api/v1/system-integrator/firs-settings/:userId` | GET | Get FIRS settings for user |
| `/api/v1/system-integrator/firs-settings` | PUT | Create/update FIRS settings (public key, certificate) |

---

## 4. Application Flow

### 4.1 Authentication Flow

```
1. Register (POST /auth/register)
   └─> Email verification (POST /auth/verify-email)
2. Login (POST /auth/login)
   └─> Returns JWT
3. JWT sent in Authorization: Bearer <token>
4. Profile (GET /auth/profile) – validates token and returns user
```

### 4.2 Invoice Lifecycle Flow

```
                    ┌─────────────┐
                    │   PENDING   │ ← Create Invoice
                    └──────┬──────┘
                           │ Sign Invoice (:id/sign)
                           ▼
                    ┌─────────────┐
                    │   SIGNED    │
                    └──────┬──────┘
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
     ┌────────────────┐         ┌──────────────┐
     │ Transmit       │         │ Confirm      │
     │ (:id/transmit) │         │ (:id/confirm)│
     └────────┬───────┘         └──────┬───────┘
              │                        │
              ▼                        ▼
     ┌────────────────┐         ┌──────────────┐
     │ TRANSMITTING   │         │  CONFIRMED   │
     │ TRANSMITTED    │         │              │
     │ ACKNOWLEDGED   │         └──────────────┘
     └────────────────┘
```

### 4.3 Exchange E-Invoice Flow

```
Sender (Access Point Provider):
1. Self Health Check (GET /transmit/self-health-check)
2. Lookup IRN/TIN (GET /transmit/lookup/:irn or /transmit/lookup/tin/:tin)
3. Transmit Invoice (POST /transmit/:id)
   └─> FIRS sends webhook to involved parties

Receiver:
1. Receive webhook (POST /api/v1/firs/webhook)
   └─> Payload: { irn, message: "TRANSMITTING" | "TRANSMITTED" | "ACKNOWLEDGED" | "FAILED" }
2. Confirm Receipt (PATCH /transmit/:id/confirm)
3. Pull Invoice (GET /transmit/pull) – updates local status to TRANSMITTING
```

### 4.4 Partner Integration Flow

```
1. Partner logs in (JWT)
2. Create/rotate API keys (POST /partners/keys)
3. Use API keys for invoice operations:
   - Validate, Sign, Confirm, Transmit (via partner endpoints)
4. View logs (GET /partners/logs)
```

---

## 5. Frontend Navigation by Role

| Route | USER | PARTNER | ADMIN |
|-------|------|---------|-------|
| `/dashboard` | ✅ | ✅ | ✅ |
| `/dashboard/invoices` | ✅ | ✅ | ✅ |
| `/dashboard/developers` | ❌ | ✅ | ❌ |
| `/dashboard/users` | ❌ | ❌ | ✅ (super_admin/admin) |

---

## 6. Module Map

### Backend Modules

| Module | Purpose |
|--------|---------|
| **auth** | Register, login, verify-email, profile, JWT |
| **users** | User CRUD |
| **invoice** | Invoice CRUD, sign, confirm, transmit, FIRS integration |
| **partners** | API key auth, proxy to invoice, keys, logs |
| **dashboard** | Role-based summaries (USER/PARTNER/ADMIN) |
| **firs** | Webhook receiver, FIRS sync |
| **system-integrator** | Validate, QR code, FIRS settings |
| **configuration** | Reference data (invoice types, tax categories, etc.) |

### Frontend Routes

| Path | Purpose |
|------|---------|
| `/` | Landing / login |
| `/register` | User registration |
| `/dashboard` | Main dashboard |
| `/dashboard/invoices` | Invoice list with actions |
| `/dashboard/invoices/create` | Create invoice form |
| `/dashboard/invoices/[id]` | Invoice detail, sign/confirm/transmit |
| `/dashboard/developers` | API keys & usage (Partners) |
| `/dashboard/users` | User management (Admin) |
| `/docs` | API documentation |
