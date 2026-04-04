# GigShield Backend API Documentation

## Overview
Production-ready Node.js + Express backend for GigShield parametric income insurance platform.

**Base URL:** `http://localhost:5000/api`  
**Environment:** Development (MongoDB local or Atlas)

---

## 📋 Table of Contents
1. [Authentication](#authentication)
2. [Policies](#policies)
3. [Risk Management](#risk-management)
4. [Claims](#claims)
5. [Error Handling](#error-handling)
6. [Sample Responses](#sample-responses)

---

## 🔐 Authentication

### POST /auth/register
Register a new user

**Request:**
```json
{
  "name": "Rajesh Kumar",
  "email": "rajesh@example.com",
  "password": "SecurePass123!",
  "phone": "9876543210",
  "zone": "Hyderabad Central",
  "role": "worker"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Rajesh Kumar",
      "email": "rajesh@example.com",
      "role": "worker",
      "zone": "Hyderabad Central",
      "riskLevel": "medium",
      "createdAt": "2024-03-30T10:30:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### POST /auth/login
Authenticate user and get JWT token

**Request:**
```json
{
  "email": "rajesh@example.com",
  "password": "SecurePass123!"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Rajesh Kumar",
      "email": "rajesh@example.com",
      "role": "worker",
      "zone": "Hyderabad Central",
      "lastLogin": "2024-03-30T10:35:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "7d"
  }
}
```

---

### GET /auth/profile
Get current user profile (requires auth)

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Rajesh Kumar",
    "email": "rajesh@example.com",
    "phone": "9876543210",
    "zone": "Hyderabad Central",
    "riskLevel": "medium",
    "kycVerified": false,
    "lastLogin": "2024-03-30T10:35:00Z"
  }
}
```

---

## 📋 Policies

### POST /policy/create
Create a new insurance policy (requires auth)

**Request:**
```json
{
  "level": "standard",
  "zone": "Hyderabad Central"
}
```

**Available Levels:**
- `basic`: ₹35/week, ₹5000 coverage
- `standard`: ₹70/week, ₹10000 coverage
- `premium`: ₹140/week, ₹25000 coverage

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Policy created successfully",
  "data": {
    "policy": {
      "_id": "507f1f77bcf86cd799439012",
      "userId": "507f1f77bcf86cd799439011",
      "policyNumber": "GS-1711862400000-ABC1234XYZ",
      "level": "standard",
      "premium": 70,
      "coverage": 10000,
      "status": "active",
      "zone": "Hyderabad Central",
      "startDate": "2024-03-30T00:00:00Z",
      "endDate": "2024-04-06T00:00:00Z",
      "triggers": {
        "rainfall": 50,
        "aqi": 300,
        "temperature": 42
      },
      "createdAt": "2024-03-30T10:40:00Z"
    },
    "message": "Your policy is now active!"
  }
}
```

---

### GET /policy/:userId
Get all policies for a user (requires auth)

**Parameters:**
- `userId` (optional): User ID (defaults to current user)

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Found 2 policy(ies)",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "userId": "507f1f77bcf86cd799439011",
      "policyNumber": "GS-1711862400000-ABC1234XYZ",
      "level": "standard",
      "premium": 70,
      "coverage": 10000,
      "status": "active",
      "zone": "Hyderabad Central"
    }
  ]
}
```

---

### GET /policy/active/:userId
Get active policy for a user (requires auth)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439011",
    "policyNumber": "GS-1711862400000-ABC1234XYZ",
    "level": "standard",
    "premium": 70,
    "coverage": 10000,
    "status": "active"
  }
}
```

---

## 🌡️ Risk Management

### POST /risk/calculate
Calculate risk score for a zone (requires auth)

**Request:**
```json
{
  "zone": "Hyderabad Central"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Risk calculated successfully",
  "data": {
    "riskScore": {
      "totalScore": 65,
      "components": {
        "weatherRisk": 72,
        "aqiRisk": 58,
        "locationRisk": 50
      },
      "level": "high"
    },
    "weatherData": {
      "temperature": 35.2,
      "humidity": 62,
      "pressure": 1012,
      "rainfall": 0,
      "windSpeed": 8.5,
      "description": "partly cloudy",
      "aqi": 178,
      "timestamp": "2024-03-30T10:45:00Z",
      "source": "simulation"
    }
  }
}
```

---

### GET /risk/score/:zone
Get current risk score for a zone (public)

**Parameters:**
- `zone`: Zone name (required)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "zone": "Hyderabad Central",
    "riskScore": {
      "totalScore": 65,
      "components": {
        "weatherRisk": 72,
        "aqiRisk": 58,
        "locationRisk": 50
      },
      "level": "high"
    },
    "weatherData": {
      "temperature": 35.2,
      "humidity": 62,
      "rainfall": 0,
      "aqi": 178
    }
  }
}
```

---

### GET /risk/alerts/:zone
Get weather alerts for a zone (public)

**Parameters:**
- `zone`: Zone name (required)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "zone": "Hyderabad Central",
    "weather": {
      "temperature": 35.2,
      "rainfall": 0,
      "aqi": 178
    },
    "alerts": [
      {
        "type": "extreme_temp",
        "message": "Extreme heat: 35.2°C (threshold: 42°C)",
        "severity": "medium"
      }
    ],
    "hasAlerts": true
  }
}
```

---

### POST /risk/check-triggers
Check if trigger conditions are met (requires auth)

**Request:**
```json
{
  "zone": "Hyderabad Central"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "No trigger condition met",
  "data": {
    "zone": "Hyderabad Central",
    "weatherData": {
      "temperature": 35.2,
      "rainfall": 0,
      "aqi": 178
    },
    "triggers": {
      "triggered": false,
      "triggers": []
    }
  }
}
```

---

## 📋 Claims

### POST /claim/auto
Auto-process claim based on trigger conditions (requires auth)

**Request:**
```json
{
  "zone": "Hyderabad Central",
  "triggerType": "rainfall",
  "triggerValue": 65,
  "gpsData": {
    "latitude": 17.3850,
    "longitude": 78.4867,
    "accuracy": 15,
    "timestamp": "2024-03-30T10:50:00Z"
  }
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Claim created successfully",
  "data": {
    "claim": {
      "_id": "507f1f77bcf86cd799439013",
      "claimNumber": "CLM-1711862400000-ABC1234XYZ",
      "userId": "507f1f77bcf86cd799439011",
      "policyId": "507f1f77bcf86cd799439012",
      "amount": 10000,
      "status": "approved",
      "triggerType": "rainfall",
      "triggerValue": 65,
      "threshold": 50,
      "zone": "Hyderabad Central",
      "fraudScore": 18,
      "fraudFlags": [],
      "weatherData": {
        "temperature": 35.2,
        "humidity": 62,
        "rainfall": 65,
        "aqi": 178
      },
      "processedAt": "2024-03-30T10:50:30Z",
      "createdAt": "2024-03-30T10:50:00Z"
    },
    "fraudDetection": {
      "fraudScore": 18,
      "fraudFlags": [],
      "risk": "low"
    },
    "autoApproved": true
  }
}
```

---

### GET /claim/:claimId
Get claim details (requires auth)

**Parameters:**
- `claimId`: Claim ID (required)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "claimNumber": "CLM-1711862400000-ABC1234XYZ",
    "status": "approved",
    "amount": 10000,
    "fraudScore": 18,
    "fraudFlags": []
  }
}
```

---

### GET /claim/user/:userId
Get all claims for a user (requires auth)

**Parameters:**
- `userId` (optional): User ID (defaults to current user)
- `status` (query, optional): Filter by status (pending, approved, rejected, paid)

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Found 3 claim(s)",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "claimNumber": "CLM-1711862400000-ABC1234XYZ",
      "status": "approved",
      "amount": 10000,
      "createdAt": "2024-03-30T10:50:00Z"
    }
  ]
}
```

---

### PUT /claim/:claimId/approve
Approve a claim (admin only)

**Parameters:**
- `claimId`: Claim ID (required)

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Claim approved",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "status": "approved",
    "processedAt": "2024-03-30T11:00:00Z"
  }
}
```

---

### PUT /claim/:claimId/reject
Reject a claim (admin only)

**Request:**
```json
{
  "reason": "Claim amount exceeds policy limit"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Claim rejected",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "status": "rejected",
    "rejectionReason": "Claim amount exceeds policy limit",
    "processedAt": "2024-03-30T11:00:00Z"
  }
}
```

---

## ❌ Error Handling

### Standard Error Response

```json
{
  "success": false,
  "message": "Error description",
  "errors": [ "Additional error details" ]
}
```

### Common Error Codes

| Code | Message | Cause |
|------|---------|-------|
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Insufficient permissions (role-based) |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate email or resource exists |
| 500 | Internal Server Error | Server error |

---

## 🔧 Setup Instructions

### Install Dependencies
```bash
cd backend
npm install
```

### Configure Environment
```bash
cp .env.example .env
# Edit .env with your values
```

### Start Server
```bash
# Development (with hot reload)
npm run dev

# Production
npm start
```

### Run Tests
```bash
npm test
```

---

## 📊 Database Models

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: 'worker' | 'admin',
  phone: String,
  zone: String,
  riskLevel: 'low' | 'medium' | 'high',
  kycVerified: Boolean,
  lastLogin: Date,
  createdAt: Date
}
```

### Policy
```javascript
{
  userId: ObjectId,
  policyNumber: String (unique),
  level: 'basic' | 'standard' | 'premium',
  premium: Number,
  coverage: Number,
  status: 'active' | 'inactive' | 'expired' | 'cancelled',
  startDate: Date,
  endDate: Date,
  zone: String,
  triggers: { rainfall, aqi, temperature },
  paymentStatus: 'pending' | 'completed' | 'failed',
  createdAt: Date
}
```

### Claim
```javascript
{
  claimNumber: String (unique),
  userId: ObjectId,
  policyId: ObjectId,
  amount: Number,
  status: 'pending' | 'approved' | 'rejected' | 'paid',
  triggerType: 'rainfall' | 'aqi' | 'temperature' | 'manual',
  triggerValue: Number,
  threshold: Number,
  zone: String,
  fraudScore: Number (0-100),
  fraudFlags: Array,
  weatherData: Object,
  gpsData: Object,
  processedAt: Date,
  createdAt: Date
}
```

---

## 🌐 Integration with Frontend

### Add to Frontend Environment Variables
```javascript
VITE_API_URL=http://localhost:5000/api
VITE_JWT_STORAGE_KEY=gigshield_token
```

### API Client Example (Frontend)
```javascript
const API_URL = import.meta.env.VITE_API_URL;

// Login
const response = await fetch(`${API_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const { data } = await response.json();
localStorage.setItem('token', data.token);

// Auto-process claim
const claimResponse = await fetch(`${API_URL}/claim/auto`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    zone: 'Hyderabad Central',
    triggerType: 'rainfall',
    triggerValue: 65
  })
});
```

---

## 🚀 Production Deployment

### MongoDB Atlas
1. Create cluster at https://www.mongodb.com/cloud/atlas
2. Set `MONGODB_URI` to connection string

### Environment Variables
- `NODE_ENV=production`
- `JWT_SECRET=<strong-random-key>`
- `OPENWEATHER_API_KEY=<your-api-key>`
- `RAZORPAY_KEY_ID=<your-key>`
- `RAZORPAY_KEY_SECRET=<your-secret>`

### Hosting Options
- **Heroku**: `git push heroku main`
- **Railway**: Connect GitHub repo
- **AWS/Azure**: Docker + container deployment
- **DigitalOcean**: App Platform or Droplet

---

## 📝 License
MIT - © 2024 GigShield Team
