'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { tablePageSize } from '@/data/magic'

export type Transaction = {
  id: string
  user_id: string
  date: string
  account_no: string
  description: string
  amount: string
  created_at: string
}

export type PaginatedResult<T> = {
  data: T[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}

export async function getTransactions(
  page: number = 1,
  pageSize: number = tablePageSize,
): Promise<PaginatedResult<Transaction>> {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getClaims()

  if (!authData?.claims?.sub) {
    redirect('/auth/login')
  }

  // Calculate offset
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  // Get total count and paginated data
  const { data, error, count } = await supabase
    .from('transactions')
    .select('*', { count: 'exact' })
    .order('date', { ascending: false })
    .range(from, to)

  if (error) {
    throw new Error(error.message)
  }

  const totalCount = count ?? 0

  return {
    data: data ?? [],
    totalCount,
    page,
    pageSize,
    totalPages: Math.ceil(totalCount / pageSize),
  }
}

export async function updateTransactionDescription(
  id: string,
  description: string,
): Promise<Transaction> {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getClaims()

  if (!authData?.claims?.sub) {
    redirect('/auth/login')
  }

  const trimmed = description.trim()
  if (!trimmed) {
    throw new Error('Description cannot be empty')
  }

  const { data, error } = await supabase
    .from('transactions')
    .update({ description: trimmed })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}
