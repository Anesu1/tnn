import 'server-only'

import { createClient, type SanityClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env'

let writeClient: SanityClient | undefined

// Server-only client for the writer portal: reads drafts and creates/updates them.
// Needs an Editor token from sanity.io/manage → API → Tokens in SANITY_API_WRITE_TOKEN.
export function getWriteClient(): SanityClient {
  if (!writeClient) {
    const token = process.env.SANITY_API_WRITE_TOKEN
    if (!token) {
      throw new Error('Missing environment variable: SANITY_API_WRITE_TOKEN')
    }
    writeClient = createClient({
      projectId,
      dataset,
      apiVersion,
      token,
      useCdn: false,
      perspective: 'raw',
    })
  }
  return writeClient
}
