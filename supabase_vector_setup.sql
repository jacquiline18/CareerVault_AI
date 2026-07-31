-- Run this in Supabase SQL Editor

-- Enable pgvector extension
create extension if not exists vector;

-- Document chunks table for RAG
create table if not exists document_chunks (
  id bigserial primary key,
  user_id uuid not null,
  document_id bigint not null,
  chunk_text text not null,
  embedding vector(384),  -- all-MiniLM-L6-v2 produces 384-dim vectors
  chunk_index int not null,
  created_at timestamptz default now()
);

-- Index for fast vector similarity search
create index if not exists document_chunks_embedding_idx
  on document_chunks
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- Index for user filtering
create index if not exists document_chunks_user_idx on document_chunks(user_id);

-- Match function for vector search
create or replace function match_chunks(
  query_embedding vector(384),
  match_user_id uuid,
  match_count int default 5
)
returns table (
  id bigint,
  chunk_text text,
  similarity float
)
language sql stable
as $$
  select
    id,
    chunk_text,
    1 - (embedding <=> query_embedding) as similarity
  from document_chunks
  where user_id = match_user_id
  order by embedding <=> query_embedding
  limit match_count;
$$;
