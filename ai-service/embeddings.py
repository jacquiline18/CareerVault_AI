from sentence_transformers import SentenceTransformer
import numpy as np
from log_util import log

# Load once at startup - all-MiniLM-L6-v2 is fast, small (80MB), 384-dim
_model = None

def get_model():
    global _model
    if _model is None:
        log("[EMBED] Loading embedding model...")
        _model = SentenceTransformer("all-MiniLM-L6-v2")
        log("[EMBED] Embedding model loaded")
    return _model


def embed(text: str) -> list[float]:
    vec = get_model().encode(text, normalize_embeddings=True)
    return vec.tolist()


def chunk_text(text: str, chunk_size: int = 400, overlap: int = 50) -> list[str]:
    """Split text into overlapping chunks by word count."""
    words = text.split()
    chunks = []
    i = 0
    while i < len(words):
        chunk = " ".join(words[i:i + chunk_size])
        if chunk.strip():
            chunks.append(chunk.strip())
        i += chunk_size - overlap
    return chunks


def store_chunks(supabase_client, user_id: str, document_id: int, text: str):
    """Chunk text, embed each chunk, store in document_chunks table."""
    if not text or not text.strip():
        log("[WARN] No text to embed")
        return

    # Clear old chunks for this document
    supabase_client.table("document_chunks").delete().eq("document_id", document_id).execute()

    chunks = chunk_text(text)
    if not chunks:
        return

    log(f"[EMBED] Embedding {len(chunks)} chunks for document {document_id}")
    model = get_model()
    embeddings = model.encode(chunks, normalize_embeddings=True, show_progress_bar=False)

    rows = [
        {
            "user_id": user_id,
            "document_id": document_id,
            "chunk_text": chunk,
            "embedding": embeddings[i].tolist(),
            "chunk_index": i,
        }
        for i, chunk in enumerate(chunks)
    ]

    supabase_client.table("document_chunks").insert(rows).execute()
    log(f"[EMBED] Stored {len(rows)} chunks with embeddings")


def search_chunks(supabase_client, user_id: str, query: str, top_k: int = 5) -> list[dict]:
    """Embed query and find most similar chunks via Supabase RPC."""
    query_vec = embed(query)
    result = supabase_client.rpc("match_chunks", {
        "query_embedding": query_vec,
        "match_user_id": user_id,
        "match_count": top_k
    }).execute()
    return result.data or []
