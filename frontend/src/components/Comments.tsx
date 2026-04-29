import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Comment,
  useAddComment,
  useComments,
  useDeleteComment,
} from "../hooks";
import { formatPublishedDate } from "../lib/date";

interface CommentsProps {
  postId: string;
  postAuthorId?: string;
}

const currentUserId = (): string | null => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return typeof payload?.id === "string" ? payload.id : null;
  } catch {
    return null;
  }
};

export const Comments = ({ postId, postAuthorId }: CommentsProps) => {
  const { comments, loading } = useComments(postId);
  const add = useAddComment(postId);
  const del = useDeleteComment(postId);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [me, setMe] = useState<string | null>(null);

  useEffect(() => {
    setMe(currentUserId());
  }, []);

  const signedIn = !!me;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return;
    setError(null);
    try {
      await add.mutateAsync(trimmed);
      setDraft("");
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Couldn't post your reply.");
    }
  };

  const canDelete = (c: Comment) =>
    signedIn && (c.author.id === me || postAuthorId === me);

  return (
    <section className="mt-12">
      <hr className="news-rule my-6" />
      <h3 className="font-smallcaps text-center text-base text-ink tracking-[0.3em] mb-4">
        Letters to the Editor
      </h3>

      {loading ? (
        <p className="font-serif italic text-ink-faded text-center">
          Pulling correspondence…
        </p>
      ) : comments.length === 0 ? (
        <p className="font-serif italic text-ink-faded text-center">
          No letters yet. Be the first to write in.
        </p>
      ) : (
        <ul className="space-y-6">
          {comments.map((c) => (
            <li key={c.id} className="border-l-2 border-ink pl-5">
              <div className="font-smallcaps text-[11px] text-ink-soft tracking-widest mb-1 flex items-baseline gap-2 flex-wrap">
                <Link
                  to={`/u/${c.author.id}`}
                  className="hover:text-sepia-dark hover:underline decoration-1 underline-offset-4"
                >
                  {c.author.name || "Anonymous"}
                </Link>
                <span>·</span>
                <span>{formatPublishedDate(c.createdAt)}</span>
                {canDelete(c) && (
                  <button
                    onClick={() => del.mutate(c.id)}
                    disabled={del.isPending}
                    className="ml-auto text-ink-faded hover:text-destructive disabled:opacity-50 underline decoration-1 underline-offset-4"
                  >
                    {del.isPending ? "…" : "Retract"}
                  </button>
                )}
              </div>
              <p className="font-serif text-[15px] text-ink-soft leading-relaxed whitespace-pre-wrap">
                {c.content}
              </p>
            </li>
          ))}
        </ul>
      )}

      {signedIn ? (
        <form onSubmit={submit} className="mt-8">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={4}
            maxLength={2000}
            placeholder="Write a letter to the editor…"
            className="w-full bg-parchment-100 border border-ink text-ink font-serif text-[15px] px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ink"
          />
          {error && (
            <p className="mt-2 font-serif italic text-destructive text-sm">
              {error}
            </p>
          )}
          <div className="flex items-center justify-between mt-2">
            <span className="font-smallcaps text-[10px] text-ink-faded tracking-widest">
              {draft.trim().length}/2000
            </span>
            <button
              type="submit"
              disabled={add.isPending || !draft.trim()}
              className="font-smallcaps tracking-[0.3em] text-xs px-5 py-2 bg-ink text-parchment-100 border border-ink hover:bg-ink-soft disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {add.isPending ? "Mailing…" : "Send letter"}
            </button>
          </div>
        </form>
      ) : (
        <p className="font-serif italic text-ink-faded text-center mt-6">
          <Link
            to="/signin"
            className="text-sepia underline decoration-1 underline-offset-4 hover:text-sepia-dark"
          >
            Sign in
          </Link>{" "}
          to leave a letter.
        </p>
      )}
    </section>
  );
};
