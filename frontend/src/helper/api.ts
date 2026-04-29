import axios, { AxiosError, type AxiosInstance } from "axios";
import { toast } from "../hooks/use-toast";
import { BACKEND_URL } from "../config";

const PUBLIC_PATHS = new Set(["/", "/signin", "/signup"]);

const onAuthExpired = () => {
  if (typeof window === "undefined") return;
  if (PUBLIC_PATHS.has(window.location.pathname)) return;
  localStorage.removeItem("token");
  window.location.assign("/signin");
};

const attachInterceptors = (instance: AxiosInstance) => {
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token && config.headers) {
        config.headers.Authorization = token;
      }
      return config;
    },
    (error) => Promise.reject(error),
  );

  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        onAuthExpired();
      }
      return Promise.reject(error);
    },
  );
};

export const installGlobalAuthInterceptors = () => {
  attachInterceptors(axios);
};

const api = axios.create({ baseURL: BACKEND_URL });
attachInterceptors(api);

export const fetchBlogsForUser = async (userId: string) => {
  try {
    const response = await api.get(`/api/v1/blog/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error(error);
    toast({
      title: "Failed to load blogs",
      description: "Please try again later.",
      variant: "destructive",
    });
    throw error;
  }
};

export const fetchProfile = async (): Promise<{
  id: string;
  name: string;
  email: string;
}> => {
  try {
    const { data } = await api.get("/api/v1/user/me");
    return data;
  } catch (error) {
    console.error(error);
    toast({
      title: "Could not load your profile.",
      description: "Please try again later.",
      variant: "destructive",
    });
    throw error;
  }
};
