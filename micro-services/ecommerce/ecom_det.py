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

class SecurityCheck(BaseModel):
    score: int
    is_suspicious: Optional[bool] = None
    suspicious: Optional[bool] = None
    is_valid: Optional[bool] = None

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
    checks: Dict[str, SecurityCheck]

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
        print(f"[DEBUG] Analyzing product with URL: {product_info.url}")
        analysis_id = str(uuid.uuid4())
        red_flags = []
        verification_checks = {}
        url_flagged = False
        # URL-based risk detection
        suspicious_domains = [
            "suspicious-deals-store.com", "fake-shop.com", "scam-mart.net", "fraudstore.xyz"
        ]
        if product_info.url:
            for domain in suspicious_domains:
                if domain in product_info.url:
                    red_flags.append(f"Suspicious domain detected: {domain}")
                    verification_checks["url"] = "Domain is on scam list"
                    url_flagged = True
            if any(x in product_info.url for x in [".xyz", "/bitcoin", "/crypto", "pay-now"]):
                red_flags.append("Suspicious URL pattern detected")
                verification_checks["url_pattern"] = "URL contains suspicious pattern"
                url_flagged = True

        seller_score, seller_flags = self._check_seller(product_info.seller)
        desc_score, desc_flags = self._analyze_description(product_info.description)
        price_score, price_flags = self._check_price(product_info.price)
        red_flags.extend(seller_flags + desc_flags + price_flags)

        all_scores = [seller_score, desc_score, price_score]
        url_risk_score = 80 if url_flagged else 0
        if url_flagged:
            confidence_score = url_risk_score
            risk_level = "HIGH"
            is_suspicious = True
            reason = "Suspicious URL detected"
        else:
            confidence_score = sum(all_scores) / len([s for s in all_scores if s is not None])
            risk_level = self._calculate_risk_level(confidence_score, len(red_flags))
            is_suspicious = confidence_score > 60 or len(red_flags) >= 3
            reason = "High confidence score" if confidence_score > 60 else "Multiple red flags" if len(red_flags) >= 3 else "Low risk indicators"

        print(f"[DEBUG] Result: score={confidence_score}, level={risk_level}, red_flags={red_flags}")
        print(f"[DEBUG] URL: {product_info.url}, url_flagged: {url_flagged}, confidence_score: {confidence_score}")
        # --- Security Checks (placeholder logic) ---
        checks = {
            "domain": SecurityCheck(score=80 if url_flagged else 100, is_suspicious=url_flagged),
            "ssl": SecurityCheck(score=100, is_valid=True),
            "contact_info": SecurityCheck(score=100, suspicious=False),
            "customer_reviews": SecurityCheck(score=100, is_suspicious=False),
            "payment_security": SecurityCheck(score=100, is_suspicious=False)
        }
        if url_flagged:
            checks["domain"].score = 20
            checks["domain"].is_suspicious = True
        # --- End Security Checks ---

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
            final_prediction_reason=reason,
            checks=checks
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
