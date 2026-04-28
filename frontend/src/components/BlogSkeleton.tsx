export const BlogSkeleton = () => {
  return (
    <div role="status" className="animate-pulse">
      <div className="border-b border-ink py-6 max-w-2xl">
        <div className="h-3 bg-parchment-300 w-64 mb-3"></div>
        <div className="h-7 bg-parchment-300 w-full mb-2"></div>
        <div className="h-7 bg-parchment-300 w-3/4 mb-4"></div>
        <div className="h-3 bg-parchment-300 w-full mb-2"></div>
        <div className="h-3 bg-parchment-300 w-full mb-2"></div>
        <div className="h-3 bg-parchment-300 w-5/6"></div>
      </div>
      <span className="sr-only">Setting type…</span>
    </div>
  );
};
