/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import toast from "react-hot-toast";
import { BASE_URL } from "../../constant/Baseurl";
import { logout } from "../../feature/authSlice";
import { store } from "../../store/store";

interface registerData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
}
interface loginData {
  email: string;
  password: string;
}

let isRefreshing = false;
let failedQueue: any[] = [];

export const registerApi = async (data: registerData) => {
  try {
    const response = await axios.post(`${BASE_URL}/auth/register`, data);
    if (response.status === 201) {
      toast.success(response.data.message || "Registration successful!");
      return response.data;
    }
  } catch (error: any) {
    toast.error(
      error.response?.data?.message || "Registration failed. Please try again."
    );
    throw error;
  }
};

export const loginApi = async (data: loginData) => {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, data);
    if (response.status === 200) {
      toast.success(response.data.message || "Login successful!");
      return response.data;
    }
  } catch (error: any) {
    toast.error(
      error.response?.data?.message || "Login failed. Please try again."
    );
    throw error;
  }
};

const api = axios.create({
  baseURL: BASE_URL,
});

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        const response = await axios.post(`${BASE_URL}/auth/refresh-token`, {
          refreshToken,
        });

        const { token, refreshToken: newRefreshToken } = response.data;

        localStorage.setItem("token", token);
        localStorage.setItem("refreshToken", newRefreshToken);

        processQueue(null, token);
        originalRequest.headers.Authorization = `Bearer ${token}`;

        return api(originalRequest);
      } catch (error) {
        processQueue(error, null);
        store.dispatch(logout());
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
