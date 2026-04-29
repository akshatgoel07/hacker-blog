import { memo, useMemo } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface BlogCardProps {
  authorName: string;
  title: string;
  content: string;
  publishedDate: string;
  id: number;
}

const stripMarkdown = (text: string) =>
  text
    .replace(/^#+\s+/gm, "")
    .replace(/[*_`>~]/g, "")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/\n+/g, " ");

export const BlogCard = memo(function BlogCard({
  id,
  authorName,
  title,
  content,
  publishedDate,
}: BlogCardProps) {
  const minutes = useMemo(
    () => Math.max(1, Math.ceil(content.length / 800)),
    [content],
  );
  const excerpt = useMemo(
    () => stripMarkdown(content).slice(0, 220).trim() + "…",
    [content],
  );

  return (
    <Link to={`/blog/${id}`} className="block group">
      <article className="border-b border-ink py-6 max-w-2xl">
        <div className="font-smallcaps text-[11px] text-ink-soft tracking-widest mb-1">
          {authorName} · {publishedDate} · {minutes} min read
        </div>
        <h2 className="font-display text-3xl md:text-4xl text-ink leading-tight capitalize group-hover:underline decoration-1 underline-offset-4">
          {title}
        </h2>
        <div className="mt-3 font-serif text-[15px] text-ink-soft leading-relaxed text-justify hyphens-auto">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{excerpt}</ReactMarkdown>
        </div>
        <div className="mt-3 font-smallcaps text-[11px] text-sepia tracking-widest">
          Continue reading →
        </div>
      </article>
    </Link>
  );
});

export function Circle() {
  return <div className="h-1 w-1 rounded-full bg-ink-soft"></div>;
}

export function Avatar({
  name,
  size = "small",
}: {
  name: string;
  size?: "small" | "big";
}) {
  return (
    <div
      className={`relative inline-flex items-center justify-center overflow-hidden border border-ink bg-parchment-100 ${
        size === "small" ? "w-6 h-6" : "w-10 h-10"
      }`}
    >
      <span
        className={`${
          size === "small" ? "text-xs" : "text-md"
        } font-display font-semibold text-ink`}
      >
        {name?.[0]?.toUpperCase()}
      </span>
    </div>
  );
}
