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
  const [submitting, setSubmitting] = useState<"draft" | "publish" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleEditorChange = ({ text }: { text: string }) => {
    setContent(text);
  };

  const submit = async (publish: boolean) => {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (!content.trim()) {
      setError("Content is required");
      return;
    }
    setError(null);
    setSubmitting(publish ? "publish" : "draft");
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/blog`,
        { title, content, published: publish },
        {
          headers: {
            Authorization: localStorage.getItem("token") ?? "",
          },
        },
      );
      navigate(publish ? `/blog/${response.data.id}` : "/profile");
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Could not save your story.");
      setSubmitting(null);
    }
  };

  const isBusy = submitting !== null;

  return (
    <div className="min-h-screen">
      <Appbar />
      <main className="max-w-3xl mx-auto px-6 md:px-10 py-10">
        <div className="text-center font-smallcaps text-xs text-sepia tracking-[0.4em] mb-2">
          ❦ Newsroom Desk ❦
        </div>
        <h1 className="text-center font-display text-3xl md:text-4xl text-ink mb-2">
          Compose
        </h1>
        <hr className="news-rule-double mb-6" />

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-parchment-100 border border-ink text-ink font-display text-2xl px-4 py-3 mb-4 focus:outline-none focus:ring-1 focus:ring-ink"
          placeholder="Headline"
          disabled={isBusy}
        />

        <div className="border border-ink bg-parchment-100">
          <MdEditor
            style={{ height: "440px", background: "transparent" }}
            value={content}
            onChange={handleEditorChange}
            renderHTML={(text) => mdParser.render(text)}
          />
        </div>

        {error && (
          <p className="mt-4 text-center font-serif italic text-destructive">
            {error}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          <button
            onClick={() => submit(false)}
            type="button"
            disabled={isBusy}
            className="font-smallcaps tracking-[0.3em] text-xs px-5 py-2 border border-ink text-ink hover:bg-ink hover:text-parchment-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting === "draft" ? "Saving…" : "Save as draft"}
          </button>
          <button
            onClick={() => submit(true)}
            type="button"
            disabled={isBusy}
            className="font-smallcaps tracking-[0.3em] text-xs px-6 py-2 bg-ink text-parchment-100 border border-ink hover:bg-ink-soft disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting === "publish" ? "Going to press…" : "Send to press"}
          </button>
        </div>
      </main>
    </div>
  );
};
