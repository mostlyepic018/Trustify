from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Any, Dict
from news.news_main import news_main
from job_offers.job_main import analyze_job_offer
from fastapi.middleware.cors import CORSMiddleware

# Add imports for analyze route
from urllib.parse import urlparse
from ecommerce_detection.app.utils.domain_check import check_domain_age
from ecommerce_detection.app.utils.ssl_check import check_ssl_certificate
from ecommerce_detection.app.utils.logo_check import check_logo_similarity
from ecommerce_detection.app.utils.pattern_check import detect_suspicious_patterns
from ecommerce_detection.app.utils.safe_browsing import check_safe_browsing
from ecommerce_detection.app.utils.whois_check import analyze_whois
from ecommerce_detection.app.utils.headers_check import analyze_headers
from ecommerce_detection.app.utils.link_checker import check_broken_links



# Image detection imports
from transformers import AutoModelForImageClassification, AutoImageProcessor
from PIL import Image
import torch
import os
import io

# Load image model and processor at startup
image_model_path = "../detect-fake-imagee/ai-image-detector-model2/models--Ateeqq--ai-vs-human-image-detector/snapshots"
snapshot_dir = os.path.join(image_model_path, os.listdir(image_model_path)[0])
image_model = AutoModelForImageClassification.from_pretrained(snapshot_dir)
image_processor = AutoImageProcessor.from_pretrained(snapshot_dir, use_fast=True)

class NewsRequest(BaseModel):
    query: str

class JobRequest(BaseModel):
    name: str
    website: str = None
    email: str = None
    phone: str = None
    address: str = None
    job_description: str = None
    salary_offered: str = None
    requirements: str = None
    contact_person: str = None
    company_size: str = None
    industry: str = None
    social_media: Dict[str, Any] = None
    job_post_date: str = None

class UrlRequest(BaseModel):
    url: str

app = FastAPI()
origins = [
    "http://localhost:8080", # The origin of your React app
    # Add other origins if needed
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or specify your frontend URL(s)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
) 

@app.post("/news/verify")
def verify_news(request: NewsRequest):
    try:
        result = news_main(request.query)
        return {"result": result}
    except Exception as e:
        raise HTTPException(status_code=500, querydetail=str(e))

@app.post("/job/analyze")
def analyze_job(request: JobRequest):
    try:
        result = analyze_job_offer(request.dict())
        return {"result": result.dict()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/")
def read_root():
    return {"message": "✅ Fake E-commerce Website Detector is running!"}

@app.post("/analyze")
async def analyze(data: UrlRequest):
    url = data.url

    # ✅ Validate and extract domain
    parsed_url = urlparse(url)
    domain_name = parsed_url.netloc.replace("www.", "") if parsed_url.netloc else parsed_url.path

    # ✅ Perform all checks
    domain_info = check_domain_age(domain_name)
    ssl_info = check_ssl_certificate(domain_name)
    logo_info = check_logo_similarity(url)
    pattern_info = detect_suspicious_patterns(url)
    safe_browsing_info = check_safe_browsing(url)
    whois_info = analyze_whois(domain_name)
    headers_info = analyze_headers(url)
    link_info = check_broken_links(url)

    # ✅ Final risk score calculation
    risk_score = sum([
        int(domain_info.get('is_suspicious', False)),
        int(logo_info.get('suspicious', False)),
        int(pattern_info.get('is_suspicious', False)),
        int(not ssl_info.get('is_valid', True)),
        int(not safe_browsing_info.get('safe', True)),
        int(whois_info.get('suspicious', False)),
        int(headers_info.get('suspicious', False)),
        int(link_info.get('suspicious', False)),
    ])

    # ✅ Final verdict
    verdict = "Unsafe" if risk_score >= 3 else "Safe"

    return {
        "domain": domain_info,
        "ssl": ssl_info,
        "logo": logo_info,
        "patterns": pattern_info,
        "safe_browsing": safe_browsing_info,
        "whois": whois_info,
        "headers": headers_info,
        "links": link_info,
        "risk_score": risk_score,
        "verdict": verdict
    }


@app.post("/image/analyze")
async def analyze_image(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        inputs = image_processor(images=image, return_tensors="pt")
        with torch.no_grad():
            outputs = image_model(**inputs)
            probs = torch.nn.functional.softmax(outputs.logits, dim=-1)
        labels = image_model.config.id2label
        result = {labels[i]: float(p) for i, p in enumerate(probs[0])}
        return JSONResponse(content={"prediction": result})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image analysis failed: {str(e)}")
