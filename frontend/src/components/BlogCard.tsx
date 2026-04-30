import { memo, useMemo } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import type { PostTag } from "../hooks";

interface BlogCardProps {
  authorName: string;
  authorId?: string;
  title: string;
  content: string;
  publishedDate: string;
  id: number;
  tags?: PostTag[];
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
  authorId,
  title,
  content,
  publishedDate,
  tags,
}: BlogCardProps) {
  const minutes = useMemo(() => {
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 225));
  }, [content]);
  const excerpt = useMemo(
    () => stripMarkdown(content).slice(0, 220).trim() + "…",
    [content],
  );

  return (
    <article className="border-b border-ink py-6 max-w-2xl">
      <div className="font-smallcaps text-[11px] text-ink-soft tracking-widest mb-1">
        {authorId ? (
          <Link
            to={`/u/${authorId}`}
            className="hover:text-sepia-dark hover:underline decoration-1 underline-offset-4"
          >
            {authorName}
          </Link>
        ) : (
          <span>{authorName}</span>
        )}
        {" · "}
        {publishedDate} · {minutes} min read
      </div>
      <Link to={`/blog/${id}`} className="block group">
        <h2 className="font-display text-3xl md:text-4xl text-ink leading-tight capitalize group-hover:underline decoration-1 underline-offset-4">
          {title}
        </h2>
        <div className="mt-3 font-serif text-[15px] text-ink-soft leading-relaxed text-justify hyphens-auto">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{excerpt}</ReactMarkdown>
        </div>
        <div className="mt-3 font-smallcaps text-[11px] text-sepia tracking-widest">
          Continue reading →
        </div>
      </Link>
      {tags && tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <Link
              key={t.id}
              to={`/blogs?tag=${encodeURIComponent(t.slug)}`}
              className="font-smallcaps text-[10px] tracking-widest border border-ink-faded text-ink-soft px-2 py-0.5 hover:border-ink hover:text-ink hover:bg-parchment-300 transition-colors"
            >
              #{t.slug}
            </Link>
          ))}
        </div>
      )}
    </article>
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
