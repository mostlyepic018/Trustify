from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import uuid
from pydantic import BaseModel
from job_offers.job_det import (
    FakeInternshipDetectorAPI,
    CompanyInfoRequest,
    DetectionResponse,
    BatchAnalysisRequest,
    BatchAnalysisResponse,
    ReportScamRequest
)
from ecommerce.ecom_det import FakeEcommerceDetectorAPI, ProductInfoRequest, DetectionResponse
from news.uitls.get_info import get_info
from news.RAG.db import upload_to_pinecone, get_related_docs
from langchain_core.documents import Document

# News verification models
class NewsVerificationRequest(BaseModel):
    statement: str

class NewsVerificationResponse(BaseModel):
    status: str
    verification_result: str
    sources: list[str]
    confidence: float
    timestamp: datetime

app = FastAPI(title="Fact-Sniff Microservices", version="2.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

detector = FakeInternshipDetectorAPI()
ecom_detector = FakeEcommerceDetectorAPI()

@app.get("/")
async def root():
    return {"message": "Fact-Sniff Microservices API v2.0.0", "status": "active"}

@app.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.now()}

@app.post("/job-offers/analyze", response_model=DetectionResponse)
async def analyze(company_info: CompanyInfoRequest):
    return detector.analyze_company(company_info)

@app.post("/job-offers/batch-analyze", response_model=BatchAnalysisResponse)
async def batch_analyze(batch_request: BatchAnalysisRequest):
    results = {}
    suspicious = 0
    for c in batch_request.companies:
        r = detector.analyze_company(c)
        results[c.name] = r
        if r.is_suspicious:
            suspicious += 1
    return BatchAnalysisResponse(
        total_analyzed=len(batch_request.companies),
        suspicious_count=suspicious,
        results=results,
        batch_id=str(uuid.uuid4()),
        timestamp=datetime.now()
    )

@app.get("/job-offers/analysis/{analysis_id}", response_model=DetectionResponse)
async def get_analysis(analysis_id: str):
    if analysis_id not in detector.analysis_cache:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return detector.analysis_cache[analysis_id]

@app.post("/job-offers/report-scam")
async def report_scam(data: ReportScamRequest):
    detector.reported_companies.add(data.company_name.lower())
    return {"message": "Scam report submitted", "report_id": str(uuid.uuid4())}

@app.get("/job-offers/stats")
async def stats():
    total = len(detector.analysis_cache)
    suspicious = len([r for r in detector.analysis_cache.values() if r.is_suspicious])
    return {
        "total_analyses": total,
        "reported_scams": len(detector.reported_companies),
        "suspicious_rate": f"{(suspicious / max(total, 1) * 100):.1f}%",
        "timestamp": datetime.now()
    }

@app.get("/job-offers/risk-levels")
async def risk_levels():
    return {
        "risk_levels": {
            "LOW": {"description": "Minimal indicators", "color": "🟢"},
            "MEDIUM": {"description": "Some suspicion", "color": "🟡"},
            "HIGH": {"description": "Multiple red flags", "color": "🔴"},
            "CRITICAL": {"description": "Likely scam", "color": "🚨"}
        }
    }

@app.post("/ecommerce/product-analyze", response_model=DetectionResponse)
async def analyze_product(product_info: ProductInfoRequest):
    return ecom_detector.analyze_product(product_info)

@app.post("/news/verify", response_model=NewsVerificationResponse)
async def verify_news(request: NewsVerificationRequest):
    try:
        # 1. Get relevant URLs and scrape them
        scraped_results = get_info(request.statement)
        if not scraped_results:
            raise HTTPException(status_code=404, detail="No relevant news articles found")

        # 2. Prepare documents for Pinecone
        docs = []
        sources = []
        for item in scraped_results:
            content = item.get('content', '')
            url = item.get('url', '')
            if content and url:
                docs.append(Document(page_content=content, metadata={'source': url}))
                sources.append(url)

        if not docs:
            raise HTTPException(status_code=404, detail="No content could be extracted from the sources")

        # 3. Upload to Pinecone and get relevant content
        index_name = "news-index"
        namespace = "news"
        upload_to_pinecone(index_name, docs, namespace)
        
        # 4. Get related documents
        related_docs = get_related_docs(index_name, namespace, request.statement)
        
        # 5. Use the verification logic (you'll need to implement the actual verification)
        # This is a placeholder - implement your Gemini verification here
        verification_result = "Verification result would go here"
        confidence = 0.85  # Replace with actual confidence score
        
        return NewsVerificationResponse(
            status="success",
            verification_result=verification_result,
            sources=sources,
            confidence=confidence,
            timestamp=datetime.now()
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
