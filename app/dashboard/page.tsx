import { Suspense } from 'react'
import { TransactionsTable } from '@/components/transactions-table'

function TableSkeleton() {
  return (
    <div className="rounded-md border p-4">
      <div className="animate-pulse space-y-3">
        <div className="h-8 bg-muted rounded w-full" />
        <div className="h-8 bg-muted rounded w-full" />
        <div className="h-8 bg-muted rounded w-full" />
        <div className="h-8 bg-muted rounded w-full" />
        <div className="h-8 bg-muted rounded w-full" />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Your financial transactions</p>
      </div>
      <Suspense fallback={<TableSkeleton />}>
        <TransactionsTable />
      </Suspense>
    </div>
  )
}
