import 'server-only'

import { choice, noul, TypeSafeClient } from '@typesafe-ai/sdk'

// Rejecting a genuine submission is worse than letting spam into the submissions
// inbox, which gets reviewed by hand anyway, so the bar for rejecting is high.
const SPAM_REJECT = 0.9
const SPAM_REVIEW = 0.5
const FIT_REVIEW = 0.3
// Below this the suggested collection is a guess, and "Other" is more honest.
const COLLECTION_CONFIDENCE = 0.6

const NO_COLLECTION = 'none'

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
    [NO_COLLECTION]: 'None of these collections fit'
  })
})

/**
 * Asks Jev what a submitted page is, and turns the answers into a decision.
 *
 * Returns `null` when moderation is unavailable (no API key, or the API failed),
 * so a TypeSafe outage never blocks a submission.
 */
export async function moderateBookmark({ url, preview, collections }) {
  if (!process.env.TYPESAFE_API_KEY) return null

  try {
    const client = new TypeSafeClient({ timeout: 4000, retry: { maxRetries: 1 } })
    const { answers, usage } = await client.systemOne({
      state: {
        submittedUrl: url,
        // Without a preview the model only has the URL to go on, and says so
        // through less extreme probabilities.
        page: preview ?? 'The page could not be fetched.'
      },
      questions: buildQuestions(collections)
    })

    const spam = answers.isSpam.noul
    const fit = answers.isFit.noul
    const { choice: collection, confidence } = answers.collection

    // An unreadable page is judged from its URL alone, which is not enough to
    // reject someone's submission.
    const reject = Boolean(preview) && spam >= SPAM_REJECT
    const review = !reject && (spam >= SPAM_REVIEW || fit < FIT_REVIEW)

    return {
      decision: reject ? 'reject' : review ? 'review' : 'accept',
      spam,
      fit,
      suggestedCollection: collection !== NO_COLLECTION && confidence >= COLLECTION_CONFIDENCE ? collection : null,
      collectionConfidence: confidence,
      previewed: Boolean(preview),
      inputTokens: usage.input_tokens
    }
  } catch (error) {
    console.error(`Bookmark moderation failed: ${error?.message ?? error}`)
    return null
  }
}
