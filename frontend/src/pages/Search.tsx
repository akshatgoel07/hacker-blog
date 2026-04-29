import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Appbar } from "../components/Appbar";
import { BlogCard } from "../components/BlogCard";
import { useSearchBlogs } from "../hooks";
import { formatPublishedDate } from "../lib/date";

export const Search = () => {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const initial = params.get("q") ?? "";
  const [draft, setDraft] = useState(initial);
  const { posts, loading, enabled } = useSearchBlogs(initial);

  useEffect(() => {
    setDraft(initial);
  }, [initial]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = draft.trim();
    if (!next) {
      navigate("/blogs");
      return;
    }
    setParams({ q: next });
  };

  return (
    <div className="min-h-screen">
      <Appbar />
      <main className="max-w-3xl mx-auto px-6 md:px-10 py-10">
        <div className="text-center font-smallcaps text-xs text-sepia tracking-[0.4em] mb-2">
          ❦ Archive Search ❦
        </div>
        <h1 className="text-center font-display text-3xl md:text-4xl text-ink mb-6">
          Search the morgue
        </h1>
        <form onSubmit={onSubmit} className="flex gap-2 mb-6">
          <input
            type="search"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Try a headline, an author, or a phrase…"
            className="flex-1 bg-parchment-100 border border-ink text-ink font-serif text-base px-4 py-2 focus:outline-none focus:ring-1 focus:ring-ink"
          />
          <button
            type="submit"
            className="font-smallcaps tracking-[0.3em] text-xs px-5 py-2 bg-ink text-parchment-100 border border-ink hover:bg-ink-soft"
          >
            Find
          </button>
        </form>
        <hr className="news-rule-thin mb-4" />

        {!enabled ? (
          <p className="font-serif italic text-ink-faded text-center mt-8">
            Type at least two characters to search.
          </p>
        ) : loading ? (
          <p className="font-serif italic text-ink-faded text-center mt-8">
            Pulling clippings…
          </p>
        ) : posts.length === 0 ? (
          <p className="font-serif italic text-ink-faded text-center mt-8">
            No stories matched <em>"{initial}"</em>. Try a different phrase.
          </p>
        ) : (
          <>
            <div className="font-smallcaps text-[11px] text-ink-soft tracking-widest mb-2">
              {posts.length} {posts.length === 1 ? "result" : "results"} for{" "}
              <em className="not-italic">"{initial}"</em>
            </div>
            <div className="flex flex-col items-center">
              {posts.map((p) => (
                <BlogCard
                  key={p.id}
                  id={p.id}
                  authorName={p.author?.name || "Anonymous"}
                  authorId={p.author?.id}
                  title={p.title}
                  content={p.content}
                  publishedDate={formatPublishedDate(p.createdAt)}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};
