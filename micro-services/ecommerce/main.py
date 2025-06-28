from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import uuid
from ecom_det import (
    FakeEcommerceDetectorAPI,
    ProductInfoRequest,
    DetectionResponse,
    BatchAnalysisRequest,
    BatchAnalysisResponse
)

app = FastAPI(title="FactSniff E-Commerce Detector", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

detector = FakeEcommerceDetectorAPI()

@app.get("/")
async def root():
    return {"message": "Fake E-Commerce Detector API v1.0.0", "status": "active"}

@app.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.now()}

@app.post("/analyze", response_model=DetectionResponse)
async def analyze(product_info: ProductInfoRequest):
    return detector.analyze_product(product_info)

@app.post("/batch-analyze", response_model=BatchAnalysisResponse)
async def batch_analyze(batch_request: BatchAnalysisRequest):
    results = {}
    suspicious = 0
    for p in batch_request.products:
        r = detector.analyze_product(p)
        results[p.name] = r
        if r.is_suspicious:
            suspicious += 1
    return BatchAnalysisResponse(
        total_analyzed=len(batch_request.products),
        suspicious_count=suspicious,
        results=results,
        batch_id=str(uuid.uuid4()),
        timestamp=datetime.now()
    )
