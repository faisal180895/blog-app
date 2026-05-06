export function SkeletonLoader() {
  return (
    <div className="animate-pulse">
      <div className="h-4 bg-[color:var(--border)] rounded mb-3"></div>
      <div className="h-4 bg-[color:var(--border)] rounded mb-3 w-5/6"></div>
      <div className="h-4 bg-[color:var(--border)] rounded mb-3 w-4/6"></div>
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="card p-6 animate-pulse space-y-4">
      <div className="h-6 bg-[color:var(--border)] rounded w-3/4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-[color:var(--border)] rounded"></div>
        <div className="h-4 bg-[color:var(--border)] rounded w-5/6"></div>
      </div>
      <div className="h-10 bg-[color:var(--border)] rounded"></div>
    </div>
  )
}

export function ImageSkeleton() {
  return (
    <div className="aspect-video bg-[color:var(--border)] rounded-lg animate-pulse"></div>
  )
}

export function PostCardSkeleton() {
  return (
    <div className="card overflow-hidden animate-pulse">
      <ImageSkeleton />
      <div className="p-6 space-y-4">
        <div className="h-4 bg-[color:var(--border)] rounded w-2/6"></div>
        <div className="h-6 bg-[color:var(--border)] rounded"></div>
        <div className="space-y-2">
          <div className="h-4 bg-[color:var(--border)] rounded"></div>
          <div className="h-4 bg-[color:var(--border)] rounded w-4/6"></div>
        </div>
        <div className="h-10 bg-[color:var(--border)] rounded"></div>
      </div>
    </div>
  )
}
