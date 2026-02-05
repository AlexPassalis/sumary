'use server'

import { db } from '@/app/lib/db'
import { transactions } from '@/app/lib/db/schema'
import { createClient } from '@/lib/supabase/server'
import { eq } from 'drizzle-orm'

export async function getTransactions() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()

  if (!data?.claims?.sub) {
    throw new Error('Unauthorized')
  }

  const userId = data.claims.sub as string

  const result = await db
    .select()
    .from(transactions)
    .where(eq(transactions.userId, userId))
    .orderBy(transactions.date)

  return result
}
