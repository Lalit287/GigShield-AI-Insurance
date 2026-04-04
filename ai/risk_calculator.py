"""Risk Scoring Model for GigShield

Calculates insurance risk score based on weather, air quality, and location factors.
Score range: 0-100 (Low to Critical)
"""

import math
from dataclasses import dataclass
from enum import Enum
from typing import Dict, Tuple


class RiskLevel(Enum):
    """Risk level classification"""
    LOW = "low"          # 0-25
    MEDIUM = "medium"    # 25-50
    HIGH = "high"        # 50-75
    CRITICAL = "critical" # 75-100


@dataclass
class WeatherData:
    """Weather metrics"""
    rainfall_mm: float      # millimeters
    aqi: float              # air quality index (0-500)
    temperature_c: float    # celsius
    humidity_pct: float = 60.0  # percentage


@dataclass
class RiskScore:
    """Risk calculation result"""
    total_score: float
    weather_risk: float
    aqi_risk: float
    location_risk: float
    risk_level: RiskLevel
    alerts: list


class RiskCalculator:
    """Multi-factor risk scoring engine"""

    # Weight distribution
    WEATHER_WEIGHT = 0.40  # 40%
    AQI_WEIGHT = 0.30      # 30%
    LOCATION_WEIGHT = 0.30 # 30%

    # Thresholds for triggers
    RAINFALL_THRESHOLD = 50.0  # mm
    AQI_THRESHOLD = 300
    TEMP_THRESHOLD = 42.0  # °C

    # Zone-based location risk baseline
    ZONE_RISK_BASELINE = {
        "Hyderabad Central": 50,
        "Secunderabad": 55,
        "Dilsukhnagar": 65,
        "Outerring": 45,
        "Telangana Rural": 70,
    }

    @staticmethod
    def calculate_weather_risk(weather: WeatherData) -> Tuple[float, list]:
        """Calculate weather risk component (0-100)

        Formula:
        - Rainfall component: (actual / threshold) × 30
        - Temperature component: ((temp - 25) / (42 - 25)) × 40
        - Humidity component: |actual - baseline| × 30
        """
        alerts = []
        components = []

        # Rainfall risk
        rainfall_normalized = min(weather.rainfall_mm / RiskCalculator.RAINFALL_THRESHOLD, 3.0)
        rainfall_risk = rainfall_normalized * 30
        if weather.rainfall_mm > RiskCalculator.RAINFALL_THRESHOLD:
            alerts.append(f"Heavy rainfall: {weather.rainfall_mm}mm (threshold: {RiskCalculator.RAINFALL_THRESHOLD}mm)")
        components.append(rainfall_risk)

        # Temperature risk
        base_temp = 25
        max_temp = 42
        if weather.temperature_c >= base_temp:
            temp_normalized = min((weather.temperature_c - base_temp) / (max_temp - base_temp), 2.0)
            temp_risk = temp_normalized * 40
            if weather.temperature_c > RiskCalculator.TEMP_THRESHOLD:
                alerts.append(f"Extreme heat: {weather.temperature_c}°C (threshold: {RiskCalculator.TEMP_THRESHOLD}°C)")
        else:
            temp_risk = 0
        components.append(temp_risk)

        # Humidity risk (deviation from 60%)
        baseline_humidity = 60
        humidity_deviation = abs(weather.humidity_pct - baseline_humidity)
        humidity_risk = min((humidity_deviation / 40) * 30, 30)
        components.append(humidity_risk)

        weather_risk = sum(components)
        return min(weather_risk, 100), alerts

    @staticmethod
    def calculate_aqi_risk(aqi: float) -> Tuple[float, list]:
        """Calculate air quality risk component (0-100)

        AQI Scale:
        0-50: Good (0-10 risk)
        51-100: Moderate (10-25 risk)
        101-150: Unhealthy for sensitive groups (25-40 risk)
        151-200: Unhealthy (40-60 risk)
        201-300: Very unhealthy (60-80 risk)
        301+: Hazardous (80-100 risk)
        """
        alerts = []

        if aqi < 0:
            aqi_risk = 0
        elif aqi <= 50:
            aqi_risk = (aqi / 50) * 10
        elif aqi <= 100:
            aqi_risk = 10 + ((aqi - 50) / 50) * 15
        elif aqi <= 150:
            aqi_risk = 25 + ((aqi - 100) / 50) * 15
        elif aqi <= 200:
            aqi_risk = 40 + ((aqi - 150) / 50) * 20
        elif aqi <= 300:
            aqi_risk = 60 + ((aqi - 200) / 100) * 20
        else:
            aqi_risk = min((aqi / 500) * 100, 100)  # Hazardous

        if aqi > RiskCalculator.AQI_THRESHOLD:
            alerts.append(f"Hazardous AQI: {aqi} (threshold: {RiskCalculator.AQI_THRESHOLD})")

        return min(aqi_risk, 100), alerts

    @staticmethod
    def calculate_location_risk(zone: str) -> float:
        """Calculate location-based risk component (0-100)

        Baseline risk varies by zone based on historical patterns.
        """
        return RiskCalculator.ZONE_RISK_BASELINE.get(zone, 60)

    @classmethod
    def calculate_risk_score(cls, weather: WeatherData, zone: str) -> RiskScore:
        """Calculate comprehensive risk score

        Returns:
            RiskScore object with total score and components
        """
        # Calculate individual components
        weather_risk, weather_alerts = cls.calculate_weather_risk(weather)
        aqi_risk, aqi_alerts = cls.calculate_aqi_risk(weather.aqi)
        location_risk = cls.calculate_location_risk(zone)

        # Combine with weights
        total_score = (
            (weather_risk * cls.WEATHER_WEIGHT) +
            (aqi_risk * cls.AQI_WEIGHT) +
            (location_risk * cls.LOCATION_WEIGHT)
        )

        # Determine risk level
        if total_score < 25:
            risk_level = RiskLevel.LOW
        elif total_score < 50:
            risk_level = RiskLevel.MEDIUM
        elif total_score < 75:
            risk_level = RiskLevel.HIGH
        else:
            risk_level = RiskLevel.CRITICAL

        # Combine alerts
        all_alerts = weather_alerts + aqi_alerts

        return RiskScore(
            total_score=round(total_score, 2),
            weather_risk=round(weather_risk, 2),
            aqi_risk=round(aqi_risk, 2),
            location_risk=round(location_risk, 2),
            risk_level=risk_level,
            alerts=all_alerts,
        )

    @classmethod
    def check_claim_triggers(cls, weather: WeatherData) -> Tuple[bool, list]:
        """Check if any claim triggers are met

        Auto-triggers claim if:
        - Rainfall > 50mm
        - AQI > 300
        - Temperature > 42°C
        """
        triggers = []
        should_trigger = False

        if weather.rainfall_mm > cls.RAINFALL_THRESHOLD:
            triggers.append({"type": "rainfall", "value": weather.rainfall_mm})
            should_trigger = True

        if weather.aqi > cls.AQI_THRESHOLD:
            triggers.append({"type": "aqi", "value": weather.aqi})
            should_trigger = True

        if weather.temperature_c > cls.TEMP_THRESHOLD:
            triggers.append({"type": "temperature", "value": weather.temperature_c})
            should_trigger = True

        return should_trigger, triggers


# Example usage
if __name__ == "__main__":
    # Test case 1: Good conditions
    weather1 = WeatherData(
        rainfall_mm=10,
        aqi=80,
        temperature_c=28,
        humidity_pct=65
    )
    score1 = RiskCalculator.calculate_risk_score(weather1, "Hyderabad Central")
    print(f"Test 1 - Good conditions:")
    print(f"  Score: {score1.total_score} ({score1.risk_level.value})")
    print(f"  Components: Weather={score1.weather_risk}, AQI={score1.aqi_risk}, Location={score1.location_risk}")
    print()

    # Test case 2: Heavy rainfall + high AQI
    weather2 = WeatherData(
        rainfall_mm=75,
        aqi=350,
        temperature_c=35,
        humidity_pct=80
    )
    score2 = RiskCalculator.calculate_risk_score(weather2, "Dilsukhnagar")
    print(f"Test 2 - Heavy rainfall + high AQI:")
    print(f"  Score: {score2.total_score} ({score2.risk_level.value})")
    print(f"  Alerts: {score2.alerts}")
    print()

    # Test case 3: Check claim triggers
    should_trigger, triggers = RiskCalculator.check_claim_triggers(weather2)
    print(f"Test 3 - Claim triggers:")
    print(f"  Should trigger: {should_trigger}")
    print(f"  Triggers: {triggers}")
