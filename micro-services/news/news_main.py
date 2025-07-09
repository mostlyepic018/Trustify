from news.uitls.get_info import get_info
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY not found in environment variables.")
genai.configure(api_key=GOOGLE_API_KEY)

def summarize_with_gemini(queries, articles):
    model = genai.GenerativeModel('gemini-2.5-flash')
    # Prepare the text to summarize
    text = "\n\n".join([
        f"Title: {a.get('title', '')}\nContent: {a.get('content', '')}\nURL: {a.get('url', '')}" for a in articles
    ])
    prompt = f"""
    Given the following news articles, summarize the information that is directly relevant to the queries: {queries}.
    Remove any information that is not related to the queries. Only include facts, claims, or statements that are clearly about the query topic. If nothing is relevant, say so.
    
    Articles:
    {text}
    """
    response = model.generate_content(prompt)
    return response.text.strip()

def verify_with_gemini(summary):
    model = genai.GenerativeModel('gemini-2.5-flash')
    prompt = f"""
    You are a fact-checking assistant. Given the following news summary, assess its factual accuracy and credibility. Indicate whether the information is likely true, partially true, or false, and provide a brief justification for your assessment. If you cannot verify the information, say so.

    News Summary:
    {summary}

    output:
    {{
        "status": "success/error",
        "verification_result": "The information is likely true/false",
        "confidence": "confidence score 1-100",
        "timestamp": "2025-07-09T12:00:00Z",
        "reason": "The information is likely true/false"
    }}
    """
    response = model.generate_content(prompt)
    return response.text.strip()

def news_main(query):
    print(f"Fetching news for: {query}")
    articles, rephrased_queries = get_info(query)
    if not articles:
        print("No articles found.")
        return {"summary": None, "articles": [], "verification_result": None}
    print(f"Fetched {len(articles)} articles. Summarizing...")
    summary = summarize_with_gemini(rephrased_queries, articles)

    verification_result = verify_with_gemini(summary)

    return verification_result
