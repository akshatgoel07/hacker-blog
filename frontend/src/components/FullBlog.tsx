import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Blog } from "../hooks";
import { Appbar } from "./Appbar";
import { Avatar } from "./BlogCard";

export const FullBlog = ({ blog }: { blog: Blog }) => {
	return (
		<div>
			<Appbar />
			<div className="flex justify-center">
				<div className="grid grid-cols-12 px-10 w-full pt-200 max-w-screen-xl pt-12">
					<div className="col-span-8">
						<div className="text-5xl font-bold capitalize">
							{blog.title}
						</div>
						<div className="text-slate-500 pt-2">
							Post on 2nd k 2023
						</div>
						<div className="pt-4 prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none">
							<ReactMarkdown
								remarkPlugins={[remarkGfm]}
								components={{
									h1: ({ node, ...props }) => (
										<h1
											className="text-3xl font-bold my-4"
											{...props}
										/>
									),
									h2: ({ node, ...props }) => (
										<h2
											className="text-2xl font-semibold my-3"
											{...props}
										/>
									),
									h3: ({ node, ...props }) => (
										<h3
											className="text-xl font-semibold my-2"
											{...props}
										/>
									),
									p: ({ node, ...props }) => (
										<p className="my-2" {...props} />
									),
									ul: ({ node, ...props }) => (
										<ul
											className="list-disc list-inside my-2"
											{...props}
										/>
									),
									ol: ({ node, ...props }) => (
										<ol
											className="list-decimal list-inside my-2"
											{...props}
										/>
									),
									a: ({ node, ...props }) => (
										<a
											className="text-blue-500 hover:underline"
											{...props}
										/>
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
					<div className="col-span-4">
						<div className="text-slate-600 text-lg">Author</div>
						<div className="flex w-full">
							<div className="pr-4 flex flex-col justify-center">
								<Avatar
									size="small"
									name={blog?.author?.name || "Anonymous"}
								/>
							</div>
							<div>
								<div className="text-base font-md">
									{blog.author.name || "Anonymous"}
								</div>
								<div className="pt-2 text-slate-500"></div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
