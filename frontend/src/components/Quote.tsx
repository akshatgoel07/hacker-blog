export const Quote = () => {
  return (
    <div className="bg-parchment-300 h-screen flex justify-center flex-col px-10 border-l border-ink">
      <div className="max-w-md mx-auto">
        <div className="font-smallcaps text-xs text-sepia tracking-[0.4em] mb-2">
          ❦ From the Editor ❦
        </div>
        <hr className="news-rule-double mb-6" />
        <p className="font-display italic text-3xl leading-snug text-ink">
          "The art of writing is the art of discovering what you believe."
        </p>
        <p className="font-smallcaps text-sm text-ink-soft tracking-widest mt-4">
          — Gustave Flaubert
        </p>
        <hr className="news-rule-thin my-8" />
        <p className="font-serif text-sm text-ink-soft leading-relaxed">
          Welcome to <span className="font-display font-semibold">The Hacker Blog</span>,
          a daily ledger of code, craft, and curiosity. Pen your own column,
          publish to the wire, and join a quiet correspondence among developers.
        </p>
      </div>
    </div>
  );
};
