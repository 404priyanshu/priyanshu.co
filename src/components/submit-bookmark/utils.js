import { z } from 'zod'

export const formSchema = z.object({
  url: z.url({
    protocol: /^https?$/,
    error: 'Invalid URL.'
  }),
  email: z.email({
    error: 'Invalid email address.'
  }),
  type: z.string().optional().or(z.literal(''))
})
