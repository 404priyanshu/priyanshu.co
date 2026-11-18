# Knowledge base for the "Ask" chat

The chat at `/ask` answers questions about Priyanshu from the files in this folder. Nothing else reaches the model.

## How the files are read

- Each `.md` file in this folder (except this README) is one topic.
- The `title` in the frontmatter names the topic.
- Each `##` heading starts one chunk. The retriever ranks chunks, not files.
- Write each chunk so it makes sense alone. The model sees only the few chunks that match a question.
- An optional `<!-- keywords: a, b, c -->` line inside a chunk adds search words. The model does not see them. Use it
  for words a visitor may type that the chunk does not contain (for example "college" for an education chunk).
- An optional `<!-- questions: First question? | Second question? -->` line lists questions the chunk answers. After an
  answer that used the chunk, the page offers them as "Ask next" buttons, and search uses their words too. Write only
  questions the chunk itself answers.
- `pinned: true` in the frontmatter sends every chunk of that file with every question. Keep pinned files short.

## Privacy

Everything here is public: any visitor can ask the bot to repeat it. Do not add a phone number, a home address, or
anything you do not want on the open web.

## Blog posts

The chat also reads `content/writing/`. Each post is chunked the same way, one chunk per `##` heading, plus the lead-in
before the first heading. Fenced code is not split. A blog chunk carries the post title and its `/writing/<slug>` URL so
an answer can cite the post.

## Embeddings

Document vectors live in `data/ask-embeddings.json`, next to the local `all-MiniLM-L6-v2` model in `data/models/`.
Rebuild them after editing these notes or a post:

```bash
bun run knowledge:embed
```

Set `EMBEDDING_PROVIDER=openai` to rebuild with OpenAI `text-embedding-3-small` instead. That needs `OPENAI_API_KEY`.
The file records which model it was built with. The chat embeds only the question, and only in that same space. If the
key is missing, the file is missing or stale, or the call fails, answers still come back from BM25.

## Check

Run `bun run knowledge:check -- "your question"` to see which chunks a question retrieves and which next questions the
page would suggest.

Run `bun run knowledge:eval` to compare BM25 with hybrid retrieval on the labelled questions in
`evals/ask-retrieval.json`. It prints recall@k and MRR.
