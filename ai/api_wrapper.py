"""
FastAPI REST API wrapper for GigShield AI modules
Serves risk scoring, fraud detection, premium calculation, and claim decisions as HTTP endpoints

Run with: uvicorn api_wrapper:app --reload --host 0.0.0.0 --port 8000
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator
from typing import Optional, Dict, Any, List
from datetime import datetime
import logging

from risk_calculator import RiskCalculator, RiskLevel, WeatherData
from fraud_detector import FraudDetector, ClaimData, GPSData, FraudLevel
from premium_engine import PremiumEngine, PolicyTier
from claim_decision import ClaimDecisionEngine, ClaimStatus
from utils import (
    WeatherValidator, ClaimValidator, GeoDistance,
    DataSerializer, WeatherMatcher, RiskAlert,
    AuditLog, ValidationError, validate_and_process_claim
)

# Initialize FastAPI app
app = FastAPI(
    title="GigShield AI Engine",
    description="AI/ML inference API for parametric income insurance",
    version="1.0.0"
)

# Add CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize components
fraud_detector = FraudDetector()
audit_log = AuditLog("gigshield_api_audit.log")


# ============================================================================
# Pydantic Models for Request/Response Validation
# ============================================================================

class WeatherDataRequest(BaseModel):
    """Weather data input"""
    rainfall_mm: float = Field(..., description="Rainfall in mm", ge=0, le=500)
    aqi: float = Field(..., description="Air Quality Index (0-500)", ge=0, le=500)
    temperature_c: float = Field(..., description="Temperature in Celsius", ge=-10, le=50)
    humidity_pct: Optional[float] = Field(60, description="Humidity percentage", ge=0, le=100)
    zone: str = Field(..., description="Geographic zone (e.g., 'Dilsukhnagar')")
    
    class Config:
        schema_extra = {
            "example": {
                "rainfall_mm": 65,
                "aqi": 320,
                "temperature_c": 38,
                "humidity_pct": 75,
                "zone": "Dilsukhnagar"
            }
        }


class RiskScoreResponse(BaseModel):
    """Risk score output"""
    total_score: float = Field(..., description="Risk score 0-100")
    risk_level: str = Field(..., description="Risk level: LOW/MEDIUM/HIGH/CRITICAL")
    weather_risk: float
    aqi_risk: float
    location_risk: float
    alerts: List[str]
    timestamp: str


class GPSDataRequest(BaseModel):
    """GPS coordinate input"""
    latitude: float = Field(..., description="Latitude (-90 to 90)", ge=-90, le=90)
    longitude: float = Field(..., description="Longitude (-180 to 180)", ge=-180, le=180)
    accuracy_m: Optional[float] = Field(50, description="GPS accuracy in meters")


class ClaimDataRequest(BaseModel):
    """Claim submission"""
    user_id: str = Field(..., description="Worker user ID")
    claim_id: str = Field(..., description="Unique claim ID")
    amount: float = Field(..., description="Claimed amount in Rupees", ge=100, le=100000)
    claimed_rainfall: float = Field(..., description="Claimed rainfall", ge=0, le=500)
    claimed_aqi: float = Field(..., description="Claimed AQI", ge=0, le=500)
    claimed_temperature: float = Field(..., description="Claimed temperature", ge=-10, le=50)
    gps: GPSDataRequest = Field(..., description="GPS coordinates")
    
    class Config:
        schema_extra = {
            "example": {
                "user_id": "user_123",
                "claim_id": "claim_2024_001",
                "amount": 5000,
                "claimed_rainfall": 65,
                "claimed_aqi": 320,
                "claimed_temperature": 38,
                "gps": {"latitude": 17.385, "longitude": 78.487, "accuracy_m": 50}
            }
        }


class FraudAnalysisRequest(BaseModel):
    """Fraud detection request"""
    claim: ClaimDataRequest
    actual_rainfall: float = Field(..., ge=0, le=500)
    actual_aqi: float = Field(..., ge=0, le=500)
    previous_gps: Optional[GPSDataRequest] = None
    previous_gps_timestamp: Optional[str] = None
    user_claim_history: Optional[List[str]] = Field(default_factory=list)
    
    class Config:
        schema_extra = {
            "example": {
                "claim": {
                    "user_id": "user_123",
                    "claim_id": "claim_001",
                    "amount": 5000,
                    "claimed_rainfall": 65,
                    "claimed_aqi": 320,
                    "claimed_temperature": 38,
                    "gps": {"latitude": 17.385, "longitude": 78.487}
                },
                "actual_rainfall": 63,
                "actual_aqi": 318,
                "previous_gps": {"latitude": 17.386, "longitude": 78.488},
                "previous_gps_timestamp": "2024-03-01T10:00:00"
            }
        }


class FraudDetectionResponse(BaseModel):
    """Fraud detection output"""
    fraud_score: float = Field(..., description="Fraud score 0-100")
    fraud_level: str = Field(..., description="Fraud level: LOW/MEDIUM/HIGH/CRITICAL")
    fraud_indicators: List[str] = Field(..., description="List of fraud indicators detected")
    risk_recommendation: str = Field(..., description="Recommendation: auto_approve/verify/review/reject")
    timestamp: str


class PremiumResponse(BaseModel):
    """Premium calculation output"""
    tier: str = Field(..., description="Policy tier: BASIC/STANDARD/PREMIUM")
    base_premium_weekly: float
    adjusted_premium_weekly: float
    risk_multiplier: float
    coverage_amount: float
    total_premium: Optional[float] = None
    roi_multiplier: float
    timestamp: str


class ClaimDecisionRequest(BaseModel):
    """Claim decision request"""
    claim_id: str
    claim_amount: float = Field(..., ge=100, le=100000)
    risk_score: float = Field(..., ge=0, le=100)
    fraud_score: float = Field(..., ge=0, le=100)
    coverage_amount: float
    policy_level: str = Field(..., pattern="^(basic|standard|premium)$")
    
    class Config:
        schema_extra = {
            "example": {
                "claim_id": "claim_2024_001",
                "claim_amount": 5000,
                "risk_score": 45,
                "fraud_score": 15,
                "coverage_amount": 10000,
                "policy_level": "standard"
            }
        }


class ClaimDecisionResponse(BaseModel):
    """Claim decision output"""
    claim_id: str
    status: str = Field(..., description="Decision status: AUTO_APPROVED/PENDING_VERIFICATION/PENDING_REVIEW/REJECTED")
    payout_amount: float
    confidence: float = Field(..., description="Confidence percentage 0-100")
    reasons: List[str]
    additional_info: Optional[Dict[str, Any]] = None
    timestamp: str


class HealthResponse(BaseModel):
    """Health check response"""
    status: str = "healthy"
    components: Dict[str, str]
    version: str = "1.0.0"


# ============================================================================
# Health & Info Endpoints
# ============================================================================

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Check API health and component status"""
    return HealthResponse(
        components={
            "risk_calculator": "operational",
            "fraud_detector": "operational",
            "premium_engine": "operational",
            "claim_decision": "operational"
        }
    )


@app.get("/info")
async def api_info():
    """Get API information"""
    return {
        "name": "GigShield AI Engine",
        "version": "1.0.0",
        "description": "AI/ML inference API for parametric income insurance",
        "endpoints": {
            "risk": "/api/risk/calculate",
            "fraud": "/api/fraud/analyze",
            "premium": "/api/premium/calculate",
            "decision": "/api/claim/decide",
            "health": "/health"
        }
    }


# ============================================================================
# Risk Scoring Endpoints
# ============================================================================

@app.post("/api/risk/calculate", response_model=RiskScoreResponse)
async def calculate_risk(request: WeatherDataRequest):
    """
    Calculate risk score based on weather conditions
    
    **Input:**
    - rainfall_mm: Rainfall in millimeters (0-500)
    - aqi: Air Quality Index (0-500)
    - temperature_c: Temperature in Celsius (-10 to 50)
    - humidity_pct: Humidity percentage (0-100)
    - zone: Geographic zone name
    
    **Output:**
    - total_score: Risk score 0-100
    - risk_level: LOW/MEDIUM/HIGH/CRITICAL
    - Components breakdown with alerts
    """
    try:
        # Validate input
        WeatherValidator.validate_all(
            request.rainfall_mm,
            request.aqi,
            request.temperature_c,
            request.humidity_pct
        )
        
        # Calculate risk
        weather = WeatherData(
            request.rainfall_mm,
            request.aqi,
            request.temperature_c,
            request.humidity_pct
        )
        risk = RiskCalculator.calculate_risk_score(weather, request.zone)
        
        # Generate alerts
        alerts = RiskAlert.generate_alerts(
            request.rainfall_mm,
            request.aqi,
            request.temperature_c
        )
        
        logger.info(f"Risk calculated: zone={request.zone}, score={risk.total_score:.1f}")
        
        return RiskScoreResponse(
            total_score=risk.total_score,
            risk_level=risk.risk_level.value,
            weather_risk=risk.components['weather'],
            aqi_risk=risk.components['aqi'],
            location_risk=risk.components['location'],
            alerts=alerts,
            timestamp=datetime.now().isoformat()
        )
    
    except ValidationError as e:
        logger.error(f"Validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error calculating risk: {str(e)}")
        raise HTTPException(status_code=500, detail="Error calculating risk")


@app.get("/api/risk/alerts/{zone}")
async def get_risk_alerts(zone: str):
    """Get current risk alerts for a zone"""
    # In production, fetch actual weather data from API
    return {
        "zone": zone,
        "alerts": [
            "⚠️  MODERATE RAINFALL: Weather risk present",
            "💨 POOR AIR QUALITY: Health impact likely"
        ],
        "last_updated": datetime.now().isoformat()
    }


# ============================================================================
# Premium Calculation Endpoints
# ============================================================================

@app.post("/api/premium/calculate", response_model=PremiumResponse)
async def calculate_premium(
    tier: str = Field(..., pattern="^(basic|standard|premium)$"),
    risk_level: str = Field(..., pattern="^(low|medium|high|critical)$"),
    weeks: int = Field(default=4, ge=1, le=52)
):
    """
    Calculate adjusted premium based on tier and risk level
    
    **Parameters:**
    - tier: BASIC | STANDARD | PREMIUM
    - risk_level: LOW | MEDIUM | HIGH | CRITICAL
    - weeks: Number of weeks for the policy
    
    **Output:**
    - Adjusted premium with risk multiplier
    - Coverage amount for the tier
    - ROI multiplier
    """
    try:
        # Map tier string to enum
        tier_map = {
            "basic": PolicyTier.BASIC,
            "standard": PolicyTier.STANDARD,
            "premium": PolicyTier.PREMIUM
        }
        
        premium = PremiumEngine.calculate_premium(
            tier_map[tier.lower()],
            risk_level.lower(),
            weeks
        )
        
        logger.info(f"Premium calculated: tier={tier}, risk={risk_level}, weeks={weeks}")
        
        return PremiumResponse(
            tier=premium['tier'],
            base_premium_weekly=premium['base_premium_weekly'],
            adjusted_premium_weekly=premium['adjusted_premium_weekly'],
            risk_multiplier=premium['risk_multiplier'],
            coverage_amount=premium['coverage_amount'],
            total_premium=premium.get('total_premium'),
            roi_multiplier=premium['roi_multiplier'],
            timestamp=datetime.now().isoformat()
        )
    
    except (KeyError, ValueError) as e:
        raise HTTPException(status_code=400, detail=f"Invalid input: {str(e)}")
    except Exception as e:
        logger.error(f"Error calculating premium: {str(e)}")
        raise HTTPException(status_code=500, detail="Error calculating premium")


# ============================================================================
# Fraud Detection Endpoints
# ============================================================================

@app.post("/api/fraud/analyze", response_model=FraudDetectionResponse)
async def analyze_fraud(request: FraudAnalysisRequest):
    """
    Analyze claim for fraud indicators
    
    **Input:**
    - Claim details (user ID, GPS, claimed weather, claimed amount)
    - Actual weather conditions
    - Previous GPS location
    - User claim history
    
    **Output:**
    - Fraud score 0-100
    - Fraud level: LOW/MEDIUM/HIGH/CRITICAL
    - List of detected fraud indicators
    - Recommendation for claim processing
    """
    try:
        # Validate inputs
        is_valid, error_msg = validate_and_process_claim(
            {
                'amount': request.claim.amount,
                'latitude': request.claim.gps.latitude,
                'longitude': request.claim.gps.longitude
            },
            {
                'rainfall': request.actual_rainfall,
                'aqi': request.actual_aqi,
                'temperature': request.claim.claimed_temperature,
                'humidity': 60
            }
        )
        
        if not is_valid:
            raise HTTPException(status_code=400, detail=error_msg)
        
        # Create claim object
        claim_data = ClaimData(
            request.claim.user_id,
            request.claim.claim_id,
            request.claim.amount,
            request.claim.claimed_rainfall,
            request.claim.claimed_aqi,
            request.claim.claimed_temperature,
            GPSData(
                request.claim.gps.latitude,
                request.claim.gps.longitude,
                request.claim.gps.accuracy_m or 50,
                datetime.now()
            )
        )
        
        # Parse previous GPS timestamp
        prev_timestamp = datetime.now()
        if request.previous_gps_timestamp:
            try:
                prev_timestamp = datetime.fromisoformat(request.previous_gps_timestamp)
            except:
                pass
        
        # Analyze fraud
        result = fraud_detector.analyze_fraud(
            claim_data,
            request.actual_rainfall,
            request.actual_aqi,
            request.previous_gps.latitude if request.previous_gps else request.claim.gps.latitude,
            request.previous_gps.longitude if request.previous_gps else request.claim.gps.longitude,
            prev_timestamp
        )
        
        logger.info(
            f"Fraud analyzed: claim={request.claim.claim_id}, "
            f"score={result.fraud_score:.1f}, level={result.fraud_level.value}"
        )
        
        return FraudDetectionResponse(
            fraud_score=result.fraud_score,
            fraud_level=result.fraud_level.value,
            fraud_indicators=result.fraud_indicators,
            risk_recommendation=result.fraud_level.value.lower(),
            timestamp=datetime.now().isoformat()
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error analyzing fraud: {str(e)}")
        raise HTTPException(status_code=500, detail="Error analyzing fraud")


# ============================================================================
# Claim Decision Endpoints
# ============================================================================

@app.post("/api/claim/decide", response_model=ClaimDecisionResponse)
async def decide_claim(
    request: ClaimDecisionRequest,
    background_tasks: BackgroundTasks
):
    """
    Make automated claim decision
    
    **Input:**
    - claim_id: Unique claim identifier
    - claim_amount: Claimed amount in Rupees
    - risk_score: Pre-calculated risk score (0-100)
    - fraud_score: Pre-calculated fraud score (0-100)
    - coverage_amount: Policy coverage amount
    - policy_level: BASIC | STANDARD | PREMIUM
    
    **Output:**
    - Claim status (AUTO_APPROVED/PENDING_VERIFICATION/PENDING_REVIEW/REJECTED)
    - Payout amount
    - Confidence score
    - Detailed reasons
    """
    try:
        # Validate input ranges
        if not (0 <= request.risk_score <= 100):
            raise HTTPException(status_code=400, detail="risk_score must be 0-100")
        if not (0 <= request.fraud_score <= 100):
            raise HTTPException(status_code=400, detail="fraud_score must be 0-100")
        
        # Make decision
        decision = ClaimDecisionEngine.decide_claim(
            request.claim_id,
            request.claim_amount,
            request.risk_score,
            request.fraud_score,
            request.coverage_amount,
            request.policy_level
        )
        
        # Log decision in background
        background_tasks.add_task(
            audit_log.log_decision,
            request.claim_id,
            request.risk_score,
            request.fraud_score,
            decision.status.value,
            decision.payout_amount,
            decision.confidence
        )
        
        logger.info(
            f"Claim decision: {request.claim_id} → {decision.status.value} "
            f"(payout=₹{decision.payout_amount})"
        )
        
        return ClaimDecisionResponse(
            claim_id=request.claim_id,
            status=decision.status.value,
            payout_amount=decision.payout_amount,
            confidence=decision.confidence,
            reasons=decision.reasons,
            additional_info=decision.additional_info,
            timestamp=datetime.now().isoformat()
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error making claim decision: {str(e)}")
        raise HTTPException(status_code=500, detail="Error making claim decision")


# ============================================================================
# Complete Pipeline Endpoint
# ============================================================================

@app.post("/api/claim/process-complete")
async def process_complete_claim(
    weather: WeatherDataRequest,
    claim: ClaimDataRequest,
    actual_rainfall: float,
    actual_aqi: float,
    background_tasks: BackgroundTasks
):
    """
    Complete end-to-end claim processing
    
    Processes: Risk Calculation → Premium Lookup → Fraud Detection → Claim Decision
    
    Returns: Final claim decision with all intermediate results
    """
    try:
        # Step 1: Calculate risk
        weather_data = WeatherData(
            weather.rainfall_mm,
            weather.aqi,
            weather.temperature_c,
            weather.humidity_pct or 60
        )
        risk = RiskCalculator.calculate_risk_score(weather_data, weather.zone)
        
        # Step 2: Calculate premium
        premium = PremiumEngine.calculate_premium(
            PolicyTier.STANDARD,
            risk.risk_level.value,
            1
        )
        
        # Step 3: Analyze fraud
        claim_data = ClaimData(
            claim.user_id,
            claim.claim_id,
            claim.amount,
            claim.claimed_rainfall,
            claim.claimed_aqi,
            claim.claimed_temperature,
            GPSData(claim.gps.latitude, claim.gps.longitude, claim.gps.accuracy_m or 50, datetime.now())
        )
        fraud = fraud_detector.analyze_fraud(
            claim_data,
            actual_rainfall,
            actual_aqi,
            claim.gps.latitude,
            claim.gps.longitude,
            datetime.now()
        )
        
        # Step 4: Make decision
        decision = ClaimDecisionEngine.decide_claim(
            claim.claim_id,
            claim.amount,
            risk.total_score,
            fraud.fraud_score,
            premium['coverage_amount'],
            "standard"
        )
        
        # Log in background
        background_tasks.add_task(
            audit_log.log_decision,
            claim.claim_id,
            risk.total_score,
            fraud.fraud_score,
            decision.status.value,
            decision.payout_amount,
            decision.confidence
        )
        
        return {
            "claim_id": claim.claim_id,
            "risk": {
                "score": risk.total_score,
                "level": risk.risk_level.value
            },
            "fraud": {
                "score": fraud.fraud_score,
                "level": fraud.fraud_level.value
            },
            "premium": {
                "tier": premium['tier'],
                "weekly_rate": premium['adjusted_premium_weekly'],
                "coverage": premium['coverage_amount']
            },
            "decision": {
                "status": decision.status.value,
                "payout": decision.payout_amount,
                "confidence": decision.confidence,
                "reasons": decision.reasons
            },
            "timestamp": datetime.now().isoformat()
        }
    
    except Exception as e:
        logger.error(f"Error in complete claim processing: {str(e)}")
        raise HTTPException(status_code=500, detail="Error processing claim")


# ============================================================================
# Error Handlers
# ============================================================================

@app.exception_handler(ValidationError)
async def validation_exception_handler(request, exc):
    return {
        "status": "error",
        "type": "validation_error",
        "message": str(exc),
        "timestamp": datetime.now().isoformat()
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
