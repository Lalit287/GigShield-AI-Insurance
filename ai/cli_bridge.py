import sys
import json
import argparse
from datetime import datetime
from risk_calculator import RiskCalculator, WeatherData
from premium_engine import PremiumEngine, PolicyTier
from fraud_detector import FraudDetector, ClaimData, GPSData
from claim_decision import ClaimDecisionEngine

def main():
    parser = argparse.ArgumentParser(description="GigShield AI CLI Bridge")
    parser.add_argument("--action", required=True, choices=["calculate_premium", "evaluate_claim"])
    parser.add_argument("--payload", required=True, help="JSON payload")
    
    args = parser.parse_args()
    
    try:
        data = json.loads(args.payload)
        
        if args.action == "calculate_premium":
            # Payload: {"zone": "string", "tier": "basic|standard|premium", "weeks": int,
            #           "weather": {"rainfall": float, "aqi": float, "temp": float, "humidity": float}}
            
            # 1. Calculate Risk
            w_data = data.get("weather", {"rainfall": 0, "aqi": 50, "temp": 30, "humidity": 60})
            weather = WeatherData(
                rainfall_mm=w_data.get("rainfall", 0),
                aqi=w_data.get("aqi", 50),
                temperature_c=w_data.get("temp", 30),
                humidity_pct=w_data.get("humidity", 60)
            )
            zone = data.get("zone", "Default")
            risk = RiskCalculator.calculate_risk_score(weather, zone)
            
            # 2. Calculate Premium
            tier_str = data.get("tier", "standard").lower()
            tier_map = {
                "basic": PolicyTier.BASIC,
                "standard": PolicyTier.STANDARD,
                "premium": PolicyTier.PREMIUM
            }
            tier = tier_map.get(tier_str, PolicyTier.STANDARD)
            weeks = data.get("weeks", 4)
            
            premium_data = PremiumEngine.calculate_premium(tier, risk.risk_level.value, weeks)
            
            result = {
                "success": True,
                "risk_score": risk.total_score,
                "risk_level": risk.risk_level.value,
                "premium": premium_data
            }
            print(json.dumps(result))
            
        elif args.action == "evaluate_claim":
            # Payload: {"claim": {...}, "actual_weather": {...}}
            claim = data.get("claim", {})
            actual_weather = data.get("actual_weather", {})
            
            detector = FraudDetector()
            
            # Analyze fraud
            c_data = ClaimData(
                user_id=claim.get("userId", "unknown"),
                claim_id=claim.get("claimId", "temp"),
                amount=claim.get("amount", 0),
                claimed_rainfall=claim.get("triggerValue", 0) if claim.get("triggerType") == "rainfall" else 0, # Rough approx
                claimed_aqi=claim.get("triggerValue", 0) if claim.get("triggerType") == "aqi" else 0,
                claimed_temperature=claim.get("triggerValue", 0) if claim.get("triggerType") == "temperature" else 0,
                gps=GPSData(
                    lat=claim.get("gpsData", {}).get("lat", 0),
                    lon=claim.get("gpsData", {}).get("lng", 0),
                    accuracy_m=50,
                    timestamp=datetime.now()
                )
            )
            
            f_result = detector.analyze_fraud(
                c_data,
                actual_rainfall_mm=actual_weather.get("rainfall", 0),
                actual_aqi=actual_weather.get("aqi", 0),
                current_lat=claim.get("gpsData", {}).get("lat", 0),
                current_lon=claim.get("gpsData", {}).get("lng", 0)
            )
            
            # Make Decision
            # We don't have full risk_score, we use proxy
            decision = ClaimDecisionEngine.decide_claim(
                claim_id=claim.get("claimId", "temp"),
                claim_amount=claim.get("amount", 0),
                risk_score=50, # Mocked for decision engine
                fraud_score=f_result.fraud_score,
                coverage_amount=claim.get("amount", 0), # assume full coverage
                policy_level="standard"
            )
            
            result = {
                "success": True,
                "fraud_score": f_result.fraud_score,
                "fraud_level": f_result.fraud_level.value,
                "fraud_indicators": f_result.fraud_indicators,
                "status": decision.status.value,
                "payout_amount": decision.payout_amount,
                "confidence": decision.confidence,
                "reasons": decision.reasons
            }
            print(json.dumps(result))

    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
