export default function SectionGoldDivider() {
  return (
    <div className="relative mb-12 flex items-center gap-4">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />
      <div className="h-1.5 w-1.5 rounded-full bg-[var(--gold-bright)] opacity-60" />
      <div className="h-2.5 w-2.5 rounded-full border border-[var(--border)]" />
      <div className="h-1.5 w-1.5 rounded-full bg-[var(--gold-bright)] opacity-60" />
      <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[var(--border)] to-transparent" />
    </div>
  )
}
