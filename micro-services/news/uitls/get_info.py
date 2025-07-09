from dotenv import load_dotenv
from .scrape_wed import WebScrapingAgent
from dataclasses import asdict
from .get_urls import NewsSearcher
import os
from google import genai
import os
from dotenv import load_dotenv
import google.generativeai as genai # Correct import

# Load environment variables
load_dotenv()

# Configure the API key once when the module is loaded
# Ensure your .env file has GOOGLE_API_KEY="your_key_here"
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY not found in environment variables.")
genai.configure(api_key=GOOGLE_API_KEY)


def rephrase_query_for_search(original_query: str) -> list[str]:
    """
    Rephrases a query into three different formats for news verification.
    """
    try:
        # Now you can correctly instantiate the model
        # Note: As of now, 'gemini-2.5-flash' is not a recognized model.
        # Use a valid model name like 'gemini-1.5-flash' or 'gemini-pro'.
        model = genai.GenerativeModel('gemini-2.5-flash')

        prompt = f"""
        Original query: "{original_query}"

        Rephrase this into 3 different search queries optimized for finding news verification:
        1. A factual query focusing on key entities and events
        2. A quote-based query if there are any quotes mentioned
        3. A broader context query for background information

        Return only the 3 queries, one per line.
        """
        response = model.generate_content(prompt)
        
        rephrased_queries = response.text.strip().split('\n')
        
        # Filter out potential numbering
        return [query.lstrip('0123456789. ') for query in rephrased_queries]

    except Exception as e:
        print(f"An error occurred during rephrasing: {e}")
        return []


def get_info(query: str):
    """
    Rephrases a query, searches for news articles using the rephrased queries,
    scrapes the content, and returns the structured data.

    Args:
        query: The initial user query.

    Returns:
        A tuple: (list of article dicts, list of rephrased queries)
    """
    NEWS_API_KEY = os.getenv('news_api_key')
    GOOGLE_API_KEY = os.getenv('google_api_key')
    Google_Search_ENGINE_ID = os.getenv('Google Search_engine_id')

    print(f"Original query: {query}")
    print("Rephrasing query for a wider search...")
    rephrased_queries = rephrase_query_for_search(query)
    if not rephrased_queries:
        print("Could not rephrase the query. Aborting.")
        return [], []
    print("Generated queries:")
    for q in rephrased_queries:
        print(f"  - {q}")

    searcher = NewsSearcher(
        news_api_key=NEWS_API_KEY if NEWS_API_KEY != "your_news_api_key_here" else None,
        google_api_key=GOOGLE_API_KEY if GOOGLE_API_KEY != "your_google_api_key_here" else None,
        google_search_engine_id=Google_Search_ENGINE_ID if Google_Search_ENGINE_ID != "your_search_engine_id_here" else None
    )

    available_apis = searcher.get_available_apis()
    if not available_apis:
        print("No API keys configured! Add your keys to test.")
        return [], rephrased_queries

    all_results = []
    seen_urls = set()
    for rephrased_query in rephrased_queries:
        print(f"\nSearching for: '{rephrased_query}'...")
        results = searcher.search(rephrased_query, max_results=5)
        if not results:
            print("  -> No results found for this query.")
            continue
        for r in results:
            if r['url'] not in seen_urls:
                all_results.append(r)
                seen_urls.add(r['url'])

    if not all_results:
        print("\nNo unique news results found across all queries!")
        return [], rephrased_queries

    url_data = []
    for r in all_results:
        url_data.append({
            'url': r['url'],
            'metadata': {
                'search_query': r.get('search_query', query),
                'source': r.get('source', ''),
                'api_source': r.get('api_source', ''),
                'relevance_score': 1.0
            }
        })

    print(f"\nScraping {len(url_data)} unique articles...")
    agent = WebScrapingAgent(delay=1.0)
    scraped_results = agent.scrape_multiple_urls(url_data)

    print("Scraping complete.")
    return [asdict(res) for res in scraped_results] if scraped_results else [], rephrased_queries

def get_info_and_write_to_txt(query: str, output_file: str = "output.txt"):
    """
    Uses get_info to fetch news info for a query and writes the results to a txt file.

    Args:
        query: The search query string.
        output_file: The path to the output txt file.
    """
    results = get_info(query)
    with open(output_file, 'w', encoding='utf-8') as f:
        for idx, item in enumerate(results, 1):
            f.write(f"Result {idx}:\n")
            for key, value in item.items():
                f.write(f"  {key}: {value}\n")
            f.write("\n" + "-"*40 + "\n\n")