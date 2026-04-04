"""GigShield AI/ML Logic - Complete Example Usage

Demonstrates the full AI pipeline:
1. Risk calculation
2. Premium pricing
3. Fraud detection
4. Claim decision making
"""

from datetime import datetime
from risk_calculator import RiskCalculator, WeatherData, RiskLevel
from fraud_detector import FraudDetector, ClaimData, GPSData
from premium_engine import PremiumEngine, PolicyTier
from claim_decision import ClaimDecisionEngine


def example_complete_workflow():
    """Complete end-to-end workflow example"""
    print("=" * 80)
    print("GigShield AI/ML Engine - Complete Workflow Example")
    print("=" * 80)
    print()

    # ========== STEP 1: RISK ASSESSMENT ==========
    print("📊 STEP 1: Risk Assessment")
    print("-" * 80)

    weather_data = WeatherData(
        rainfall_mm=65,
        aqi=320,
        temperature_c=38,
        humidity_pct=75
    )
    zone = "Dilsukhnagar"

    risk_score = RiskCalculator.calculate_risk_score(weather_data, zone)
    print(f"Weather Data:")
    print(f"  Rainfall: {weather_data.rainfall_mm}mm (threshold: 50mm)")
    print(f"  AQI: {weather_data.aqi} (threshold: 300)")
    print(f"  Temperature: {weather_data.temperature_c}°C (threshold: 42°C)")
    print(f"  Humidity: {weather_data.humidity_pct}%")
    print()
    print(f"Risk Score Calculation:")
    print(f"  Weather Risk: {risk_score.weather_risk}/100 (40% weight)")
    print(f"  AQI Risk: {risk_score.aqi_risk}/100 (30% weight)")
    print(f"  Location Risk: {risk_score.location_risk}/100 (30% weight)")
    print(f"  → Total Risk Score: {risk_score.total_score}/100")
    print(f"  → Risk Level: {risk_score.risk_level.value.upper()}")
    print(f"  → Alerts: {', '.join(risk_score.alerts) if risk_score.alerts else 'None'}")
    print()

    # Check claim triggers
    should_trigger, triggers = RiskCalculator.check_claim_triggers(weather_data)
    print(f"Claim Triggers:")
    print(f"  Should Auto-Trigger: {should_trigger}")
    print(f"  Triggered By: {[t['type'] for t in triggers]}")
    print()

    # ========== STEP 2: PREMIUM CALCULATION ==========
    print("💰 STEP 2: Premium Calculation")
    print("-" * 80)

    # Recommend tier based on risk
    recommended_tier = PremiumEngine.recommend_tier(risk_score.total_score)
    print(f"Recommended Tier (based on risk {risk_score.total_score}/100): {recommended_tier.value.upper()}")
    print()

    # Show all options
    print("Available Options for Risk Level ({}):\n".format(risk_score.risk_level.value))
    for option in PremiumEngine.get_all_tier_options(risk_score.risk_level.value):
        print(f"  📋 {option['tier'].upper()}")
        print(f"     Premium: ₹{option['adjusted_premium_weekly']}/week (base: ₹{option['base_premium_weekly']}, multiplier: {option['risk_multiplier']}x)")
        print(f"     Coverage: ₹{option['coverage_amount']} ({option['coverage_percentage']}%)")
        print(f"     Monthly: ₹{option['monthly_equivalent']} | Yearly: ₹{option['yearly_equivalent']}")
        print(f"     ROI: {option['roi_multiplier']}x (coverage relative to premium)")
        print()

    # Calculate selected tier
    selected_tier = PolicyTier.STANDARD
    premium = PremiumEngine.calculate_premium(
        selected_tier,
        risk_score.risk_level.value,
        weeks=4
    )
    print(f"Selected: {selected_tier.value.upper()} tier for 4 weeks")
    print(f"  Total Premium: ₹{premium['total_premium']}")
    print(f"  Coverage: ₹{premium['coverage_amount']}")
    print()

    # Apply coupon
    discounted = PremiumEngine.apply_coupon_discount(premium, "WELCOME20")
    print(f"Coupon WELCOME20 applied:")
    print(f"  Discount: ₹{discounted['discount_amount']} (-{discounted['discount_rate']*100:.0f}%)")
    print(f"  Final Price: ₹{discounted['final_premium']}")
    print()

    # ========== STEP 3: CLAIM SUBMISSION & FRAUD DETECTION ==========
    print("🚨 STEP 3: Claim Submission & Fraud Detection")
    print("-" * 80)

    claim = ClaimData(
        user_id="user_12345",
        claim_id="claim_c001",
        amount=4000,
        claimed_rainfall=65,
        claimed_aqi=320,
        claimed_temperature=38,
        gps_data=GPSData(
            latitude=17.3850,
            longitude=78.4867,
            accuracy_m=50,
            timestamp=datetime.now()
        )
    )

    fraud_detector = FraudDetector()
    fraud_result = fraud_detector.analyze_fraud(claim, actual_rainfall=63, actual_aqi=318)

    print(f"Claim Details:")
    print(f"  Claim ID: {claim.claim_id}")
    print(f"  User ID: {claim.user_id}")
    print(f"  Amount: ₹{claim.amount}")
    print(f"  GPS Accuracy: {claim.gps_data.accuracy_m}m")
    print()

    print(f"Fraud Detection Analysis:")
    print(f"  No Activity: {fraud_result.breakdown['no_activity']} pts")
    print(f"  Duplicate Claims: {fraud_result.breakdown['duplicate_claims']} pts")
    print(f"  GPS Anomaly: {fraud_result.breakdown['gps_anomaly']} pts")
    print(f"  Weather Mismatch: {fraud_result.breakdown['weather_mismatch']} pts")
    print(f"  Claim Pattern: {fraud_result.breakdown['claim_pattern']} pts")
    print(f"  → Total Fraud Score: {fraud_result.fraud_score}/100")
    print(f"  → Fraud Risk Level: {fraud_result.risk_level.value.upper()}")
    print(f"  → Flags: {fraud_result.flags if fraud_result.flags else 'None'}")
    print()

    # ========== STEP 4: CLAIM DECISION ==========
    print("⚙️  STEP 4: Claim Decision Engine")
    print("-" * 80)

    decision = ClaimDecisionEngine.decide_claim(
        claim_id=claim.claim_id,
        claim_amount=claim.amount,
        risk_score=risk_score.total_score,
        fraud_score=fraud_result.fraud_score,
        coverage_amount=premium['coverage_amount'],
        policy_level="standard"
    )

    print(f"Decision Matrix:")
    print(f"  Risk Score: {decision.risk_score}/100")
    print(f"  Fraud Score: {decision.fraud_score}/100")
    print(f"  → Status: {decision.status.value.upper()}")
    print(f"  → Decision: {decision.decision.upper()}")
    print(f"  → Confidence: {decision.confidence}%")
    print()

    print(f"Decision Reasoning:")
    for reason in decision.reasons:
        print(f"  • {reason}")
    print()

    # Next step
    next_step = ClaimDecisionEngine.get_next_step(decision)
    print(f"Next Step: {next_step}")
    print()

    # ========== SUMMARY ==========
    print("=" * 80)
    print("📈 SUMMARY")
    print("=" * 80)

    print(f"""
Risk Assessment: {risk_score.risk_level.value.upper()} ({risk_score.total_score}/100)
  • Weather risk driving factor (rainfall, temperature)
  • Premium adjustment: {premium['risk_multiplier']}x base rate

Insurance Premium: ₹{discounted['final_premium']}/week
  • Coverage: ₹{premium['coverage_amount']}
  • ROI: {premium['roi_multiplier']}x
  • Tier: {selected_tier.value.upper()}

Claim Processing:
  • Fraud Score: {fraud_result.fraud_score}/100 ({fraud_result.risk_level.value.upper()})
  • Decision: {decision.decision.upper()}
  • Payout: {'₹' + str(int(decision.payout_amount)) if decision.decision == 'approve' else 'Pending review'}
  • Confidence: {decision.confidence}%
    """)

    print("=" * 80)
    print()


def example_batch_processing():
    """Batch claim processing example"""
    print("🔄 Batch Claim Processing Example")
    print("-" * 80)

    claims = [
        {
            "claim_id": "c001",
            "amount": 5000,
            "risk_score": 20,
            "fraud_score": 10,
            "coverage": 10000,
            "policy_level": "standard"
        },
        {
            "claim_id": "c002",
            "amount": 3000,
            "risk_score": 45,
            "fraud_score": 65,
            "coverage": 5000,
            "policy_level": "basic"
        },
        {
            "claim_id": "c003",
            "amount": 8000,
            "risk_score": 30,
            "fraud_score": 85,
            "coverage": 10000,
            "policy_level": "premium"
        },
        {
            "claim_id": "c004",
            "amount": 2000,
            "risk_score": 60,
            "fraud_score": 40,
            "coverage": 5000,
            "policy_level": "standard"
        },
    ]

    result = ClaimDecisionEngine.batch_process_claims(claims)

    print(f"Processing {result['statistics']['total_claims']} claims...")
    print()
    print(f"Statistics:")
    print(f"  ✅ Auto-approved: {result['statistics']['auto_approved']}")
    print(f"  ⚠️  Pending verification: {result['statistics']['pending_verification']}")
    print(f"  🔍 Pending review: {result['statistics']['pending_review']}")
    print(f"  ❌ Rejected: {result['statistics']['rejected']}")
    print(f"  Total payout: ₹{result['statistics']['total_payout']}")
    print(f"  Average confidence: {result['statistics']['average_confidence']}%")
    print()

    print("Details:")
    for decision in result['decisions']:
        print(f"  Claim {decision.claim_id}: {decision.decision.upper()} (confidence: {decision.confidence}%)")
    print()


if __name__ == "__main__":
    example_complete_workflow()
    print("\n")
    example_batch_processing()
