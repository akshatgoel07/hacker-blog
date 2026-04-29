import { useParams } from "react-router-dom";
import { Appbar } from "../components/Appbar";
import { BlogCard } from "../components/BlogCard";
import { useAuthorPosts, usePublicUser } from "../hooks";
import { formatPublishedDate } from "../lib/date";

export const AuthorProfile = () => {
  const { id } = useParams();
  const { user, loading: userLoading, error: userError } = usePublicUser(id);
  const { posts, loading: postsLoading } = useAuthorPosts(id);

  if (userLoading) {
    return (
      <div className="min-h-screen">
        <Appbar />
        <main className="text-center py-20 font-serif italic text-ink-faded">
          Setting type…
        </main>
      </div>
    );
  }

  if (userError || !user) {
    return (
      <div className="min-h-screen">
        <Appbar />
        <main className="text-center py-20 font-serif italic text-destructive">
          We couldn't find that columnist.
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Appbar />
      <main className="max-w-3xl mx-auto px-6 md:px-10 py-10">
        <div className="text-center font-smallcaps text-xs text-sepia tracking-[0.4em] mb-2">
          ❦ Columnist ❦
        </div>
        <h1 className="text-center font-display text-4xl md:text-5xl text-ink mb-2 capitalize">
          {user.name || "Anonymous"}
        </h1>
        <hr className="news-rule-double my-6" />

        <h2 className="font-display text-xl text-ink mb-1">Stories filed</h2>
        <hr className="news-rule-thin mb-2" />

        {postsLoading ? (
          <p className="font-serif italic text-ink-faded mt-4">
            Pulling clippings…
          </p>
        ) : posts.length === 0 ? (
          <p className="font-serif italic text-ink-faded mt-4">
            This columnist hasn't filed any stories yet.
          </p>
        ) : (
          <div className="flex flex-col items-center">
            {posts.map((p) => (
              <BlogCard
                key={p.id}
                id={p.id}
                authorName={user.name || "Anonymous"}
                title={p.title}
                content={p.content}
                publishedDate={formatPublishedDate(p.createdAt)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
