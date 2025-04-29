import { Appbar } from "../components/Appbar";
import { BlogCard } from "../components/BlogCard";
import { BlogSkeleton } from "../components/BlogSkeleton";
import { useBlogs } from "../hooks";

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
    <div>
      <Appbar />

      <div className="mx-auto max-w-4xl sm:px-6 lg:px-8 flex flex-col justify-center py-12">
        {/* <div className="flex flex-col gap-y-5 ml-2 py-20">
          <p className="text-5xl font-medium ">
            Top Blogs posted on Hacker blog
          </p>
          <p className="text-lg text-black/60  ml-2">
            Learn about trending software trends
          </p>
        </div> */}
        <div className="flex flex-col justify-center items-center">
          {blogs.map((blog) => (
            <BlogCard
              id={blog.id}
              authorName={blog.author.name || "Anonymous"}
              title={blog.title}
              content={blog.content}
              publishedDate={"2nd Feb 2024"}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
