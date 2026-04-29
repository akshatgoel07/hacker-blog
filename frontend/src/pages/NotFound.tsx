import { Link } from "react-router-dom";
import { Appbar } from "../components/Appbar";

export const NotFound = () => {
  return (
    <div className="min-h-screen">
      <Appbar />
      <main className="max-w-2xl mx-auto px-6 md:px-10 py-20 text-center">
        <div className="font-smallcaps text-xs text-sepia tracking-[0.4em] mb-4">
          ❦ Stop the Press ❦
        </div>
        <h1 className="font-display text-5xl md:text-7xl text-ink leading-none mb-4">
          404
        </h1>
        <hr className="news-rule-double mb-6" />
        <p className="font-display text-2xl text-ink italic mb-2">
          Story not found.
        </p>
        <p className="font-serif text-ink-soft mb-10">
          The article you're looking for may have been pulled, retitled, or it
          never made the edition. Try the{" "}
          <Link
            to="/blogs"
            className="text-sepia underline decoration-1 underline-offset-4 hover:text-sepia-dark"
          >
            front page
          </Link>{" "}
          for today's stories.
        </p>
        <div className="flex justify-center gap-3">
          <Link
            to="/blogs"
            className="font-smallcaps tracking-[0.3em] text-xs px-6 py-2 bg-ink text-parchment-100 border border-ink hover:bg-ink-soft"
          >
            Front Page
          </Link>
          <Link
            to="/"
            className="font-smallcaps tracking-[0.3em] text-xs px-6 py-2 border border-ink text-ink hover:bg-ink hover:text-parchment-100"
          >
            Masthead
          </Link>
        </div>
      </main>
    </div>
  );
};
