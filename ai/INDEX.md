# GigShield AI Engine - Complete Module Index

## 📂 Directory Structure

```
ai/
├── risk_calculator.py              # Multi-factor risk scoring model
├── fraud_detector.py               # Rule-based fraud detection
├── premium_engine.py               # Dynamic premium pricing engine
├── claim_decision.py               # Automated claim decision logic
├── example_usage.py                # Complete workflow demonstration
├── utils.py                        # Validation, logging, serialization utilities
├── api_wrapper.py                  # FastAPI REST endpoints
├── test_ai_modules.py              # Comprehensive test suite
├── quickstart.sh                   # Automated setup script
├── requirements.txt                # Python dependencies
├── README.md                       # Feature documentation with ML upgrades
├── INTEGRATION_GUIDE.md            # Backend integration guide
└── INDEX.md                        # This file
```

## 📋 Module Descriptions

### 1. **risk_calculator.py** (Core Module)
**Purpose:** Calculate insurance risk scores based on weather conditions

**Key Components:**
- `RiskLevel` enum: LOW, MEDIUM, HIGH, CRITICAL
- `WeatherData` dataclass: Inputs (rainfall, AQI, temperature, humidity)
- `RiskScore` dataclass: Output (score, level, component breakdown)
- `RiskCalculator.calculate_risk_score()`: Main calculation method

**Formula:**
```
Risk = (Weather Risk × 0.4) + (AQI Risk × 0.3) + (Location Risk × 0.3)
- Weather Risk: Combines rainfall, temperature, humidity
- AQI Risk: Logarithmic scale (0-500 AQI → 0-100 risk)
- Location Risk: Zone-based baseline
```

**Example Usage:**
```python
from risk_calculator import RiskCalculator, WeatherData

weather = WeatherData(rainfall_mm=65, aqi=320, temperature_c=38, humidity_pct=75)
risk = RiskCalculator.calculate_risk_score(weather, "Dilsukhnagar")
# Output: RiskScore(total_score=62.3, risk_level=RiskLevel.HIGH, components={...})
```

---

### 2. **fraud_detector.py** (Core Module)
**Purpose:** Detect fraudulent claims using rule-based 5-point system

**Key Components:**
- `FraudLevel` enum: LOW, MEDIUM, HIGH, CRITICAL
- `ClaimData` dataclass: Claim details (user, amount, weather, GPS)
- `GPSData` dataclass: GPS coordinates and accuracy
- `FraudResult` dataclass: Output (score, level, indicators, recommendation)
- `FraudDetector.analyze_fraud()`: Main detection method

**5-Point Fraud Detection System:**
1. **No Activity** (0-25 pts): GPS stationary for 4+ hours
2. **Duplicate Claims** (0-30 pts): 3+ claims in 24-hour window
3. **GPS Anomaly** (0-20 pts): Impossible speed or teleportation
4. **Weather Mismatch** (0-20 pts): Claimed vs actual weather divergence
5. **Claim Pattern** (0-15 pts): Unusual claim frequency

**Example Usage:**
```python
from fraud_detector import FraudDetector, ClaimData, GPSData
from datetime import datetime

detector = FraudDetector()
claim = ClaimData(
    "user_123", "claim_001", 5000,
    60, 300, 35,  # claimed rainfall, AQI, temp
    GPSData(17.385, 78.487, 50, datetime.now())
)
result = detector.analyze_fraud(claim, actual_rainfall=58, actual_aqi=298)
# Output: FraudResult(fraud_score=15.0, fraud_level=FraudLevel.LOW, ...)
```

---

### 3. **premium_engine.py** (Core Module)
**Purpose:** Calculate dynamic insurance premiums based on risk level

**Key Components:**
- `PolicyTier` enum: BASIC, STANDARD, PREMIUM
- `RiskAdjustment` dataclass: Pricing multipliers
- `PolicyTier` dataclass: Output with coverage details
- `PremiumEngine.calculate_premium()`: Main calculation method

**Pricing Model:**
| Tier | Weekly | Coverage | Risk Adjustment |
|------|--------|----------|-----------------|
| BASIC | ₹20 | ₹1,000 | 0.8x (low) → 1.6x (critical) |
| STANDARD | ₹35 | ₹5,000 | 0.8x (low) → 1.6x (critical) |
| PREMIUM | ₹50 | ₹10,000 | 0.8x (low) → 1.6x (critical) |

**Example Usage:**
```python
from premium_engine import PremiumEngine, PolicyTier

premium = PremiumEngine.calculate_premium(
    PolicyTier.STANDARD,
    "high",  # risk_level
    4  # weeks
)
# Output: {
#   'tier': 'STANDARD',
#   'base_premium_weekly': 35.0,
#   'adjusted_premium_weekly': 45.5,  # High risk surcharge
#   'coverage_amount': 5000,
#   'total_premium': 182.0
# }
```

---

### 4. **claim_decision.py** (Core Module)
**Purpose:** Automatically approve, verify, or reject claims

**Key Components:**
- `ClaimStatus` enum: AUTO_APPROVED, PENDING_VERIFICATION, PENDING_REVIEW, REJECTED
- `ClaimDecision` dataclass: Output (status, payout, confidence, reasons)
- `ClaimDecisionEngine.decide_claim()`: Main decision method

**Decision Matrix:**
```
Risk Level vs Fraud Level Decision Table:
- Low Fraud + Low/Medium Risk → AUTO_APPROVED (95% confidence)
- Low Fraud + High Risk → NEEDS_VERIFICATION (80% confidence)
- Medium Fraud → NEEDS_VERIFICATION (70% confidence)
- High Fraud OR Critical Risk → REJECTED (90% confidence)
```

**Example Usage:**
```python
from claim_decision import ClaimDecisionEngine

decision = ClaimDecisionEngine.decide_claim(
    claim_id="c001",
    claim_amount=5000,
    risk_score=45,      # Medium risk
    fraud_score=15,     # Low fraud
    coverage_amount=10000,
    policy_level="standard"
)
# Output: ClaimDecision(
#   status=AUTO_APPROVED,
#   payout_amount=5000,
#   confidence=92,
#   reasons=["Low fraud risk (15/100)", "Medium risk accepted (45/100)"]
# )
```

---

### 5. **example_usage.py** (Demonstration)
**Purpose:** Show complete end-to-end workflow

**Contains:**
- Real-world example data (rainfall, AQI, GPS coordinates)
- Step-by-step integration of all 4 modules
- Output formatting and explanations
- JSON serialization examples

**Workflow:**
1. Calculate weather risk → Risk: 62.3 (MEDIUM)
2. Calculate premium → ₹45.50/week for STANDARD tier
3. Analyze fraud → Fraud Score: 10.0 (LOW)
4. Make claim decision → AUTO_APPROVED, ₹3,000 payout

**Run:** `python example_usage.py`

---

### 6. **utils.py** (Utility Module)
**Purpose:** Validation, logging, serialization, and helper functions

**Key Classes:**
- `WeatherValidator`: Validate rainfall, AQI, temperature, humidity ranges
- `ClaimValidator`: Validate claim amounts and GPS coordinates
- `GeoDistance`: Calculate distances and detect teleportation
- `DataSerializer`: Convert objects to JSON for API responses
- `WeatherMatcher`: Check claimed vs actual weather
- `RiskAlert`: Generate human-readable alerts
- `AuditLog`: Log all decisions for compliance

**Example Usage:**
```python
from utils import WeatherValidator, GeoDistance, DataSerializer

# Validate weather
WeatherValidator.validate_all(rainfall=65, aqi=320, temperature=38, humidity=75)

# Check for impossible GPS movement
is_teleport = GeoDistance.is_teleportation(17.385, 78.487, 28.704, 77.102, time_minutes=30)

# Serialize for API response
json_str = DataSerializer.to_json(risk_object)
```

---

### 7. **api_wrapper.py** (REST API Service)
**Purpose:** Serve AI modules as HTTP endpoints via FastAPI

**Endpoints:**

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/health` | Health check |
| POST | `/api/risk/calculate` | Calculate risk score |
| POST | `/api/fraud/analyze` | Analyze fraud |
| POST | `/api/premium/calculate` | Calculate premium |
| POST | `/api/claim/decide` | Make claim decision |
| POST | `/api/claim/process-complete` | Complete pipeline |

**Request/Response Models:**
- `WeatherDataRequest`: Weather inputs
- `RiskScoreResponse`: Risk score output
- `FraudAnalysisRequest`: Fraud analysis inputs
- `ClaimDecisionRequest`: Claim decision inputs
- All responses include timestamp and confidence scores

**Run:** `uvicorn api_wrapper:app --reload --host 0.0.0.0 --port 8000`

**Access Docs:** `http://localhost:8000/docs`

---

### 8. **test_ai_modules.py** (Test Suite)
**Purpose:** Comprehensive unit and integration tests

**Test Classes:**
- `TestRiskCalculator`: 4 risk scenarios (low, medium, high, critical)
- `TestFraudDetector`: 3 fraud scenarios (clean, suspicious, GPS anomaly)
- `TestPremiumEngine`: Tier and risk adjustment tests
- `TestClaimDecisionEngine`: 5 decision scenarios with payout validation
- `TestIntegration`: End-to-end pipeline test
- `TestPerformance`: Speed benchmarks (<100ms for risk, <200ms for fraud)

**Run Tests:**
```bash
pytest test_ai_modules.py -v                    # All tests
pytest test_ai_modules.py::TestRiskCalculator   # Single class
pytest test_ai_modules.py -v --tb=short         # Verbose with short output
```

---

### 9. **quickstart.sh** (Setup Script)
**Purpose:** Automated environment setup and configuration

**Steps:**
1. Check Python 3 installation
2. Create virtual environment
3. Activate venv
4. Install dependencies
5. Display usage instructions

**Run:** `bash quickstart.sh`

---

### 10. **requirements.txt** (Dependencies)
**Purpose:** Python package management

**Core Requirements:**
- `python>=3.8` (Python runtime)

**Recommended:**
- `fastapi==0.104.1` (REST API framework)
- `uvicorn==0.24.0` (ASGI server)
- `pydantic==2.5.0` (Data validation)
- `pytest==7.4.3` (Testing framework)

**Optional - ML Upgrades:**
- `numpy`, `pandas`, `scikit-learn` (ML libraries)
- `xgboost`, `lightgbm` (Gradient boosting)
- `tensorflow`, `torch` (Deep learning)

**Optional - Production:**
- `gunicorn` (Production server)
- `redis` (Caching)
- `sqlalchemy` (Database ORM)

---

### 11. **README.md** (Documentation)
**Purpose:** Complete feature documentation with ML upgrade ideas

**Sections:**
- Core features overview
- Usage examples
- Integration guide
- ML upgrade ideas (XGBoost, neural networks, LSTM, anomaly detection)
- Performance metrics
- Known limitations
- Roadmap

---

### 12. **INTEGRATION_GUIDE.md** (Backend Integration)
**Purpose:** Connect Python AI to Node.js backend

**Methods:**
1. **FastAPI Microservice** (Recommended)
   - Run AI on separate port 8000
   - Call via HTTP from Node.js
   - Best for production

2. **Subprocess Integration**
   - Call Python directly from Node.js
   - Simpler setup, slower performance
   - Good for small deployments

3. **Docker Compose**
   - Run both services together
   - Easy local development
   - Production-ready configuration

**Includes:**
- JavaScript client for AI API
- Complete implementation examples
- Docker setup
- Health monitoring
- Troubleshooting guide

---

## 🚀 Getting Started

### Quick Setup (5 minutes)
```bash
cd /Users/lalitaditya/gigshield/ai
bash quickstart.sh
python example_usage.py
```

### Run Tests (1 minute)
```bash
cd /Users/lalitaditya/gigshield/ai
pytest test_ai_modules.py -v
```

### Start API Server (2 minutes)
```bash
cd /Users/lalitaditya/gigshield/ai
source venv/bin/activate
uvicorn api_wrapper:app --reload --host 0.0.0.0 --port 8000
# Visit http://localhost:8000/docs
```

### Connect to Backend
See `INTEGRATION_GUIDE.md` for complete backend integration steps.

---

## 📊 Module Statistics

| Module | Lines | Classes | Methods | Purpose |
|--------|-------|---------|---------|---------|
| risk_calculator.py | ~100 | 2 | 1 | Risk scoring |
| fraud_detector.py | ~150 | 2 | 2 | Fraud detection |
| premium_engine.py | ~80 | 3 | 3 | Premium pricing |
| claim_decision.py | ~120 | 2 | 1 | Claim decisions |
| example_usage.py | ~90 | 0 | 0 | Demonstration |
| utils.py | ~400 | 8 | 30 | Utilities |
| api_wrapper.py | ~600 | 10 | 20 | REST API |
| test_ai_modules.py | ~400 | 7 | 30 | Testing |
| **TOTAL** | **~1,940** | **34** | **87** | **Complete AI Engine** |

---

## 🔗 File Relationships

```
┌─────────────────────────────────────────────────────────┐
│                  FastAPI REST API                       │
│              (api_wrapper.py - port 8000)              │
├─────────────────────────────────────────────────────────┤
│  /api/risk/calculate ──── risk_calculator.py           │
│  /api/fraud/analyze ───── fraud_detector.py            │
│  /api/premium/calculate ─ premium_engine.py            │
│  /api/claim/decide ────── claim_decision.py            │
└─────────────────────────────────────────────────────────┘
              ↑
              │ HTTP
              │
┌─────────────────────────────────────────────────────────┐
│        Node.js Backend (port 5000)                      │
│        (src/services/aiClient.js)                       │
├─────────────────────────────────────────────────────────┤
│  claimController.js ──→ aiClient ──→ API               │
│  policyController.js                                    │
│  riskController.js                                      │
└─────────────────────────────────────────────────────────┘

Helper Modules:
- utils.py (validation, logging, serialization)
- test_ai_modules.py (unit & integration tests)
- example_usage.py (complete workflow demo)
```

---

## ✅ Implementation Checklist

- [x] Risk scoring model (3-factor weighted formula)
- [x] Fraud detection system (5-point rule-based)
- [x] Premium pricing engine (3 tiers with risk multipliers)
- [x] Claim decision logic (decision matrix)
- [x] REST API service (FastAPI with 5 endpoints)
- [x] Comprehensive utilities (validation, logging, serialization)
- [x] Unit tests (20+ test cases)
- [x] Integration tests (end-to-end pipeline)
- [x] Complete examples (working code demonstrations)
- [x] Documentation (README with ML upgrade ideas)
- [x] Backend integration guide (3 integration methods)
- [x] Automated setup script (bash quickstart)
- [x] Production-ready dependencies (requirements.txt)

---

## 🎯 Architecture Decisions

1. **Dataclasses for Type Safety**: Leverages Python 3.7+ dataclasses for immutable, type-checked data structures
2. **Rule-Based (Extensible to ML)**: Current implementation is rule-based but architecture supports ML model replacement
3. **Modular Design**: Each component is independent and can be tested, upgraded, or swapped independently
4. **REST API Layer**: FastAPI provides async, type-validated HTTP interface for backend integration
5. **Comprehensive Utilities**: Validation, logging, and serialization centralized for code reuse
6. **Docker-Ready**: Can be containerized and deployed with backend as microservice

---

## 🔮 Future Enhancements

**Phase 1 (Q2 2024):**
- [ ] Replace fraud rules with XGBoost classifier
- [ ] Add ML-based risk prediction model
- [ ] Implement LSTM for time series analysis

**Phase 2 (Q3 2024):**
- [ ] Add real-time monitoring dashboard
- [ ] Implement model drift detection
- [ ] Add A/B testing framework

**Phase 3 (Q4 2024):**
- [ ] Deploy to production Kubernetes cluster
- [ ] Setup model versioning and governance
- [ ] Implement federated learning for privacy

---

## 📞 Support & Questions

For detailed module information, see the docstrings in each file.

**Key Entry Points:**
- **To understand risk scoring**: See `risk_calculator.py` docstring
- **To understand fraud detection**: See `fraud_detector.py` docstring  
- **To understand API integration**: See `api_wrapper.py` and `INTEGRATION_GUIDE.md`
- **To run examples**: Execute `python example_usage.py`
- **To test everything**: Run `pytest test_ai_modules.py -v`

---

**Last Updated:** March 30, 2024  
**Version:** 1.0.0  
**Status:** Production-Ready ✅
