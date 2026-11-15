---
title: Projects
---

## Project overview

<!-- keywords: projects, project, portfolio, built, build, side, work, products, shipped, apps, list, best, favorite -->

Priyanshu's main projects are:

- LexIQ, an evaluation-driven RAG platform.
- CallAaya, an AI job-fit engine with paying users (https://callaaya.fun).
- ClassVault, a study platform for college students (https://classvault.in).
- Tandem, a multi-agent research copilot.
- Two published Zed editor themes with 59k+ downloads.

## LexIQ — eval-driven RAG platform

<!-- keywords: lexiq, rag, retrieval, search, hybrid, bm25, pgvector, vector, embeddings, reranking, reranker, cross-encoder, citations, cited, streaming, abstention, evaluation, eval, golden, recall, faithfulness, llm-judge, latency, p95, nextjs, fastapi, redis -->

LexIQ is an evaluation-driven RAG platform built with Next.js, FastAPI, pgvector, and Redis. Repository:
https://github.com/404priyanshu/lexiq

- Hybrid retrieval with BM25 and pgvector, cross-encoder reranking, cited streaming answers, and abstention when the
  evidence is weak.
- It handles 50k+ pages at about $0.004 per query.
- A 500-question golden set, scored with recall@k and LLM-judge faithfulness, gates every change in CI.
- Priyanshu cut p95 latency from 4.1 seconds to 1.9 seconds.

## CallAaya — AI job-fit engine

<!-- keywords: callaaya, jobs, job, search, matching, fit, resume, resumes, tailored, ranking, claude, turso, razorpay, payments, paid, users, greenhouse, lever, ashby, workday, adzuna, seo, ingestion -->

CallAaya (https://callaaya.fun) is an AI job-fit engine built with Next.js, Turso, the Claude API, and Razorpay. It has
paying users.

- It ranks 22,000+ live job postings by skill-level fit.
- It drafts tailored resumes and checks each line against the user's real resume.
- It sells paid passes through Razorpay.
- It ingests jobs from Greenhouse, Lever, Ashby, Workday, and Adzuna on a 6-hour refresh.
- It includes 3,000+ SEO job pages.

## ClassVault — study platform for college students

<!-- keywords: classvault, notes, study, students, college, university, supabase, postgresql, rls, row level security, auth, authentication, otp, oauth, pgtap, vitest, playwright, testing, realtime, pomodoro, chat, pdf, search -->

ClassVault (https://classvault.in) is a notes and study platform for college students, built with Next.js, Supabase, and
PostgreSQL.

- Sign-in with email, Google, GitHub, or phone OTP.
- University membership, moderated uploads, and search across note text and PDFs.
- Access control lives in PostgreSQL row-level security (RLS) and is checked by 260+ pgTAP assertions plus Vitest and
  Playwright tests.
- Realtime study rooms with a synced Pomodoro timer and chat.

## Tandem — multi-agent research copilot

<!-- keywords: tandem, multi-agent, multiagent, agents, agent, langgraph, research, copilot, planner, researcher, critic, writer, celery, langfuse, tracing, checkpoints, human-in-the-loop, approval, tools, token budgets -->

Tandem is a multi-agent research copilot built with LangGraph, FastAPI, Celery, and Langfuse.

- Four agents: planner, researcher, critic, and writer.
- Typed tools, token budgets, human approval for risky actions, resumable checkpoints, and full tracing.

## Zed editor themes

<!-- keywords: zed, editor, theme, themes, open source, open-source, downloads, design, light, dark -->

Priyanshu published two Zed editor themes with four light and dark variants. They have 59k+ downloads.
