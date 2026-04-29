import axios from "axios";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { BACKEND_URL } from "../config";

export interface Blog {
  content: string;
  title: string;
  id: number;
  createdAt?: string;
  author: {
    name: string;
  };
}

const PAGE_SIZE = 20;

const authHeader = () => ({
  Authorization: localStorage.getItem("token") ?? "",
});

export const useBlog = ({ id }: { id: string }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["blog", id],
    queryFn: async () => {
      const res = await axios.get(`${BACKEND_URL}/api/v1/blog/${id}`, {
        headers: authHeader(),
      });
      return res.data.post as Blog;
    },
    enabled: !!id,
  });
  return { loading: isLoading, blog: data };
};

interface BlogsPage {
  posts: Blog[];
  nextCursor: string | null;
}

export const useBlogs = () => {
  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ["blogs"],
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam }) => {
      const url = pageParam
        ? `${BACKEND_URL}/api/v1/blog/bulk?cursor=${encodeURIComponent(pageParam)}&limit=${PAGE_SIZE}`
        : `${BACKEND_URL}/api/v1/blog/bulk?limit=${PAGE_SIZE}`;
      const res = await axios.get(url, { headers: authHeader() });
      const d = res.data || {};
      return {
        posts: (d.posts ?? d.post ?? []) as Blog[],
        nextCursor: (d.nextCursor ?? null) as string | null,
      } satisfies BlogsPage;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const blogs = data?.pages.flatMap((p) => p.posts) ?? [];

  return {
    loading: isLoading,
    loadingMore: isFetchingNextPage,
    blogs,
    hasMore: !!hasNextPage,
    loadMore: () => {
      void fetchNextPage();
    },
  };
};

export interface DraftPost {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface EditablePost {
  id: string;
  title: string;
  content: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export const useEditablePost = (id: string | undefined) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["edit-post", id],
    queryFn: async () => {
      const res = await axios.get(
        `${BACKEND_URL}/api/v1/blog/edit/${id}`,
        { headers: authHeader() },
      );
      return res.data.post as EditablePost;
    },
    enabled: !!id,
    staleTime: 0,
  });
  return { loading: isLoading, post: data, error };
};

export const useDrafts = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["drafts"],
    queryFn: async () => {
      const res = await axios.get(`${BACKEND_URL}/api/v1/blog/drafts`, {
        headers: authHeader(),
      });
      return (res.data.posts || []) as DraftPost[];
    },
    staleTime: 0,
  });
  return { loading: isLoading, drafts: data ?? [] };
};

export const useRelatedBlogs = ({ id }: { id: string }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["blog", id, "related"],
    queryFn: async () => {
      const res = await axios.get(
        `${BACKEND_URL}/api/v1/blog/related/${id}`,
        { headers: authHeader() },
      );
      return (res.data.posts || []) as Blog[];
    },
    enabled: !!id,
    staleTime: 60_000,
  });
  return { loading: isLoading, related: data ?? [] };
};
