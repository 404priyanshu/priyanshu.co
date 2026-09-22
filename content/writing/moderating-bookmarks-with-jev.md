---
title: 'Three Questions Before a Bookmark Gets In'
date: '2026-09-23'
description:
  "My bookmark form accepted anything with a valid URL. Here's how I put Jev in front of it: three typed questions,
  thresholds in code, and a fetch I had to lock down."
---

My bookmarks page has a small "submit a bookmark" form. You paste a URL, add your email, optionally pick a collection,
and it lands in a Supabase table that I go through by hand.

Until recently, its whole idea of quality control was: is this a URL, and is that an email?
`https://definitely-not-a-casino.example` passes both with flying colours.

I didn't want a chatbot deciding what gets in. I wanted a few answers my code could branch on: is this spam, does it
belong here, and if so, where? That's the kind of job [Jev](https://docs.typesafe.ai) is built for, so I put it in front
of the form.

## A model that doesn't write anything

Jev is TypeSafe's first [System One model](https://docs.typesafe.ai/concepts/system-one). Unlike a chat model, it
doesn't generate text. You send it some state and a set of questions, and it sends back typed answers with probabilities
attached. There's no prose to parse, and no "Sure! Here's your JSON:" to strip off the front.

There are three question types:

- **Noul**: a yes/no question. The answer is the probability that it's yes.
- **Choice**: pick one option from a set. You get the pick, a probability for every option, and a confidence value.
- **Score**: a position on ordered levels that you describe.

As of September 2026, the current model is `jev-1.13.0`. It costs $0.042 per million input tokens, and output tokens are
free. The [models page](https://docs.typesafe.ai/models) has the current numbers.

What I liked most was the division of labour. The model makes narrow judgments. My code decides what they mean.

## The form only sends a URL

A URL on its own isn't much to judge. `acme.dev` could be a lovely font foundry or an online pharmacy. So before asking
anything, the route fetches a small preview of the page: its title, meta description, site name and the first 1,500
characters of visible text.

Some sites won't talk to an unfamiliar fetcher, and that's fine. The preview comes back as `null`, and the model gets
the URL with a note that the page couldn't be read. Remember that `null`, because it matters later.

Fetching whatever URL a stranger typed into a form is a whole problem of its own. I'll come back to it.

<ArticleFigure
  src="/assets/writing/moderating-bookmarks-with-jev/moderation-flow.svg"
  alt="Flow of a bookmark submission: validate, fetch a page preview, ask Jev three questions in one request, apply the policy in code, then reject, flag for review, or accept. An unreadable page continues with the URL only, and a missing key or API error skips moderation."
  caption="Both dashed paths rejoin the normal flow. If moderation can't run, the submission goes through exactly as it did before."
  width="600"
  height="640"
/>

## Three questions, one request

These are the questions, lightly simplified from the helper:

```js
const buildQuestions = (collections) => ({
  isSpam: noul('Is this page spam, a scam, or low-value filler rather than a genuine website?', {
    true: 'Gambling, adult content, online pharmacies, crypto giveaways, phishing or fake login pages, parked domains, link farms, or pages that exist mainly to sell backlinks or ads',
    false: 'A real product, tool, library, course, article, portfolio, font or company site, even if it is commercial'
  }),
  isFit: noul({
    question: 'Would this page fit a public bookmarks collection curated by a frontend developer and designer?',
    collections
  }),
  collection: choice('Which of these bookmark collections does this page belong in?', {
    ...Object.fromEntries(collections.map((title) => [title, null])),
    none: 'None of these collections fit'
  })
})
```

There are a few decisions packed in there.

**Spam and fit are separate questions.** A perfectly legitimate SaaS landing page isn't spam, but it probably isn't
something I'd bookmark either. Folding both into "should I accept this?" would give me one number that means two things.
The [Noul docs](https://docs.typesafe.ai/primitives/noul) give the same advice: ask one yes/no question per Noul, and
combine the answers in code.

**The spam question says what counts.** The `true` and `false` criteria draw the line explicitly. "Even if it is
commercial" is doing a lot of work there. I don't want every company homepage treated as an ad.

**The collection options come from Raindrop.** The Choice options are my actual collections, fetched when the request
arrives, plus a `none` option. Without `none`, the model has to pick something, and that pharmacy ends up in "Random
Useful Stuff". To be fair, that is roughly what the collection is for.

The fit question gets the collection list too, passed as structured instructions. It's hard to judge whether something
fits without knowing what it's meant to fit into.

All three go in a single request:

```js
const { answers } = await client.systemOne({
  state: {
    submittedUrl: url,
    page: preview ?? 'The page could not be fetched.'
  },
  questions: buildQuestions(collections)
})
```

Jev evaluates the questions in parallel, so according to the [Choice docs](https://docs.typesafe.ai/primitives/choice),
the extra two barely change the response time. They do still cost tokens.

The question IDs, `isSpam`, `isFit` and `collection`, only exist for my code. They're never sent to the model, so the
full meaning has to live in the question text.

## Where the probability stops and the policy starts

It's tempting to treat 0.5 as the obvious cut-off and move on.

But the two ways of being wrong here don't cost the same. If spam slips through, I delete a row. If a real submission
gets rejected, someone took the time to share a link with me and got told it looked like spam. That's much worse.

So the thresholds are lopsided on purpose:

<ArticleFigure
  src="/assets/writing/moderating-bookmarks-with-jev/spam-thresholds.svg"
  alt="A spam probability scale from 0 to 1. Below 0.5 is accept, 0.5 to 0.9 is review, and 0.9 to 1 is reject. A wrong accept costs a row to delete; a wrong reject turns away a real link. Rejecting needs a readable page."
  caption="The reject band is deliberately narrow. Everything uncertain lands in review, where I make the call."
  width="600"
  height="330"
/>

```js
const reject = Boolean(preview) && spam >= 0.9
const review = !reject && (spam >= 0.5 || fit < 0.3)
```

Anything at 0.9 or above is rejected, but only if the model actually saw the page. That's the `null` from earlier. A
page that couldn't be fetched is judged from its URL alone, and a URL isn't enough evidence to turn someone away. At
most, it gets flagged.

The middle band is for honest uncertainty. A Noul around 0.5 doesn't mean "medium spam". It means the model gives yes
and no similar odds, which is exactly when I want to look myself.

A low fit score also goes to review, but it never rejects anything on its own. It's my collection; the model doesn't get
a veto on my taste.

The collection guess uses the Choice's confidence instead. If the submitter picked a collection, their pick wins. If
they left it blank and the confidence is at least 0.6, the guess fills in the Type field. Below that, it's "Other". A
wrong guess isn't a disaster, but I'd rather see "Other" than a guess that looks settled and isn't.

I should be honest: these numbers are starting points, not findings. It'll take a decent number of real submissions
before I can tune them properly.

## If Jev is down, nothing changes

Moderation is a nice extra. The form worked before it existed, so it has to keep working when moderation doesn't:

- **No `TYPESAFE_API_KEY`?** Moderation is skipped.
- **The API errors or times out?** The error is logged, and the submission goes through as before.
- **Someone is waiting on a spinner.** The client gets a 4-second timeout and one retry, instead of the SDK's defaults
  of 10 seconds and two retries.

The API key stays on the server. The SDK throws if you create a client in the browser, unless you pass an option called
`dangerouslyAllowBrowser`, which is a fairly clear hint.

## The part that wasn't about AI

Back to that preview fetch. It's a server requesting whatever URL a stranger typed into a form, which is the classic
setup for server-side request forgery (SSRF): point the server at `http://127.0.0.1` or a cloud metadata address and see
what it can reach.

So before the first request, and again after every redirect, the helper checks the URL:

- http or https only, on the default ports
- no credentials in the URL
- a hostname that doesn't resolve to a loopback, private, link-local or metadata address

I tested it with the usual tricks: `127.0.0.1`, `[::1]`, `169.254.169.254`, the decimal form `2130706433`, the shorthand
`0x7f.1`, a public domain that resolves to `127.0.0.1`, and a redirect that bounces to localhost. All blocked. Job done.

Except it wasn't. `http://[::ffff:127.0.0.1]/` got straight through.

That's an IPv4-mapped IPv6 address: the IPv4 address `127.0.0.1` written inside an IPv6 one. My check had a case for
exactly that format. The check just never saw that format, because the URL parser had already rewritten it:

```js
new URL('http://[::ffff:127.0.0.1]/').hostname
// '[::ffff:7f00:1]'
```

`7f00:1` is `127.0.0.1` in hexadecimal. My pattern was looking for dots, and there weren't any left. The address passed
as public, and the only reason nothing happened was that nothing on my machine was listening there.

The fix decodes the hex form back to IPv4 before checking it. It also covers the older IPv4-compatible form and the
NAT64 prefix:

```js
const embedded = address.match(/^(?:::ffff:|::|64:ff9b::)([0-9a-f]{1,4}):([0-9a-f]{1,4})$/)
if (embedded) {
  const [high, low] = embedded.slice(1).map((group) => parseInt(group, 16))
  return isPrivateIPv4(`${high >> 8}.${high & 255}.${low >> 8}.${low & 255}`)
}
```

The lesson I keep relearning: test what your check receives, not what you typed. The same `new URL()` that made
validation convenient had quietly normalised my test case into something my code didn't recognise.

I've left one gap open on purpose. The address is checked, and then `fetch` resolves the hostname again, so a DNS server
that answers differently the second time could slip through. The response never goes back to the person who submitted
the link, though. They only find out whether it was accepted. That's a small window with very little visible through it,
and closing it properly means writing a custom connection agent. Not today.

## The first real submission

The first link to go through the live form was the `src` folder of OpenAI's GPT-2 repository on GitHub. I sent it three
times while testing, and got the same verdict each time:

| Question              | Answer       |
| --------------------- | ------------ |
| Spam                  | 0.02         |
| Fit                   | 0.20 to 0.22 |
| Collection confidence | 0.42 to 0.46 |
| Input tokens          | 948          |

Not spam, obviously. But a bare folder of Python files isn't much of a bookmark, and Jev agreed: a fit around 0.2 sent
it to review. None of my collections was a confident match either, so the Type fell back to "Other" rather than a guess.
That's the behaviour I wanted, and the answers barely moved between runs.

At 948 input tokens, one check costs about $0.00004, or roughly 25,000 checks for a dollar. The bookmark form isn't
going to trouble that budget.

## What I'll look at next

Each submission now stores the spam and fit probabilities, the collection guess, its confidence and the token count
alongside the row. As more real links come in, that's the data I need to find out whether 0.9 is too cautious and
whether "fit" lines up with what I'd actually bookmark.

The part I'll take to other projects isn't really about this form. It's the split. Ask the model narrow questions it can
answer. Keep the thresholds, the fallbacks and the "what if it's wrong?" in code, where I can read them.

And test the IPv6 addresses. Apparently.
