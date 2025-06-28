from dotenv import load_dotenv
from .scrape_wed import WebScrapingAgent
from dataclasses import asdict
from .get_urls import NewsSearcher
import os

load_dotenv()

def get_info(query):
    NEWS_API_KEY = os.getenv('news_api_key')
    GOOGLE_API_KEY = os.getenv('google_api_key')
    GOOGLE_SEARCH_ENGINE_ID = os.getenv('google_search_engine_id')

    # Initialize searcher
    searcher = NewsSearcher(
        news_api_key=NEWS_API_KEY if NEWS_API_KEY != "your_news_api_key_here" else None,
        google_api_key=GOOGLE_API_KEY if GOOGLE_API_KEY != "your_google_api_key_here" else None,
        google_search_engine_id=GOOGLE_SEARCH_ENGINE_ID if GOOGLE_SEARCH_ENGINE_ID != "your_search_engine_id_here" else None
    )

    # Check what APIs are available
    available_apis = searcher.get_available_apis()
    print(f"Available APIs: {available_apis}")

    if not available_apis:
        print("No API keys configured! Add your keys to test.")
        return []

    # Get news results
    results = searcher.search(query, max_results=15)
    if not results:
        print("No news results found!")
        return []

    # Prepare url-metadata pairs for scraping
    url_data = []
    for r in results:
        url_data.append({
            'url': r['url'],
            'metadata': {
                'search_query': query,
                'source': r.get('source', ''),
                'api_source': r.get('api_source', ''),
                'relevance_score': 1.0  # Placeholder, can be improved
            }
        })

    # Scrape the URLs
    agent = WebScrapingAgent(delay=1.0)
    scraped_results = agent.scrape_multiple_urls(url_data)

    # Return as list of dicts
    return [asdict(res) for res in scraped_results] if scraped_results else []
    
