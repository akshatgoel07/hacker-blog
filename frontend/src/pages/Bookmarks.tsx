import { Link } from "react-router-dom";
import { Appbar } from "../components/Appbar";
import { BlogCard } from "../components/BlogCard";
import { useBookmarks } from "../hooks";
import { formatPublishedDate } from "../lib/date";

export const Bookmarks = () => {
  const { bookmarks, loading, enabled } = useBookmarks();

  if (!enabled) {
    return (
      <div className="min-h-screen">
        <Appbar />
        <main className="max-w-2xl mx-auto px-6 md:px-10 py-20 text-center">
          <p className="font-display text-2xl text-ink italic mb-4">
            Sign in to view your scrapbook.
          </p>
          <Link
            to="/signin"
            className="font-smallcaps tracking-[0.3em] text-xs px-6 py-2 bg-ink text-parchment-100 border border-ink hover:bg-ink-soft"
          >
            Enter the Newsroom
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Appbar />
      <main className="max-w-3xl mx-auto px-6 md:px-10 py-10">
        <div className="text-center font-smallcaps text-xs text-sepia tracking-[0.4em] mb-2">
          ❦ Personal Archive ❦
        </div>
        <h1 className="text-center font-display text-3xl md:text-4xl text-ink mb-2">
          Your Scrapbook
        </h1>
        <hr className="news-rule-double my-6" />

        {loading ? (
          <p className="font-serif italic text-ink-faded text-center mt-8">
            Pulling your clippings…
          </p>
        ) : bookmarks.length === 0 ? (
          <p className="font-serif italic text-ink-faded text-center mt-8">
            Your scrapbook is empty. Find a story you like and{" "}
            <em className="not-italic">Clip it</em>.
          </p>
        ) : (
          <div className="flex flex-col items-center">
            {bookmarks.map((b) => (
              <BlogCard
                key={b.id}
                id={b.id}
                authorName={b.author?.name || "Anonymous"}
                authorId={b.author?.id}
                title={b.title}
                content={b.content}
                publishedDate={formatPublishedDate(b.createdAt)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
