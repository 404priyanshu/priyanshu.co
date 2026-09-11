import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Supabase is optional: without credentials the site builds and runs, just
// without view counts. Consumers must handle a null client.
const publicClient = url && anonKey ? createClient(url, anonKey) : null

export default publicClient
