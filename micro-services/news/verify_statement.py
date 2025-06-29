import sys
from uitls.get_info import get_info
from RAG.db import upload_to_pinecone, get_related_docs
from langchain_core.documents import Document

# 1. Take a statement from the user
if len(sys.argv) < 2:
    print("Usage: python verify_statement.py '<your statement>'")
    sys.exit(1)

statement = sys.argv[1]

# 2. Get relevant URLs and scrape them (returns list of dicts)
scraped_results = get_info(statement)
if not scraped_results:
    print("No relevant news articles found.")
    sys.exit(1)

# 3. Prepare documents for Pinecone upload
docs = []
for item in scraped_results:
    # Each item is a dict with keys like 'url', 'title', 'content', etc.
    content = item.get('content', '')
    if content:
        docs.append(Document(page_content=content, metadata={'source': item.get('url', '')}))

if not docs:
    print("No content to upload to Pinecone.")
    sys.exit(1)

# 4. Upload to Pinecone
index_name = "news-index"
namespace = "news"
upload_to_pinecone(index_name, docs, namespace)
print(f"Uploaded {len(docs)} documents to Pinecone.")

# 5. Retrieve relevant content from Pinecone
related_docs = get_related_docs(index_name, namespace, statement)
print("\nTop relevant content from Pinecone:")
for i, doc in enumerate(related_docs):
    print(f"--- Document {i+1} ---")
    print(doc.page_content[:500], "...\n")

# 6. Placeholder: Call Gemini model using LangChain
# (You need to implement this part with your Gemini/LLM setup)
print("\n[Placeholder] Call Gemini model here with the statement and retrieved context.")
# Example:
# gemini_response = call_gemini(statement, [doc.page_content for doc in related_docs])
# print("Gemini Verification Result:", gemini_response) 