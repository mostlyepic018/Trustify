import os
from pinecone import Pinecone, ServerlessSpec
from dotenv import find_dotenv,load_dotenv
from langchain_ollama import OllamaEmbeddings
from langchain_pinecone import PineconeVectorStore
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_core.documents import Document

import re
import time

env_path = find_dotenv()

load_dotenv(env_path)
Pinecone_key = os.getenv("Pinecone_key")

    
def upload_to_pinecone(index_name, docs, namespace, dimensions=None, embedding_model="bge-m3:latest"):
    pc = Pinecone(api_key=Pinecone_key)
    existing_indexes = [index_info["name"] for index_info in pc.list_indexes()]

    if index_name not in existing_indexes:
        if dimensions is None:
            raise Exception("Please provide dimensions as an argument.")
        pc.create_index(
            name=index_name,
            dimension=dimensions,
            metric="cosine",
            spec=ServerlessSpec(cloud="aws", region="us-east-1"),
        )
        while not pc.describe_index(index_name).status["ready"]:
            time.sleep(1)
    index = pc.Index(index_name)
    embeddings = OllamaEmbeddings(model=embedding_model)

    # Initialize the text splitter
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)

    # Process and split documents
    split_docs = []
    for doc in docs:
        if hasattr(doc, 'page_content') and isinstance(doc.page_content, str):
            # Cleanse the text to remove surrogate characters
            cleansed_text = re.sub(r'[\uD800-\uDFFF]', '', doc.page_content)
            # Split the text into chunks
            chunks = text_splitter.split_text(cleansed_text)
            for i, chunk in enumerate(chunks):
                split_docs.append(Document(page_content=chunk, metadata={'source': doc.metadata.get('source', 'unknown'), 'chunk': i}))

    vector_store = PineconeVectorStore(index=index, embedding=embeddings, namespace=namespace)

    # Add cleansed and split documents to the vector store
    if split_docs:
        vector_store.add_documents(documents=split_docs)

    return True

def deleat_by_name(index_name,namespace,embedding_model="bge-m3:latest"):
    pc = Pinecone(api_key=Pinecone_key)
    index = pc.Index(index_name)
    embeddings = OllamaEmbeddings(model=embedding_model)
    vector_store = PineconeVectorStore(index=index, embedding=embeddings)

    vector_store.delete(delete_all=True, namespace=namespace) 

    return True
# improve this function
def get_related_docs(index_name,namespace,question,embedding_model="bge-m3:latest"):
    pc = Pinecone(api_key=Pinecone_key)
    index = pc.Index(index_name)
    embeddings = OllamaEmbeddings(model=embedding_model)
    vector_store = PineconeVectorStore(index=index, embedding=embeddings,namespace=namespace)

    store = vector_store.as_retriever()

    context = store.invoke(question)

    return context