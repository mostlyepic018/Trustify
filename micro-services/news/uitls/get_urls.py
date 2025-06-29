# Multi-API News Search System for Hackathon
# Quick implementation focusing on getting it working fast
import os
import requests
import json
from datetime import datetime
from typing import List, Dict, Optional
from dataclasses import asdict
from .scrape_wed import WebScrapingAgent
from dotenv import load_dotenv
import time

load_dotenv()
class NewsSearcher:
    def __init__(self, news_api_key=None, google_api_key=None, google_search_engine_id=None):
        """
        Initialize with API keys. Add keys as you get them.
        """
        self.news_api_key = os.getenv('news_api_key', news_api_key)
        self.google_api_key = os.getenv('google_api_key', google_api_key)
        self.google_search_engine_id = os.getenv('google_search_engine_id', google_search_engine_id)
        self.timeout = 5
        self.max_results = 20  # Increase default
        
        # Simple cache to avoid duplicate API calls during demo
        self._cache = {}
    
    def search_news_api(self, query: str, max_results: int = 10) -> List[Dict]:
        """
        Search using News API - usually the easiest to get started with
        """
        if not self.news_api_key:
            return []
        
        url = "https://newsapi.org/v2/everything"
        params = {
            'q': query,
            'apiKey': self.news_api_key,
            'language': 'en',
            'sortBy': 'relevancy',
            'pageSize': min(max_results, 20)  # API limit
        }
        
        try:
            response = requests.get(url, params=params, timeout=self.timeout)
            response.raise_for_status()
            data = response.json()
            
            results = []
            for article in data.get('articles', []):
                # Skip articles without title (common issue)
                if not article.get('title'):
                    continue
                    
                results.append({
                    'title': article.get('title', ''),
                    'url': article.get('url', ''),
                    'snippet': article.get('description', ''),
                    'source': article.get('source', {}).get('name', 'Unknown'),
                    'published_at': article.get('publishedAt', ''),
                    'api_source': 'news_api'
                })
            
            return results
            
        except Exception as e:
            print(f"News API error: {e}")
            return []
    
    def search_google_news(self, query: str, max_results: int = 10) -> List[Dict]:
        """
        Search using Google Custom Search API - excellent quality results
        Note: Google API limit is 10 results per request, but we can make multiple requests
        """
        if not self.google_api_key or not self.google_search_engine_id:
            return []
        
        all_results = []
        requests_needed = (max_results + 9) // 10  # Calculate how many requests we need
        
        for request_num in range(requests_needed):
            start_index = request_num * 10 + 1  # Google uses 1-based indexing
            current_request_limit = min(10, max_results - len(all_results))
            
            if current_request_limit <= 0:
                break
                
            url = "https://www.googleapis.com/customsearch/v1"
            params = {
                'key': self.google_api_key,
                'cx': self.google_search_engine_id,
                'q': f"{query} news",  # Add 'news' to focus on news articles
                'num': current_request_limit,
                'start': start_index,
                'sort': 'date'  # Sort by date for recent news
            }
            
            try:
                response = requests.get(url, params=params, timeout=self.timeout)
                response.raise_for_status()
                data = response.json()
                
                items = data.get('items', [])
                if not items:  # No more results available
                    break
                
                for item in items:
                    # Extract source from display URL
                    source = item.get('displayLink', 'Unknown')
                    if '.' in source:
                        source = source.split('.')[0].title()
                    
                    all_results.append({
                        'title': item.get('title', ''),
                        'url': item.get('link', ''),
                        'snippet': item.get('snippet', ''),
                        'source': source,
                        'published_at': '',  # Google Custom Search doesn't provide publish date
                        'api_source': 'google_search'
                    })
                
                # Add delay between requests to be nice to Google
                if request_num < requests_needed - 1:
                    time.sleep(1)
                    
            except Exception as e:
                print(f"Google Search API error on request {request_num + 1}: {e}")
                break  # Stop making more requests if one fails
        
        return all_results
    
    def remove_duplicates(self, results: List[Dict]) -> List[Dict]:
        """
        Simple duplicate removal by URL - good enough for hackathon
        """
        seen_urls = set()
        unique_results = []
        
        for result in results:
            url = result.get('url', '')
            if url and url not in seen_urls:
                seen_urls.add(url)
                unique_results.append(result)
        
        return unique_results
    
    def search(self, query: str, max_results: int = None) -> List[Dict]:
        """
        Main search function - tries multiple APIs and combines results
        """
        if max_results is None:
            max_results = self.max_results
        
        # Simple caching for demo purposes
        cache_key = f"{query}_{max_results}"
        if cache_key in self._cache:
            return self._cache[cache_key]
        
        all_results = []
        
        # Try News API first (usually most reliable)
        news_results = self.search_news_api(query, max_results // 2)  # Get half from News API
        all_results.extend(news_results)
        
        # Add small delay to be nice to APIs
        time.sleep(0.5)
        
        # Try Google Search if we have the key and need more results
        remaining_needed = max_results - len(all_results)
        if remaining_needed > 0 and self.google_api_key and self.google_search_engine_id:
            google_results = self.search_google_news(query, remaining_needed)
            all_results.extend(google_results)
        
        # Remove duplicates and limit results
        unique_results = self.remove_duplicates(all_results)[:max_results]
        
        # Cache for demo
        self._cache[cache_key] = unique_results
        
        return unique_results
    
    def get_available_apis(self) -> List[str]:
        """
        Check which APIs are configured
        """
        apis = []
        if self.news_api_key:
            apis.append("News API")
        if self.google_api_key and self.google_search_engine_id:
            apis.append("Google Custom Search")
        return apis


# Example usage and testing
def main():
    """
    Example usage - replace with your actual API keys
    """
    # ADD YOUR API KEYS HERE
    NEWS_API_KEY = os.getenv('news_api_key')# Get from newsapi.org
    GOOGLE_API_KEY = os.getenv('google_api_key')  # Get from Google Cloud Console
    GOOGLE_SEARCH_ENGINE_ID = os.getenv('google_search_engine_id') # Custom Search Engine ID
    
    # Initialize searcher
    searcher = NewsSearcher(
        news_api_key=NEWS_API_KEY if NEWS_API_KEY != "your_news_api_key_here" else None,
        google_api_key=GOOGLE_API_KEY if GOOGLE_API_KEY != "your_google_api_key_here" else None,
        google_search_engine_id=GOOGLE_SEARCH_ENGINE_ID if GOOGLE_SEARCH_ENGINE_ID != "your_search_engine_id_here" else None
    )
    
    # Check what APIs are available
    available_apis = searcher.get_available_apis()
    
    if not available_apis:
        return

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

    if not available_apis:
        return []

    # Get news results
    results = searcher.search(query, max_results=15)
    if not results:
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
    
