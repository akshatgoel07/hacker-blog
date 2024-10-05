import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import MdEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";
import MarkdownIt from "markdown-it";

import { Appbar } from "../components/Appbar";
import { BACKEND_URL } from "../config";

const mdParser = new MarkdownIt();

export const Publish = () => {
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const navigate = useNavigate();

	const handleEditorChange = ({ text }: { text: string }) => {
		setContent(text);
	};

	const handleSubmit = async () => {
		try {
			const response = await axios.post(
				`${BACKEND_URL}/api/v1/blog`,
				{ title, content },
				{
					headers: {
						Authorization: localStorage.getItem("token"),
					},
				},
			);
			navigate(`/blog/${response.data.id}`);
		} catch (error) {
			console.error("Error publishing post:", error);
			// Handle error (e.g., show error message to user)
		}
	};

	return (
		<div>
			<Appbar />
			<div className="flex justify-center w-full pt-8">
				<div className="max-w-screen-lg w-full">
					<input
						type="text"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 mb-4"
						placeholder="Title"
					/>

					<MdEditor
						style={{ height: "400px" }}
						value={content}
						onChange={handleEditorChange}
						renderHTML={(text) => mdParser.render(text)}
					/>

					<button
						onClick={handleSubmit}
						type="submit"
						className="mt-4 px-8 py-2 bg-black text-white text-sm rounded-md font-semibold hover:bg-black/[0.8] hover:shadow-lg"
					>
						Publish post
					</button>
				</div>
			</div>
		</div>
	);
};
