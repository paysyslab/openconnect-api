---
id: developerworkflow
title: Developer Workflow
sidebar_position: 3
---

# Developer Workflow

![OpenConnect Functional Flow](/img/OC-architecture.png)

This document outlines the complete step-by-step workflow for developers working on the OpenConnect project, from initial setup through deployment. It covers API development, integration, testing, code review, and version control processes.

---

## 📋 Table of Contents

- [1. API Development](#1-api-development)
- [2. Testing](#2-testing)
- [3. Deployment](#3-deployment)
- [4. Code Review](#4-code-review)
- [5. Documentation](#5-documentation)
- [6. Troubleshooting](#6-troubleshooting)

---

## 1. API Development

### 1.1 Environment Setup

Before starting development, ensure you have the following installed:

```bash
# Required tools
- Node.js >= 16.x
- npm >= 8.x or yarn >= 3.x
- Docker >= 20.x
- Git >= 2.x
- OpenAPI 3.0.3 compatible tools (Swagger Editor, Postman)
```

**Setup Steps:**

```bash
# 1. Clone the repository
git clone https://github.com/paysyslabs/openconnect-api.git
cd openconnect-api

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# 4. Start local development server
npm run dev
# Server runs at http://localhost:3006
```

### 1.2 Designing APIs

All APIs must adhere to OpenConnect API specifications:

| Aspect | Requirement | Example |
|--------|-------------|---------|
| **Format** | JSON request/response | `Content-Type: application/json` |
| **Naming** | RESTful conventions | `/api/v1/paysyslabs/payments/transfer` |
| **HTTP Verbs** | GET, POST, PUT, DELETE | `POST /api/v1/paysyslabs/payments/transfer` |
| **Auth** | JWT Bearer token | `Authorization: Bearer <token>` |
| **Versioning** | Include in URL path | `/api/v1/`, `/api/v2/`, `/api/v3/` |
| **Status Codes** | Standard HTTP codes | 200, 400, 401, 500 |

**Best Practices:**

- ✅ Use plural nouns for resource endpoints: `/payments` not `/payment`
- ✅ Use hyphens for multi-word endpoints: `/bill-inquiry` not `/billInquiry`
- ✅ Keep endpoints consistent with existing patterns
- ✅ Always include `correlationId` in responses for tracking
- ✅ Implement proper error responses with descriptive messages

### 1.3 API Development Process

#### Step 1: Create a New API Endpoint

```yaml
# Define in OC-api.yml
/api/v1/paysyslabs/payments/example:
  post:
    tags:
      - Financial APIs
    operationId: examplePayment
    summary: Example Payment Endpoint
    description: >
      Brief description of what this endpoint does.
    security:
      - bearerAuth: []
    requestBody:
      required: true
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/ExampleRequest"
    responses:
      "200":
        description: Success/Business response
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/ExampleResponse"
      "400":
        description: Invalid request parameters
      "401":
        description: Unauthorized (missing/invalid bearer token)
      "500":
        description: Internal server error
```

#### Step 2: Define Request/Response Schemas

```yaml
# In components/schemas section
ExampleRequest:
  type: object
  required:
    - info
    - paymentDetails
  properties:
    info:
      $ref: "#/components/schemas/StandardReqInfo"
    paymentDetails:
      type: object
      properties:
        amount:
          type: number
          format: decimal
          example: 5000
        currency:
          type: string
          example: "PKR"

ExampleResponse:
  type: object
  required:
    - response
    - info
  properties:
    response:
      $ref: "#/components/schemas/StandardResponse"
    info:
      $ref: "#/components/schemas/StandardRespInfo"
```

#### Step 3: Implement Error Handling

```javascript
// Example error response handling
const errorResponses = {
  "0000": { description: "Success", httpStatus: 200 },
  "0400": { description: "Invalid Request Parameters", httpStatus: 400 },
  "0401": { description: "Unauthorized", httpStatus: 401 },
  "0402": { description: "Invalid Bearer Token", httpStatus: 401 },
  "0468": { description: "Mandatory Parameters Not Provided", httpStatus: 400 },
  "0500": { description: "Internal Server Error", httpStatus: 500 }
};
```

#### Step 4: Implement Logging

```javascript
// Logging pattern for all API calls
logger.info(`API Call: ${method} ${endpoint}`, {
  timestamp: new Date().toISOString(),
  correlationId: req.correlationId,
  userId: req.user.id,
  status: res.statusCode,
  duration: Date.now() - startTime
});
```

### 1.4 Security Implementation

#### Authentication
- All endpoints require valid JWT Bearer tokens
- Tokens are validated against SBP/RAAST credentials
- Token expiry: 1 hour (configurable)

#### Authorization
- Role-based access control (RBAC)
- Channel/Bank-level permissions
- Transaction amount limits per user role

#### Data Protection
- Mutual TLS for external integrations
- PCI-DSS compliance for card data
- CNIC and account numbers are encrypted at rest

#### Best Practices
```javascript
// Security headers
app.use(helmet());

// Rate limiting
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));

// Input validation
const schema = Joi.object({
  amount: Joi.number().positive().required(),
  iban: Joi.string().required(),
  // ... more fields
});

const { error, value } = schema.validate(req.body);
if (error) throw new ValidationError(error.details);
```

### 1.5 API Integration

#### External Integrations
- **1LINK**: IBFT and BPS services
- **RAAST**: P2P, P2M, and bulk transfers
- **NADRA**: Bill payment aggregation
- **Telco Operators**: Prepaid and postpaid services

#### Internal Integrations
- **Message Queue**: RabbitMQ for async operations
- **Cache**: Redis for session and data caching
- **Database**: PostgreSQL for persistent storage
- **Logging**: ELK Stack for centralized logging

---

## 2. Testing

### 2.1 Unit Testing

**Framework**: Jest/Mocha  
**Coverage Target**: > 80%

```javascript
// Example unit test
describe('Payment API', () => {
  it('should successfully process payment with valid input', async () => {
    const payload = {
      info: { rrn: "002236987456", stan: "987456", ... },
      paymentDetails: { amount: 5000, ... }
    };
    const response = await paymentService.process(payload);
    expect(response.response.response_code).toBe("0000");
  });

  it('should return error for invalid amount', async () => {
    const payload = { ... amount: -100 ... };
    expect(() => paymentService.process(payload))
      .toThrow(ValidationError);
  });
});
```

**Test Checklist:**
- ✅ Valid input scenarios
- ✅ Invalid/missing input scenarios
- ✅ Boundary conditions
- ✅ Error handling
- ✅ Security validations

### 2.2 Integration Testing

**Framework**: Cypress / Postman  
**Scope**: End-to-end API flows

```javascript
// Example integration test
describe('Complete Payment Flow', () => {
  it('should complete bill payment workflow', async () => {
    // Step 1: Fetch bill details
    const billDetails = await billInquiry({
      billerId: 5,
      consumerNo: "03132370605"
    });
    expect(billDetails.response.response_code).toBe("0000");

    // Step 2: Process payment
    const payment = await billPayment({
      billInfo: billDetails,
      payerInfo: { ... }
    });
    expect(payment.response.response_code).toBe("0000");

    // Step 3: Verify transaction
    const inquiry = await transactionInquiry({
      originalTxnInfo: { ... }
    });
    expect(inquiry.response.response_code).toBe("0000");
  });
});
```

### 2.3 Manual Testing with Postman

**Collection Setup:**
```json
{
  "info": {
    "name": "OpenConnect API Tests",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{auth_token}}",
        "type": "string"
      }
    ]
  }
}
```

### 2.4 Continuous Integration (CI)

**Tool**: GitHub Actions / Jenkins

```yaml
# .github/workflows/ci.yml
name: CI Pipeline
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm install
      - run: npm run lint
      - run: npm run test
      - run: npm run test:integration
      - uses: codecov/codecov-action@v2
```

---

## 3. Deployment

### 3.1 Deployment Pipeline

```
Development → Build → Unit Tests → Staging → Integration Tests → Production
```

### 3.2 Staging Environment

**URL**: `https://staging-api.openconnect.paysyslabs.com`

**Deployment Steps:**
```bash
# 1. Create feature branch
git checkout -b feature/new-endpoint

# 2. Make changes and commit
git add .
git commit -m "feat: add new payment endpoint"

# 3. Push to remote
git push origin feature/new-endpoint

# 4. Create Pull Request
# 5. Pass code review
# 6. Merge to develop branch
git merge --squash feature/new-endpoint

# 7. Automatic deployment to staging
# (Triggered by push to develop)
```

### 3.3 Production Environment

**URL**: `https://api.openconnect.paysyslabs.com`

**Requirements:**
- ✅ All tests passing
- ✅ Code review approved
- ✅ Documentation updated
- ✅ Changelog updated
- ✅ Security audit completed

**Deployment:**
```bash
# 1. Create release branch
git checkout -b release/v1.2.0

# 2. Update version
npm version minor

# 3. Commit and tag
git commit -am "Release v1.2.0"
git tag -a v1.2.0 -m "Version 1.2.0"

# 4. Push to master
git push origin master --tags

# 5. Create GitHub Release
# 6. Automatic deployment to production
```

### 3.4 Versioning Strategy

**Semantic Versioning**: `MAJOR.MINOR.PATCH`

| Version Type | When to Use | Example |
|--------------|------------|---------|
| **MAJOR** | Breaking changes | 1.0.0 → 2.0.0 |
| **MINOR** | New features (backward compatible) | 1.0.0 → 1.1.0 |
| **PATCH** | Bug fixes | 1.0.0 → 1.0.1 |

**Changelog Format:**
```markdown
## [1.2.0] - 2024-01-15

### Added
- New merchant payment endpoint
- Support for RAAST P2M transfers

### Changed
- Improved error response messages
- Updated API documentation

### Fixed
- Fixed transaction inquiry timeout issue
- Corrected bill payment calculation

### Deprecated
- Old bill payment endpoint (v1)
```

---

## 4. Code Review

### 4.1 Review Checklist

**Before Submitting PR:**
- ✅ Code follows style guide
- ✅ All tests pass locally
- ✅ No hardcoded credentials
- ✅ Proper error handling
- ✅ Documentation updated
- ✅ Commit messages are clear

**During Review:**
- ✅ Logic is correct
- ✅ No security vulnerabilities
- ✅ Performance is acceptable
- ✅ Code is maintainable
- ✅ Tests have good coverage

### 4.2 Code Style Guide

**JavaScript/Node.js:**
```javascript
// Use const and let, not var
const MAX_RETRIES = 3;
let retryCount = 0;

// Use arrow functions
const processPayment = async (payload) => {
  return await paymentGateway.process(payload);
};

// Proper naming conventions
function validateIBAN(iban) { ... }
const userRepository = { ... };

// Add JSDoc comments
/**
 * Process IBFT payment transfer
 * @param {Object} payload - Payment payload
 * @param {number} payload.amount - Transaction amount
 * @returns {Promise<Object>} Transaction response
 * @throws {ValidationError} If validation fails
 */
```

### 4.3 Security Review Points

```javascript
// ❌ DON'T: Hardcode credentials
const API_KEY = "sk_live_123456789";

// ✅ DO: Use environment variables
const API_KEY = process.env.API_KEY;

// ❌ DON'T: Log sensitive data
logger.info(`Processing payment for CNIC: ${cnic}`);

// ✅ DO: Mask sensitive information
logger.info(`Processing payment for CNIC: ${maskCNIC(cnic)}`);

// ❌ DON'T: Skip input validation
app.post('/transfer', (req, res) => {
  const amount = req.body.amount;
});

// ✅ DO: Validate all inputs
app.post('/transfer', (req, res) => {
  const schema = Joi.object({
    amount: Joi.number().positive().required()
  });
  const { error, value } = schema.validate(req.body);
});
```

---

## 5. Documentation

### 5.1 API Documentation

**Format**: OpenAPI 3.0.3 (Swagger)

- **Location**: `/static/openapi/OC-api.yml`
- **Viewer**: Swagger UI at `/api-docs`
- **Auto-generated**: From YAML specification

**Required Sections per Endpoint:**
- Summary (1 line)
- Description (detailed explanation)
- Security requirements
- Request body schema
- Response schemas for all status codes
- Examples for common scenarios

### 5.2 Developer Guide

**Topics to Cover:**
- Environment setup
- Authentication process
- Error handling patterns
- Retry mechanisms
- Rate limiting
- Webhook integration

### 5.3 Runbook

**For Operations Team:**
```markdown
# Production Runbook

## API Health Check
GET /api/v1/health

## Common Issues

### High Error Rate
1. Check database connectivity
2. Verify external service status (1LINK, RAAST)
3. Check rate limiting thresholds
4. Review recent deployments

### Payment Timeout
1. Verify queue status (RabbitMQ)
2. Check transaction logs
3. Reach out to payment gateway support
```

---

## 6. Troubleshooting

### 6.1 Common Issues

| Issue | Solution |
|-------|----------|
| Port 3006 already in use | `lsof -i :3006` and kill process |
| Node modules not installing | Delete `node_modules` and `package-lock.json`, reinstall |
| JWT token validation fails | Check token expiry and refresh if needed |
| Database connection error | Verify PostgreSQL is running and credentials are correct |
| External API timeout | Check network connectivity and service status |

### 6.2 Debugging Tips

```bash
# Enable debug logging
DEBUG=openconnect:* npm run dev

# Run tests with verbose output
npm run test -- --verbose

# Check API health
curl -H "Authorization: Bearer <token>" http://localhost:3006/api/v1/health

# View logs in real-time
tail -f logs/app.log | grep -i error
```

---

## Quick Reference

### Development Commands
```bash
npm run dev          # Start development server
npm run lint         # Run ESLint
npm run test         # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run build        # Build for production
npm start            # Start production server
```

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/feature-name

# Make changes and commit
git add .
git commit -m "feat: description"

# Push and create PR
git push origin feature/feature-name

# After approval, merge to develop
git checkout develop
git merge feature/feature-name
git push origin develop
```

### API Base URLs
| Environment | URL |
|-------------|-----|
| Local | `http://localhost:3006` |
| Staging | `https://staging-api.openconnect.paysyslabs.com` |
| Production | `https://api.openconnect.paysyslabs.com` |

---

**Last Updated**: January 2024  
**Maintained By**: Development Team  
**Questions?**: Create an issue in the GitHub repository or contact support@paysyslabs.com
