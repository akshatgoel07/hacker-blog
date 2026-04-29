import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import MdEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";
import MarkdownIt from "markdown-it";

import { Appbar } from "../components/Appbar";
import { BACKEND_URL } from "../config";
import { useEditablePost } from "../hooks";

const mdParser = new MarkdownIt();

export const Publish = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const { post: existing, loading: loadingExisting, error: existingError } =
    useEditablePost(id);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState<"draft" | "publish" | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const qc = useQueryClient();

  useEffect(() => {
    if (existing) {
      setTitle(existing.title);
      setContent(existing.content);
    }
  }, [existing]);

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
    const headers = { Authorization: localStorage.getItem("token") ?? "" };
    try {
      if (isEdit && existing) {
        await axios.put(
          `${BACKEND_URL}/api/v1/blog`,
          { id: existing.id, title, content, published: publish },
          { headers },
        );
        qc.invalidateQueries({ queryKey: ["edit-post", existing.id] });
        qc.invalidateQueries({ queryKey: ["drafts"] });
        qc.invalidateQueries({ queryKey: ["blog", existing.id] });
        qc.invalidateQueries({ queryKey: ["blogs"] });
        navigate(publish ? `/blog/${existing.id}` : "/profile");
      } else {
        const response = await axios.post(
          `${BACKEND_URL}/api/v1/blog`,
          { title, content, published: publish },
          { headers },
        );
        qc.invalidateQueries({ queryKey: ["drafts"] });
        qc.invalidateQueries({ queryKey: ["blogs"] });
        navigate(publish ? `/blog/${response.data.id}` : "/profile");
      }
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Could not save your story.");
      setSubmitting(null);
    }
  };

  const isBusy = submitting !== null;

  if (isEdit && loadingExisting) {
    return (
      <div className="min-h-screen">
        <Appbar />
        <main className="max-w-3xl mx-auto px-6 md:px-10 py-10 text-center font-serif italic text-ink-faded">
          Pulling your draft…
        </main>
      </div>
    );
  }

  if (isEdit && existingError) {
    return (
      <div className="min-h-screen">
        <Appbar />
        <main className="max-w-3xl mx-auto px-6 md:px-10 py-10 text-center font-serif italic text-destructive">
          Couldn't load that story. It may have been deleted, or you might not
          be the author.
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Appbar />
      <main className="max-w-3xl mx-auto px-6 md:px-10 py-10">
        <div className="text-center font-smallcaps text-xs text-sepia tracking-[0.4em] mb-2">
          ❦ {isEdit ? "Revising" : "Newsroom Desk"} ❦
        </div>
        <h1 className="text-center font-display text-3xl md:text-4xl text-ink mb-2">
          {isEdit ? "Edit story" : "Compose"}
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
            {submitting === "publish"
              ? "Going to press…"
              : isEdit && existing?.published
                ? "Update published story"
                : "Send to press"}
          </button>
        </div>
      </main>
    </div>
  );
};
