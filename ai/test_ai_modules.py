"""
Unit tests for GigShield AI modules

Run with: python -m pytest test_ai_modules.py -v
"""

import pytest
from datetime import datetime, timedelta
from risk_calculator import RiskCalculator, RiskLevel, WeatherData
from fraud_detector import FraudDetector, GPSData, ClaimData, FraudLevel
from premium_engine import PremiumEngine, PolicyTier
from claim_decision import ClaimDecisionEngine, ClaimStatus


class TestRiskCalculator:
    """Test risk scoring module"""
    
    def test_low_risk_scenario(self):
        """Normal weather conditions = low risk"""
        weather = WeatherData(
            rainfall_mm=20,
            aqi=150,
            temperature_c=28,
            humidity_pct=60
        )
        risk = RiskCalculator.calculate_risk_score(weather, "Banjara Hills")
        
        assert risk.risk_level == RiskLevel.LOW
        assert 0 <= risk.total_score <= 25
    
    def test_high_risk_scenario(self):
        """Extreme weather = high risk"""
        weather = WeatherData(
            rainfall_mm=100,
            aqi=400,
            temperature_c=42,
            humidity_pct=85
        )
        risk = RiskCalculator.calculate_risk_score(weather, "Charminar")
        
        assert risk.risk_level == RiskLevel.HIGH
        assert 50 <= risk.total_score <= 100
    
    def test_critical_risk_scenario(self):
        """Worst case weather = critical risk"""
        weather = WeatherData(
            rainfall_mm=120,
            aqi=500,
            temperature_c=45,
            humidity_pct=90
        )
        risk = RiskCalculator.calculate_risk_score(weather, "Urban Zone")
        
        assert risk.risk_level == RiskLevel.CRITICAL
        assert risk.total_score >= 75
    
    def test_medium_risk_scenario(self):
        """Mixed conditions = medium risk"""
        weather = WeatherData(
            rainfall_mm=50,
            aqi=250,
            temperature_c=32,
            humidity_pct=70
        )
        risk = RiskCalculator.calculate_risk_score(weather, "Dilsukhnagar")
        
        assert risk.risk_level == RiskLevel.MEDIUM
        assert 25 <= risk.total_score <= 50


class TestFraudDetector:
    """Test fraud detection module"""
    
    def test_clean_claim(self):
        """No fraud indicators = low fraud"""
        detector = FraudDetector()
        
        claim = ClaimData(
            user_id="user_123",
            claim_id="claim_001",
            amount=2000,
            claimed_rainfall=50,
            claimed_aqi=300,
            claimed_temperature=35,
            gps_data=GPSData(17.385, 78.487, 50, datetime.now())
        )
        
        result = detector.analyze_fraud(
            claim,
            actual_rainfall=48,
            actual_aqi=298,
            previous_gps_lat=17.386,
            previous_gps_lon=78.488,
            previous_gps_timestamp=datetime.now() - timedelta(hours=2)
        )
        
        assert result.fraud_level == FraudLevel.LOW
        assert result.fraud_score < 25
    
    def test_suspicious_claim(self):
        """Multiple indicators = high fraud"""
        detector = FraudDetector()
        
        claim = ClaimData(
            user_id="user_456",
            claim_id="claim_002",
            amount=5000,
            claimed_rainfall=80,
            claimed_aqi=450,
            claimed_temperature=40,
            gps_data=GPSData(17.385, 78.487, 50, datetime.now())
        )
        
        # Weather mismatch
        result = detector.analyze_fraud(
            claim,
            actual_rainfall=10,  # Huge mismatch
            actual_aqi=150,      # Huge mismatch
            previous_gps_lat=17.385,
            previous_gps_lon=78.487,
            previous_gps_timestamp=datetime.now() - timedelta(hours=1)
        )
        
        assert result.fraud_level == FraudLevel.HIGH
        assert result.fraud_score > 50
    
    def test_gps_anomaly(self):
        """Impossible GPS jump = fraud"""
        detector = FraudDetector()
        
        claim = ClaimData(
            user_id="user_789",
            claim_id="claim_003",
            amount=3000,
            claimed_rainfall=60,
            claimed_aqi=300,
            claimed_temperature=35,
            gps_data=GPSData(28.7041, 77.1025, 50, datetime.now())  # Delhi
        )
        
        result = detector.analyze_fraud(
            claim,
            actual_rainfall=55,
            actual_aqi=295,
            previous_gps_lat=17.385,  # Hyderabad - 1500km away!
            previous_gps_lon=78.487,
            previous_gps_timestamp=datetime.now() - timedelta(minutes=30)
        )
        
        assert FraudLevel.HIGH <= result.fraud_level
        assert "GPS" in result.fraud_indicators


class TestPremiumEngine:
    """Test premium calculation"""
    
    def test_basic_tier_low_risk(self):
        """Basic tier + low risk = low premium"""
        premium = PremiumEngine.calculate_premium(
            tier=PolicyTier.BASIC,
            risk_level="low",
            weeks=1
        )
        
        assert premium['tier'] == 'BASIC'
        assert premium['adjusted_premium_weekly'] <= 20 * 0.9  # With discount
    
    def test_premium_tier_critical_risk(self):
        """Premium tier + critical risk = high premium"""
        premium = PremiumEngine.calculate_premium(
            tier=PolicyTier.PREMIUM,
            risk_level="critical",
            weeks=4
        )
        
        assert premium['tier'] == 'PREMIUM'
        assert premium['adjusted_premium_weekly'] >= 50 * 1.6  # With surcharge
    
    def test_coverage_limits(self):
        """Coverage amounts match policy tier"""
        basic = PremiumEngine.calculate_premium(
            PolicyTier.BASIC, "medium", 1
        )
        standard = PremiumEngine.calculate_premium(
            PolicyTier.STANDARD, "medium", 1
        )
        premium = PremiumEngine.calculate_premium(
            PolicyTier.PREMIUM, "medium", 1
        )
        
        assert basic['coverage_amount'] == 1000
        assert standard['coverage_amount'] == 5000
        assert premium['coverage_amount'] == 10000


class TestClaimDecisionEngine:
    """Test claim approval/rejection logic"""
    
    def test_auto_approve_low_risk_low_fraud(self):
        """Low risk + low fraud = auto approve"""
        decision = ClaimDecisionEngine.decide_claim(
            claim_id="claim_auto_001",
            claim_amount=2000,
            risk_score=15,
            fraud_score=10,
            coverage_amount=5000,
            policy_level="standard"
        )
        
        assert decision.status == ClaimStatus.AUTO_APPROVED
        assert decision.payout_amount == 2000
        assert decision.confidence >= 90
    
    def test_verification_medium_fraud(self):
        """Medium fraud = needs verification"""
        decision = ClaimDecisionEngine.decide_claim(
            claim_id="claim_verify_001",
            claim_amount=3000,
            risk_score=40,
            fraud_score=35,
            coverage_amount=5000,
            policy_level="standard"
        )
        
        assert decision.status == ClaimStatus.PENDING_VERIFICATION
        assert decision.confidence < 85
    
    def test_rejection_high_fraud(self):
        """High fraud = reject"""
        decision = ClaimDecisionEngine.decide_claim(
            claim_id="claim_reject_001",
            claim_amount=4000,
            risk_score=80,
            fraud_score=75,
            coverage_amount=5000,
            policy_level="standard"
        )
        
        assert decision.status == ClaimStatus.REJECTED
        assert decision.payout_amount == 0
    
    def test_claim_limit_capping(self):
        """Payout cannot exceed coverage"""
        decision = ClaimDecisionEngine.decide_claim(
            claim_id="claim_cap_001",
            claim_amount=8000,  # More than coverage
            risk_score=20,
            fraud_score=5,
            coverage_amount=5000,
            policy_level="premium"
        )
        
        assert decision.payout_amount <= 5000
    
    def test_basic_tier_smaller_payout(self):
        """Basic tier may have lower max payout"""
        decision = ClaimDecisionEngine.decide_claim(
            claim_id="claim_basic_001",
            claim_amount=2000,
            risk_score=15,
            fraud_score=5,
            coverage_amount=1000,
            policy_level="basic"
        )
        
        assert decision.payout_amount <= 1000


class TestIntegration:
    """Test complete workflow"""
    
    def test_end_to_end_pipeline(self):
        """Full workflow: risk → premium → fraud → decision"""
        
        # Step 1: Calculate risk
        weather = WeatherData(65, 320, 38, 75)
        risk = RiskCalculator.calculate_risk_score(weather, "Dilsukhnagar")
        assert risk.risk_level == RiskLevel.MEDIUM
        
        # Step 2: Get premium
        premium = PremiumEngine.calculate_premium(
            PolicyTier.STANDARD,
            risk.risk_level.value,
            4
        )
        assert premium['coverage_amount'] == 5000
        
        # Step 3: Analyze fraud
        detector = FraudDetector()
        claim = ClaimData(
            "user_flow", "claim_flow",
            3000,
            65, 320, 38,
            GPSData(17.385, 78.487, 50, datetime.now())
        )
        fraud = detector.analyze_fraud(
            claim, 65, 320,
            17.385, 78.487,
            datetime.now() - timedelta(hours=2)
        )
        
        # Step 4: Make decision
        decision = ClaimDecisionEngine.decide_claim(
            "claim_flow",
            3000,
            risk.total_score,
            fraud.fraud_score,
            premium['coverage_amount'],
            "standard"
        )
        
        assert decision.status in [
            ClaimStatus.AUTO_APPROVED,
            ClaimStatus.PENDING_VERIFICATION,
            ClaimStatus.PENDING_REVIEW
        ]
        assert decision.payout_amount <= premium['coverage_amount']


# Performance tests
class TestPerformance:
    """Test module performance"""
    
    def test_risk_calculation_speed(self):
        """Risk calculation should be < 100ms"""
        import time
        
        weather = WeatherData(50, 300, 35, 70)
        
        start = time.time()
        for _ in range(100):
            RiskCalculator.calculate_risk_score(weather, "Test")
        elapsed = (time.time() - start) / 100
        
        assert elapsed < 0.1  # 100ms
    
    def test_fraud_detection_speed(self):
        """Fraud detection should be < 200ms"""
        import time
        
        detector = FraudDetector()
        claim = ClaimData(
            "u1", "c1", 2000, 50, 300, 35,
            GPSData(17.385, 78.487, 50, datetime.now())
        )
        
        start = time.time()
        for _ in range(50):
            detector.analyze_fraud(claim, 50, 300, 17.385, 78.487, datetime.now())
        elapsed = (time.time() - start) / 50
        
        assert elapsed < 0.2  # 200ms


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
