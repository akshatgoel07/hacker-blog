import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../config";


export interface Blog {
    "content": string;
    "title": string;
    "id": number
    "createdAt"?: string
    "author": {
        "name": string
    }
}

export const useBlog = ({ id }: { id: string }) => {
    const [loading, setLoading] = useState(true);
    const [blog, setBlog] = useState<Blog>();

    useEffect(() => {
        axios.get(`${BACKEND_URL}/api/v1/blog/${id}`, {
            headers: {
                Authorization: localStorage.getItem("token")
            }
        })
            .then(response => {
                setBlog(response.data.post);
                setLoading(false);
            })
    }, [id])

    return {
        loading,
        blog
    }

}
export const useRelatedBlogs = ({ id }: { id: string }) => {
    const [loading, setLoading] = useState(true);
    const [related, setRelated] = useState<Blog[]>([]);

    useEffect(() => {
        if (!id) return;
        axios.get(`${BACKEND_URL}/api/v1/blog/related/${id}`, {
            headers: {
                Authorization: localStorage.getItem("token")
            }
        })
            .then(response => {
                setRelated(response.data.posts || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [id]);

    return { loading, related };
}

const PAGE_SIZE = 20;

export const useBlogs = () => {
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [cursor, setCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);

    const fetchPage = useCallback(async (after: string | null) => {
        const url = after
            ? `${BACKEND_URL}/api/v1/blog/bulk?cursor=${encodeURIComponent(after)}&limit=${PAGE_SIZE}`
            : `${BACKEND_URL}/api/v1/blog/bulk?limit=${PAGE_SIZE}`;
        const res = await axios.get(url, {
            headers: { Authorization: localStorage.getItem("token") },
        });
        const data = res.data || {};
        const posts: Blog[] = data.posts ?? data.post ?? [];
        const nextCursor: string | null = data.nextCursor ?? null;
        return { posts, nextCursor };
    }, []);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        fetchPage(null)
            .then(({ posts, nextCursor }) => {
                if (cancelled) return;
                setBlogs(posts);
                setCursor(nextCursor);
                setHasMore(!!nextCursor);
            })
            .catch(() => {
                if (!cancelled) setHasMore(false);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [fetchPage]);

    const loadMore = useCallback(async () => {
        if (!cursor || loadingMore) return;
        setLoadingMore(true);
        try {
            const { posts, nextCursor } = await fetchPage(cursor);
            setBlogs((prev) => [...prev, ...posts]);
            setCursor(nextCursor);
            setHasMore(!!nextCursor);
        } finally {
            setLoadingMore(false);
        }
    }, [cursor, loadingMore, fetchPage]);

    return { loading, loadingMore, blogs, hasMore, loadMore };
};