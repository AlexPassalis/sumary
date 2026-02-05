'use client'

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query'
import {
  getTransactions,
  updateTransactionDescription,
  type Transaction,
  type PaginatedResult,
} from '@/app/lib/actions/transactions'

export const transactionKeys = {
  all: ['transactions'] as const,
  list: (page: number) => [...transactionKeys.all, 'list', { page }] as const,
}

export function useTransactions(page: number = 1) {
  return useQuery({
    queryKey: transactionKeys.list(page),
    queryFn: () => getTransactions(page),
    placeholderData: keepPreviousData,
  })
}

export function useUpdateDescription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, description }: { id: string; description: string }) =>
      updateTransactionDescription(id, description),

    onMutate: async ({ id, description }) => {
      // Cancel any outgoing refetches for all pages
      await queryClient.cancelQueries({ queryKey: transactionKeys.all })

      // Get all cached pages and update them optimistically
      const queryCache = queryClient.getQueryCache()
      const queries = queryCache.findAll({ queryKey: transactionKeys.all })

      const previousData: {
        queryKey: readonly unknown[]
        data: PaginatedResult<Transaction> | undefined
      }[] = []

      queries.forEach((query) => {
        const data = query.state.data as
          | PaginatedResult<Transaction>
          | undefined
        if (data) {
          previousData.push({ queryKey: query.queryKey, data })
          queryClient.setQueryData<PaginatedResult<Transaction>>(
            query.queryKey,
            {
              ...data,
              data: data.data.map((t) =>
                t.id === id ? { ...t, description } : t,
              ),
            },
          )
        }
      })

      return { previousData }
    },

    onError: (_err, _variables, context) => {
      // Rollback all pages on error
      context?.previousData.forEach(({ queryKey, data }) => {
        queryClient.setQueryData(queryKey, data)
      })
    },

    onSettled: () => {
      // Refetch after mutation settles
      queryClient.invalidateQueries({ queryKey: transactionKeys.all })
    },
  })
}
