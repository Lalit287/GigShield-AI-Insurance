"""
Utility functions for GigShield AI modules
Helper functions for validation, logging, and backend integration
"""

import json
import logging
from datetime import datetime
from typing import Dict, Any, Tuple, Optional
from enum import Enum

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('GigShield-AI')


class ValidationError(Exception):
    """Raised when input validation fails"""
    pass


class WeatherValidator:
    """Validate weather data inputs"""
    
    # Valid ranges for weather parameters
    RAINFALL_MIN = 0
    RAINFALL_MAX = 500  # mm
    
    AQI_MIN = 0
    AQI_MAX = 500
    
    TEMPERATURE_MIN = -10  # °C
    TEMPERATURE_MAX = 50
    
    HUMIDITY_MIN = 0
    HUMIDITY_MAX = 100
    
    @staticmethod
    def validate_rainfall(rainfall: float) -> bool:
        """Check if rainfall is within valid range"""
        if not isinstance(rainfall, (int, float)):
            raise ValidationError(f"Rainfall must be numeric, got {type(rainfall)}")
        if not (WeatherValidator.RAINFALL_MIN <= rainfall <= WeatherValidator.RAINFALL_MAX):
            raise ValidationError(
                f"Rainfall {rainfall}mm out of range "
                f"({WeatherValidator.RAINFALL_MIN}-{WeatherValidator.RAINFALL_MAX})"
            )
        return True
    
    @staticmethod
    def validate_aqi(aqi: float) -> bool:
        """Check if AQI is within valid range"""
        if not isinstance(aqi, (int, float)):
            raise ValidationError(f"AQI must be numeric, got {type(aqi)}")
        if not (WeatherValidator.AQI_MIN <= aqi <= WeatherValidator.AQI_MAX):
            raise ValidationError(
                f"AQI {aqi} out of range ({WeatherValidator.AQI_MIN}-{WeatherValidator.AQI_MAX})"
            )
        return True
    
    @staticmethod
    def validate_temperature(temperature: float) -> bool:
        """Check if temperature is within valid range"""
        if not isinstance(temperature, (int, float)):
            raise ValidationError(f"Temperature must be numeric, got {type(temperature)}")
        if not (WeatherValidator.TEMPERATURE_MIN <= temperature <= WeatherValidator.TEMPERATURE_MAX):
            raise ValidationError(
                f"Temperature {temperature}°C out of range "
                f"({WeatherValidator.TEMPERATURE_MIN}-{WeatherValidator.TEMPERATURE_MAX})"
            )
        return True
    
    @staticmethod
    def validate_humidity(humidity: float) -> bool:
        """Check if humidity is within valid range"""
        if not isinstance(humidity, (int, float)):
            raise ValidationError(f"Humidity must be numeric, got {type(humidity)}")
        if not (WeatherValidator.HUMIDITY_MIN <= humidity <= WeatherValidator.HUMIDITY_MAX):
            raise ValidationError(
                f"Humidity {humidity}% out of range "
                f"({WeatherValidator.HUMIDITY_MIN}-{WeatherValidator.HUMIDITY_MAX})"
            )
        return True
    
    @staticmethod
    def validate_all(rainfall: float, aqi: float, temperature: float, humidity: float = 50):
        """Validate all weather parameters"""
        WeatherValidator.validate_rainfall(rainfall)
        WeatherValidator.validate_aqi(aqi)
        WeatherValidator.validate_temperature(temperature)
        WeatherValidator.validate_humidity(humidity)
        logger.info(f"Weather data validated: rain={rainfall}mm, AQI={aqi}, temp={temperature}°C")
        return True


class ClaimValidator:
    """Validate claim data inputs"""
    
    AMOUNT_MIN = 100
    AMOUNT_MAX = 100000  # Rupees
    
    @staticmethod
    def validate_claim_amount(amount: float) -> bool:
        """Check if claim amount is reasonable"""
        if not isinstance(amount, (int, float)):
            raise ValidationError(f"Amount must be numeric, got {type(amount)}")
        if not (ClaimValidator.AMOUNT_MIN <= amount <= ClaimValidator.AMOUNT_MAX):
            raise ValidationError(
                f"Amount {amount} out of range "
                f"(₹{ClaimValidator.AMOUNT_MIN}-₹{ClaimValidator.AMOUNT_MAX})"
            )
        return True
    
    @staticmethod
    def validate_gps(latitude: float, longitude: float) -> bool:
        """Check if GPS coordinates are valid"""
        if not (-90 <= latitude <= 90):
            raise ValidationError(f"Latitude {latitude} out of range (-90 to 90)")
        if not (-180 <= longitude <= 180):
            raise ValidationError(f"Longitude {longitude} out of range (-180 to 180)")
        # Check if within India (roughly)
        if not (8 <= latitude <= 35 and 68 <= longitude <= 97):
            logger.warning(f"GPS coordinates ({latitude}, {longitude}) outside India")
        return True
    
    @staticmethod
    def validate_claim_data(claim_amount: float, latitude: float, longitude: float):
        """Validate all claim parameters"""
        ClaimValidator.validate_claim_amount(claim_amount)
        ClaimValidator.validate_gps(latitude, longitude)
        logger.info(f"Claim data validated: amount=₹{claim_amount}, location=({latitude}, {longitude})")
        return True


class GeoDistance:
    """Calculate distances between GPS coordinates"""
    
    # Earth radius in km
    EARTH_RADIUS = 6371
    
    @staticmethod
    def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """
        Calculate distance between two GPS coordinates in km
        
        Args:
            lat1, lon1: Starting latitude/longitude
            lat2, lon2: Ending latitude/longitude
            
        Returns:
            Distance in kilometers
        """
        import math
        
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        
        a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * \
            math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        
        distance = GeoDistance.EARTH_RADIUS * c
        return distance
    
    @staticmethod
    def is_teleportation(lat1: float, lon1: float, lat2: float, lon2: float,
                          time_minutes: int = 30) -> bool:
        """
        Check if GPS movement is physically impossible
        
        Args:
            lat1, lon1, lat2, lon2: GPS coordinates
            time_minutes: Time between measurements
            
        Returns:
            True if movement is impossible (teleportation suspected)
        """
        distance_km = GeoDistance.haversine_distance(lat1, lon1, lat2, lon2)
        max_speed_kmh = 500  # Jet plane speed
        max_distance_km = (time_minutes / 60) * max_speed_kmh
        
        if distance_km > max_distance_km:
            logger.warning(f"Teleportation detected: {distance_km}km in {time_minutes}m")
            return True
        return False


class DataSerializer:
    """Serialize/deserialize AI module outputs for API responses"""
    
    @staticmethod
    def to_dict(obj: Any) -> Dict[str, Any]:
        """Convert dataclass to dictionary"""
        if hasattr(obj, '__dataclass_fields__'):
            result = {}
            for field_name in obj.__dataclass_fields__:
                value = getattr(obj, field_name)
                if isinstance(value, Enum):
                    result[field_name] = value.value
                elif hasattr(value, '__dataclass_fields__'):
                    result[field_name] = DataSerializer.to_dict(value)
                elif isinstance(value, (list, tuple)):
                    result[field_name] = [
                        DataSerializer.to_dict(v) if hasattr(v, '__dataclass_fields__') else v
                        for v in value
                    ]
                else:
                    result[field_name] = value
            return result
        return obj
    
    @staticmethod
    def to_json(obj: Any) -> str:
        """Convert object to JSON string"""
        return json.dumps(DataSerializer.to_dict(obj), indent=2)
    
    @staticmethod
    def for_api(obj: Any, include_timestamp: bool = True) -> Dict[str, Any]:
        """Format output for REST API response"""
        result = DataSerializer.to_dict(obj)
        if include_timestamp:
            result['timestamp'] = datetime.now().isoformat()
        return result


class WeatherMatcher:
    """Match claimed weather with actual conditions"""
    
    RAINFALL_TOLERANCE = 10  # mm
    AQI_TOLERANCE = 30  # points
    TEMPERATURE_TOLERANCE = 3  # °C
    
    @staticmethod
    def rainfall_match(claimed: float, actual: float, tolerance: Optional[float] = None) -> Tuple[bool, float]:
        """
        Check if claimed rainfall matches actual within tolerance
        
        Returns:
            (matches: bool, divergence_percent: float)
        """
        if tolerance is None:
            tolerance = WeatherMatcher.RAINFALL_TOLERANCE
        
        divergence = abs(claimed - actual)
        matches = divergence <= tolerance
        divergence_percent = (divergence / max(actual, 1)) * 100
        
        return matches, divergence_percent
    
    @staticmethod
    def aqi_match(claimed: float, actual: float, tolerance: Optional[float] = None) -> Tuple[bool, float]:
        """Check if claimed AQI matches actual"""
        if tolerance is None:
            tolerance = WeatherMatcher.AQI_TOLERANCE
        
        divergence = abs(claimed - actual)
        matches = divergence <= tolerance
        divergence_percent = (divergence / max(actual, 1)) * 100
        
        return matches, divergence_percent
    
    @staticmethod
    def temperature_match(claimed: float, actual: float, tolerance: Optional[float] = None) -> Tuple[bool, float]:
        """Check if claimed temperature matches actual"""
        if tolerance is None:
            tolerance = WeatherMatcher.TEMPERATURE_TOLERANCE
        
        divergence = abs(claimed - actual)
        matches = divergence <= tolerance
        
        return matches, divergence


class RiskAlert:
    """Generate risk alerts based on weather conditions"""
    
    @staticmethod
    def generate_alerts(rainfall: float, aqi: float, temperature: float) -> list:
        """Generate human-readable risk alerts"""
        alerts = []
        
        if rainfall > 80:
            alerts.append("🌧️  HEAVY RAINFALL: Extreme weather risk detected")
        elif rainfall > 50:
            alerts.append("🌧️  MODERATE RAINFALL: Weather risk present")
        
        if aqi > 400:
            alerts.append("💨 SEVERE AIR POLLUTION: Unhealthy conditions")
        elif aqi > 300:
            alerts.append("💨 POOR AIR QUALITY: Health impact likely")
        elif aqi > 200:
            alerts.append("⚠️  MODERATE POLLUTION: Sensitive groups at risk")
        
        if temperature > 40:
            alerts.append("🌡️  EXTREME HEAT: High temperature risk")
        elif temperature < 5:
            alerts.append("❄️  EXTREME COLD: Low temperature risk")
        
        return alerts


class AuditLog:
    """Log AI decisions for audit trail"""
    
    def __init__(self, log_file: str = "gigshield_audit.log"):
        self.log_file = log_file
        self.logger = logging.getLogger('GigShield-Audit')
        handler = logging.FileHandler(log_file)
        handler.setFormatter(
            logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
        )
        self.logger.addHandler(handler)
    
    def log_decision(self, claim_id: str, risk_score: float, fraud_score: float,
                    decision: str, payout: float, confidence: float):
        """Log a claim decision"""
        self.logger.info(
            f"CLAIM_DECISION | ID={claim_id} | Risk={risk_score:.1f} | "
            f"Fraud={fraud_score:.1f} | Decision={decision} | "
            f"Payout={payout} | Confidence={confidence:.0f}%"
        )
    
    def log_error(self, claim_id: str, error_type: str, message: str):
        """Log an error"""
        self.logger.error(f"CLAIM_ERROR | ID={claim_id} | {error_type}: {message}")
    
    def get_decision_stats(self) -> Dict[str, Any]:
        """Get decision statistics from audit log"""
        # In production, this would parse the audit log file
        return {
            "total_claims": 0,
            "auto_approved": 0,
            "verification_needed": 0,
            "rejected": 0,
            "avg_confidence": 0
        }


def validate_and_process_claim(claim_data: Dict[str, Any],
                               weather_data: Dict[str, Any]) -> Tuple[bool, str]:
    """
    Validate claim and weather data before processing
    
    Returns:
        (is_valid: bool, error_message: str)
    """
    try:
        # Validate weather data
        WeatherValidator.validate_all(
            weather_data.get('rainfall', 0),
            weather_data.get('aqi', 0),
            weather_data.get('temperature', 0),
            weather_data.get('humidity', 50)
        )
        
        # Validate claim data
        ClaimValidator.validate_claim_data(
            claim_data.get('amount', 0),
            claim_data.get('latitude', 0),
            claim_data.get('longitude', 0)
        )
        
        return True, ""
    
    except ValidationError as e:
        logger.error(f"Validation error: {str(e)}")
        return False, str(e)
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return False, f"Unexpected error: {str(e)}"


# Export main classes
__all__ = [
    'WeatherValidator',
    'ClaimValidator',
    'GeoDistance',
    'DataSerializer',
    'WeatherMatcher',
    'RiskAlert',
    'AuditLog',
    'ValidationError',
    'validate_and_process_claim'
]
