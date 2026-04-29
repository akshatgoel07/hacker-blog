import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Link } from "react-router-dom";
import { Blog, useRelatedBlogs } from "../hooks";
import { Appbar } from "./Appbar";
import { formatPublishedDate } from "../lib/date";
import rehypeHighlight from "rehype-highlight";

export const FullBlog = ({ blog }: { blog: Blog }) => {
  const { related } = useRelatedBlogs({ id: String(blog.id) });

  return (
    <div className="min-h-screen">
      <Appbar />
      <main className="max-w-3xl mx-auto px-6 md:px-10 py-12">
        <div className="text-center font-smallcaps text-xs text-sepia tracking-[0.3em] mb-3">
          ❦ Featured Story ❦
        </div>

        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-center text-ink leading-tight capitalize">
          {blog.title}
        </h1>

        <div className="mt-4 text-center font-smallcaps text-[12px] text-ink-soft tracking-widest">
          <span>By </span>
          {blog.author?.id ? (
            <Link
              to={`/u/${blog.author.id}`}
              className="hover:text-sepia-dark hover:underline decoration-1 underline-offset-4"
            >
              {blog.author?.name || "Anonymous"}
            </Link>
          ) : (
            <span>{blog.author?.name || "Anonymous"}</span>
          )}
          <span className="mx-3">·</span>
          <span>{formatPublishedDate(blog.createdAt)}</span>
        </div>

        <hr className="news-rule-double my-8" />

        <article className="font-serif text-[17px] leading-[1.85] text-ink-soft text-justify hyphens-auto drop-cap">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={{
              h1: ({ node, ...props }) => (
                <h1
                  className="font-display text-3xl text-ink mt-10 mb-3 text-left"
                  {...props}
                />
              ),
              h2: ({ node, ...props }) => (
                <h2
                  className="font-display text-2xl text-ink mt-8 mb-3 text-left"
                  {...props}
                />
              ),
              h3: ({ node, ...props }) => (
                <h3
                  className="font-display text-xl text-ink mt-6 mb-2 text-left italic"
                  {...props}
                />
              ),
              p: ({ node, ...props }) => (
                <p className="my-4 indent-6 first:indent-0" {...props} />
              ),
              ul: ({ node, ...props }) => (
                <ul
                  className="list-disc list-outside ml-6 my-4 text-left space-y-1"
                  {...props}
                />
              ),
              ol: ({ node, ...props }) => (
                <ol
                  className="list-decimal list-outside ml-6 my-4 text-left space-y-1"
                  {...props}
                />
              ),
              a: ({ node, ...props }) => (
                <a
                  className="text-sepia underline decoration-1 underline-offset-4 hover:text-sepia-dark"
                  {...props}
                />
              ),
              blockquote: ({ node, ...props }) => (
                <blockquote
                  className="border-l-2 border-ink pl-5 my-6 italic font-display text-xl text-ink text-left"
                  {...props}
                />
              ),
              code: ({ node, ...props }) => (
                <code
                  className="font-mono text-[14px] bg-parchment-300 px-1 rounded-sm"
                  {...props}
                />
              ),
              pre: ({ node, ...props }) => (
                <pre
                  className="font-mono text-[13px] bg-ink text-parchment-100 p-4 my-6 overflow-x-auto text-left"
                  {...props}
                />
              ),
              hr: () => <hr className="news-rule-thin my-8" />,
            }}
          >
            {blog.content || ""}
          </ReactMarkdown>
        </article>

        <div className="text-center font-smallcaps text-[12px] text-sepia tracking-[0.4em] mt-12">
          ❦ ❦ ❦
        </div>

        {related.length > 0 && (
          <section className="mt-14">
            <hr className="news-rule my-6" />
            <h3 className="font-smallcaps text-center text-base text-ink tracking-[0.3em] mb-6">
              From The Archives
            </h3>
            <ul className="grid gap-6 md:grid-cols-3">
              {related.map((r) => (
                <li key={r.id}>
                  <Link
                    to={`/blog/${r.id}`}
                    className="block group border-t border-ink pt-3"
                  >
                    <div className="font-smallcaps text-[10px] text-ink-soft tracking-widest mb-1">
                      {r.author?.name ? `By ${r.author.name}` : "Staff"} ·{" "}
                      {formatPublishedDate(r.createdAt)}
                    </div>
                    <div className="font-display text-lg text-ink leading-snug capitalize group-hover:underline decoration-1 underline-offset-4">
                      {r.title}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
};
