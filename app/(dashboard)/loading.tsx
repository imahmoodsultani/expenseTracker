export default function DashboardLoading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 animate-pulse rounded-md bg-gray-200" />
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-md bg-gray-100" />
        ))}
      </div>
    </div>
  );
}
