import json
from pathlib import Path
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.documents import Document

BASE_DIR = Path(__file__).resolve().parents[1]
JSON_PATH = BASE_DIR / "data" / "treatment_protocols.json"
INDEX_PATH = BASE_DIR / "data" / "faiss_index"

def build_index():
    print("Loading treatment protocols...")
    with open(JSON_PATH, "r", encoding="utf-8") as f:
        protocols = json.load(f)

    docs = []
    for p in protocols:
        content = (
            f"Disease: {p['disease']} (Severity: {p['severity_range'][0]}-{p['severity_range'][1]})\n"
            f"Protocol: {p['protocol']}\n"
            f"Preventive Measures: {p['preventive_measures']}\n"
            f"Chemical Agents: {', '.join(p['chemical_agents'])}\n"
            f"Application Timing: {p['application_timing']}\n"
            f"Arabic Protocol: {p.get('protocol_ar', '')}"
        )
        doc = Document(page_content=content, metadata={"id": p["id"], "disease": p["disease"]})
        docs.append(doc)

    print("Initializing HuggingFace Embeddings...")
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
    )

    print("Building FAISS index...")
    vectorstore = FAISS.from_documents(docs, embeddings)

    print(f"Saving index to {INDEX_PATH}...")
    INDEX_PATH.mkdir(parents=True, exist_ok=True)
    vectorstore.save_local(str(INDEX_PATH))
    print("Done!")

if __name__ == "__main__":
    build_index()
