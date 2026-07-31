-- Run this in Supabase SQL Editor

create table if not exists chat_history (
  id bigserial primary key,
  user_id uuid not null,
  role text not null check (role in ('user','assistant')),
  message text not null,
  created_at timestamptz default now()
);

create table if not exists resumes (
  id bigserial primary key,
  user_id uuid not null,
  template text not null default 'modern',
  content jsonb not null default '{}',
  pdf_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists portfolio_settings (
  id bigserial primary key,
  user_id uuid not null unique,
  theme text default 'indigo',
  github_url text default '',
  linkedin_url text default '',
  contact_email text default '',
  bio text default '',
  published boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists interview_sessions (
  id bigserial primary key,
  user_id uuid not null,
  topic text not null,
  question_type text not null,
  questions jsonb not null default '[]',
  created_at timestamptz default now()
);

create table if not exists career_reports (
  id bigserial primary key,
  user_id uuid not null,
  readiness_score int default 0,
  strengths jsonb default '[]',
  weaknesses jsonb default '[]',
  missing_skills jsonb default '[]',
  recommended_certs jsonb default '[]',
  career_paths jsonb default '[]',
  growth_roadmap jsonb default '[]',
  created_at timestamptz default now()
);

create table if not exists roadmaps (
  id bigserial primary key,
  user_id uuid not null,
  target_role text not null,
  current_skills jsonb default '[]',
  weeks jsonb default '[]',
  created_at timestamptz default now()
);

-- Indexes
create index if not exists chat_history_user_idx on chat_history(user_id);
create index if not exists resumes_user_idx on resumes(user_id);
create index if not exists interview_sessions_user_idx on interview_sessions(user_id);
create index if not exists career_reports_user_idx on career_reports(user_id);
create index if not exists roadmaps_user_idx on roadmaps(user_id);
