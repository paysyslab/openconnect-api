---
id: dataTypeRef
title: Data Type Reference
sidebar_position: 2
---

# Data Type References

<!-- import Tabs from '@theme/Tabs';
import TabContent from '@theme/TabContent'; -->

![OpenConnect Functional Flow](/img/OC-system.png)

This document serves as a comprehensive reference for the data types, enumerations, and validation rules used across OpenConnect APIs. It ensures data consistency, interoperability, and proper validation across all integrated services and channels.

:::info
All API integrations must strictly adhere to these data type specifications and validation rules to ensure seamless transaction processing and error prevention.
:::

---

## Standard Data Types

| Type | Description | Example | Allowed Format / Range | Common Fields | Min Length | Max Length |
|------|-------------|---------|------------------------|----------------|------------|------------|
| **string** | Alphanumeric text | `"OpenConnect"` | UTF-8 characters | accountId, userName | 1 | 64 |
| **integer** | Whole number | `1001` | 0–999,999,999 | amount, customerId | N/A | 10 digits |
| **long** | Large numeric identifier | `23132313131313` | Unsigned 64-bit | rrn, transactionId | 13 | 20 |
| **boolean** | True/False values | `true` / `false` | Boolean literal | isActive, isVerified | N/A | N/A |
| **date** | ISO 8601 date format | `"2025-04-15"` | YYYY-MM-DD | accountExpiryDate, dob | N/A | 10 |
| **dateTime** | ISO 8601 timestamp | `"2025-04-15T10:45:30Z"` | YYYY-MM-DDThh:mm:ssZ | createdAt, updatedAt | N/A | 24 |
| **decimal** | Numeric with precision | `2500.75` | 0–99,999,999.99 (2 decimals) | amount, fee, commission | N/A | 12 |
| **enum** | Predefined set of values | `"Active"` | Pre-defined list | accountStatus, txnType | N/A | N/A |
| **object** | Nested JSON structure | `{"accountId": "123"}` | Valid JSON object | customer, paymentInfo | N/A | N/A |
| **array** | Ordered list of values | `["ATM", "POS", "Ecom"]` | Valid JSON array | allowedChannels, participants | 0 | Unlimited |
| **UUID** | Universally unique identifier | `"7ad7bf9f-99dc-42c2-ab88-abddb87789a0"` | RFC 4122 format | correlationId, messageId | N/A | 36 |
| **IBAN** | International Bank Account Number | `"PK76MASH1234567890126985"` | 24 characters, alphanumeric | account, toAccount | 24 | 24 |

---

## Enumerations

### Account Status

| Value | Description | Use Case |
|-------|-------------|----------|
| **Fresh** | Account generated but not activated | New account before first use |
| **Active** | Account is operational and fully enabled | Regular transactions allowed |
| **Frozen** | Temporarily blocked pending review | Fraud investigation or compliance check |
| **Blocked** | Permanently locked and unusable | Regulatory action or policy violation |
| **Expired** | Account validity period has ended | Dormant or expired credentials |
| **Suspended** | Temporarily inactive for maintenance | System updates or policy changes |

---

### Transaction Type

| Value | Description | Direction | Affects Balance |
|-------|-------------|-----------|-----------------|
| **Credit** | Adds funds to the account | Inbound | ↑ Increases |
| **Debit** | Deducts funds from the account | Outbound | ↓ Decreases |
| **Reversal** | Reverses a previous transaction | Bidirectional | Corrects |
| **Adjustment** | Manual adjustment by system/admin | Bidirectional | Variable |
| **Transfer** | Movement between accounts | Bidirectional | Transfers |

---

### Transaction Status

| Value | Description | Next Possible States |
|-------|-------------|---------------------|
| **Pending** | Transaction awaiting processing | Processing, Failed, Cancelled |
| **Processing** | Active transaction in progress | Success, Failed |
| **Success** | Transaction completed successfully | Reversal (if applicable) |
| **Failed** | Transaction did not complete | Pending (retry), Reversed |
| **Cancelled** | Transaction manually cancelled | N/A |
| **Rejected** | Transaction rejected by system | Pending (resubmit) |

---

### Identification Type

| Value | Description | Length | Format | Example |
|-------|-------------|--------|--------|---------|
| **CNIC** | Pakistan National ID | 13 | Numeric only | `4210321466271` |
| **Passport** | Passport number | 9-15 | Alphanumeric | `FA3214567` |
| **NTN** | National Tax Number | 10 | Numeric only | `1234567890` |
| **NICOP** | Pakistan National ID for overseas | 13 | Numeric only | `6321234567890` |
| **EmployeeID** | Internal employee identifier | 6-10 | Alphanumeric | `EMP123456` |
| **Email** | Valid email address | 5-100 | RFC 5322 format | `user@example.com` |
| **Mobile** | Phone number | 11 | Numeric (Pakistan) | `03132370605` |

---

### Account Type

| Value | Description | Capabilities |
|-------|-------------|--------------|
| **00** | Default Account | Standard transactions |
| **10** | Savings Account | Interest-bearing, limited transactions |
| **20** | Current/Checking | Unlimited transactions |
| **30** | Credit Account | Credit-based spending |
| **40** | Branchless Banking | Mobile/agent-based access |
| **50** | Biometric Withdrawal | Biometric authentication required |
| **60** | Roshan Digital Account | Overseas Pakistani accounts |

---

### Priority Flag (Payment Rails)

| Code | System | Description | Speed | Availability |
|------|--------|-------------|-------|--------------|
| **01** | RAAST | Real-time retail payment system (local) | Real-time | All banks |
| **02** | 1LINK | Interbank settlement system | 1-2 hours | Most banks |

---

### Fallback Options

| Code | Setting | Description |
|------|---------|-------------|
| **01** | Yes | Use alternate payment rail if primary fails |
| **02** | No | Do not attempt alternate payment rail |

---

### Bill Status

| Status | Code | Description |
|--------|------|-------------|
| **Unpaid** | U | Bill has not been paid |
| **Paid** | P | Bill fully paid |
| **Partial** | T | Partial payment received |
| **Blocked** | B | Bill payment blocked |
| **Due** | D | Bill payment is due |
| **Overdue** | O | Payment is overdue |

---

### Aggregator Sources

| Code | Provider | Description |
|------|----------|-------------|
| **03** | NADRA | National Database and Registration Authority |
| **04** | 1LINKBPS | 1LINK Bill Payment System |
| **05** | UFONE | UFONE Mobile Operator |
| **06** | TELENOR | Telenor Mobile Operator |
| **07** | JAZZ | Jazz Mobile Operator |
| **08** | ZONG | ZONG Mobile Operator |
| **09** | ONIC | ONIC Telecom Operator |

---

## Naming Conventions

| Convention | Usage | Example | Where Used |
|------------|-------|---------|-----------|
| **camelCase** | API request/response parameters | `accountId`, `txnType`, `payerIBAN` | JSON payloads, JavaScript |
| **PascalCase** | Class names and UI labels | `AccountId`, `ResponseCode`, `TransactionType` | Database schemas, UI displays |
| **snake_case** | Internal configuration and database columns | `account_type`, `transaction_status`, `payer_cnic` | Configuration files, Databases |
| **UPPER_SNAKE_CASE** | Constants and environment variables | `API_KEY`, `MAX_AMOUNT`, `TIMEOUT_MS` | Constants, ENV vars |

---

## Validation Rules

### Mandatory Field Validation

| Field | API Endpoint | Type | Error Code |
|-------|-------------|------|-----------|
| `rrn` | All endpoints | string (12 chars) | 0468 |
| `stan` | All endpoints | string (6 chars) | 0468 |
| `txndate` | All endpoints | string (8 chars, YYYYMMDD) | 0468 |
| `txntime` | All endpoints | string (6 chars, HHMMSS) | 0468 |
| `bankId` / `billerId` | Most endpoints | integer | 0468 |

### Pattern & Format Validation

| Field | Pattern/Format | Example | Validation Rule |
|-------|----------------|---------|----|
| **CNIC** | `[0-9]{13}` | `4210321466271` | Exactly 13 digits, no spaces |
| **Mobile** | `03[0-9]{9}` | `03132370605` | 11 digits starting with 03 |
| **Email** | RFC 5322 | `user@domain.com` | Valid email format |
| **IBAN** | `PK[0-9A-Z]{24}` | `PK76MASH1234567890126985` | 24 chars, starts with PK |
| **RRN** | `[0-9]{12}` | `002236987456` | Exactly 12 numeric digits |
| **STAN** | `[0-9]{6}` | `987456` | Exactly 6 numeric digits |
| **Date** | `YYYYMMDD` | `20231015` | Valid date format |
| **Time** | `HHMMSS` | `182243` | Valid 24-hour time (00-23:59:59) |
| **UUID** | RFC 4122 | `7ad7bf9f-99dc-42c2-ab88-abddb87789a0` | Standard UUID v4 format |

### Length Constraints

| Field Type | Min Length | Max Length | Notes |
|------------|-----------|-----------|-------|
| Account Title | 3 | 40 | Names, merchant names |
| Narration/Description | 0 | 140 | Transaction description |
| Account Number | 6 | 24 | IBAN or local account |
| Consumer Number | 1 | 30 | Bill/utility account number |
| Message ID | 5 | 35 | Unique transaction identifier |
| Correlation ID | 36 | 36 | UUID format only |

---

## Data Type Examples by API

### Unified Title Fetch Request

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
    "amount": 5000.00
  }
}
```

### Bill Payment Request

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
    "bundleId": 1,
    "consumerNo": "03132370605",
    "amount": 500.00
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

---

## Response Validation Example

```json
{
  "customerId": "10000045",
  "accountId": "100000245",
  "rrn": "23132313131313",
  "idType": "CNIC",
  "idValue": "4210101010101",
  "amount": 5000.75,
  "currency": "PKR",
  "transactionType": "Credit",
  "isActive": true,
  "createdAt": "2025-04-15T10:45:30Z"
}
```

### Validation Output Table

| Field | Validation Type | Result | Message | Status Code |
|-------|-----------------|--------|---------|------------|
| customerId | Length Check | ✅ Pass | Valid identifier | 0000 |
| idValue | Pattern Check | ✅ Pass | CNIC format verified (13 digits) | 0000 |
| amount | Decimal Precision | ✅ Pass | Valid (2 decimal places) | 0000 |
| transactionType | Enum Validation | ❌ Fail | Must be Credit, Debit, Reversal, or Adjustment | 0001 |
| rrn | Mandatory Field | ✅ Pass | RRN present and valid | 0000 |
| createdAt | DateTime Format | ✅ Pass | Valid ISO 8601 format | 0000 |

---

## Common Error Scenarios

:::danger Important
Always validate data before submission to avoid rejection and processing delays.
:::

| Scenario | Issue | Example | Solution |
|----------|-------|---------|----------|
| Decimal formatting | Commas or currency symbols included | `"5,000.75"` or `"PKR 5000.75"` | Remove formatting: `5000.75` |
| Date format mismatch | Using different date format | `"15-10-2023"` instead of `"20231015"` | Use YYYYMMDD format strictly |
| IBAN invalid | Wrong country code or length | `"SA76MASH1234..."` | Use Pakistan IBAN starting with `PK` |
| CNIC invalid | Non-numeric characters | `"4210-321-466-271"` | Remove hyphens: `4210321466271` |
| Amount overflow | Exceeds maximum allowed | `999999999999.99` | Check transaction limits |
| UUID format | Wrong UUID format | `"7ad7bf9f99dc42c2ab88abddb87789a0"` | Use hyphens: `7ad7bf9f-99dc-42c2-ab88-abddb87789a0` |

---

## Developer Best Practices

:::tip Best Practices
Follow these guidelines to ensure smooth API integration and error prevention.
:::

✅ **Do:**
- Validate all numeric values without formatting (no commas, currency symbols, or spaces)
- Use consistent camelCase for all API parameters
- Always include mandatory fields: `rrn`, `stan`, `txndate`, `txntime`
- Validate IBAN format before submission (24 characters, starts with PK)
- Use UTC/Zulu timezone for all timestamps
- Implement comprehensive error handling for response codes
- Log all API requests and responses for auditing
- Test with sandbox environment before production

❌ **Don't:**
- Include formatting characters in numeric fields (e.g., `1,000.00` or `$ 5000`)
- Mix camelCase, PascalCase, and snake_case in the same payload
- Send null or empty mandatory fields
- Use local timezone without conversion
- Hardcode API endpoints or credentials
- Ignore validation error messages
- Retry failed transactions without proper error analysis

---

## Integration Checklist

- [ ] All data types conform to OpenConnect specifications
- [ ] Mandatory fields are always included in requests
- [ ] Numeric values are sent without formatting
- [ ] IBAN and CNIC formats are validated before sending
- [ ] Timestamps are in ISO 8601 format with timezone
- [ ] Enum values match predefined lists
- [ ] Error handling implemented for all response codes
- [ ] Decimal precision limited to 2 places
- [ ] UUID format validation implemented
- [ ] Request payloads tested in sandbox environment

---

