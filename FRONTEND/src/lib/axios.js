import axios from "axios";

const normalizeApiUrl = (url) => {
  if (!url) return "/api";

  const trimmedUrl = url.replace(/\/$/, "");
  return trimmedUrl.endsWith("/api") ? trimmedUrl : `${trimmedUrl}/api`;
};

const BASE_URL =
  import.meta.env.MODE === "development"
    ? `${window.location.protocol}//${window.location.hostname}:5001/api`
    : normalizeApiUrl(import.meta.env.VITE_API_URL);

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send cookies with the request
});
