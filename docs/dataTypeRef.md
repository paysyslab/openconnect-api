---
id: dataTypeRef
title: Data Type Reference
sidebar_position: 2
---

# Data Type References
![OpenConnect Functional Flow](/img/OC-system.png)


This document serves as a reference for the data types, enumerations, and validation rules used across OpenConnect APIs, ensuring data consistency and interoperability between various services.

---

# Standard Data Types

| Type       | Description                                   | Example                | Allowed Format / Range | Common Fields       |
|------------|-----------------------------------------------|------------------------|------------------------|---------------------|
| **string** | Alphanumeric text                             | `"OpenConnect"`         | Up to 64 characters     | accountId, userName |
| **integer**| Whole number                                  | `1001`                 | 0–999999999            | amount, customerId  |
| **long**   | Large numeric identifier                     | `23132313131313`       | 13–20 digits           | rrn, transactionId  |
| **boolean**| True/False values                             | `true`                 | Boolean literal        | isActive, isVerified|
| **date**   | Date in ISO 8601 format                      | `"2025-04-15"`         | YYYY-MM-DD             | accountExpiryDate   |
| **dateTime**| Date and time in ISO 8601 format with timezone | `"2025-04-15T10:45:30Z"` | YYYY-MM-DDThh:mm:ssZ | createdAt, updatedAt|
| **decimal**| Numeric value with decimal precision (2 digits) | `2500.75`             | 0–99999999.99          | amount, fee         |
| **enum**   | Predefined set of values                     | `"Active"`             | See Enum section       | accountStatus, txnType|
| **object** | JSON-like structure                          | `{"accountId": "123"}` | JSON object            | customer, data      |
| **array**  | List of values or objects                     | `["ATM", "POS", "Ecom"]` | JSON array           | allowedChannels     |

---

# Enumerations

## Account Status

| Value   | Description                  |
|---------|------------------------------|
| **Fresh**   | Account generated but not activated   |
| **Active**  | Account is active for transactions    |
| **Frozen**  | Temporarily blocked or under review  |
| **Blocked** | Permanently blocked                |
| **Expired** | Account validity ended            |

---

## Transaction Type

| Value     | Description                |
|-----------|----------------------------|
| **Credit** | Adds funds to the account  |
| **Debit**  | Deducts funds from the account |
| **Reversal** | Reverses a previous transaction |
| **Adjustment** | Manual adjustments to accounts or funds |

---

## Identification Type

| Value    | Description               |
|----------|---------------------------|
| **CNIC** | Pakistan National ID       |
| **Passport** | Passport number            |
| **NTN**  | National Tax Number         |
| **EmployeeID** | Employee internal ID       |

---

# Naming Conventions

| Convention | Usage                | Example             |
|------------|----------------------|---------------------|
| **camelCase** | API parameters         | accountId, txnType |
| **PascalCase** | UI/Database labels     | AccountId, ResponseCode |
| **snake_case** | Internal configs       | transaction_type, account_status |

---

# Validation Rules

| Validation Type | Description            | Applies To |
|-----------------|------------------------|------------|
| **Mandatory Fields** | Fields that must always be present in requests | accountId, rrn, txnAmount |
| **Length Check** | Field length must not exceed the maximum allowed | iban, rrn, idValue |
| **Pattern Check** | Field must match a regex pattern | CNIC → `[0-9]{13}` |
| **Enum Check** | Field must be one of the predefined values | accountStatus, txnType |
| **Data Type Check** | Field must match the defined data type | All fields |

---

# Example Schema

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

Response Validation Output Example
| Field           | Validation Type   | Result | Message                 |
| --------------- | ----------------- | ------ | ----------------------- |
| customerId      | Length Check      | Pass   | Valid                   |
| idValue         | Pattern Check     | Pass   | CNIC format verified    |
| amount          | Decimal Precision | Pass   | Valid (2 decimals)      |
| transactionType | Enum Validation   | Fail   | Must be Credit or Debit |


Developer Notes

Ensure all numeric values are sent without formatting (e.g., no commas or currency symbols).

All nested JSON objects must follow OpenConnect’s schema rules.

Always validate API payloads before sending requests.