export function NewsSkeletons() {
  return (
    <div className="flex flex-col gap-3">
      {/* Breaking card skeleton */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="skeleton h-5 w-20" />
          <div className="skeleton h-4 w-16" />
        </div>
        <div className="skeleton mb-2 h-6 w-full" />
        <div className="skeleton mb-1 h-4 w-full" />
        <div className="skeleton mb-1 h-4 w-4/5" />
        <div className="skeleton h-4 w-3/5" />
      </div>

      {/* Standard card skeletons */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-[18px]">
          <div className="mb-2 flex items-center justify-between">
            <div className="skeleton h-4 w-20" />
            <div className="skeleton h-4 w-14" />
          </div>
          <div className="skeleton mb-2 h-4 w-full" />
          <div className="skeleton mb-1 h-3 w-full" />
          <div className="skeleton mb-1 h-3 w-11/12" />
          <div className="skeleton h-3 w-3/4" />
        </div>
      ))}
    </div>
  )
}
