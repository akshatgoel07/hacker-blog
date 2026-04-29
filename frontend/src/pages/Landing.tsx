import { Link } from "react-router-dom";

const todayLong = () =>
  new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const sections = [
  {
    name: "Front Page",
    description:
      "The day's stories, set in serif and laid out for unhurried reading. Cursor-paginated so you can keep going as long as the press has paper.",
  },
  {
    name: "Compose",
    description:
      "A markdown desk for filing your column. Save it to the drawer as a draft, or send it straight to press when it's ready.",
  },
  {
    name: "Scrapbook",
    description:
      "Clip stories you want to revisit. Your scrapbook is private; only you see what's in it.",
  },
  {
    name: "Search",
    description:
      "Look back through the archive — by headline, author, or any phrase that comes to mind.",
  },
  {
    name: "Columnists",
    description:
      "Click an author's name on any byline to read their full body of work.",
  },
  {
    name: "Quiet design",
    description:
      "Old-newspaper typography, drop caps, hairline rules. Built for prose, not for thumbs.",
  },
];

export const Landing = () => {
  return (
    <div className="min-h-screen">
      <header className="bg-parchment-200 border-b border-ink">
        <div className="max-w-6xl mx-auto px-4 md:px-8 pt-6 pb-3">
          <div className="flex items-center justify-between text-[11px] font-smallcaps text-ink-soft tracking-widest">
            <span>Founded MMXXIV</span>
            <span className="hidden md:inline">
              "All the code that's fit to print"
            </span>
            <span>Price: Free</span>
          </div>
          <hr className="news-rule-thin my-2" />
          <Link to="/blogs" className="block text-center select-none">
            <h1 className="font-blackletter text-6xl md:text-8xl text-ink leading-none">
              The Hacker Blog
            </h1>
          </Link>
          <hr className="news-rule my-3" />
          <div className="flex items-center justify-between text-[12px] font-smallcaps text-ink-soft">
            <span className="hidden sm:inline">{todayLong()}</span>
            <nav className="flex items-center gap-5">
              <Link
                to="/blogs"
                className="hover:underline underline-offset-4 decoration-1"
              >
                Front Page
              </Link>
              <Link
                to="/search"
                className="hover:underline underline-offset-4 decoration-1"
              >
                Search
              </Link>
              <Link
                to="/signin"
                className="hover:underline underline-offset-4 decoration-1"
              >
                Sign in
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 md:px-10 py-14">
        <div className="text-center font-smallcaps text-xs text-sepia tracking-[0.4em] mb-3">
          ❦ Inaugural Edition ❦
        </div>
        <h2 className="text-center font-display text-4xl md:text-6xl text-ink leading-tight mb-4">
          Where developers file the news.
        </h2>
        <p className="text-center font-serif text-lg text-ink-soft leading-relaxed max-w-xl mx-auto">
          A small newsroom for engineers, writers, and tinkerers. Pen a column,
          publish to the wire, and join a quiet correspondence with readers who
          actually want to read.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
          <Link
            to="/signup"
            className="font-smallcaps tracking-[0.3em] text-xs px-6 py-3 bg-ink text-parchment-100 border border-ink hover:bg-ink-soft transition-colors"
          >
            Subscribe
          </Link>
          <Link
            to="/blogs"
            className="font-smallcaps tracking-[0.3em] text-xs px-6 py-3 border border-ink text-ink hover:bg-ink hover:text-parchment-100 transition-colors"
          >
            Read today's edition
          </Link>
        </div>

        <hr className="news-rule-double my-14" />

        <div className="text-center font-smallcaps text-xs text-sepia tracking-[0.4em] mb-2">
          ❦ Today's Sections ❦
        </div>
        <hr className="news-rule-thin mb-6" />
        <div className="grid gap-x-8 gap-y-6 md:grid-cols-2">
          {sections.map((s) => (
            <div key={s.name} className="border-t border-ink pt-3">
              <div className="font-display text-xl text-ink leading-snug mb-1">
                {s.name}
              </div>
              <p className="font-serif text-[14px] text-ink-soft leading-relaxed">
                {s.description}
              </p>
            </div>
          ))}
        </div>

        <hr className="news-rule-double my-14" />

        <blockquote className="font-display italic text-2xl text-ink leading-snug text-center">
          "The art of writing is the art of discovering what you believe."
        </blockquote>
        <p className="text-center font-smallcaps text-sm text-ink-soft tracking-widest mt-3">
          — Gustave Flaubert
        </p>
      </main>

      <footer className="border-t border-ink mt-12 bg-parchment-200">
        <div className="max-w-3xl mx-auto px-6 md:px-10 py-8 text-center font-smallcaps text-[11px] text-ink-faded tracking-widest">
          Set in Playfair Display & Lora · Composed by{" "}
          <a
            href="https://github.com/akshatgoel07"
            target="_blank"
            rel="noreferrer"
            className="text-sepia hover:text-sepia-dark underline decoration-1 underline-offset-4"
          >
            Akshat Goel
          </a>
          <br />
          <span className="not-italic">
            © {new Date().getFullYear()} The Hacker Blog · An open ledger
          </span>
        </div>
      </footer>
    </div>
  );
};
