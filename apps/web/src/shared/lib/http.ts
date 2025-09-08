import axios from 'axios';
import { API_BASE } from './config';

export const http = axios.create({ baseURL: API_BASE, withCredentials: true });

export function setAuthToken(token?: string) {
  console.log(API_BASE);

  if (token) http.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  else delete http.defaults.headers.common['Authorization'];
}

let isRefreshing = false;
let refreshQueue: ((token: string) => void)[] = [];

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const res = await axios.post(
            API_BASE + "/auth/refresh",
            {},
            { withCredentials: true }
          );
          const newAccessToken = res.data.accessToken;

          localStorage.setItem("accessToken", newAccessToken);

          refreshQueue.forEach((cb) => cb(newAccessToken));
          refreshQueue = [];
          return http(originalRequest);
        } catch (refreshError) {
          console.log(refreshError);
          
          localStorage.removeItem("accessToken");
          // window.location.href = "/login";
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return new Promise((resolve) => {
        refreshQueue.push((token: string) => {
          originalRequest.headers["Authorization"] = `Bearer ${token}`;
          resolve(http(originalRequest));
        });
      });
    }

    return Promise.reject(error);
  }
);

