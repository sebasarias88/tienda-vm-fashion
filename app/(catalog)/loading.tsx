import { Skeleton, ProductCardSkeleton } from '@/components/ui/Skeleton'

export default function CatalogHomeLoading() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative flex min-h-[78vh] flex-col items-center justify-center gap-5 px-6 pt-24 text-center">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-10 w-[min(30rem,90%)]" />
        <Skeleton className="h-10 w-[min(20rem,70%)]" />
        <Skeleton className="mt-2 h-4 w-[min(26rem,85%)]" />
        <Skeleton className="mt-6 h-12 w-full max-w-md rounded-full" />
      </section>

      {/* Categorías */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col items-center gap-3">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-7 w-56 max-w-[70%]" />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/3] w-full rounded-xl" />
          ))}
        </div>
      </section>

      {/* Destacados */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col items-center gap-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-64 max-w-[80%]" />
        </div>
        <div className="grid grid-cols-2 gap-px sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </section>
    </div>
  )
}
