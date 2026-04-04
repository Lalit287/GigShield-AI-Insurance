"""Fraud Detection Engine for GigShield

Rule-based fraud detection system with 5-point scoring mechanism.
Final fraud score: 0-100 (Low to Critical risk)
"""

from dataclasses import dataclass, field
from enum import Enum
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import math


class FraudRiskLevel(Enum):
    """Fraud risk classification"""
    LOW = "low"          # 0-25
    MEDIUM = "medium"    # 25-50
    HIGH = "high"        # 50-75
    CRITICAL = "critical" # 75-100


@dataclass
class GPSData:
    """GPS coordinates and metadata"""
    latitude: float
    longitude: float
    accuracy_m: float  # accuracy in meters
    timestamp: datetime


@dataclass
class ClaimData:
    """Claim submission details"""
    user_id: str
    claim_id: str
    amount: float
    claimed_rainfall: float
    claimed_aqi: float
    claimed_temperature: float
    gps_data: Optional[GPSData] = None
    timestamp: datetime = field(default_factory=datetime.now)


@dataclass
class FraudDetectionResult:
    """Fraud detection outcome"""
    fraud_score: float  # 0-100
    risk_level: FraudRiskLevel
    flags: List[str]  # Individual fraud indicators
    breakdown: Dict[str, float]  # Score breakdown by component
    recommendation: str  # "auto_approve", "verify", "hold"


class FraudDetector:
    """Multi-signal fraud detection system"""

    # Fraud thresholds
    NO_ACTIVITY_HOURS = 4
    DUPLICATE_CLAIM_HOURS = 24
    GPS_SPOOFING_ACCURACY_M = 1000  # meters
    CLAIM_FREQUENCY_THRESHOLD = 6  # hours between claims

    # Fraud points
    NO_ACTIVITY_POINTS = 25
    DUPLICATE_CLAIM_POINTS = 30
    GPS_ANOMALY_POINTS = 20
    WEATHER_MISMATCH_POINTS = 20
    CLAIM_PATTERN_POINTS = 15

    def __init__(self):
        # Mock database for user claim history
        self.user_claims_history: Dict[str, List[ClaimData]] = {}
        self.user_gps_history: Dict[str, List[GPSData]] = {}

    def detect_no_activity(self, user_id: str, gps_data: Optional[GPSData]) -> tuple:
        """Detect no-activity anomaly (25 pts)

        Flags if:
        - No GPS data provided
        - No recorded activity in past N hours
        """
        points = 0
        flags = []

        if gps_data is None:
            points = self.NO_ACTIVITY_POINTS
            flags.append("No GPS data provided")
            return points, flags

        # Check if recent activity exists
        if user_id in self.user_gps_history:
            recent_gps = self.user_gps_history[user_id]
            if recent_gps:
                last_activity = recent_gps[-1].timestamp
                time_since_activity = datetime.now() - last_activity

                if time_since_activity > timedelta(hours=self.NO_ACTIVITY_HOURS):
                    points = self.NO_ACTIVITY_POINTS
                    hours = time_since_activity.total_seconds() / 3600
                    flags.append(f"No activity for {hours:.1f} hours")

        return points, flags

    def detect_duplicate_claims(self, user_id: str, current_timestamp: datetime) -> tuple:
        """Detect duplicate claim patterns (30 pts)

        Flags if:
        - 3+ claims in 24 hours from same user
        """
        points = 0
        flags = []

        if user_id in self.user_claims_history:
            recent_claims = [
                claim for claim in self.user_claims_history[user_id]
                if (current_timestamp - claim.timestamp).total_seconds() < 24 * 3600
            ]

            if len(recent_claims) >= 3:
                points = self.DUPLICATE_CLAIM_POINTS
                flags.append(f"Multiple claims in 24h window ({len(recent_claims)} claims)")

        return points, flags

    def detect_gps_spoofing(self, user_id: str, current_gps: Optional[GPSData]) -> tuple:
        """Detect GPS spoofing/teleportation (20 pts)

        Flags if:
        - GPS accuracy > 1000m (unreliable)
        - Impossible speed (teleportation between locations)
        """
        points = 0
        flags = []

        if current_gps is None:
            return points, flags

        # Check GPS accuracy
        if current_gps.accuracy_m > self.GPS_SPOOFING_ACCURACY_M:
            points += 10
            flags.append(f"Poor GPS accuracy: {current_gps.accuracy_m}m")

        # Check for teleportation (impossible speeds)
        if user_id in self.user_gps_history:
            previous_gps = self.user_gps_history[user_id][-1]
            distance_m = self._calculate_distance(previous_gps, current_gps)
            time_diff_seconds = (current_gps.timestamp - previous_gps.timestamp).total_seconds()

            if time_diff_seconds > 0:
                speed_ms = distance_m / time_diff_seconds
                max_reasonable_speed = 30  # 30 m/s ≈ 108 km/h

                if speed_ms > max_reasonable_speed:
                    points += 10
                    speed_kmh = speed_ms * 3.6
                    flags.append(f"Impossible speed: {speed_kmh:.1f} km/h")

        return points, flags

    def detect_weather_mismatch(
        self,
        claimed_rainfall: float,
        actual_rainfall: float,
        claimed_aqi: float,
        actual_aqi: float
    ) -> tuple:
        """Detect weather data mismatch (20 pts)

        Flags if:
        - Claimed weather significantly differs from actual weather
        """
        points = 0
        flags = []

        # Rainfall mismatch
        rainfall_diff = abs(claimed_rainfall - actual_rainfall)
        if rainfall_diff > 20:  # 20mm difference threshold
            points += 10
            flags.append(f"Rainfall mismatch: claimed {claimed_rainfall}mm, actual {actual_rainfall}mm")

        # AQI mismatch
        aqi_diff = abs(claimed_aqi - actual_aqi)
        if aqi_diff > 50:  # 50 AQI difference threshold
            points += 10
            flags.append(f"AQI mismatch: claimed {claimed_aqi}, actual {actual_aqi}")

        return min(points, self.WEATHER_MISMATCH_POINTS), flags

    def detect_claim_pattern(self, user_id: str, current_timestamp: datetime) -> tuple:
        """Detect unusual claim patterns (15 pts)

        Flags if:
        - Average time between claims < 6 hours
        """
        points = 0
        flags = []

        if user_id in self.user_claims_history and len(self.user_claims_history[user_id]) > 2:
            recent_claims = [
                claim for claim in self.user_claims_history[user_id]
                if (current_timestamp - claim.timestamp).total_seconds() < 7 * 24 * 3600  # past week
            ]

            if len(recent_claims) >= 3:
                time_diffs = [
                    (recent_claims[i].timestamp - recent_claims[i + 1].timestamp).total_seconds() / 3600
                    for i in range(len(recent_claims) - 1)
                ]
                avg_hours = sum(time_diffs) / len(time_diffs) if time_diffs else 0

                if avg_hours < self.CLAIM_FREQUENCY_THRESHOLD:
                    points = self.CLAIM_PATTERN_POINTS
                    flags.append(f"Frequent claim pattern: avg {avg_hours:.1f}h between claims")

        return points, flags

    def analyze_fraud(
        self,
        claim: ClaimData,
        actual_rainfall: float,
        actual_aqi: float
    ) -> FraudDetectionResult:
        """Comprehensive fraud detection analysis

        Returns:
            FraudDetectionResult with score, risk level, and recommendation
        """
        breakdown = {}
        all_flags = []

        # 1. No Activity Detection
        no_activity_score, no_activity_flags = self.detect_no_activity(
            claim.user_id,
            claim.gps_data
        )
        breakdown["no_activity"] = no_activity_score
        all_flags.extend(no_activity_flags)

        # 2. Duplicate Claims Detection
        duplicate_score, duplicate_flags = self.detect_duplicate_claims(
            claim.user_id,
            claim.timestamp
        )
        breakdown["duplicate_claims"] = duplicate_score
        all_flags.extend(duplicate_flags)

        # 3. GPS Spoofing Detection
        gps_score, gps_flags = self.detect_gps_spoofing(
            claim.user_id,
            claim.gps_data
        )
        breakdown["gps_anomaly"] = gps_score
        all_flags.extend(gps_flags)

        # 4. Weather Mismatch Detection
        weather_score, weather_flags = self.detect_weather_mismatch(
            claim.claimed_rainfall,
            actual_rainfall,
            claim.claimed_aqi,
            actual_aqi
        )
        breakdown["weather_mismatch"] = weather_score
        all_flags.extend(weather_flags)

        # 5. Claim Pattern Detection
        pattern_score, pattern_flags = self.detect_claim_pattern(
            claim.user_id,
            claim.timestamp
        )
        breakdown["claim_pattern"] = pattern_score
        all_flags.extend(pattern_flags)

        # Calculate total fraud score
        total_fraud_score = min(
            sum(breakdown.values()),
            100  # Cap at 100
        )

        # Determine risk level
        if total_fraud_score < 25:
            risk_level = FraudRiskLevel.LOW
            recommendation = "auto_approve"
        elif total_fraud_score < 50:
            risk_level = FraudRiskLevel.MEDIUM
            recommendation = "verify"
        elif total_fraud_score < 75:
            risk_level = FraudRiskLevel.HIGH
            recommendation = "hold"
        else:
            risk_level = FraudRiskLevel.CRITICAL
            recommendation = "hold"

        return FraudDetectionResult(
            fraud_score=round(total_fraud_score, 2),
            risk_level=risk_level,
            flags=all_flags,
            breakdown=breakdown,
            recommendation=recommendation
        )

    def add_claim_to_history(self, claim: ClaimData) -> None:
        """Add claim to user's history"""
        if claim.user_id not in self.user_claims_history:
            self.user_claims_history[claim.user_id] = []
        self.user_claims_history[claim.user_id].append(claim)

    def add_gps_to_history(self, user_id: str, gps_data: GPSData) -> None:
        """Add GPS data to user's history"""
        if user_id not in self.user_gps_history:
            self.user_gps_history[user_id] = []
        self.user_gps_history[user_id].append(gps_data)

    @staticmethod
    def _calculate_distance(gps1: GPSData, gps2: GPSData) -> float:
        """Calculate distance between two GPS coordinates (Haversine formula)

        Returns distance in meters
        """
        R = 6371000  # Earth radius in meters
        lat1, lon1 = math.radians(gps1.latitude), math.radians(gps1.longitude)
        lat2, lon2 = math.radians(gps2.latitude), math.radians(gps2.longitude)

        dlat = lat2 - lat1
        dlon = lon2 - lon1

        a = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
        c = 2 * math.asin(math.sqrt(a))

        return R * c


# Example usage
if __name__ == "__main__":
    detector = FraudDetector()

    # Test case 1: Clean claim
    claim1 = ClaimData(
        user_id="user_1",
        claim_id="claim_1",
        amount=5000,
        claimed_rainfall=60,
        claimed_aqi=350,
        claimed_temperature=35,
        gps_data=GPSData(17.385, 78.4867, 50, datetime.now()),
    )
    result1 = detector.analyze_fraud(claim1, actual_rainfall=58, actual_aqi=340)
    print(f"Test 1 - Clean claim:")
    print(f"  Fraud Score: {result1.fraud_score} ({result1.risk_level.value})")
    print(f"  Recommendation: {result1.recommendation}")
    print()

    # Test case 2: Suspicious claim (no activity)
    claim2 = ClaimData(
        user_id="user_2",
        claim_id="claim_2",
        amount=5000,
        claimed_rainfall=60,
        claimed_aqi=350,
        claimed_temperature=35,
        gps_data=None,  # No GPS
    )
    result2 = detector.analyze_fraud(claim2, actual_rainfall=60, actual_aqi=350)
    print(f"Test 2 - Suspicious claim (no GPS):")
    print(f"  Fraud Score: {result2.fraud_score} ({result2.risk_level.value})")
    print(f"  Flags: {result2.flags}")
    print(f"  Recommendation: {result2.recommendation}")
