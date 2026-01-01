---
title: API Specification
sidebar_position: 2
---

## OpenConnect Unified API Specification

OpenConnect exposes REST-based APIs conforming to OpenAPI 3.0, acting as a unified abstraction layer over multiple payment rails including **RAAST**, **1LINK**, **Billing Aggregators**, and **RTGS (PRISM)**.

All APIs require authentication via OAuth2 (client credentials) and are protected using JWT and Mutual TLS.

---

## Authentication Flow

Before invoking any API, the channel must obtain an access token.

**Token Endpoint**
POST /realms/paysys-raast-realm/protocol/openid-connect/token

- Grant Type: `client_credentials`
- Authentication: HTTP Basic (channel credentials)
- Token used in header:  
  `Authorization: Bearer <access_token>`

---

## API Classification

### 1. Non-Financial APIs

#### Get Banks List
Used to retrieve participant banks and their supported rails.

- Identifies:
  - IBFT support
  - RAAST P2P / P2M
  - RAAST Bulk
  - Title Fetch 2.0 availability

Used **before Title Fetch and Payments**.

---

#### Unified Title Fetch
A **rail-agnostic title fetch API** that dynamically routes the request to RAAST or 1LINK.

Key Features:
- Preferred rail selection
- Fallback to alternate rail
- EFT-compliant purpose code validation
- Returns destination payment system for payment routing

**Important:**  
The returned `correlationId` **must be reused** in the financial transaction.

---

#### Get Default Account by RAAST ID
Resolves beneficiary account details using RAAST CAS.

Supports aliases:
- MOBILE
- CNIC
- EMAIL
- TXT

Returns:
- IBAN
- Account currency
- Destination payment system
- Correlation expiry

---

#### Merchant Alias Inquiry
Used in **RAAST P2M** flows to resolve merchant account using:
- TILL_CODE
- MID
- VPA (future)

Returns merchant account, acquiring institution, MCC, and DBA.

---

#### Biller & Telco Catalog APIs
- Get Billers Category
- Get Billers List
- Get Telco Companies
- Get Telco Packages

Supports:
- Min / Max limits
- Activation & deactivation dates
- Future-dated billers & bundles

---

#### Bill Inquiry
Retrieves bill details before payment to:
- Reduce financial rejections
- Validate consumer number
- Identify settlement account based on source

---

#### Transaction Inquiry
Used to fetch status of:
- IBFT transfers
- RAAST P2P transfers
- Bill payments

Supports:
- Success
- Failure
- Not found
- Includes RAAST identifiers when applicable

---

### 2. Financial APIs

#### Transfer via 1LINK (IBFT)
- Debit via CBS
- Credit routed through 1LINK
- Title Fetch correlation mandatory (where applicable)

---

#### Transfer via RAAST (P2P)
- Requires prior Title Fetch
- Uses purpose codes as per SBP circulars
- Correlation ID reuse mandatory

---

#### Bill Payment
- Debit via CBS
- Credit routed to aggregator / biller settlement account
- Source-driven settlement logic

---

#### Telco Bundle / Package Purchase
- Similar to bill payment
- Bundle-specific pricing and validity
- Supports prepaid and postpaid flows

---

### 3. RTGS APIs (PRISM)

#### Outward Transactions
- MT103 – Single Customer Credit Transfer
- MT102 – Multiple Customer Credit Transfer
- MT202 – FI to FI Transfer
- MTn92 – Cancellation
- MTn95 – Status / Duplicate / Priority Change
- MT920 – Balance & Interim Reports

#### Inward Transactions
- MT900 – Confirmation of Debit
- MT910 – Confirmation of Credit
- MT940 / MT950 – EOD Reports
- MTn96 – Response to Queries

---

## Error Handling

All APIs return:
- `response_code` (4 digits)
- `response_desc`
- `correlationId`

Response codes are aligned with:
- SBP
- RAAST
- 1LINK
- RTGS PRISM specifications
