export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl">
      <div className="skeleton aspect-[3/4] rounded-2xl" />
      <div className="space-y-2 p-3">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-4 w-1/2 rounded" />
      </div>
    </div>
  );
}