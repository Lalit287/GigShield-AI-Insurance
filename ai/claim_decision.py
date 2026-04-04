"""Claim Decision Engine for GigShield

Automatic claim approval/rejection based on risk and fraud scores.
Integrates risk scoring and fraud detection for final decision.
"""

from dataclasses import dataclass
from enum import Enum
from typing import Dict, Tuple
from datetime import datetime


class ClaimStatus(Enum):
    """Claim processing status"""
    AUTO_APPROVED = "auto_approved"
    PENDING_VERIFICATION = "pending_verification"
    PENDING_REVIEW = "pending_review"
    APPROVED = "approved"
    REJECTED = "rejected"


@dataclass
class ClaimDecision:
    """Claim decision with reasoning"""
    claim_id: str
    status: ClaimStatus
    decision: str  # "approve", "verify", "reject"
    payout_amount: float
    confidence: float  # 0-100
    reasons: list  # Explanation
    risk_score: float
    fraud_score: float
    processed_at: datetime


class ClaimDecisionEngine:
    """Intelligent claim decision making"""

    # Decision thresholds
    AUTO_APPROVE_FRAUD_THRESHOLD = 25  # Fraud score < 25 → auto approve
    VERIFY_FRAUD_THRESHOLD = 50        # Fraud score 25-50 → verify
    HOLD_FRAUD_THRESHOLD = 75          # Fraud score 50-75 → hold
    AUTO_REJECT_FRAUD_THRESHOLD = 100  # Fraud score >= 75 → reject

    APPROVE_RISK_THRESHOLD = 75        # Risk score < 75 → can approve
    CRITICAL_RISK_THRESHOLD = 85       # Risk score >= 85 → requires review

    @classmethod
    def decide_claim(
        cls,
        claim_id: str,
        claim_amount: float,
        risk_score: float,
        fraud_score: float,
        coverage_amount: float,
        policy_level: str = "standard"
    ) -> ClaimDecision:
        """Make claim decision based on risk and fraud scores

        Decision matrix:
        ┌──────────────┬──────────────┬──────────────┬──────────────┐
        │ Risk\\Fraud   │    Low       │   Medium     │   High/Crit  │
        ├──────────────┼──────────────┼──────────────┼──────────────┤
        │ Low          │ ✅ Auto      │ ⚠️ Verify    │ 🔍 Review    │
        │ Medium       │ ✅ Approve   │ ⚠️ Verify    │ 🔍 Review    │
        │ High         │ ⚠️ Verify    │ 🔍 Review    │ 🔍 Review    │
        │ Critical     │ 🔍 Review    │ 🔍 Review    │ ❌ Reject    │
        └──────────────┴──────────────┴──────────────┴──────────────┘
        """
        reasons = []
        confidence = 0
        payout_amount = 0
        decision_priority = []  # Track decision factors

        # Risk level classification
        if risk_score < 25:
            risk_level = "low"
        elif risk_score < 50:
            risk_level = "medium"
        elif risk_score < 75:
            risk_level = "high"
        else:
            risk_level = "critical"

        # Fraud level classification
        if fraud_score < 25:
            fraud_level = "low"
            decision_priority.append(("fraud", "low", 1))
        elif fraud_score < 50:
            fraud_level = "medium"
            decision_priority.append(("fraud", "medium", 2))
        elif fraud_score < 75:
            fraud_level = "high"
            decision_priority.append(("fraud", "high", 3))
        else:
            fraud_level = "critical"
            decision_priority.append(("fraud", "critical", 4))

        # Add risk priority
        decision_priority.append(("risk", risk_level, {"low": 1, "medium": 2, "high": 3, "critical": 4}[risk_level]))

        # Claim amount validation
        acceptable_amount = claim_amount <= coverage_amount
        if not acceptable_amount:
            reasons.append(f"Amount exceeds coverage (₹{claim_amount} > ₹{coverage_amount})")
            payout_amount = min(claim_amount, coverage_amount)
        else:
            payout_amount = claim_amount

        # --- DECISION LOGIC ---

        # Auto-reject conditions
        if fraud_score >= cls.AUTO_REJECT_FRAUD_THRESHOLD:
            status = ClaimStatus.REJECTED
            decision = "reject"
            confidence = 95
            reasons.append(f"Critical fraud risk (score: {fraud_score}/100)")
            payout_amount = 0
        elif risk_score >= cls.CRITICAL_RISK_THRESHOLD and fraud_score >= cls.HOLD_FRAUD_THRESHOLD:
            status = ClaimStatus.PENDING_REVIEW
            decision = "review"
            confidence = 40
            reasons.append(f"High risk ({risk_score}/100) + high fraud risk ({fraud_score}/100) requires manual review")
            payout_amount = 0
        # Auto-approve conditions
        elif risk_score < cls.APPROVE_RISK_THRESHOLD and fraud_score < cls.AUTO_APPROVE_FRAUD_THRESHOLD:
            status = ClaimStatus.AUTO_APPROVED
            decision = "approve"
            confidence = 92
            reasons.append(f"Low risk ({risk_score}/100) and low fraud risk ({fraud_score}/100)")
        # Verification needed
        elif fraud_score >= cls.VERIFY_FRAUD_THRESHOLD and fraud_score < cls.HOLD_FRAUD_THRESHOLD:
            status = ClaimStatus.PENDING_VERIFICATION
            decision = "verify"
            confidence = 60
            reasons.append(f"Medium fraud risk ({fraud_score}/100) requires verification")
            payout_amount = 0
        # Review needed
        else:
            status = ClaimStatus.PENDING_REVIEW
            decision = "review"
            confidence = 50
            reasons.append(f"Risk/fraud combination requires manual review")
            payout_amount = 0

        # Add contextual information
        if policy_level == "premium":
            if decision != "reject" and fraud_score < cls.HOLD_FRAUD_THRESHOLD:
                confidence += 3
                reasons.append("Premium policy holder: faster processing")

        # Duration-based decision (older policies get faster approval)
        # This would be added in actual implementation with policy dates

        return ClaimDecision(
            claim_id=claim_id,
            status=status,
            decision=decision,
            payout_amount=payout_amount if decision == "approve" else 0,
            confidence=min(confidence, 100),
            reasons=reasons,
            risk_score=round(risk_score, 2),
            fraud_score=round(fraud_score, 2),
            processed_at=datetime.now(),
        )

    @classmethod
    def batch_process_claims(
        cls,
        claims: list
    ) -> Dict:
        """Process multiple claims and generate statistics

        Args:
            claims: List of claim dicts with required fields

        Returns:
            Dict with decision results and statistics
        """
        decisions = []
        stats = {
            "total_claims": len(claims),
            "auto_approved": 0,
            "pending_verification": 0,
            "pending_review": 0,
            "rejected": 0,
            "total_payout": 0,
            "average_confidence": 0,
        }

        for claim in claims:
            decision = cls.decide_claim(
                claim_id=claim.get("claim_id"),
                claim_amount=claim.get("amount"),
                risk_score=claim.get("risk_score"),
                fraud_score=claim.get("fraud_score"),
                coverage_amount=claim.get("coverage"),
                policy_level=claim.get("policy_level", "standard")
            )
            decisions.append(decision)

            # Update stats
            if decision.status == ClaimStatus.AUTO_APPROVED:
                stats["auto_approved"] += 1
            elif decision.status == ClaimStatus.PENDING_VERIFICATION:
                stats["pending_verification"] += 1
            elif decision.status == ClaimStatus.PENDING_REVIEW:
                stats["pending_review"] += 1
            elif decision.status == ClaimStatus.REJECTED:
                stats["rejected"] += 1

            stats["total_payout"] += decision.payout_amount

        if decisions:
            stats["average_confidence"] = round(
                sum(d.confidence for d in decisions) / len(decisions),
                2
            )

        return {
            "decisions": decisions,
            "statistics": stats,
        }

    @classmethod
    def get_next_step(cls, decision: ClaimDecision) -> str:
        """Get next action based on decision"""
        next_steps = {
            ClaimStatus.AUTO_APPROVED: f"Payout ₹{decision.payout_amount} to account within 1 hour",
            ClaimStatus.PENDING_VERIFICATION: "Send verification request to claimant",
            ClaimStatus.PENDING_REVIEW: "Escalate to claims officer for manual review",
            ClaimStatus.APPROVED: f"Process payout of ₹{decision.payout_amount}",
            ClaimStatus.REJECTED: "Send rejection notice with appeal instructions",
        }
        return next_steps.get(decision.status, "Unknown next step")


if __name__ == "__main__":
    # Test case 1: Low risk, low fraud → Auto approve
    decision1 = ClaimDecisionEngine.decide_claim(
        claim_id="claim_1",
        claim_amount=5000,
        risk_score=20,
        fraud_score=10,
        coverage_amount=10000,
        policy_level="standard"
    )
    print(f"Test 1 - Low risk, low fraud:")
    print(f"  Decision: {decision1.decision.upper()}")
    print(f"  Status: {decision1.status.value}")
    print(f"  Payout: ₹{decision1.payout_amount}")
    print(f"  Confidence: {decision1.confidence}%")
    print(f"  Reasons: {decision1.reasons}")
    print()

    # Test case 2: Medium risk, high fraud → Review
    decision2 = ClaimDecisionEngine.decide_claim(
        claim_id="claim_2",
        claim_amount=5000,
        risk_score=45,
        fraud_score=65,
        coverage_amount=10000,
        policy_level="basic"
    )
    print(f"Test 2 - Medium risk, high fraud:")
    print(f"  Decision: {decision2.decision.upper()}")
    print(f"  Status: {decision2.status.value}")
    print(f"  Next step: {ClaimDecisionEngine.get_next_step(decision2)}")
    print()

    # Test case 3: Critical fraud → Reject
    decision3 = ClaimDecisionEngine.decide_claim(
        claim_id="claim_3",
        claim_amount=5000,
        risk_score=30,
        fraud_score=85,
        coverage_amount=10000,
        policy_level="premium"
    )
    print(f"Test 3 - Critical fraud:")
    print(f"  Decision: {decision3.decision.upper()}")
    print(f"  Status: {decision3.status.value}")
    print(f"  Payout: ₹{decision3.payout_amount}")
