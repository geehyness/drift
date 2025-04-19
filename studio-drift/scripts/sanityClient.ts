
import { createClient } from '@sanity/client';


const NEXT_PUBLIC_SANITY_PROJECT_ID='2vpucv9x'

const NEXT_PUBLIC_SANITY_DATASET='production'

const SANITY_API_WRITE_TOKEN='skr052EAZeJKQje7zGevLgoXaRSTZ5i0p0arDGZfvFPbwuR6Jo65p4ZEqzlruwYF9vs1fTQECh0l5SAW8psbGaJEmKaBGFO1qZmg4dWLmitdSY01JRjogGGcdNPtXDVWOg2cmoZGuVMbxsRxKkRuIYsD7PVUwqtlnsJS93bCprSgJWth7KXe'


export const writeClient = createClient({
    projectId: NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: NEXT_PUBLIC_SANITY_DATASET || 'production',
    token: SANITY_API_WRITE_TOKEN,
    apiVersion: '2023-10-01',
    useCdn: false, // Always false for write operations
  });
  