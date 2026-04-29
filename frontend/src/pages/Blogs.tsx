import { Appbar } from "../components/Appbar";
import { BlogCard } from "../components/BlogCard";
import { BlogSkeleton } from "../components/BlogSkeleton";
import { useBlogs } from "../hooks";
import { formatPublishedDate } from "../lib/date";

export const Blogs = () => {
  const { loading, blogs } = useBlogs();

  if (loading) {
    return (
      <div>
        <Appbar />
        <div className="flex justify-center">
          <div>
            <BlogSkeleton />
            <BlogSkeleton />
            <BlogSkeleton />
            <BlogSkeleton />
            <BlogSkeleton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Appbar />
      <main className="mx-auto max-w-3xl px-6 md:px-8 py-10">
        <div className="text-center font-smallcaps text-xs text-sepia tracking-[0.4em]">
          ❦ Today's Edition ❦
        </div>
        <h2 className="text-center font-display text-3xl md:text-4xl text-ink mt-2">
          Front Page
        </h2>
        <hr className="news-rule-double my-6" />
        <div className="flex flex-col items-center">
          {blogs.map((blog) => (
            <BlogCard
              key={blog.id}
              id={blog.id}
              authorName={blog.author.name || "Anonymous"}
              title={blog.title}
              content={blog.content}
              publishedDate={formatPublishedDate(blog.createdAt)}
            />
          ))}
        </div>
      </main>
    </div>
  );
};
