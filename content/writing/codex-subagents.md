---
title: 'Codex Subagents: Delegating Without Creating More Work'
date: '2026-09-20'
description:
  'I tried subagents in Codex, then reverted the setup. Here is how to try them, configure a focused reviewer, and
  delegate work that is actually worth splitting.'
---

I tried a subagent setup in Codex. Then I reverted it.

Possibly not the opening you expect from a post explaining how to set one up. But trying a feature and deciding you
don’t want it running all the time are perfectly compatible decisions.

The appeal is easy to understand. One agent investigates a bug, another checks the tests, and the main agent puts the
pieces together. Meanwhile, you get to feel like someone with an engineering department.

The question is whether the work actually needs a department.

I still think subagents are worth learning. Here’s how I’d introduce them into a project now: start with one small
delegation, make its output useful, and only then consider a reusable setup.

## Start with a prompt, not a configuration project

This guide is for local Codex: the desktop app, CLI, or IDE extension. It isn’t a tutorial for building an app with the
Agents SDK.

As of September 20, 2026, current Codex releases enable subagents by default. Ask for delegation explicitly; applicable
project or skill instructions can request it too. See the
[official subagent guide](https://learn.chatgpt.com/docs/agent-configuration/subagents).

Open a project in Codex and try this:

```text
Review the article-rendering flow. Use two subagents.

1. Trace how Markdown becomes the article page.
   Report the relevant files and where custom components enter.
2. Inspect the existing validation scripts.
   Report what they check and what they miss.

Neither agent should edit files. Do not spawn further agents.
Wait for both, then give me a short combined summary with
file references and one suggested next step.
```

That’s a real first experiment. There’s a defined subject, two separate questions, and a clear finish line. You can
judge the answer without spending an afternoon configuring an imaginary org chart.

For your own repository, replace “article-rendering flow” with something concrete: authentication, checkout, image
loading, or the job that sends emails.

## Give each agent a question you can check

A subagent handles delegated work and returns a result to the main agent. In the desktop app, open its activity to
inspect the thread. In the CLI, use `/agent`. You can ask Codex to steer or stop a running agent. Those controls are
covered in the [same guide](https://learn.chatgpt.com/docs/agent-configuration/subagents).

The useful part is the assignment. “Check quality” leaves almost everything up for interpretation. I’d rather write:

```text
Inspect the changed image component for hydration timing bugs.
Do not edit it.

Return:
- A concrete failure scenario, if you find one.
- The file and line involved.
- Whether an existing test covers it.
- Any uncertainty that needs a browser check.

If you find no supported issue, say so.
```

That final sentence matters to me. A reviewer shouldn’t feel obliged to produce a bug just because I gave it a
review-shaped job.

My test for a delegation prompt is simple: if I handed it to another developer, would they know what “done” means?

## Parallel work needs somewhere to go

For a blog pipeline change, I’d divide the first pass like this:

| Owner      | Assignment                           | Deliverable                            |
| ---------- | ------------------------------------ | -------------------------------------- |
| Main agent | Understand the requested change      | Scope and acceptance criteria          |
| Subagent A | Trace article rendering              | Files, data flow, likely change points |
| Subagent B | Inspect content validation           | Existing checks and concrete gaps      |
| Main agent | Read both reports, implement, verify | One coherent patch                     |

The two investigations can happen together. Implementation comes after them because it depends on what they find.

I wouldn’t ask two agents to independently “fix the blog pipeline.” That sounds parallel, but it gives both of them the
same decisions to make. Now I have two proposed solutions and a third task: deciding which bits belong together.

When delegating edits, I’d name the files each worker owns and leave shared files with the main agent. If the jobs need
overlapping edits, I’d sequence them or explicitly arrange separate worktrees. “Separate agent” isn’t a plan for
resolving conflicting changes.

## Put a small ceiling on it

For reusable settings, Codex uses `~/.codex/config.toml` for user configuration and `.codex/config.toml` for project
configuration. Project configuration is loaded for trusted projects. The
[configuration basics](https://learn.chatgpt.com/docs/config-file/config-basic) explain precedence and trust.

For an initial project setup, I’d merge this into the existing `.codex/config.toml`:

```toml
[agents]
enabled = true
max_concurrent_threads_per_session = 2
```

If an `[agents]` table already exists, edit it rather than adding a second one.

The limit counts concurrently open spawned threads, excluding the main thread. It isn’t a token budget or a limit on the
total number of agents that may run over time. The older `max_threads` spelling is a legacy alias. These settings are
listed in the [configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference).

Two is my suggested starting point, not a magic number. It’s enough to test whether splitting the work helps while
keeping the results easy to inspect.

## Save a reviewer you’ll actually reuse

Custom agents live in `.codex/agents/` for a project, or `~/.codex/agents/` for personal use. Each TOML file requires a
name, description, and developer instructions. The
[custom-agent documentation](https://learn.chatgpt.com/docs/agent-configuration/subagents#custom-agents) describes the
format.

Here’s an example I’d use for this site. Create `.codex/agents/article_reviewer.toml`:

```toml
name = "article_reviewer"
description = "Checks an article patch for specific reader-facing problems."
sandbox_mode = "read-only"
developer_instructions = """
Review only the article and rendering changes named in your task.

Check for misleading claims, broken local asset references,
and examples that disagree with the surrounding explanation.
Distinguish confirmed problems from questions needing research.

Do not edit files or delegate further.
Return at most five actionable findings with file references.
Say when you found no supported issue.
"""
```

Then test it in a fresh Codex session:

```text
Use the article_reviewer subagent to review the current
article changes. Ask it to identify itself in the report.
Keep this review read-only and wait for its findings.
Do not implement changes yet.
```

Inspect the activity and report to confirm that the named agent was used. A file sitting in a directory is not, by
itself, evidence that your workflow picked it up.

I’ve left model settings out of this example. Without overrides, subagents inherit the parent’s model and reasoning
effort. They also inherit sandbox policy; live runtime overrides can supersede configured defaults. Check the effective
permissions, rather than treating the TOML as an independent security boundary.
[OpenAI documents that behavior here](https://learn.chatgpt.com/docs/agent-configuration/subagents).

## Make the habit explicit in AGENTS.md

Codex reads `AGENTS.md` for project instructions. More specific files can apply within subdirectories; the
[AGENTS.md guide](https://learn.chatgpt.com/docs/agent-configuration/agents-md) explains how instructions are
discovered.

I’d add a short policy like this to a repository where I wanted occasional delegation:

```md
## Delegation

Use subagents when there are at least two independent, substantial questions to investigate.

Before spawning, state each assignment and its expected output. Start with no more than two subagents. Use read-only
investigation unless edits are explicitly assigned. Give each editing agent ownership of specific files. Keep
integration and final verification with the main agent.

For copy edits, small CSS changes, or one-file fixes, work in the main thread.
```

This is an example for readers, not a claim that every repository needs it. I’d adjust it after seeing which jobs
benefit. A rule that says “always use subagents” makes delegation the goal, and I’d rather keep finishing the task as
the goal.

## Watch the work, not the headcount

Subagents do their own model and tool work, so comparable multi-agent runs consume more tokens than single-agent runs.
[The documentation calls out that tradeoff](https://learn.chatgpt.com/docs/agent-configuration/subagents).

I’d evaluate a trial on three things: time to a usable result, usage, and how much cleanup I had to do afterward.
Finishing the investigations quickly doesn’t help much if reconciling their answers takes longer than the original job.

A few warning signs I’d look for:

- Both agents are reading the same files to answer essentially the same question.
- The main agent repeats the entire investigation after receiving the reports.
- Reports contain lots of observations but no evidence or decision.
- More agents keep appearing without a clearly assigned piece of work.

When that happens, I’d narrow or stop the assignments. There’s no prize for keeping everyone busy.

To stop using delegation by default, remove the instruction requesting it from your project policy. To disable the tools
themselves, set `enabled = false` under `[agents]`, as described in the
[configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference). Stop any active workers
separately; a configuration edit shouldn’t be your way of cancelling ongoing work.

## The version I’d start with

My earlier setup is reverted. I’m not presenting it as a benchmark or a configuration everyone should copy.

What I’d recommend trying is much smaller: one main task, two independent questions, and reports short enough that
you’ll actually read them. Keep the main agent responsible for the final patch.

If that helps, save a useful role. If it doesn’t, go back to one agent. You’ve learned something about your workflow
either way.

The best delegation prompt probably won’t sound impressive. It’ll sound like “check this file for this problem, then
tell me what you found.”

Which is a perfectly respectable amount of management.
