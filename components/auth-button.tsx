import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LogoutButton } from './logout-button'

export async function AuthButton() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()

  const user = data?.claims

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="flex items-center gap-4">
      Hey, {user.email}!
      <LogoutButton />
    </div>
  )
}
