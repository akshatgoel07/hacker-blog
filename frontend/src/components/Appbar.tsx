import { Link } from "react-router-dom";
import Hlogo from "../assets/hlogo.svg";
export const Appbar = () => {
	return (
		<div className="border-b flex justify-between px-32 py-4">
			<Link
				to={"/blogs"}
				className="flex flex-col justify-center cursor-pointer "
			>
				<div className="flex gap-4">
					<img className="" src={Hlogo} alt="Logo" />
					Hacker Blog
				</div>
			</Link>

			<div>
				<Link to={`/publish`}>
					<button className="px-4 py-2 rounded-md border border-black bg-white text-neutarl-700 text-sm hover:shadow-[4px_4px_0px_0px_rgba(0,0,0)] transition duration-200">
						Write
					</button>
				</Link>

				{/* <Avatar size={"big"} name="akshat" /> */}
			</div>
		</div>
	);
};
