---
id: apidocs
title: API Documentation
sidebar_position: 2
---

# OpenConnect Unified API Specification

OpenConnect exposes **REST-based APIs** conforming to **OpenAPI 3.0**, acting as a unified abstraction layer over multiple payment rails including **RAAST**, **1LINK**, **Billing Aggregators**, and **RTGS (PRISM)**.

All APIs require authentication via **OAuth2 (client credentials)** and are protected using **JWT tokens** and **Mutual TLS** for secure, encrypted communication.

---

## Table of Contents

1. [Authentication & Authorization](#authentication--authorization)
2. [API Classification](#api-classification)
3. [Non-Financial APIs](#non-financial-apis)
4. [Financial APIs](#financial-apis)
5. [Error Handling](#error-handling)
6. [Best Practices](#best-practices)
7. [API Flow Examples](#api-flow-examples)

---

## Authentication & Authorization

### Overview

All OpenConnect APIs require valid authentication credentials and a valid JWT bearer token. The platform uses **OAuth2 client credentials flow** for machine-to-machine authentication.

### Authentication Steps

#### Step 1: Obtain Access Token

**Endpoint**
```
POST /realms/paysys-raast-realm/protocol/openid-connect/token
```

**Request Headers**
```http
Content-Type: application/x-www-form-urlencoded
Authorization: Basic <base64(client_id:client_secret)>
```

**Request Body**
```
grant_type=client_credentials
&scope=openconnect-api
```

**Response**
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldWIiwia2lkIiA6ICJ...",
  "expires_in": 3600,
  "refresh_expires_in": 0,
  "token_type": "Bearer",
  "not-before-policy": 0,
  "scope": "openconnect-api"
}
```

#### Step 2: Use Token in API Requests

Include the access token in the `Authorization` header for all subsequent API calls:

```http
GET /api/v2/paysyslabs/banklist HTTP/1.1
Host: localhost:3006
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Token Lifecycle

| Property | Details |
|----------|---------|
| **Token Type** | JWT (JSON Web Token) |
| **Validity Period** | 1 hour (3600 seconds) |
| **Refresh Strategy** | Obtain new token before expiry |
| **Expiry Handling** | Gracefully retry with fresh token |
| **Scope** | `openconnect-api` |

### Security Best Practices

✓ Store credentials securely (environment variables, vaults)  
✓ Refresh tokens before expiry (cache tokens for reuse)  
✓ Use HTTPS/TLS for all token requests  
✓ Implement mutual TLS for production environments  
✓ Rotate credentials regularly  
✓ Monitor token usage patterns for anomalies  

---

## API Classification

OpenConnect APIs are organized into three categories based on function and risk profile:

### Category Overview

| Category | Purpose | Risk Level | Requires TFetch |
|----------|---------|-----------|-----------------|
| **Non-Financial** | Data lookup & inquiry | Low | No |
| **Financial** | Payment execution & posting | High | Conditional |
| **RTGS (PRISM)** | Interbank fund transfer | High | No |

---

## Non-Financial APIs

Non-Financial APIs provide data lookups, validations, and inquiries. They do not move funds and can be called multiple times safely.

### 1. Get Banks List

**Purpose:** Retrieve list of participating banks and their supported payment rails.

**Endpoint**
```
GET /api/v2/paysyslabs/banklist
```

**Authentication**
```
Bearer Token Required
```

**Response Example**
```json
{
  "response": {
    "response_code": "0000",
    "response_desc": "SUCCESS",
    "participants": [
      {
        "bankId": 1,
        "bankDisplayName": "National Bank of Pakistan",
        "bankShortBIC": "NBPA",
        "bankBIC": "NBPBPKKA",
        "bankIMD": "601492",
        "accountNumberHelp": "Please provide 14 digits NBP account # or IBAN",
        "isAvailable1LINKIBFT": "Y",
        "isAvailableRAASTP2P": "Y",
        "isAvailableRAASTTF2": "Y",
        "isAvailableRAASTBulk": "Y",
        "isAvailableRAASTP2M": "Y",
        "isAvailableRAASTP2MRTP": "N",
        "isAvailableRAASTP2MPISP": "N"
      },
      {
        "bankId": 2,
        "bankDisplayName": "HBL Bank",
        "bankShortBIC": "HBLC",
        "bankBIC": "HBLCPKKA",
        "bankIMD": "100271",
        "isAvailable1LINKIBFT": "Y",
        "isAvailableRAASTP2P": "Y",
        "isAvailableRAASTTF2": "N"
      }
    ]
  }
}
```

**Use Cases**
- ✓ Display list of banks in mobile/web UI
- ✓ Validate beneficiary bank before title fetch
- ✓ Determine supported payment rails per bank
- ✓ Show account number format help text to user

**Call This API Before:** Title Fetch, Payments to unknown beneficiary banks

---

### 2. Unified Title Fetch

**Purpose:** A **rail-agnostic title fetch API** that dynamically routes requests to RAAST or 1LINK based on preference and availability.

**Endpoint**
```
POST /api/v1/paysyslabs/payments/unifiedtitlefetch
```

**Request Example**
```json
{
  "info": {
    "rrn": "002236987456",
    "stan": "987456",
    "txndate": "20231015",
    "txntime": "182243"
  },
  "senderinfo": {
    "fromAccount": "05421236547552",
    "fromAccountType": "00",
    "fromAccountCurrency": "586"
  },
  "receiverinfo": {
    "bankId": 1,
    "toAccount": "00023137343951"
  },
  "otherinfo": {
    "priorityFlag": "01",
    "fallbackFlag": "01",
    "purposeCode": "0152",
    "amount": 5000
  }
}
```

**Response Example**
```json
{
  "response": {
    "response_code": "0000",
    "response_desc": "SUCCESS"
  },
  "info": {
    "rrn": "00123010123",
    "stan": "001023",
    "correlationId": "7ad7bf9f-99dc-42c2-ab88-abddb87789a0"
  },
  "accountInfo": {
    "title": "Waqas Nizam",
    "toAccount": "00653000129536",
    "destinationPaymentSystem": "01",
    "iban": "PK19SONE000022006493697"
  },
  "participantInfo": {
    "bankIMD": "100271",
    "bankBIC": "NBPBPKKA"
  }
}
```

**Key Features**
- ✓ Dual-rail support (RAAST primary, 1LINK fallback)
- ✓ Account title validation before payment
- ✓ Purpose code validation per SBP circulars
- ✓ Returns destination payment system for intelligent routing
- ✓ Correlation ID for transaction traceability

**⚠️ Critical:** The returned `correlationId` **MUST be reused** in the corresponding financial transaction (ibftTransfer or directPosting) for audit trail and dispute resolution.

**Use Cases**
- ✓ Validate beneficiary account exists
- ✓ Confirm beneficiary account title with customer
- ✓ Determine optimal payment route (RAAST vs 1LINK)
- ✓ Pre-stage transaction data before user confirmation

**Call Before:** IBFT Transfer (1LINK) or Direct Posting (RAAST)

---

### 3. Get Default Account by RAAST ID (Alias)

**Purpose:** Resolve beneficiary account details using RAAST Central Alias Service (CAS).

**Endpoint**
```
POST /api/v1/paysyslabs/alias/getdefaultaccount
```

**Request Example**
```json
{
  "info": {
    "rrn": "002236987456",
    "stan": "987456",
    "txndate": "20231015",
    "txntime": "182243"
  },
  "receiverinfo": {
    "type": "MOBILE",
    "value": "03132370605"
  }
}
```

**Supported Alias Types**

| Type | Format | Example | Notes |
|------|--------|---------|-------|
| **MOBILE** | 11 digits | 03132370605 | Without +92 prefix |
| **CNIC** | 13 digits | 1234512345671 | National ID number |
| **EMAIL** | Email format | user@example.com | Valid email address |
| **TXT** | 3-35 characters | CustomAlias123 | Custom text alias |

**Response Example**
```json
{
  "response": {
    "response_code": "0000",
    "response_desc": "SUCCESS"
  },
  "info": {
    "rrn": "00123010123",
    "stan": "001023",
    "correlationId": "7ad7bf9f-99dc-42c2-ab88-abddb87789a0"
  },
  "accountInfo": {
    "surname": "Mr.",
    "name": "Waqas",
    "destinationPaymentSystem": "01",
    "iban": "PK19SONE000022006493697",
    "currency": "PKR",
    "type": "DFLT"
  },
  "participantInfo": {
    "bankBIC": "SONEPKKA"
  }
}
```

**Use Cases**
- ✓ RAAST P2P transfers to mobile/CNIC alias
- ✓ Alias verification before transaction
- ✓ Account title confirmation
- ✓ Interoperable payment flows (cross-bank)

**Call Before:** Direct Posting (RAAST P2P) using alias

---

### 4. Merchant Alias Inquiry

**Purpose:** Resolve merchant account details using merchant identifiers for P2M (Person-to-Merchant) payments.

**Endpoint**
```
POST /api/v1/paysyslabs/merchant/aliasInquiry
```

**Supported Merchant Alias Types**

| Type | Format | Example | Use Case |
|------|--------|---------|----------|
| **MID** | Merchant ID | 123456789 | Acquiring bank MID |
| **TILL_CODE** | Terminal code | 000112345 | POS terminal identifier |
| **VPA** | Virtual Payment Address | merchant@upi | Future support |

**Request Example**
```json
{
  "info": {
    "rrn": "002236987456",
    "stan": "987456",
    "txndate": "20231015",
    "txntime": "182243"
  },
  "alias": {
    "aliasType": "TILL_CODE",
    "aliasValue": "000112345"
  }
}
```

**Response Example**
```json
{
  "response": {
    "response_code": "0000",
    "response_desc": "SUCCESS"
  },
  "info": {
    "rrn": "00123010123",
    "stan": "010123",
    "correlationId": "7ad7bf9f-99dc-42c2-ab88-abddb87789a0"
  },
  "merchantInfo": {
    "type": "DFLT",
    "currency": "PKR",
    "name": "ABC Retail Store",
    "isDefault": true,
    "account": {
      "iban": "PK26AINI12345678900000056"
    },
    "servicer": {
      "memberId": "AAAAAAXX"
    },
    "additionalDetails": {
      "dba": "ABC Trading Company",
      "mcc": "5411"
    }
  }
}
```

**Use Cases**
- ✓ Point-of-Sale (POS) terminal payments
- ✓ Merchant validation before payment
- ✓ QR code-based payments
- ✓ Merchant billing and settlement

**Call Before:** Direct Posting (RAAST P2M)

---

### 5. Get Billers Category

**Purpose:** Retrieve list of biller categories to organize billers UI.

**Endpoint**
```
GET /api/v1/paysyslabs/billercat
```

**Response Example**
```json
{
  "response": {
    "response_code": "0000",
    "response_desc": "SUCCESS"
  },
  "catList": [
    {
      "catId": 1,
      "catName": "Electricity"
    },
    {
      "catId": 2,
      "catName": "Gas"
    },
    {
      "catId": 3,
      "catName": "Water"
    },
    {
      "catId": 4,
      "catName": "Telecom"
    },
    {
      "catId": 5,
      "catName": "Insurance"
    }
  ]
}
```

**Use Cases**
- ✓ Display biller category menu in UI
- ✓ Organize biller list by category
- ✓ Provide category-based search/filter

**Call Before:** Get Billers List

---

### 6. Get Billers List

**Purpose:** Retrieve list of billers under a specific category with transaction limits and dates.

**Endpoint**
```
POST /api/v1/paysyslabs/billerlist
```

**Request Example**
```json
{
  "info": {
    "rrn": "002236987456",
    "stan": "987456",
    "txndate": "20231015",
    "txntime": "182243"
  },
  "otherinfo": {
    "billerCat": 2
  }
}
```

**Response Example**
```json
{
  "response": {
    "response_code": "0000",
    "response_desc": "SUCCESS"
  },
  "info": {
    "rrn": "00123010123",
    "stan": "010123",
    "correlationId": "7ad7bf9f-99dc-42c2-ab88-abddb87789a0"
  },
  "billers": [
    {
      "billerId": 1,
      "billerName": "SNGPL",
      "minimumAmount": 100,
      "maximumAmount": 100000,
      "startDate": "2024-01-01",
      "endDate": ""
    },
    {
      "billerId": 2,
      "billerName": "Sui Southern",
      "minimumAmount": 100,
      "maximumAmount": 100000,
      "startDate": "2024-01-01",
      "endDate": ""
    }
  ]
}
```

**Use Cases**
- ✓ Display billers in category
- ✓ Show min/max transaction limits
- ✓ Validate biller availability (check endDate)
- ✓ Support future-dated biller enablement

**Call Before:** Bill Inquiry or Bill Payment

---

### 7. Bill Inquiry

**Purpose:** Retrieve bill details before initiating payment to reduce financial rejections and validate consumer details.

**Endpoint**
```
POST /api/v1/paysyslabs/payments/billinquiry
```

**Request Example**
```json
{
  "info": {
    "rrn": "002236987456",
    "stan": "987456",
    "txndate": "20231015",
    "txntime": "182243"
  },
  "billinfo": {
    "billerId": 5,
    "bundleId": null,
    "consumerNo": "03132370605"
  }
}
```

**Response Example**
```json
{
  "response": {
    "response_code": "0000",
    "response_desc": "SUCCESS"
  },
  "info": {
    "rrn": "00123010123",
    "stan": "010123",
    "correlationId": "7ad7bf9f-99dc-42c2-ab88-abddb87789a0"
  },
  "billinfo": {
    "billerId": 5,
    "bundleId": 149,
    "consumerNo": "03132370605",
    "customerName": "Waqas Nizam",
    "billStatus": "U",
    "billingMonth": "2310",
    "dueDate": "231029",
    "amountWithinDueDate": "5100",
    "amountAfterDueDate": "5300",
    "source": "04"
  }
}
```

**Bill Status Codes**

| Code | Meaning |
|------|---------|
| **U** | Unpaid |
| **P** | Paid |
| **T** | Partial payment |
| **B** | Blocked |

**Use Cases**
- ✓ Validate consumer number before payment
- ✓ Display bill amount and due date to customer
- ✓ Show overage amount if payment is late
- ✓ Confirm customer name matches
- ✓ Determine settlement account (source-driven)

**⚠️ Important:** Store the returned `correlationId` for use in the subsequent Bill Payment call.

**Call Before:** Bill Payment

---

### 8. Transaction Inquiry

**Purpose:** Fetch status of previously initiated transactions (IBFT, P2P, Bill Payments, etc.).

**Endpoint**
```
POST /api/v1/paysyslabs/payments/transactioninquiry
```

**Request Example**
```json
{
  "info": {
    "rrn": "002236987456",
    "stan": "987456",
    "txndate": "20231015",
    "txntime": "182243"
  },
  "originalTxnInfo": {
    "destinationSystem": "04",
    "orrn": "654785654785",
    "ostan": "654785",
    "otxndate": "20231015",
    "otxntime": "182243",
    "omsgId": "34f15c52-15ad-4ac7-a1a5-501d36f2be80"
  }
}
```

**Response Example**
```json
{
  "response": {
    "response_code": "0000",
    "response_desc": "SUCCESS"
  },
  "info": {
    "rrn": "00123010123",
    "stan": "010123",
    "correlationId": "7ad7bf9f-99dc-42c2-ab88-abddb87789a0"
  },
  "paymentInfo": {
    "instrId": "TMIC230511125023876423",
    "endToEndId": "1fc66b584e77-46e6-9dcb-fb12c00e7742",
    "txId": "TMIC230511125023876423",
    "msgId": "34f15c52-15ad-4ac7-a1a5-501d36f2be80"
  }
}
```

**Use Cases**
- ✓ Check transaction status after timeout
- ✓ Provide customer with transaction receipt
- ✓ Reconciliation and dispute handling
- ✓ Monitor in-flight transactions
- ✓ Payment confirmation for receipts/notifications

**Call For:** Reconciliation, dispute handling, receipt generation

---

### 9. Get Telco List

**Purpose:** Retrieve list of telecommunications companies offering prepaid/postpaid bundles.

**Endpoint**
```
GET /api/v1/paysyslabs/telcolist
```

**Response Example**
```json
{
  "response": {
    "response_code": "0000",
    "response_desc": "SUCCESS"
  },
  "telcos": [
    {
      "telcoId": "149",
      "telcoName": "Ufone"
    },
    {
      "telcoId": "150",
      "telcoName": "Telenor"
    },
    {
      "telcoId": "151",
      "telcoName": "Jazz"
    },
    {
      "telcoId": "152",
      "telcoName": "Zong"
    }
  ]
}
```

**Use Cases**
- ✓ Display telco options in UI
- ✓ Enable telco bundle selection
- ✓ Support telecom prepaid top-ups
- ✓ Manage telco-specific promotions

**Call Before:** Get Telco Packages

---

### 10. Get Telco Packages

**Purpose:** Retrieve telco bundles/packages with pricing, validity, and features.

**Endpoint**
```
POST /api/v1/paysyslabs/packageslist
```

**Request Example**
```json
{
  "info": {
    "rrn": "002236987456",
    "stan": "987456",
    "txndate": "20231015",
    "txntime": "182243"
  },
  "otherinfo": {
    "billerId": 149
  }
}
```

**Response Example**
```json
{
  "response": {
    "response_code": "0000",
    "response_desc": "SUCCESS"
  },
  "info": {
    "rrn": "00123010123",
    "stan": "010123",
    "correlationId": "7ad7bf9f-99dc-42c2-ab88-abddb87789a0"
  },
  "bundles": [
    {
      "bundleId": 1,
      "billerId": 149,
      "source": "05",
      "startDate": "2024-07-01",
      "bundleName": "Super Card Gold",
      "onNetMins": "7500",
      "offNetMins": "600",
      "sms": "5000",
      "internet": "40 GB",
      "price": 1700,
      "validity": "30 days",
      "bundleType": "Super Card Family",
      "inquiryAvailable": "N"
    }
  ]
}
```

**Use Cases**
- ✓ Display telco bundles with pricing
- ✓ Show data, minutes, SMS benefits
- ✓ Display validity period (e.g., 30 days)
- ✓ Enable bundle selection for purchase
- ✓ Support promotional bundle messaging

**Call Before:** Bill Payment (for Telco bundles)

---

## Financial APIs

Financial APIs execute actual payment transactions and move funds. These require higher authentication levels and careful handling.

### 1. Transfer via 1LINK (IBFT)

**Purpose:** Execute interbank fund transfer through 1LINK (Interbank Fund Transfer).

**Endpoint**
```
POST /api/v1/paysyslabs/payments/ibfttransfer
```

**Request Example**
```json
{
  "info": {
    "rrn": "002236987456",
    "stan": "987456",
    "txndate": "20231015",
    "txntime": "182243",
    "tfcorrelationId": "7ad7bf9f-99dc-42c2-ab88-abddb87789a0"
  },
  "senderinfo": {
    "fromAccount": "05421236547552",
    "fromAccountTitle": "Muhammad Ali",
    "fromAccountType": "00",
    "fromAccountCurrency": "586",
    "fromAccountCnic": "1234512345671"
  },
  "receiverinfo": {
    "bankIMD": "100271",
    "toAccount": "00023137343951",
    "toAccountTitle": "Waqas Nizam"
  },
  "paymentInfo": {
    "purposeCode": "0152",
    "narration": "Test transaction",
    "amount": 5000,
    "authId": "654123",
    "msgId": "34f15c52-15ad-4ac7-a1a5-501d36f2be80"
  }
}
```

**Processing Flow**

```
1. Channel submits IBFT request with valid tfcorrelationId
2. OpenConnect validates request (format, limits, fraud checks)
3. CBS debits sender account (under authorization)
4. 1LINK credit advice sent to beneficiary bank
5. Beneficiary bank credits receiver account
6. Success/failure returned to channel
```

**Response Example**
```json
{
  "response": {
    "response_code": "0000",
    "response_desc": "Success"
  },
  "info": {
    "rrn": "00123010123",
    "stan": "010123",
    "correlationId": "7ad7bf9f-99dc-4c2c-ab88-abddb87789a0"
  },
  "paymentInfo": {
    "instrId": "TMIC230511152023876423",
    "endToEndId": "1fc66b58a7f-46e6-9dcb-fb12c00e7742",
    "txId": "TMIC230511152023876423",
    "msgId": "TMICFBPX11052300011152023"
  }
}
```

**Response Codes**

| Code | Description | Action |
|------|-------------|--------|
| 0000 | Success | Transaction completed |
| 0001 | Pending Approval | Awaiting auth, retry later |
| 0003 | Insufficient Balance | Reject, show user |
| 0004 | Duplicate Transaction | Check previous transaction |
| 0005 | Account Locked | Inform user, escalate |
| 0006 | Account Not Found | Verify account, reject |
| 0007 | Invalid Beneficiary | Retry title fetch |
| 0009 | Amount Exceeds Limit | Show limit, reduce amount |
| 0010 | Rejected by Beneficiary Bank | Inform user |

**Mandatory Requirements**
- ✓ Valid `tfcorrelationId` from prior Title Fetch call
- ✓ Purpose code per SBP circulars
- ✓ Unique `msgId` (prevent duplicates)
- ✓ Valid beneficiary IBAN/account

**Use Cases**
- ✓ Peer-to-peer fund transfer
- ✓ Bill payments via 1LINK
- ✓ Salary/vendor payments
- ✓ Fund transfers between own accounts

**Retry Strategy**
- ✓ Retry on network timeout (with exp backoff)
- ✓ Retry on pending (0001) after 2-5 seconds
- ✓ Do NOT retry on duplicate (0004)
- ✓ Do NOT retry on insufficient balance (0003)

---

### 2. Transfer via RAAST (Direct Posting)

**Purpose:** Execute peer-to-peer (P2P) or person-to-merchant (P2M) fund transfer through RAAST.

**Endpoint**
```
POST /api/v3/paysyslabs/directposting
```

**Request Example**
```json
{
  "info": {
    "rrn": "002236987456",
    "stan": "987456",
    "txndate": "20231015",
    "txntime": "182243",
    "tfcorrelationId": "7ad7bf9f-99dc-42c2-ab88-abddb87789a0"
  },
  "senderinfo": {
    "fromAccount": "PK56AINI12345678900000001",
    "fromAccountTitle": "Muhammad Ali",
    "fromAccountType": "00",
    "fromAccountCurrency": "586",
    "fromAccountCnic": "1234512345671"
  },
  "receiverinfo": {
    "bankBIC": "NBPBPKKA",
    "toAccount": "PK76NBPA12345678900000999",
    "toAccountTitle": "Waqas Nizam"
  },
  "paymentInfo": {
    "purposeCode": "0125",
    "narration": "test transaction",
    "amount": 5000,
    "authId": "654123",
    "msgId": "34f15c52-15ad-4ac7-a1a5-501d36f2be80"
  }
}
```

**Processing Flow**

```
1. Channel submits RAAST Direct Posting request
2. OpenConnect validates request (format, limits, fraud checks)
3. CBS debits sender account (under authorization)
4. RAAST credit transfer initiated to beneficiary
5. Beneficiary bank credits receiver account
6. Confirmation returned to channel
```

**Response Example**
```json
{
  "response": {
    "response_code": "0000",
    "response_desc": "Success"
  },
  "info": {
    "rrn": "00123010123",
    "stan": "010123",
    "correlationId": "7ad7bf9f-99dc-4c2c-ab88-abddb87789a0"
  },
  "paymentInfo": {
    "instrId": "TMIC230511152023876423",
    "endToEndId": "1fc66b58a7f-46e6-9dcb-fb12c00e7742",
    "txId": "TMIC230511152023876423",
    "msgId": "TMICFBPX11052300011152023"
  }
}
```

**RAAST-Specific Features**
- ✓ Alias-based transfers (MOBILE, CNIC, EMAIL, TXT)
- ✓ Person-to-Merchant (P2M) payments
- ✓ Lower transaction limits (vs 1LINK)
- ✓ Real-time settlement
- ✓ Enhanced fraud controls

**Use Cases**
- ✓ Peer-to-peer RAAST transfers
- ✓ Merchant QR code payments (P2M)
- ✓ Branchless banking remittances
- ✓ Person-to-person domestic transfers
- ✓ Bill payments via RAAST

**Mandatory Requirements**
- ✓ Valid `tfcorrelationId` from prior Title Fetch/Alias lookup
- ✓ Purpose code per RAAST specifications
- ✓ Unique `msgId` (prevent duplicates)
- ✓ Beneficiary IBAN (24 characters)

---

### 3. Bill Payment

**Purpose:** Initiate bill payment transaction through aggregator/biller settlement.

**Endpoint**
```
POST /api/v1/paysyslabs/payments/billpayment
```

**Request Example**
```json
{
  "info": {
    "rrn": "002236987456",
    "stan": "987456",
    "txndate": "20231015",
    "txntime": "182243",
    "inqcorrelationId": "7ad7bf9f-99dc-42c2-ab88-abddb87789a0"
  },
  "billInfo": {
    "billerId": 5,
    "bundleId": null,
    "consumerNo": "03132370605",
    "amount": 500
  },
  "payerInfo": {
    "payerIBAN": "PK76MASH1234567890126985",
    "payerName": "Muhammad Ali",
    "payerCNIC": "1234512345671"
  },
  "otherInfo": {
    "channel": "00000007",
    "authId": "658965"
  }
}
```

**Processing Flow**

```
1. Channel submits bill payment request
2. Validate consumer number and biller
3. CBS debits payer account
4. Aggregator receives credit
5. Biller receives billing credit
6. Consumer receives bill clearance
```

**Response Example**
```json
{
  "response": {
    "response_code": "0000",
    "response_desc": "Success"
  },
  "info": {
    "rrn": "00123010123",
    "stan": "010123",
    "correlationId": "7ad7bf9f-99dc-4c2c-ab88-abddb87789a0"
  }
}
```

**Channel Codes**

| Code | Channel |
|------|---------|
| 00000000 | ATM |
| 00000001 | IVR |
| 00000002 | Call Center |
| 00000003 | Web |
| 00000004 | T24 TELL |
| 00000005 | POS |
| 00000006 | CDM_CASH |
| 00000007 | Mobile |

**Use Cases**
- ✓ Utility bill payments (electricity, gas, water)
- ✓ Telecom prepaid/postpaid
- ✓ Insurance premium payments
- ✓ Educational institution fees
- ✓ Online shopping bill payments

**Mandatory Requirements**
- ✓ Valid `inqcorrelationId` from Bill Inquiry call
- ✓ Exact amount (or approved variation)
- ✓ Valid payer IBAN and CNIC
- ✓ Valid consumer number

---

### 4. Bill Payment 2

**Purpose:** Enhanced bill payment with bundle-specific support (e.g., telco packages).

**Endpoint**
```
POST /api/v1/paysyslabs/payments/billpayment2
```

**Request Example**
```json
{
  "info": {
    "rrn": "002236987456",
    "stan": "987456",
    "txndate": "20231015",
    "txntime": "182243",
    "incorrelationId": "7ad7bf9f-99dc-42c2-ab88-abddb87789a0"
  },
  "billInfo": {
    "billerId": 149,
    "bundleId": 1,
    "consumerNo": "03001234567",
    "amount": 1700
  },
  "payerInfo": {
    "payerIBAN": "PK76MASH1234567890126985",
    "payerName": "Muhammad Ali",
    "payerCNIC": "1234512345671"
  },
  "otherInfo": {
    "channel": "00000007"
  }
}
```

**Key Differences from Bill Payment**

| Feature | Bill Payment | Bill Payment 2 |
|---------|--------------|----------------|
| **Bundle Support** | Optional (null) | Required |
| **Auth ID** | Required | Optional |
| **Use Case** | General bills | Telco/subscriptions |
| **Channel** | All channels | Mobile/Web focused |

**Use Cases**
- ✓ Telco bundle/package purchase
- ✓ Subscription-based services
- ✓ Prepaid package top-ups
- ✓ Recurring bill payments

---

### 6. Channel Notify Request for Return Payment

**Purpose:** Expose a new end point which OC will call once it will receive the accept or reject reply from SBP.

**Endpoint**
```
POST /notifyRequestForReturnPayment
```

**Request Headers**
```http
Content-Type: application/json
Authorization: Bearer <access_token>
```

**Request Body Example**
```json
{
  "info": {
    "rrn": "002236987456",
    "stan": "987456",
    "txndate": "20231015",
    "txntime": "182243"
  },
  "originalMessageInfo": {
    "originalRrn": "01012301023",
    "originalStan": "010123",
    "camtD56MessageId": "070341490014900099999"
  },
  "statusInfo": {
    "status": "ACCP",
    "rictCode": "",
    "rictDesc": ""
  },
  "reserveFields": {
    "r1": "",
    "r2": "",
    "r3": "",
    "r4": "",
    "r5": ""
  }
}
```

**Request Body Parameters**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **info** | Object | Y | Transaction metadata |
| info.rrn | String (12) | Y | Retrieval reference number |
| info.stan | String (6) | Y | System trace audit number |
| info.txndate | String (8) | Y | Transaction date (Format: yyyymmdd) |
| info.txntime | String (6) | Y | Transaction time (Format: hhmmss) |
| **originalMessageInfo** | Object | Y | Original transaction details |
| originalMessageInfo.originalRrn | String (12) | Y | RRN used in original request for return |
| originalMessageInfo.originalStan | String (6) | Y | Stan used in original request for return |
| originalMessageInfo.camtD56MessageId | String (100) | Y | CamtD56 original Message id |
| **statusInfo** | Object | Y | Return payment status |
| statusInfo.status | String (20) | Y | If CamtD56 reply accepted then "ACCP" else "RJCT" |
| statusInfo.rictCode | String (0) | O | If status value is RJCT then value will be present else it will be empty string |
| statusInfo.rictDesc | String (50) | O | If status value is RJCT then value will be present else it will be empty string |
| **reserveFields** | Object | Y | Reserved fields for future use |
| reserveFields.r1 | String (100) | O | Reserved field 1 |
| reserveFields.r2 | String (100) | O | Reserved field 2 |
| reserveFields.r3 | String (100) | O | Reserved field 3 |
| reserveFields.r4 | String (100) | O | Reserved field 4 |
| reserveFields.r5 | String (100) | O | Reserved field 5 |

**Response Example**
```json
{
  "response": {
    "responseCode": "00",
    "responseDesc": "Success"
  },
  "info": {
    "rrn": "00123010123",
    "stan": "010123"
  }
}
```

**Response Body Parameters**

| Field | Type | Mandatory | Description |
|-------|------|-----------|-------------|
| **response** | Object | Y | Response metadata |
| response.responseCode | String (2) | Y | Response code for the request |
| response.responseDesc | String (40) | Y | Description for the respective response code |
| **info** | Object | Y | Transaction information |
| info.rrn | String (12) | Y | Echo back |
| info.stan | String (6) | Y | Echo back |

**Status Values**

| Code | Meaning | Action |
|------|---------|--------|
| **ACCP** | Accepted | Return payment accepted by SBP |
| **RJCT** | Rejected | Return payment rejected by SBP (rictCode and rictDesc will contain reason) |

**Use Cases**
- ✓ Receive return payment acceptance/rejection from SBP
- ✓ Update transaction status in core system
- ✓ Notify customer of return payment outcome
- ✓ Maintain audit trail for regulatory compliance
- ✓ Enable exception handling for rejected returns

**Mandatory Requirements**
- ✓ Valid RRN, STAN from original transaction
- ✓ Valid CamtD56 Message ID
- ✓ Proper status value (ACCP or RJCT)
- ✓ RJCT status must include rictCode and rictDesc

---

## Error Handling

All APIs follow a consistent error response format for easy client-side handling.

### Response Structure

```json
{
  "response": {
    "response_code": "0401",
    "response_desc": "Invalid request parameters"
  },
  "info": {
    "rrn": "00123010123",
    "stan": "010123",
    "correlationId": "7ad7bf9f-99dc-42c2-ab88-abddb87789a0"
  }
}
```

### Standard Response Codes

**Success Codes**

| Code | Description |
|------|-------------|
| **0000** | Success – Transaction completed successfully |
| **0001** | Pending Approval – Awaiting authorization, retry later |

**Client Error Codes (4xx)**

| Code | Description | Action |
|------|-------------|--------|
| 0401 | Invalid request parameters | Validate request format |
| 0402 | Unauthorized – Missing/invalid bearer token | Refresh token |
| 0468 | Mandatory parameters not provided | Check required fields |

**Server Error Codes (5xx)**

| Code | Description | Action |
|------|-------------|--------|
| 0500 | Internal server error | Retry with exponential backoff |
| 0503 | Service temporarily unavailable | Retry after delay |

**Business Error Codes**

| Code | Description | User Action |
|------|-------------|-------------|
| 0003 | Insufficient Balance | Insufficient funds |
| 0004 | Duplicate Transaction | Check previous transaction |
| 0005 | Account Locked | Contact bank support |
| 0006 | Account Not Found | Verify account details |
| 0007 | Invalid Beneficiary | Re-verify beneficiary |
| 0008 | Transaction Timeout | Retry or check status |
| 0009 | Amount Exceeds Limit | Reduce amount or contact support |
| 0010 | Rejected by Beneficiary Bank | Contact beneficiary bank |

### Error Handling Best Practices

✓ **Idempotency** – Use unique msgId to prevent duplicate processing  
✓ **Retry Strategy** – Implement exponential backoff for transient errors  
✓ **Timeout Handling** – Query transaction status on timeout  
✓ **User Communication** – Display user-friendly error messages  
✓ **Logging** – Log all errors with correlationId for debugging  
✓ **Monitoring** – Alert on error spikes or pattern changes  

---

## Best Practices

### 1. Idempotency

Always use unique identifiers to prevent duplicate processing:

```json
{
  "info": {
    "rrn": "002236987456",      // Unique per transaction
    "stan": "987456",             // Unique per session
    "txndate": "20231015",
    "txntime": "182243"
  },
  "paymentInfo": {
    "msgId": "34f15c52-15ad-4ac7-a1a5-501d36f2be80"  // UUID - unique globally
  }
}
```

### 2. Correlation Tracking

Always store and reuse correlation IDs for audit trail:

```
1. Title Fetch → returns correlationId (store)
2. IBFT Transfer → reuse correlationId in request
3. Transaction Inquiry → use correlationId to track
4. Dispute handling → provide correlationId as reference
```

### 3. Request Timeout & Retry

Implement intelligent retry logic:

```javascript
// Pseudocode
async function transferWithRetry(request, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await callAPI(request);
      
      if (response.response_code === "0000") {
        return response;  // Success
      } else if (response.response_code === "0001") {
        await delay(2000);  // Pending - wait and retry
        continue;
      } else if (response.response_code === "0004") {
        return response;  // Duplicate - don't retry
      } else {
        return response;  // Business error - no retry
      }
    } catch (error) {
      // Network/timeout error
      if (i < maxRetries - 1) {
        await delay(Math.pow(2, i) * 1000);  // Exponential backoff
      } else {
        throw error;
      }
    }
  }
}
```

### 4. Token Management

Cache and refresh tokens efficiently:

```javascript
// Pseudocode
class TokenManager {
  private token: string;
  private expiresAt: number;
  
  async getToken() {
    if (this.isTokenExpired()) {
      this.token = await this.obtainNewToken();
      this.expiresAt = Date.now() + 3500000;  // 1hr - 100s
    }
    return this.token;
  }
  
  private isTokenExpired() {
    return Date.now() > this.expiresAt - 60000;  // Refresh 1min early
  }
}
```

### 5. Data Validation

Validate all inputs before API calls:

```json
{
  "senderinfo": {
    "fromAccount": "05421236547552",           // Length: 14-24 chars
    "fromAccountType": "00",                   // Enum: 00, 10, 20...
    "fromAccountCurrency": "586",              // 3-digit currency code
    "fromAccountCnic": "1234512345671"         // Exactly 13 digits
  },
  "paymentInfo": {
    "amount": 5000,                            // > 0, within limits
    "purposeCode": "0152",                     // Valid per SBP
    "msgId": "34f15c52-15ad-4ac7-a1a5-501d36f2be80"  // Valid UUID
  }
}
```

### 6. PCI-DSS Compliance

Sensitive data handling:

✓ Never log full account numbers or IBANs  
✓ Mask account numbers in UI (show last 4 digits only)  
✓ Use HTTPS/TLS for all communications  
✓ Implement mutual TLS for production  
✓ Store sensitive data encrypted  
✓ Implement role-based access controls  

---

## API Flow Examples

### Example 1: Peer-to-Peer 1LINK Transfer

```
Step 1: Get Banks List
  GET /api/v2/paysyslabs/banklist
  → Identify beneficiary bank, confirm IBFT support
  
Step 2: Unified Title Fetch
  POST /api/v1/paysyslabs/payments/unifiedtitlefetch
  → Validate beneficiary account, get correlationId
  → Returns: correlationId, bankIMD, title
  
Step 3: Display Confirmation
  → Show customer: Beneficiary name, amount, fees
  
Step 4: IBFT Transfer
  POST /api/v1/paysyslabs/payments/ibfttransfer
  → Use correlationId from step 2
  → Returns: success or failure
  
Step 5: Display Receipt
  → Show RRN, STAN, transaction status
```

### Example 2: RAAST Alias-Based P2P Transfer

```
Step 1: Get Default Account by Alias
  POST /api/v1/paysyslabs/alias/getdefaultaccount
  → Resolve mobile/CNIC to IBAN
  → Returns: correlationId, IBAN, account title
  
Step 2: Display Confirmation
  → Show: Account holder name, amount
  
Step 3: Direct Posting (RAAST P2P)
  POST /api/v3/paysyslabs/directposting
  → Use correlationId from step 1
  → Returns: success or failure
  
Step 4: Transaction Inquiry (if needed)
  POST /api/v1/paysyslabs/payments/transactioninquiry
  → Check final status for receipt
```

### Example 3: Bill Payment Flow

```
Step 1: Get Billers Category
  GET /api/v1/paysyslabs/billercat
  → Display category menu to user
  
Step 2: Get Billers List
  POST /api/v1/paysyslabs/billerlist
  → Show billers in selected category
  
Step 3: Bill Inquiry
  POST /api/v1/paysyslabs/payments/billinquiry
  → Fetch bill details, amount, due date
  → Returns: correlationId
  
Step 4: Display Bill Summary
  → Show: Consumer name, amount, due date
  
Step 5: Bill Payment
  POST /api/v1/paysyslabs/payments/billpayment
  → Use correlationId from step 3
  → Returns: success or failure
  
Step 6: Display Receipt
  → Transaction confirmation, receipt number
```

### Example 4: Telco Bundle Purchase

```
Step 1: Get Telco List
  GET /api/v1/paysyslabs/telcolist
  → Display telco options
  
Step 2: Get Telco Packages
  POST /api/v1/paysyslabs/packageslist
  → Show bundles, pricing, features
  
Step 3: Bill Inquiry (optional validation)
  POST /api/v1/paysyslabs/payments/billinquiry
  → Verify consumer number and bundle
  
Step 4: Bill Payment 2
  POST /api/v1/paysyslabs/payments/billpayment2
  → Include bundleId for package purchase
  
Step 5: Confirmation
  → Bundle activation confirmation
```

---

## Summary

The OpenConnect API provides a **comprehensive, unified abstraction** over multiple payment rails:

✓ **Non-Financial APIs** – Data lookups, inquiries, validations  
✓ **Financial APIs** – Payment execution (1LINK, RAAST, Billing)  
✓ **Security** – OAuth2, JWT, Mutual TLS  
✓ **Reliability** – Idempotency, retry, error handling  
✓ **Compliance** – Audit trails, regulatory reporting  
✓ **Developer Experience** – Clear error messages, comprehensive documentation  

For more details, refer to the **OpenAPI specification** and **Integration Guide**.
