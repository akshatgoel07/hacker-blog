import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Blog } from "../hooks";
import { Appbar } from "./Appbar";

import rehypeHighlight from "rehype-highlight";
// import "highlight.js/styles/github-dark.css";
// import "highlight.js/styles/default.css";

export const FullBlog = ({ blog }: { blog: Blog }) => {
  return (
    <div>
      <Appbar />
      <div className="flex justify-center py-20">
        <div className="px-20 w-full max-w-4xl py-4 border rounded-md bg overflow-hidden">
          <div className="">
            <div className="text-xl font-normal capitalize">{blog.title}</div>
            <div className="text-slate-500 pt-2 text-sm">July 2024</div>
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
          {/* <div className="col-span-4">
            <div className="text-slate-600 text-lg">Author</div>
            <div className="flex w-full">
              <div className="pr-4 flex flex-col justify-center">
                <Avatar size="small" name={blog?.author?.name || "Anonymous"} />
              </div>
              <div>
                <div className="text-base font-md">
                  {blog.author.name || "Anonymous"}
                </div>
                <div className="pt-2 text-slate-500"></div>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};
