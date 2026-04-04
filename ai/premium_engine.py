"""Premium Calculation Engine for GigShield

Calculates insurance premiums based on risk score.
Tiers: Basic (₹20), Standard (₹35), Premium (₹50)
"""

from dataclasses import dataclass
from enum import Enum
from typing import Dict, Tuple


class PolicyTier(Enum):
    """Insurance policy tiers"""
    BASIC = "basic"          # ₹20/week
    STANDARD = "standard"    # ₹35/week
    PREMIUM = "premium"      # ₹50/week


@dataclass
class PolicyTierDetails:
    """Policy tier specifications"""
    tier: PolicyTier
    premium_weekly: float  # ₹ per week
    coverage_amount: float  # Claim payout
    coverage_percentage: float  # Coverage % of premium
    description: str
    features: list


class PremiumEngine:
    """Premium calculation and tier management"""

    # Base premiums (per week in ₹)
    PREMIUM_CONFIG = {
        "basic": {
            "premium": 20,
            "coverage": 1000,
            "coverage_pct": 50,
            "description": "Basic income protection",
            "features": [
                "Single trigger (rainfall/AQI/temperature)",
                "Auto-claim up to ₹1,000",
                "Up to 4 claims/month",
                "Basic fraud protection",
            ]
        },
        "standard": {
            "premium": 35,
            "coverage": 5000,
            "coverage_pct": 70,
            "description": "Comprehensive protection",
            "features": [
                "Multi-trigger (all parameters)",
                "Auto-claim up to ₹5,000",
                "Unlimited claims",
                "Advanced fraud detection",
                "Priority claim processing",
                "Risk alerts & notifications",
            ]
        },
        "premium": {
            "premium": 50,
            "coverage": 10000,
            "coverage_pct": 90,
            "description": "Maximum coverage",
            "features": [
                "All triggers + custom thresholds",
                "Auto-claim up to ₹10,000",
                "Unlimited claims",
                "ML-powered fraud detection",
                "24/7 priority support",
                "Real-time risk dashboard",
                "Claim payout within 2 hours",
                "Zone-wide risk monitoring",
            ]
        },
    }

    # Risk-based multiplier (applied to base premium)
    RISK_MULTIPLIERS = {
        "low": 0.8,      # 20% discount
        "medium": 1.0,   # Base rate
        "high": 1.3,     # 30% surcharge
        "critical": 1.6, # 60% surcharge
    }

    @classmethod
    def get_tier_details(cls, tier: PolicyTier) -> PolicyTierDetails:
        """Get detailed tier information"""
        config = cls.PREMIUM_CONFIG[tier.value]
        return PolicyTierDetails(
            tier=tier,
            premium_weekly=config["premium"],
            coverage_amount=config["coverage"],
            coverage_percentage=config["coverage_pct"],
            description=config["description"],
            features=config["features"],
        )

    @classmethod
    def calculate_premium(
        cls,
        tier: PolicyTier,
        risk_level: str,
        weeks: int = 1
    ) -> Dict:
        """Calculate total premium with risk adjustment

        Args:
            tier: Policy tier (basic, standard, premium)
            risk_level: Risk level (low, medium, high, critical)
            weeks: Coverage period in weeks

        Returns:
            Dict with breakdown and totals
        """
        tier_details = cls.get_tier_details(tier)
        base_premium = tier_details.premium_weekly

        # Apply risk multiplier
        multiplier = cls.RISK_MULTIPLIERS.get(risk_level, 1.0)
        adjusted_premium = base_premium * multiplier

        # Calculate totals
        weekly_premium = round(adjusted_premium, 2)
        total_premium = round(weekly_premium * weeks, 2)
        total_coverage = tier_details.coverage_amount

        # Calculate ROI (coverage / premium)
        roi = round((total_coverage / weekly_premium), 1) if weekly_premium > 0 else 0

        return {
            "tier": tier.value,
            "risk_level": risk_level,
            "risk_multiplier": multiplier,
            "base_premium_weekly": base_premium,
            "adjusted_premium_weekly": weekly_premium,
            "coverage_amount": total_coverage,
            "coverage_percentage": tier_details.coverage_percentage,
            "weeks": weeks,
            "total_premium": total_premium,
            "monthly_equivalent": round(weekly_premium * 4.33, 2),
            "yearly_equivalent": round(weekly_premium * 52, 2),
            "roi_multiplier": roi,  # How many times premium is recovered
            "description": tier_details.description,
            "features": tier_details.features,
        }

    @classmethod
    def recommend_tier(cls, risk_score: float) -> PolicyTier:
        """Recommend policy tier based on risk score

        Low risk (0-25): Recommend Basic
        Medium risk (25-50): Recommend Standard
        High/Critical risk (50+): Recommend Premium
        """
        if risk_score < 25:
            return PolicyTier.BASIC
        elif risk_score < 50:
            return PolicyTier.STANDARD
        else:
            return PolicyTier.PREMIUM

    @classmethod
    def get_all_tier_options(cls, risk_level: str) -> list:
        """Get all tier options with prices for given risk level"""
        return [
            cls.calculate_premium(tier, risk_level)
            for tier in PolicyTier
        ]

    @classmethod
    def apply_coupon_discount(cls, premium: Dict, coupon_code: str) -> Dict:
        """Apply coupon discount to premium

        Coupon codes:
        - WELCOME20: 20% off first purchase
        - FAMILY10: 10% off for adding family
        - RENEWDISCOUNT5: 5% off renewals
        """
        discounts = {
            "WELCOME20": 0.20,
            "FAMILY10": 0.10,
            "RENEWDISCOUNT5": 0.05,
        }

        discount_rate = discounts.get(coupon_code, 0)
        if discount_rate == 0:
            return premium

        discount_amount = round(premium["total_premium"] * discount_rate, 2)
        final_premium = round(premium["total_premium"] - discount_amount, 2)

        return {
            **premium,
            "coupon_code": coupon_code,
            "discount_rate": discount_rate,
            "discount_amount": discount_amount,
            "final_premium": final_premium,
        }


if __name__ == "__main__":
    # Test case 1: Basic tier, low risk
    premium1 = PremiumEngine.calculate_premium(
        PolicyTier.BASIC,
        "low",
        weeks=4
    )
    print("Test 1 - Basic tier, low risk (4 weeks):")
    print(f"  Weekly: ₹{premium1['adjusted_premium_weekly']}")
    print(f"  Total: ₹{premium1['total_premium']}")
    print(f"  Coverage: ₹{premium1['coverage_amount']}")
    print(f"  ROI: {premium1['roi_multiplier']}x")
    print()

    # Test case 2: Premium tier, high risk
    premium2 = PremiumEngine.calculate_premium(
        PolicyTier.PREMIUM,
        "high",
        weeks=4
    )
    print("Test 2 - Premium tier, high risk (4 weeks):")
    print(f"  Weekly: ₹{premium2['adjusted_premium_weekly']}")
    print(f"  Total: ₹{premium2['total_premium']}")
    print(f"  Coverage: ₹{premium2['coverage_amount']}")
    print()

    # Test case 3: Show all tiers for medium risk
    print("Test 3 - All tiers for medium risk:")
    for option in PremiumEngine.get_all_tier_options("medium"):
        print(f"  {option['tier'].upper()}: ₹{option['adjusted_premium_weekly']}/week → ₹{option['total_premium']} (₹{option['coverage_amount']} coverage)")
    print()

    # Test case 4: Coupon discount
    premium3 = PremiumEngine.calculate_premium(PolicyTier.STANDARD, "low", weeks=4)
    discounted = PremiumEngine.apply_coupon_discount(premium3, "WELCOME20")
    print("Test 4 - Coupon WELCOME20:")
    print(f"  Original: ₹{discounted['total_premium'] + discounted['discount_amount']}")
    print(f"  Discount: ₹{discounted['discount_amount']} (-{discounted['discount_rate']*100}%)")
    print(f"  Final: ₹{discounted['final_premium']}")
