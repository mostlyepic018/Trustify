# ... existing code ...

from .get_info import get_info
from ..RAG.db import upload_to_pinecone, get_related_docs
from .scrape_wed import WebScrapingAgent
from langchain.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv
import uuid

def call_gemini_api(statement, context):
    load_dotenv()
    gemini_api_key = os.getenv("GEMINI_API_KEY")
    gemini_client = ChatGoogleGenerativeAI(model="gemini-2.0-flash", api_key=gemini_api_key)
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a helpful assistant that verifies statements. You are given a statement and a context. You need to verify if the statement is true or false. You need to return the verified statement and the reasoning."),
        ("user", "{statement}\n\n{context}")
    ])

    return {"verified": True, "reasoning": "This is a placeholder response."}

def verify_statement(statement):
    """
    1. Get URLs for the statement.
    2. Scrape the web for those URLs.
    3. Upload scraped content to Pinecone.
    4. Retrieve relevant info from Pinecone.
    5. Call Gemini API to verify the statement.
    """
    # Step 1: Get URLs and metadata
    url_data = get_info(statement)
    if not url_data:
        return {"error": "No URLs found for the statement."}

    # Step 2: Scrape the web
    agent = WebScrapingAgent(delay=1.0)
    scraped_results = agent.scrape_multiple_urls(url_data)
    if not scraped_results:
        return {"error": "Failed to scrape any URLs."}

    # Step 3: Upload to Pinecone
    # Prepare docs for Pinecone (simulate as objects with .page_content)
    class Doc:
        def __init__(self, content):
            self.page_content = content

    docs = [Doc(res.content) for res in scraped_results if hasattr(res, "content") and res.content]
    if not docs:
        return {"error": "No valid content to upload to Pinecone."}

    # Use a unique namespace for each statement (or hash of statement)
    namespace = f"verify_{uuid.uuid4().hex[:8]}"
    index_name = "web-scrape-index"
    dimensions = 1024  # Set this to your embedding model's output size

    # Upload to Pinecone
    upload_to_pinecone(index_name, docs, namespace, dimensions=dimensions)

    # Step 4: Retrieve relevant info
    context_docs = get_related_docs(index_name, namespace, statement)
    context = "\n\n".join([doc.page_content for doc in context_docs])

    # Step 5: Call Gemini API
    gemini_result = call_gemini_api(statement, context)

    return {
        "statement": statement,
        "gemini_result": gemini_result,
        "context": context,
        "scraped_urls": [res.url for res in scraped_results]
    }
def main():
    statement = "virat kolhi retires from odi cricket"
    result = verify_statement(statement)
    print(result)

if __name__ == "__main__":
    main()