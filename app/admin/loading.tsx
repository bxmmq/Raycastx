export default function AdminLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      <div className="h-12 w-64 bg-white/5 rounded-xl mb-12 animate-pulse" />
      
      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md h-32 animate-pulse" />
        ))}
      </div>
      
      {/* Table Skeleton */}
      <div className="mt-12">
        <div className="h-8 w-48 bg-white/5 rounded-lg mb-6 animate-pulse" />
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden">
          <div className="h-12 bg-white/10 border-b border-white/10 animate-pulse" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 border-b border-white/5 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
