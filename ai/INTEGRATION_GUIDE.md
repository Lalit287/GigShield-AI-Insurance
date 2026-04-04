# GigShield AI-Backend Integration Guide

This guide explains how to connect the Python AI modules to the Node.js backend.

## 📋 Integration Options

### Option 1: FastAPI Microservice (Recommended for Production)

**Overview:** Run Python AI as a separate microservice on port 8000, Node.js calls it via HTTP.

**Advantages:**
- Independent scaling
- Language-agnostic
- Easy debugging
- Standard REST API
- Perfect for containerization

**Disadvantages:**
- Network latency
- Extra deployment complexity
- Need to handle API errors

#### Setup Steps

1. **Start AI Microservice**
```bash
cd /Users/lalitaditya/gigshield/ai
source venv/bin/activate
uvicorn api_wrapper:app --host 0.0.0.0 --port 8000
```

2. **Update Node.js Backend Config** (add to `.env`)
```
AI_SERVICE_URL=http://localhost:8000
AI_ENABLED=true
```

3. **Create AI Client** (`backend/src/services/aiClient.js`)
```javascript
const axios = require('axios');

class AIClient {
  constructor(baseURL = process.env.AI_SERVICE_URL || 'http://localhost:8000') {
    this.client = axios.create({
      baseURL,
      timeout: 5000
    });
  }

  async calculateRisk(rainfall, aqi, temperature, zone) {
    try {
      const response = await this.client.post('/api/risk/calculate', {
        rainfall_mm: rainfall,
        aqi,
        temperature_c: temperature,
        humidity_pct: 60,
        zone
      });
      return response.data;
    } catch (error) {
      console.error('AI Risk calculation failed:', error.message);
      throw error;
    }
  }

  async analyzeFraud(claimData, actualRainfall, actualAqi) {
    try {
      const response = await this.client.post('/api/fraud/analyze', {
        claim: {
          user_id: claimData.userId,
          claim_id: claimData.claimId,
          amount: claimData.amount,
          claimed_rainfall: claimData.rainfall,
          claimed_aqi: claimData.aqi,
          claimed_temperature: claimData.temperature,
          gps: {
            latitude: claimData.latitude,
            longitude: claimData.longitude
          }
        },
        actual_rainfall: actualRainfall,
        actual_aqi: actualAqi
      });
      return response.data;
    } catch (error) {
      console.error('AI Fraud detection failed:', error.message);
      throw error;
    }
  }

  async calculatePremium(tier, riskLevel, weeks = 4) {
    try {
      const response = await this.client.post('/api/premium/calculate', null, {
        params: { tier: tier.toLowerCase(), risk_level: riskLevel.toLowerCase(), weeks }
      });
      return response.data;
    } catch (error) {
      console.error('AI Premium calculation failed:', error.message);
      throw error;
    }
  }

  async decideClaim(claimId, amount, riskScore, fraudScore, coverage, policyLevel) {
    try {
      const response = await this.client.post('/api/claim/decide', {
        claim_id: claimId,
        claim_amount: amount,
        risk_score: riskScore,
        fraud_score: fraudScore,
        coverage_amount: coverage,
        policy_level: policyLevel.toLowerCase()
      });
      return response.data;
    } catch (error) {
      console.error('AI Claim decision failed:', error.message);
      throw error;
    }
  }

  async processCompleteClaim(weatherData, claimData, actualRainfall, actualAqi) {
    try {
      const response = await this.client.post('/api/claim/process-complete', {
        weather: {
          rainfall_mm: weatherData.rainfall,
          aqi: weatherData.aqi,
          temperature_c: weatherData.temperature,
          humidity_pct: 60,
          zone: weatherData.zone
        },
        claim: {
          user_id: claimData.userId,
          claim_id: claimData.claimId,
          amount: claimData.amount,
          claimed_rainfall: claimData.rainfall,
          claimed_aqi: claimData.aqi,
          claimed_temperature: claimData.temperature,
          gps: {
            latitude: claimData.latitude,
            longitude: claimData.longitude
          }
        },
        actual_rainfall: actualRainfall,
        actual_aqi: actualAqi
      });
      return response.data;
    } catch (error) {
      console.error('AI Complete claim processing failed:', error.message);
      throw error;
    }
  }

  // Health check
  async health() {
    try {
      const response = await this.client.get('/health');
      return response.data;
    } catch (error) {
      return { status: 'offline' };
    }
  }
}

module.exports = new AIClient();
```

4. **Use in Claim Controller** (`backend/src/controllers/claimController.js`)
```javascript
const aiClient = require('../services/aiClient');
const weatherService = require('../services/weatherService');

// Get actual weather data
const actualWeather = await weatherService.getWeatherData(zone);

// Analyze claim with AI
try {
  // Option A: Use complete endpoint
  const aiResult = await aiClient.processCompleteClaim(
    {
      rainfall: claim.rainfall,
      aqi: claim.aqi,
      temperature: claim.temperature,
      zone: zone
    },
    {
      userId: claim.userId,
      claimId: claim._id,
      amount: claim.amount,
      rainfall: claim.rainfall,
      aqi: claim.aqi,
      temperature: claim.temperature,
      latitude: claim.gps.lat,
      longitude: claim.gps.lon
    },
    actualWeather.rainfall,
    actualWeather.aqi
  );

  // Store AI results
  claim.riskScore = aiResult.risk.score;
  claim.fraudScore = aiResult.fraud.score;
  claim.aiDecision = aiResult.decision;
  
} catch (error) {
  // Fallback to local calculation
  console.warn('AI service unavailable, using local calculation');
  claim.riskScore = calculateRiskLocal(claim);
}
```

---

### Option 2: Subprocess Integration (Simple Setup)

**Overview:** Call Python directly from Node.js using child_process.

**Advantages:**
- No extra service to run
- Direct memory access
- Simpler deployment
- No network overhead

**Disadvantages:**
- Slower than native JS
- Process overhead
- Harder to debug
- Not suitable for high traffic

#### Setup

```javascript
// backend/src/services/aiService.js
const { spawn } = require('child_process');
const path = require('path');

class AIService {
  async calculateRisk(rainfall, aqi, temperature, zone) {
    return this.runPython('calculate_risk', {
      rainfall,
      aqi,
      temperature,
      zone
    });
  }

  async runPython(method, params) {
    return new Promise((resolve, reject) => {
      const python = spawn('python3', [
        path.join(__dirname, '../../ai/subprocess_handler.py'),
        method,
        JSON.stringify(params)
      ]);

      let result = '';
      let error = '';

      python.stdout.on('data', (data) => {
        result += data.toString();
      });

      python.stderr.on('data', (data) => {
        error += data.toString();
      });

      python.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Python error: ${error}`));
        } else {
          try {
            resolve(JSON.parse(result));
          } catch (e) {
            reject(new Error(`Failed to parse Python output: ${result}`));
          }
        }
      });
    });
  }
}

module.exports = new AIService();
```

*Note: Requires a Python subprocess handler script*

---

### Option 3: Direct Python Import (Advanced)

**Overview:** Use Node.js TypeScript and Python interop libraries.

**Setup:** Use `node-gyp` and Python C API (advanced, not recommended for most cases)

---

## 🔧 Docker Integration

### docker-compose.yml (Updated)

```yaml
version: '3.8'

services:
  # Existing MongoDB service
  mongodb:
    image: mongo:7.0
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: gigshield
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD:-gigshield-pass}

  # Node.js Backend
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    environment:
      NODE_ENV: development
      MONGODB_URI: mongodb://gigshield:gigshield-pass@mongodb:27017/gigshield
      JWT_SECRET: ${JWT_SECRET:-your-secret-key}
      AI_SERVICE_URL: http://ai:8000
      AI_ENABLED: "true"
    depends_on:
      - mongodb
      - ai
    volumes:
      - ./backend:/app
    command: npm start

  # Python AI Service
  ai:
    build:
      context: ./ai
      dockerfile: Dockerfile.ai
    ports:
      - "8000:8000"
    expose:
      - "8000"
    command: uvicorn api_wrapper:app --host 0.0.0.0 --port 8000
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  mongo-data:
```

### Create `ai/Dockerfile.ai`

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy AI modules
COPY . .

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:8000/health')"

CMD ["uvicorn", "api_wrapper:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Run with Docker Compose

```bash
cd /Users/lalitaditya/gigshield

# Start both services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f ai
docker-compose logs -f backend

# Stop
docker-compose down
```

---

## 🧪 Testing Integration

### Test Script (`test_integration.js`)

```javascript
const aiClient = require('./src/services/aiClient');

async function testIntegration() {
  console.log('Testing AI Integration...\n');

  try {
    // 1. Health check
    console.log('1. Health Check');
    const health = await aiClient.health();
    console.log(`   Status: ${health.status}`);
    console.log('   ✓ AI service is running\n');

    // 2. Risk calculation
    console.log('2. Risk Calculation');
    const risk = await aiClient.calculateRisk(65, 320, 38, 'Dilsukhnagar');
    console.log(`   Risk Score: ${risk.total_score.toFixed(1)}`);
    console.log(`   Risk Level: ${risk.risk_level}`);
    console.log('   ✓ Risk calculation works\n');

    // 3. Premium calculation
    console.log('3. Premium Calculation');
    const premium = await aiClient.calculatePremium('standard', risk.risk_level, 4);
    console.log(`   Tier: ${premium.tier}`);
    console.log(`   Weekly Premium: ₹${premium.adjusted_premium_weekly}`);
    console.log('   ✓ Premium calculation works\n');

    // 4. Fraud detection
    console.log('4. Fraud Detection');
    const fraud = await aiClient.analyzeFraud(
      {
        userId: 'test_user',
        claimId: 'test_claim_001',
        amount: 5000,
        rainfall: 65,
        aqi: 320,
        temperature: 38,
        latitude: 17.385,
        longitude: 78.487
      },
      63,
      318
    );
    console.log(`   Fraud Score: ${fraud.fraud_score.toFixed(1)}`);
    console.log(`   Fraud Level: ${fraud.fraud_level}`);
    console.log('   ✓ Fraud detection works\n');

    // 5. Claim decision
    console.log('5. Claim Decision');
    const decision = await aiClient.decideClaim(
      'test_claim_001',
      5000,
      risk.total_score,
      fraud.fraud_score,
      10000,
      'standard'
    );
    console.log(`   Status: ${decision.status}`);
    console.log(`   Payout: ₹${decision.payout_amount}`);
    console.log('   ✓ Claim decision works\n');

    console.log('✅ All integration tests passed!');
  } catch (error) {
    console.error('❌ Integration test failed:', error.message);
  }
}

testIntegration();
```

Run with:
```bash
cd backend
node test_integration.js
```

---

## 📊 Monitoring Integration

### Add Monitoring (`backend/src/middleware/aiMonitoring.js`)

```javascript
const aiClient = require('../services/aiClient');

let aiHealth = {
  status: 'unknown',
  lastCheck: null,
  requestCount: 0,
  errorCount: 0,
  avgLatency: 0
};

// Periodic health check
setInterval(async () => {
  try {
    await aiClient.health();
    aiHealth.status = 'healthy';
  } catch {
    aiHealth.status = 'unhealthy';
  }
  aiHealth.lastCheck = new Date();
}, 30000);

// Middleware to track requests
function trackAIRequest(req, res, next) {
  const originalJson = res.json;
  const startTime = Date.now();

  res.json = function(data) {
    const latency = Date.now() - startTime;
    aiHealth.requestCount++;
    aiHealth.avgLatency = (aiHealth.avgLatency + latency) / 2;
    return originalJson.call(this, data);
  };

  next();
}

// Endpoint to check AI status
app.get('/api/ai/status', (req, res) => {
  res.json(aiHealth);
});

module.exports = { trackAIRequest, getAIHealth: () => aiHealth };
```

---

## 🚀 Deployment Checklist

- [ ] AI service has health check endpoint
- [ ] Backend can reach AI service
- [ ] Error handling for AI service downtime
- [ ] Fallback logic for offline AI
- [ ] Logging and monitoring enabled
- [ ] Rate limiting on AI endpoints
- [ ] Authentication for AI service (if in production)
- [ ] Environment variables configured
- [ ] Docker containers tested
- [ ] Load testing completed

---

## 📈 Performance Considerations

### Response Times (Expected)

| Operation | Time |
|-----------|------|
| Risk Calculation | 50-100ms |
| Fraud Detection | 100-200ms |
| Premium Calculation | 10-20ms |
| Claim Decision | 20-50ms |
| Complete Pipeline | 300-500ms |

### Optimization Tips

1. **Caching**: Store results in Redis
```javascript
const redis = require('redis');
const client = redis.createClient();

async function getCachedRisk(zone, rainfall, aqi, temp) {
  const key = `risk:${zone}:${rainfall}:${aqi}:${temp}`;
  const cached = await client.get(key);
  if (cached) return JSON.parse(cached);

  const result = await aiClient.calculateRisk(rainfall, aqi, temp, zone);
  await client.setex(key, 3600, JSON.stringify(result)); // 1 hour TTL
  return result;
}
```

2. **Batch Processing**: Process multiple claims at once
3. **Async Processing**: Use background jobs for non-critical claims
4. **Connection Pooling**: Keep idle AI connections alive

---

## 🐛 Troubleshooting

**AI service not responding?**
```bash
# Check if running
curl http://localhost:8000/health

# Check logs
docker-compose logs ai

# Restart
docker-compose restart ai
```

**Slow response times?**
```bash
# Check Python CPU usage
ps aux | grep python

# Monitor network
netstat -an | grep 8000
```

**Integration errors?**

Add detailed logging:
```javascript
const aiClient = require('./aiClient');
aiClient.client.interceptors.response.use(
  response => response,
  error => {
    console.error('AI API Error:', {
      status: error.response?.status,
      message: error.response?.statusText,
      data: error.response?.data
    });
    throw error;
  }
);
```

---

## ✅ Complete Integration Example

See `/backend/src/controllers/claimController.example.js` for a complete working example.

```javascript
// Complete claim processing with AI
async function processClaimWithAI(claimData) {
  const ai = require('../services/aiClient');
  const weather = await getWeatherData(claimData.zone);

  // Full AI pipeline
  const result = await ai.processCompleteClaim(
    weather,
    claimData,
    weather.rainfall,
    weather.aqi
  );

  // Store results
  const updatedClaim = new Claim({
    ...claimData,
    riskScore: result.risk.score,
    fraudScore: result.fraud.score,
    decision: result.decision.status,
    payout: result.decision.payout,
    confidence: result.decision.confidence
  });

  return updatedClaim.save();
}
```

---

**For more details, see the README.md in the ai/ directory.**
