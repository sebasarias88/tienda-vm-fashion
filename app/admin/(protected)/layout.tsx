import { createSupabaseServer } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/Sidebar'
import MobileAdminShell from '@/components/admin/mobile/MobileAdminShell'

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/admin/login')

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <AdminSidebar />
      <MobileAdminShell>
        <main className="min-h-screen md:ml-64">{children}</main>
      </MobileAdminShell>
    </div>
  )
}
