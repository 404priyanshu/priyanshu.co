# Knowledge base for the "Ask" chat

The chat at `/ask` answers questions about Priyanshu from the files in this folder. Nothing else reaches the model.

## How the files are read

- Each `.md` file in this folder (except this README) is one topic.
- The `title` in the frontmatter names the topic.
- Each `##` heading starts one chunk. The retriever ranks chunks, not files.
- Write each chunk so it makes sense alone. The model sees only the few chunks that match a question.
- An optional `<!-- keywords: a, b, c -->` line inside a chunk adds search words. The model does not see them. Use it
  for words a visitor may type that the chunk does not contain (for example "college" for an education chunk).
- `pinned: true` in the frontmatter sends every chunk of that file with every question. Keep pinned files short.

## Privacy

Everything here is public: any visitor can ask the bot to repeat it. Do not add a phone number, a home address, or
anything you do not want on the open web.

## Check

Run `bun run knowledge:check -- "your question"` to see which chunks a question retrieves.
