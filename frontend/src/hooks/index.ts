import axios from "axios";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { BACKEND_URL } from "../config";

export interface Blog {
  content: string;
  title: string;
  id: number;
  createdAt?: string;
  author: {
    id?: string;
    name: string;
  };
}

export interface PublicUser {
  id: string;
  name: string;
}

export const usePublicUser = (id: string | undefined) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["public-user", id],
    queryFn: async () => {
      const res = await axios.get(`${BACKEND_URL}/api/v1/user/public/${id}`);
      return res.data as PublicUser;
    },
    enabled: !!id,
    staleTime: 5 * 60_000,
  });
  return { loading: isLoading, user: data, error };
};

export const useAuthorPosts = (authorId: string | undefined) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["author-posts", authorId],
    queryFn: async () => {
      const res = await axios.get(
        `${BACKEND_URL}/api/v1/blog/get-blogs-for-user/${authorId}`,
      );
      return (res.data.posts || []) as Blog[];
    },
    enabled: !!authorId,
    staleTime: 60_000,
  });
  return { loading: isLoading, posts: data ?? [], error };
};

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

export interface BookmarkedPost extends Blog {
  bookmarkedAt: string;
}

export const useBookmarks = () => {
  const enabled = !!localStorage.getItem("token");
  const { data, isLoading } = useQuery({
    queryKey: ["bookmarks"],
    queryFn: async () => {
      const res = await axios.get(`${BACKEND_URL}/api/v1/blog/bookmarks`, {
        headers: authHeader(),
      });
      return (res.data.posts || []) as BookmarkedPost[];
    },
    enabled,
    staleTime: 60_000,
  });
  return { loading: isLoading && enabled, bookmarks: data ?? [], enabled };
};

export const useToggleBookmark = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, on }: { id: string; on: boolean }) => {
      const url = `${BACKEND_URL}/api/v1/blog/${id}/bookmark`;
      const headers = authHeader();
      if (on) {
        await axios.post(url, {}, { headers });
      } else {
        await axios.delete(url, { headers });
      }
      return { id, on };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bookmarks"] });
    },
  });
};

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; name: string };
}

export const useComments = (postId: string | undefined) => {
  const { data, isLoading } = useQuery({
    queryKey: ["comments", postId],
    queryFn: async () => {
      const res = await axios.get(
        `${BACKEND_URL}/api/v1/blog/${postId}/comments`,
      );
      return (res.data.comments || []) as Comment[];
    },
    enabled: !!postId,
    staleTime: 15_000,
  });
  return { loading: isLoading, comments: data ?? [] };
};

export const useAddComment = (postId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (content: string) => {
      const res = await axios.post(
        `${BACKEND_URL}/api/v1/blog/${postId}/comments`,
        { content },
        { headers: authHeader() },
      );
      return res.data.comment as Comment;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["comments", postId] });
    },
  });
};

export const useDeleteComment = (postId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (commentId: string) => {
      await axios.delete(
        `${BACKEND_URL}/api/v1/blog/${postId}/comments/${commentId}`,
        { headers: authHeader() },
      );
      return commentId;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["comments", postId] });
    },
  });
};

export const useDeletePost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`${BACKEND_URL}/api/v1/blog/${id}`, {
        headers: authHeader(),
      });
      return id;
    },
    onSuccess: (id) => {
      qc.invalidateQueries({ queryKey: ["drafts"] });
      qc.invalidateQueries({ queryKey: ["blogs"] });
      qc.removeQueries({ queryKey: ["edit-post", id] });
      qc.removeQueries({ queryKey: ["blog", id] });
    },
  });
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

export const useSearchBlogs = (query: string) => {
  const trimmed = query.trim();
  const enabled = trimmed.length >= 2;
  const { data, isLoading } = useQuery({
    queryKey: ["search", trimmed],
    queryFn: async () => {
      const res = await axios.get(
        `${BACKEND_URL}/api/v1/blog/search?q=${encodeURIComponent(trimmed)}`,
      );
      return (res.data.posts || []) as Blog[];
    },
    enabled,
    staleTime: 30_000,
  });
  return { loading: isLoading && enabled, posts: data ?? [], enabled };
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
