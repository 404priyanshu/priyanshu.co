import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Supabase is optional: without credentials the site builds and runs, just
// without view counts. Consumers must handle a null client.
const privateClient = url && serviceRoleKey ? createClient(url, serviceRoleKey) : null

export default privateClient
