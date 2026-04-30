import { Link, useSearchParams } from "react-router-dom";
import { Appbar } from "../components/Appbar";
import { BlogCard } from "../components/BlogCard";
import { BlogSkeleton } from "../components/BlogSkeleton";
import { useBlogs } from "../hooks";
import { formatPublishedDate } from "../lib/date";

export const Blogs = () => {
  const [params] = useSearchParams();
  const tag = params.get("tag") ?? undefined;
  const { loading, loadingMore, blogs, hasMore, loadMore } = useBlogs({ tag });

  if (loading) {
    return (
      <div>
        <Appbar />
        <div className="flex justify-center">
          <div>
            <BlogSkeleton />
            <BlogSkeleton />
            <BlogSkeleton />
            <BlogSkeleton />
            <BlogSkeleton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Appbar />
      <main className="mx-auto max-w-3xl px-6 md:px-8 py-10">
        <div className="text-center font-smallcaps text-xs text-sepia tracking-[0.4em]">
          ❦ {tag ? "Tagged Stories" : "Today's Edition"} ❦
        </div>
        <h2 className="text-center font-display text-3xl md:text-4xl text-ink mt-2">
          {tag ? `#${tag}` : "Front Page"}
        </h2>
        {tag && (
          <div className="text-center mt-2">
            <Link
              to="/blogs"
              className="font-smallcaps text-[11px] text-sepia hover:text-sepia-dark tracking-widest underline decoration-1 underline-offset-4"
            >
              ← Back to all stories
            </Link>
          </div>
        )}
        <hr className="news-rule-double my-6" />
        {!loading && blogs.length === 0 && (
          <div className="text-center py-16">
            <p className="font-display text-2xl text-ink italic mb-2">
              {tag ? `No stories tagged #${tag} yet.` : "No issue today."}
            </p>
            <p className="font-serif text-ink-soft">
              {tag ? (
                <>
                  Try{" "}
                  <Link
                    to="/blogs"
                    className="text-sepia underline decoration-1 underline-offset-4 hover:text-sepia-dark"
                  >
                    the front page
                  </Link>{" "}
                  for the day's stories.
                </>
              ) : (
                <>
                  No stories have been filed yet. Check back tomorrow — or be
                  the first to{" "}
                  <a
                    href="/publish"
                    className="text-sepia underline decoration-1 underline-offset-4 hover:text-sepia-dark"
                  >
                    file one
                  </a>
                  .
                </>
              )}
            </p>
          </div>
        )}
        <div className="flex flex-col items-center">
          {blogs.map((blog) => (
            <BlogCard
              key={blog.id}
              id={blog.id}
              authorName={blog.author.name || "Anonymous"}
              authorId={blog.author.id}
              title={blog.title}
              content={blog.content}
              publishedDate={formatPublishedDate(blog.createdAt)}
              tags={blog.tags}
            />
          ))}
        </div>
        {hasMore && (
          <div className="flex justify-center mt-8">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="font-smallcaps tracking-[0.3em] text-xs px-6 py-2 border border-ink text-ink hover:bg-ink hover:text-parchment-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loadingMore ? "Setting type…" : "Read earlier issues"}
            </button>
          </div>
        )}
        {!hasMore && blogs.length > 0 && (
          <div className="text-center mt-10 font-smallcaps text-xs text-sepia tracking-[0.4em]">
            ❦ End of edition ❦
          </div>
        )}
      </main>
    </div>
  );
};
