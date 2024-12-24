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

export const BlogCard = ({
  id,
  authorName,
  title,
  content,
  publishedDate,
}: BlogCardProps) => {
  return (
    <Link to={`/blog/${id}`}>
      <div className="overflow-hidden rounded-lg bg-white shadow mt-4">
        <div className="px-4 py-5 sm:p-6  ">
          <div className=" pb-4 w-screen max-w-screen-md cursor-pointer space-y-4">
            <div className="flex flex-col gap-y-3 ">
              <div className="font-base text-sm flex flex-col justify-center ">
                {authorName}
              </div>
              <div className="text-slate-500 text-sm flex justify-center flex-col">
                {publishedDate}
              </div>
            </div>
            <div className="text-lg font-medium pt-2">{title}</div>
            <div className="text-sm text-black/60">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content.slice(0, 100) + "..."}
              </ReactMarkdown>
            </div>
            <div className="text-slate-500 text-sm  pt-4">
              {`${Math.ceil(content.length / 100)} minute(s) read`}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export function Circle() {
  return <div className="h-1 w-1 rounded-full bg-slate-500"></div>;
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
      className={`relative inline-flex items-center justify-center overflow-hidden bg-gray-600 rounded-full ${
        size === "small" ? "w-6 h-6" : "w-10 h-10"
      }`}
    >
      <span
        className={`${
          size === "small" ? "text-xs" : "text-md"
        } font-base text-gray-600 dark:text-gray-300`}
      >
        {name[0]}
      </span>
    </div>
  );
}
