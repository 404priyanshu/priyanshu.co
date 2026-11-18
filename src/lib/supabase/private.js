import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL
// The publishable key runs as the anon role. Database grants limit it to
// reading view counts, calling increment_view_count and inserting bookmark
// submissions (supabase/migrations/20261012120000_least_privilege_server_key.sql).
// Keep it server-only anyway: no NEXT_PUBLIC_ prefix.
const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY

// Supabase is optional: without credentials the site builds and runs, just
// without view counts. Consumers must handle a null client.
const privateClient = url && publishableKey ? createClient(url, publishableKey) : null

export default privateClient
