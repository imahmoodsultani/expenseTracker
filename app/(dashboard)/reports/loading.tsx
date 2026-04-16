export default function ReportsLoading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-56 animate-pulse rounded-md bg-gray-200" />
      <div className="flex gap-3">
        <div className="h-9 w-32 animate-pulse rounded-md bg-gray-100" />
        <div className="h-9 w-40 animate-pulse rounded-md bg-gray-100" />
      </div>
      <div className="h-72 animate-pulse rounded-lg bg-gray-100" />
    </div>
  );
}
