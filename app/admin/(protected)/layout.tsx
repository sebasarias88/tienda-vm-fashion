import { createSupabaseServer } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/Sidebar'

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/admin/login')

  return (
    <div className="flex min-h-screen bg-[var(--bg-base)]">
      <AdminSidebar />
      <main className="flex-1 ml-64 min-h-screen">
        {children}
      </main>
    </div>
  )
}
