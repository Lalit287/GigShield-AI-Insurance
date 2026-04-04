# GigShield Backend

Production-ready Node.js + Express backend for the GigShield parametric income insurance platform.

## 🏗️ Architecture Overview

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── models/
│   │   ├── User.js               # User schema + auth methods
│   │   ├── Policy.js             # Insurance policy schema
│   │   ├── Claim.js              # Claim submission schema
│   │   └── RiskData.js           # Risk metrics storage
│   ├── controllers/
│   │   ├── authController.js     # Auth logic (register, login)
│   │   ├── policyController.js   # Policy management
│   │   ├── claimController.js    # Claim processing
│   │   └── riskController.js     # Risk calculations
│   ├── services/
│   │   ├── riskCalculator.js     # Risk score algorithm
│   │   ├── fraudDetector.js      # Fraud detection logic
│   │   └── weatherService.js     # Weather API integration
│   ├── routes/
│   │   ├── auth.js               # /api/auth endpoints
│   │   ├── policy.js             # /api/policy endpoints
│   │   ├── claim.js              # /api/claim endpoints
│   │   └── risk.js               # /api/risk endpoints
│   ├── middleware/
│   │   ├── auth.js               # JWT validation
│   │   └── errorHandler.js       # Global error handling
│   └── app.js                    # Express app setup
├── server.js                     # Entry point
├── package.json
├── .env.example                  # Environment template
├── API_DOCUMENTATION.md          # Full API reference
└── README.md                     # This file
```

---

## ✨ Key Features

### 1. **Authentication (JWT-based)**
- User registration with validation
- Secure login with bcrypt password hashing
- JWT token generation and refresh
- Role-based access control (worker/admin)
- Profile management

### 2. **Insurance Policies**
- Policy tiers: Basic, Standard, Premium
- Automatic policy numbering
- Customizable trigger thresholds
- Policy status tracking
- Admin statistics

### 3. **Risk Assessment**
- **Multi-factor risk scoring:**
  - Weather risk (40% weight): rainfall, temperature
  - AQI risk (30% weight): air quality index
  - Location risk (30% weight): zone-based baseline
- Real-time weather integration (OpenWeather API)
- Simulated weather for development/testing
- Historical risk tracking
- Zone-wide assessments

### 4. **Claim Processing**
- **Auto-claim trigger:** Automatic claims when thresholds met
- **Manual claims:** Worker-initiated claims
- **Fraud detection:** 5-point detection system
  - No-activity anomaly detection
  - Duplicate claim patterns
  - GPS spoofing detection
  - Weather data mismatch
  - Claim frequency analysis
- Fraud scoring (0-100)
- Admin approval workflow

### 5. **Fraud Detection**
```
Components:
├── No Activity (25 pts): No recorded activity in N hours
├── Duplicate Claims (30 pts): Multiple claims in 24h window
├── GPS Anomaly (20 pts): Teleportation/impossible speeds
├── Weather Mismatch (20 pts): Claim vs actual weather data
└── Claim Pattern (15 pts): Unusual frequency analysis
```

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 16+ 
- MongoDB (local or Atlas)
- npm or yarn

### 2. Installation
```bash
cd backend
npm install
```

### 3. Configuration
```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/gigshield
JWT_SECRET=your-secret-key-min-32-chars
```

### 4. Start Development Server
```bash
npm run dev
```

Server starts at: `http://localhost:5000`

---

## 📡 API Endpoints Summary

### **Authentication**
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | ❌ | Create new account |
| POST | `/auth/login` | ❌ | Login & get token |
| GET | `/auth/profile` | ✅ | Get user profile |
| PUT | `/auth/update-profile` | ✅ | Update profile |

### **Policies**
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/policy/create` | ✅ | Create policy |
| GET | `/policy/:userId` | ✅ | Get user policies |
| GET | `/policy/active/:userId` | ✅ | Get active policy |
| PUT | `/policy/:id/cancel` | ✅ | Cancel policy |
| GET | `/policy/stats` | ✅ Admin | Policy statistics |

### **Risk Management**
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/risk/calculate` | ✅ | Calculate risk score |
| GET | `/risk/score/:zone` | ❌ | Get zone risk |
| GET | `/risk/alerts/:zone` | ❌ | Get weather alerts |
| GET | `/risk/zone/:zone` | ❌ | Zone assessment |
| GET | `/risk/history/:userId` | ✅ | User risk history |
| POST | `/risk/check-triggers` | ✅ | Check claim triggers |

### **Claims**
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/claim/auto` | ✅ | Auto-process claim |
| POST | `/claim/manual` | ✅ | Manual claim |
| GET | `/claim/:claimId` | ✅ | Get claim details |
| GET | `/claim/user/:userId` | ✅ | Get user claims |
| PUT | `/claim/:id/approve` | ✅ Admin | Approve claim |
| PUT | `/claim/:id/reject` | ✅ Admin | Reject claim |
| GET | `/claim/stats` | ✅ Admin | Claim statistics |

---

## 🎯 Business Logic

### Risk Score Calculation
```
Risk Score = (Weather × 0.4) + (AQI × 0.3) + (Location × 0.3)

Weather Risk:
  - Rainfall: (actual / threshold) × 100
  - Temperature: ((temp - 25) / (42 - 25)) × 100
  - Humidity: deviation from 60% baseline

AQI Risk: (AQI / 300) × 100

Location Risk: Zone-based baseline (50-80)

Result: 0-100 scale
  Low: 0-25
  Medium: 25-50
  High: 50-75
  Critical: 75-100
```

### Claim Trigger Logic
```javascript
IF rainfall > 50mm
  OR aqi > 300
  OR temperature > 42°C
  THEN
    CREATE auto-claim
    RUN fraud detection
    IF fraudScore < 25
      THEN approve automatically
    ELSE
      QUEUE for admin review
```

### Fraud Detection Scoring
```
totalScore = 0

IF no GPS activity in 4 hours
  totalScore += 25

IF 3+ claims in 24 hours from same user
  totalScore += 30

IF GPS accuracy > 1000m (spoofing)
  totalScore += 20

IF claimed rainfall != actual rainfall
  totalScore += 20

IF avg time between claims < 6 hours
  totalScore += 15

Final: min(totalScore, 100)
Risk Level:
  Low: 0-25
  Medium: 25-50
  High: 50-75
  Critical: 75-100
```

---

## 📊 Sample Usage Flow

### Worker Flow
```
1. Register → 2. Login → 3. Get Profile
4. Create Policy (choose tier) → 5. Check Risk Score
6. Auto-trigger claim (when weather condition met)
7. View claim status → 8. Receive payout notification
```

### Admin Flow
```
1. Login (role: admin) → 2. View Dashboard
3. Get Policy Statistics → 4. Get Claim Statistics
5. Review High Fraud Claims → 6. Approve/Reject Claims
7. Monitor Zone Risk Levels
```

---

## 🔒 Security Features

- **Password Hashing**: bcrypt (10-round salt)
- **JWT Tokens**: HS256 algorithm, 7-day expiry
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Restricted to frontend origins
- **Helmet**: Security headers (XSS, CSRF protection)
- **Input Validation**: Joi schema validation
- **SQL Injection Prevention**: Mongoose parameterized queries
- **Role-Based Access**: Middleware-enforced authorization

---

## 📈 Database Schemas

### User Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (bcrypt hashed),
  role: 'worker' | 'admin',
  phone: String,
  zone: String,
  riskLevel: 'low' | 'medium' | 'high',
  kycVerified: Boolean,
  lastLogin: Date,
  avatar: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Policy Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  policyNumber: String (unique),
  level: 'basic' | 'standard' | 'premium',
  premium: Number,
  coverage: Number,
  status: 'active' | 'inactive' | 'expired' | 'cancelled',
  startDate: Date,
  endDate: Date,
  zone: String,
  triggers: {
    rainfall: Number,
    aqi: Number,
    temperature: Number
  },
  paymentStatus: 'pending' | 'completed' | 'failed',
  paymentId: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Claim Collection
```javascript
{
  _id: ObjectId,
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
  fraudFlags: Array<String>,
  weatherData: {
    rainfall: Number,
    aqi: Number,
    temperature: Number,
    humidity: Number
  },
  gpsData: {
    latitude: Number,
    longitude: Number,
    accuracy: Number,
    timestamp: Date
  },
  processedAt: Date,
  rejectionReason: String,
  createdAt: Date,
  updatedAt: Date
}
```

### RiskData Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  zone: String,
  riskScore: Number (0-100),
  components: {
    weatherRisk: Number,
    aqiRisk: Number,
    locationRisk: Number
  },
  weatherData: Object,
  riskLevel: 'low' | 'medium' | 'high' | 'critical',
  alerts: Array<String>,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Test with coverage
npm run test:coverage

# Run specific test file
npm test -- auth.test.js
```

---

## 📦 Dependencies

### Core
- **express** ^4.18.2 - Web framework
- **mongoose** ^8.0.0 - MongoDB ODM
- **dotenv** ^16.3.1 - Environment variables

### Security
- **bcrypt** ^5.1.1 - Password hashing
- **jsonwebtoken** ^9.1.0 - JWT tokens
- **helmet** ^7.1.0 - Security headers
- **express-rate-limit** ^7.1.1 - Rate limiting
- **cors** ^2.8.5 - Cross-origin requests

### Validation
- **joi** ^17.11.0 - Schema validation
- **express-validator** ^7.0.0 - Request validation

### External APIs
- **axios** ^1.6.2 - HTTP client

---

## 🔧 Environment Configuration

### Required Variables
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/gigshield
JWT_SECRET=min-32-character-secret-key
```

### Optional Variables
```env
OPENWEATHER_API_KEY=your_api_key
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
FRAUD_NO_ACTIVITY_HOURS=4
FRAUD_DUPLICATE_CLAIM_HOURS=24
FRAUD_SCORE_THRESHOLD=50
RAINFALL_THRESHOLD_MM=50
AQI_THRESHOLD=300
TEMP_THRESHOLD_C=42
```

---

## 🚀 Deployment

### Heroku
```bash
heroku create gigshield-api
heroku config:set MONGODB_URI=<your-atlas-uri>
git push heroku main
```

### Docker
```bash
docker build -t gigshield-backend .
docker run -p 5000:5000 gigshield-backend
```

### Railway
```bash
railway link
railway up
```

---

## 📝 API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ /* error details */ ]
}
```

---

## 🤝 Integration with Frontend

Add environment variables to frontend `.env`:
```
VITE_API_URL=http://localhost:5000/api
VITE_JWT_STORAGE_KEY=gigshield_token
```

Example frontend integration:
```javascript
const API_URL = import.meta.env.VITE_API_URL;
const token = localStorage.getItem('gigshield_token');

// Auth request
const res = await fetch(`${API_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(credentials)
});

// Protected request
const res = await fetch(`${API_URL}/claim/auto`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(claimData)
});
```

---

## 📊 Project Statistics

- **Files**: 14 backend modules
- **Models**: 4 (User, Policy, Claim, RiskData)
- **Controllers**: 4 (Auth, Policy, Risk, Claim)
- **Routes**: 4 endpoint groups (~20 total endpoints)
- **Services**: 3 (RiskCalculator, FraudDetector, WeatherService)
- **Lines of Code**: ~2000+
- **Test Coverage**: TBD

---

## 📚 Documentation

- **Full API Docs**: See `API_DOCUMENTATION.md`
- **Postman Collection**: Request needed (can be generated)
- **Architecture Decisions**: See code comments

---

## 🐛 Known Limitations

1. **Weather Data**: Currently uses simulated data in development. Set `OPENWEATHER_API_KEY` for real data.
2. **Payment Integration**: Razorpay integration is scaffolded but not fully implemented.
3. **Email Notifications**: Commented out in code; requires SMTP configuration.
4. **Location Verification**: GPS verification is basic; production should use real location services.

---

## 🚦 Roadmap

- [ ] Payment gateway integration (Razorpay)
- [ ] Email notifications
- [ ] SMS notifications (Twilio)
- [ ] Advanced fraud detection (ML models)
- [ ] WebSocket real-time updates
- [ ] File upload for KYC documents
- [ ] Advanced analytics dashboard
- [ ] Mobile SMS-based claims

---

## 📧 Support

For issues, questions, or feature requests, please create an issue in the main repository.

---

## 📄 License

MIT © 2024 GigShield Team

---

**Built with ❤️ by the GigShield Team**
