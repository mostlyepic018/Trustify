from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import uuid
from job_det import (
    FakeInternshipDetectorAPI,
    CompanyInfoRequest,
    DetectionResponse,
    BatchAnalysisRequest,
    BatchAnalysisResponse,
    ReportScamRequest
)

app = FastAPI(title="Fact-Sniff", version="2.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

detector = FakeInternshipDetectorAPI()

@app.get("/")
async def root():
    return {"message": "Fake Internship Detector API v2.0.0", "status": "active"}

@app.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.now()}

@app.post("/analyze", response_model=DetectionResponse)
async def analyze(company_info: CompanyInfoRequest):
    return detector.analyze_company(company_info)

@app.post("/batch-analyze", response_model=BatchAnalysisResponse)
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

@app.get("/analysis/{analysis_id}", response_model=DetectionResponse)
async def get_analysis(analysis_id: str):
    if analysis_id not in detector.analysis_cache:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return detector.analysis_cache[analysis_id]

@app.post("/report-scam")
async def report_scam(data: ReportScamRequest):
    detector.reported_companies.add(data.company_name.lower())
    return {"message": "Scam report submitted", "report_id": str(uuid.uuid4())}

@app.get("/stats")
async def stats():
    total = len(detector.analysis_cache)
    suspicious = len([r for r in detector.analysis_cache.values() if r.is_suspicious])
    return {
        "total_analyses": total,
        "reported_scams": len(detector.reported_companies),
        "suspicious_rate": f"{(suspicious / max(total, 1) * 100):.1f}%",
        "timestamp": datetime.now()
    }

@app.get("/risk-levels")
async def risk_levels():
    return {
        "risk_levels": {
            "LOW": {"description": "Minimal indicators", "color": "🟢"},
            "MEDIUM": {"description": "Some suspicion", "color": "🟡"},
            "HIGH": {"description": "Multiple red flags", "color": "🔴"},
            "CRITICAL": {"description": "Likely scam", "color": "🚨"}
        }
    }
