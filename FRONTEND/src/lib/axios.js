import axios from "axios";

const BASE_URL =
  import.meta.env.MODE === "development"
    ? `${window.location.protocol}//${window.location.hostname}:5001/api`
    : import.meta.env.VITE_API_URL || "/api";

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send cookies with the request
});
