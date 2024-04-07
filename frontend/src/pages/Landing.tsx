import image1 from "../assets/image.png";
import image5 from "../assets/image5.svg";

export const Landing = () => {
	return (
		<div className="flex flex-col min-h-[100dvh]">
			<header className="px-4 lg:px-20 h-14 flex items-center">
				<a className="flex items-center justify-center" href="#">
					<MountainIcon className="h-6 w-6" />
					<span className="sr-only">Mac studio</span>
				</a>
				<nav className="ml-auto flex gap-4 sm:gap-6">
					<a
						className="text-sm font-medium hover:underline underline-offset-4"
						href="https://www.linkedin.com/in/akshatgoel7/"
						target="_blank"
					>
						Linkedin
					</a>
					<a
						className="text-sm font-medium hover:underline underline-offset-4"
						href="https://github.com/akshatgoel07"
						target="_blank"
					>
						Github
					</a>
					<a
						className="text-sm font-medium hover:underline underline-offset-4"
						href="https://akshatgoel0.vercel.app/"
						target="_blank"
					>
						Portfolio
					</a>
					<a
						className="text-sm font-medium hover:underline underline-offset-4"
						href="https://twitter.com/akshato7"
						target="_blank"
					>
						Contact
					</a>
				</nav>
			</header>
			<main className="flex-1">
				<section className="w-full py-6 sm:py-12 md:py-24 lg:py-32 xl:py-48">
					<div className="container px-4 md:px-6">
						<div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
							<img
								alt="Hero"
								className="ml-20 mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last lg:aspect-square"
								height="150"
								src={image1}
								width="150"
							/>
							<div className="ml-20 flex flex-col justify-center space-y-4">
								<div className="space-y-2">
									<h1 className=" text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
										Where developer blogs meet community
										power!
									</h1>
									<p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
										Create and grow your developer blog,
										newsletter, or team engineering blog
										effortlessly with Hacker Blog.
									</p>
								</div>
								<div className="flex flex-col gap-2 min-[400px]:flex-row">
									<a
										className="inline-flex h-10 items-center justify-center rounded-md bg-gray-900 px-8 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus-visible:ring-gray-300"
										href="http://localhost:5173/signup"
									>
										Sign Up
									</a>
									<a
										className="inline-flex h-10 items-center justify-center rounded-md border border-gray-200 bg-white px-8 text-sm font-medium shadow-sm transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-800 dark:text-gray-50 dark:focus-visible:ring-gray-300"
										href="http://localhost:5173/signin"
									>
										LogIn
									</a>
								</div>
							</div>
						</div>
					</div>
				</section>
				<section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-100">
					<div className="container px-4 mx-auto md:px-6">
						<div className="flex flex-col items-center justify-center space-y-4 text-center">
							<div className="space-y-2">
								<div className="inline-block rounded-lg px-3 py-1 text-sm">
									 Features
								</div>
								<h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                                Faster iteration. More innovation.

								</h2>
								<p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                                Explore the Latest Trends, Tips, and Tricks in Technology and Development


								</p>
							</div>
						</div>
						<div className="mx-auto grid max-w-5xl items-center justify-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
							<img
								alt="Image"
								className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
								height="390"
								src={image5}
								width="340"
							/>
							<div className="flex flex-col justify-center space-y-4">
								<ul className="grid gap-6">
									<li>
										<div className="grid gap-1">
											<h3 className="text-xl font-bold">
                                            Streamlined Markdown Editing
											</h3>
											<p className="text-gray-500 dark:text-gray-400">
                                            Simplify Your Workflow with Intuitive Markdown Editing Tools
											</p>
										</div>
									</li>
									<li>
										<div className="grid gap-1">
											<h3 className="text-xl font-bold">
                                            Intuitive WYSIWYG Experience
											</h3>
											<p className="text-gray-500 dark:text-gray-400">
                                            Visualize Your Content Instantly with our User-Friendly Editor
											</p>
										</div>
									</li>
									<li>
										<div className="grid gap-1">
											<h3 className="text-xl font-bold">
												
Seamless Integration and Collaboration
											</h3>
											<p className="text-gray-500 dark:text-gray-400">
                                            Enhance Teamwork and Efficiency with Integrated Collaboration Tools
											</p>
										</div>
									</li>
								</ul>
							</div>
						</div>
					</div>
				</section>
                <section className="w-full py-12 md:py-24 lg:py-32">
  <div className="container mx-auto grid items-center gap-6 px-4 md:px-6 lg:grid-cols-2 lg:gap-10">
    <div className="space-y-2">
      <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
        Todo's  to improve the user experience
      </h2>
      <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
      Add a text editor box, add search parameter, add features like Bookmarks and recommedation
      </p>
    </div>
    <div className="flex space-x-4 lg:justify-end">
      <a
        className="inline-flex h-10 items-center justify-center rounded-md bg-gray-900 px-8 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-300"
        href="mailto:akshathg7@gmail.com"
      >
        Contact Creator
      </a>
      <a
        className="inline-flex h-10 items-center justify-center rounded-md border border-gray-200 border-gray-200 bg-white px-8 text-sm font-medium shadow-sm transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-300"
        href="mailto:akshathg7@gmail.com"
      >
       Suggestions
      </a>
    </div>
  </div>
</section>

			</main>
			<footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
				<p className="text-xs text-gray-500 dark:text-gray-400">
					© 2024 mac studio Inc. All rights reserved.
				</p>
				<nav className="sm:ml-auto flex gap-4 sm:gap-6">
					<a
						className="text-xs hover:underline underline-offset-4"
						href="#"
					>
						Terms of Service
					</a>
					<a
						className="text-xs hover:underline underline-offset-4"
						href="#"
					>
						Privacy
					</a>
				</nav>
			</footer>
		</div>
	);
};

function MountainIcon() {
	return (
		<svg
			// {...props}
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="m8 3 4 8 5-5 5 15H2L8 3z" />
		</svg>
	);
}
