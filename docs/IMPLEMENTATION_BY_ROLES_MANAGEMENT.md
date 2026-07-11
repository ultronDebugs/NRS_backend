# Genius-Excel – Management Overview

## What is Genius-Excel?

Genius-Excel is an e-invoicing platform that helps businesses create, sign, and exchange tax-compliant invoices in line with Nigerian FIRS (Federal Inland Revenue Service) requirements. The system supports multiple types of users and integrates with external systems through secure APIs.

---

## Who Uses the System?

### 1. Regular Users (Taxpayers)

**Who they are:** Business owners and staff who create and manage invoices day to day.

**What they can do:**

- Create new invoices
- View and manage their invoices
- Sign invoices (submit to FIRS for approval)
- Transmit invoices to customers and other parties
- Confirm that invoices have been received
- See counts of pending, signed, and confirmed invoices on their dashboard

---

### 2. Partners (Integrators)

**Who they are:** Software vendors, ERPs, or accounting systems that connect to Genius-Excel on behalf of their customers.

**What they can do:**

- Obtain API keys to integrate with Genius-Excel
- Automate invoice creation, signing, transmission, and confirmation
- View usage and logs of their API calls
- See a dashboard with API usage statistics

---

### 3. Administrators

**Who they are:** Internal staff who manage users and monitor the platform.

**What they can do:**

- Manage users (add, edit, deactivate)
- Assign roles (User or Admin)
- View system-wide statistics (users, partners, invoices, API usage)
- Monitor system health and configuration

---

### 4. Super Admin

**Who they are:** Highest-level administrators with full access.

**What they can do:** Everything an Administrator can do, plus full control over the platform.

---

## How Invoices Flow Through the System

### Invoice Lifecycle

1. **PENDING** – Invoice has been created and saved, but not yet sent to FIRS.
2. **SIGNED** – Invoice has been submitted to FIRS and accepted.
3. **TRANSMITTED** – Invoice has been sent to the customer or other parties.
4. **CONFIRMED** – Invoice has been confirmed as received by all parties.

### Typical Steps for a User

1. Create the invoice (details, amounts, parties).
2. Sign the invoice (submit to FIRS).
3. Transmit the invoice (send to the recipient).
4. Confirm the invoice (acknowledge receipt).

---

## Main Features by Role

| Feature                    | Regular User | Partner | Admin |
|---------------------------|--------------|---------|-------|
| Create & manage invoices  | Yes          | Yes     | No    |
| Sign invoices             | Yes          | Yes*    | No    |
| Transmit invoices         | Yes          | Yes*    | No    |
| Confirm invoices          | Yes          | Yes*    | No    |
| Dashboard (invoice stats) | Yes          | Yes     | Yes   |
| API keys & integration    | No           | Yes     | No    |
| User management           | No           | No      | Yes   |
| System statistics         | No           | No      | Yes   |

\* Partners use APIs, not the web interface.

---

## Exchange E-Invoice (Transmission)

When an invoice is transmitted:

1. The sender checks that the system is ready.
2. The invoice is sent to FIRS.
3. FIRS notifies all involved parties (supplier, customer, etc.).
4. Each party confirms receipt.
5. The invoice status becomes fully transmitted and confirmed.

---

## System Integrator Option

External systems can connect to Genius-Excel as "System Integrators" to:

- Validate invoices
- Generate QR codes for invoices
- Store their own FIRS credentials when needed

This supports third-party software and platforms that need to work with Genius-Excel without going through the web interface.

---

## Summary

| Role          | Primary use                          |
|---------------|--------------------------------------|
| **User**      | Create and manage invoices in the UI |
| **Partner**   | Integrate via APIs on behalf of clients |
| **Admin**     | Manage users and monitor the system  |
| **Super Admin** | Full platform administration       |
