---
title: About this assistant
---

## How this chat works

<!-- keywords: bot, chatbot, assistant, you, this, chat, how, work, works, built, made, rag, retrieval, model, openai, gpt, chatgpt, groq, llm, ai, blog, posts, writing, embeddings, hybrid, bm25 -->
<!-- questions: How does this chat work? -->

This chat is a small retrieval-augmented generation (RAG) system that Priyanshu built into his website. His resume notes
and blog posts are split into short sections. For each question, keyword search (BM25) and a small local embedding model
rank those sections, and the two rankings are merged. If the embedding index is unavailable, keyword search is used on
its own. A large language model writes the answer from the matched sections only.
