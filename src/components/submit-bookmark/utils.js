import { z } from 'zod'

export const formSchema = z.object({
  url: z
    .url({
      protocol: /^https?$/,
      error: 'Invalid URL.'
    })
    .max(2048, { error: 'URL is too long.' }),
  email: z
    .email({
      error: 'Invalid email address.'
    })
    .max(254, { error: 'Email address is too long.' }),
  type: z.string().max(100).optional().or(z.literal(''))
})
