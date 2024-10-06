import image1 from "../assets/image.png";
import { Link } from "react-router-dom";
const HeroSection = () => {
	return (
		<div>
			<section className="w-full mt-20">
				<div className="container px-4 md:px-6">
					<div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
						<img
							alt="Hero"
							className=" hidden sm:flex ml-20 mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last lg:aspect-square"
							height="150"
							src={image1}
							width="150"
						/>
						<div className="sm:ml-20 flex flex-col justify-center space-y-4">
							<div className="space-y-2">
								<h1 className="text-center md:text-left text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
									Where developer blogs meet community power!
								</h1>
								<p className="text-center md:text-left max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
									Create and grow your developer blog,
									newsletter, or team engineering blog
									effortlessly with Hacker Blog.
								</p>
							</div>
							<div className="flex flex-col gap-2  md:flex-row">
								<Link
									className="inline-flex h-10 items-center justify-center rounded-md bg-gray-900 px-8 text-sm font-medium text-gray-50 shadow 
                                    transition-colors hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-1 
                                    focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-50
                                     dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus-visible:ring-gray-300"
									to="/signin"
								>
									Signup
								</Link>
								<Link
									className="inline-flex h-10 items-center justify-center rounded-md border border-gray-200
                                     bg-white px-8 text-sm font-medium shadow-sm transition-colors hover:bg-gray-100
                                      focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 
                                      disabled:pointer-events-none disabled:opacity-50 dark:border-gray-800 dark:bg-gray-950
                                       dark:hover:bg-gray-800 dark:text-gray-50 dark:focus-visible:ring-gray-300"
									to="/signin"
								>
									LogIn
								</Link>
							</div>
						</div>
					</div>
				</div>
			</section>
			;
		</div>
	);
};

export default HeroSection;
