import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Link } from "react-router-dom";
import { Blog, useRelatedBlogs } from "../hooks";
import { Appbar } from "./Appbar";
import { formatPublishedDate } from "../lib/date";

import rehypeHighlight from "rehype-highlight";
// import "highlight.js/styles/github-dark.css";
// import "highlight.js/styles/default.css";

export const FullBlog = ({ blog }: { blog: Blog }) => {
  const { related } = useRelatedBlogs({ id: String(blog.id) });
  return (
    <div>
      <Appbar />
      <div className="flex justify-center py-20">
        <div className="px-20 w-full max-w-4xl py-4 border rounded-md bg overflow-hidden">
          <div className="">
            <div className="text-xl font-normal capitalize">{blog.title}</div>
            <div className="text-slate-500 pt-2 text-sm">
              {blog.author?.name ? `By ${blog.author.name} · ` : ""}
              {formatPublishedDate(blog.createdAt)}
            </div>
            <div className="pt-4 prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                  h1: ({ node, ...props }) => (
                    <h1
                      className="text-xl font-normal my-4 text-black/80"
                      {...props}
                    />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2
                      className="text-base  font-medium mt-8 mb-2  "
                      {...props}
                    />
                  ),
                  h3: ({ node, ...props }) => (
                    <h3
                      className=" font-normal mt-12 mb-2 text-black/70"
                      {...props}
                    />
                  ),
                  p: ({ node, ...props }) => (
                    <p
                      className="my-2 text-[15px] tracking-wide	 text-black/70"
                      {...props}
                    />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul
                      className="list-disc list-inside my-2 text-black/70"
                      {...props}
                    />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol
                      className="list-decimal list-inside my-2 text-black/70"
                      {...props}
                    />
                  ),
                  a: ({ node, ...props }) => (
                    <a className="text-blue-500 hover:underline" {...props} />
                  ),
                  blockquote: ({ node, ...props }) => (
                    <blockquote
                      className="border-l-4 border-gray-300 pl-4 my-2 italic"
                      {...props}
                    />
                  ),
                }}
              >
                {blog.content || ""}
              </ReactMarkdown>
            </div>
          </div>
          {related.length > 0 && (
            <div className="mt-12 border-t pt-6">
              <div className="text-base font-medium mb-3 text-black/80">
                Related posts
              </div>
              <ul className="space-y-3">
                {related.map((r) => (
                  <li key={r.id}>
                    <Link
                      to={`/blog/${r.id}`}
                      className="block group"
                    >
                      <div className="text-sm font-medium capitalize group-hover:underline">
                        {r.title}
                      </div>
                      <div className="text-xs text-slate-500">
                        {r.author?.name ? `By ${r.author.name} · ` : ""}
                        {formatPublishedDate(r.createdAt)}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
