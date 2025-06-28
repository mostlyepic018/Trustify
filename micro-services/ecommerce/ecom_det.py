from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from datetime import datetime
from enum import Enum

# ------------------------------- Pydantic Models -------------------------------

class ProductInfoRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=200, description="Product name")
    url: Optional[str] = None
    price: Optional[str] = None
    seller: Optional[str] = None
    description: Optional[str] = None
    images: Optional[List[str]] = None
    posted_date: Optional[str] = None
    category: Optional[str] = None
    brand: Optional[str] = None
    ratings: Optional[float] = None
    reviews: Optional[List[str]] = None

class RiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class DetectionResponse(BaseModel):
    is_suspicious: bool
    confidence_score: float = Field(..., ge=0, le=100)
    risk_level: RiskLevel
    red_flags: List[str]
    warnings: List[str]
    recommendations: List[str]
    verification_checks: Dict[str, str]
    analysis_id: str
    timestamp: datetime
    final_prediction_reason: Optional[str] = None

class BatchAnalysisRequest(BaseModel):
    products: List[ProductInfoRequest] = Field(..., max_items=50)

class BatchAnalysisResponse(BaseModel):
    total_analyzed: int
    suspicious_count: int
    results: Dict[str, DetectionResponse]
    batch_id: str
    timestamp: datetime

# ------------------------------- Detector Core -------------------------------

class FakeEcommerceDetectorAPI:
    def __init__(self):
        self.suspicious_sellers = {"unknown", "anonymous", "no name"}
        self.red_flag_keywords = {"too good to be true", "guaranteed", "no returns", "urgent", "limited stock", "pay upfront", "wire transfer", "bitcoin", "cryptocurrency"}
        self.analysis_cache = {}

    def analyze_product(self, product_info: ProductInfoRequest) -> DetectionResponse:
        import uuid
        analysis_id = str(uuid.uuid4())
        red_flags = []
        verification_checks = {}

        seller_score, seller_flags = self._check_seller(product_info.seller)
        desc_score, desc_flags = self._analyze_description(product_info.description)
        price_score, price_flags = self._check_price(product_info.price)
        red_flags.extend(seller_flags + desc_flags + price_flags)

        all_scores = [seller_score, desc_score, price_score]
        confidence_score = sum(all_scores) / len([s for s in all_scores if s is not None])
        risk_level = self._calculate_risk_level(confidence_score, len(red_flags))
        is_suspicious = confidence_score > 60 or len(red_flags) >= 3
        reason = "High confidence score" if confidence_score > 60 else "Multiple red flags" if len(red_flags) >= 3 else "Low risk indicators"

        result = DetectionResponse(
            is_suspicious=is_suspicious,
            confidence_score=round(confidence_score, 2),
            risk_level=RiskLevel(risk_level),
            red_flags=red_flags,
            warnings=self._generate_warnings(risk_level, red_flags),
            recommendations=self._generate_recommendations(risk_level),
            verification_checks=verification_checks,
            analysis_id=analysis_id,
            timestamp=datetime.now(),
            final_prediction_reason=reason
        )
        self.analysis_cache[analysis_id] = result
        return result

    def _check_seller(self, seller):
        flags = []
        score = 0
        if seller and seller.lower() in self.suspicious_sellers:
            flags.append("Suspicious seller name")
            score += 30
        return score, flags

    def _analyze_description(self, desc):
        flags = []
        score = 0
        if desc:
            lower = desc.lower()
            for keyword in self.red_flag_keywords:
                if keyword in lower:
                    flags.append(f"Suspicious keyword found: {keyword}")
                    score += 10
        return score, flags

    def _check_price(self, price):
        flags = []
        score = 0
        if price:
            try:
                p = float(price.replace("$", "").replace(",", ""))
                if p < 1:
                    flags.append("Unrealistically low price")
                    score += 30
            except:
                pass
        return score, flags

    def _calculate_risk_level(self, score, red_flags):
        if score >= 80 or red_flags >= 5:
            return "CRITICAL"
        elif score >= 60 or red_flags >= 3:
            return "HIGH"
        elif score >= 40 or red_flags >= 2:
            return "MEDIUM"
        return "LOW"

    def _generate_warnings(self, level, red_flags):
        warnings = []
        if level == "CRITICAL":
            warnings.append("🚨 CRITICAL: Likely scam product")
        elif level == "HIGH":
            warnings.append("🔴 HIGH RISK: Multiple red flags")
        elif level == "MEDIUM":
            warnings.append("🟡 CAUTION: Some indicators of scam")
        if any("no returns" in f for f in red_flags):
            warnings.append("⚠️ No returns policy")
        return warnings

    def _generate_recommendations(self, level):
        base = [
            "Research seller independently",
            "Check product reviews and ratings",
            "Verify product authenticity",
            "Avoid paying via wire transfer or crypto",
            "Request proof of product before purchase"
        ]
        if level in ["HIGH", "CRITICAL"]:
            base += [
                "DO NOT provide personal financial information",
                "DO NOT pay any upfront fees",
                "Report to authorities if confirmed scam"
            ]
        return base
