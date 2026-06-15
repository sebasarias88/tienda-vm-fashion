export default function SectionGoldDivider() {
  return (
    <div className="relative mb-12 flex items-center gap-4">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[rgba(212,175,55,0.3)] to-transparent" />
      <div className="h-1.5 w-1.5 rounded-full bg-[#D4AF37] opacity-60" />
      <div className="h-2.5 w-2.5 rounded-full border border-[rgba(212,175,55,0.5)]" />
      <div className="h-1.5 w-1.5 rounded-full bg-[#D4AF37] opacity-60" />
      <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[rgba(212,175,55,0.3)] to-transparent" />
    </div>
  )
}
