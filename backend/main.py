# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from agents.graph import app_graph

app = FastAPI(title="AEGIS AI", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class DocumentInput(BaseModel):
    name: str
    text: str

@app.post("/analyze")
async def analyze_document(doc: DocumentInput):
    initial_state = {
        "document_text": doc.text,
        "document_name": doc.name,
        "findings": [],
        "status": "pending",
        "total_potential_loss": 0.0,
    }
    
    result = await app_graph.ainvoke(initial_state)
    
    return {
        "document": result.get("document_name", doc.name),
        "status": result.get("status", "unknown"),
        "total_potential_loss": result.get("total_potential_loss", 0.0),
        "findings": [f.model_dump() if hasattr(f, "model_dump") else f for f in result.get("findings", [])],
    }

@app.get("/health")
async def health():
    return {"status": "ok", "llm": "qwen", "model": "qwen3.7-plus"}