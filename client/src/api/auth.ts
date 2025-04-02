import axios from "axios";
import type { AuthResponse, User } from "../types";

const API_URL = "http://localhost:5001";

const auth = {
  register: async (username: string, email: string, password: string) => {
    return axios.post<AuthResponse>(`${API_URL}/auth/register`, {
      username,
      email,
      password,
    });
  },

  login: async (email: string, password: string) => {
    return axios.post<AuthResponse>(`${API_URL}/auth/login`, {
      email,
      password,
    });
  },

  getCurrentUser: async () => {
    const token = localStorage.getItem("token");
    return axios.get<User>(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  logout: () => {
    localStorage.removeItem("token");
  },

  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },

  uploadAvatar: async (formData: FormData) => {
    const token = localStorage.getItem("token");
    return axios.post<User>(`${API_URL}/auth/avatar`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
  },

  updateProfile: async (data: { username: string; email: string }) => {
    const token = localStorage.getItem("token");
    return axios.put<User>(`${API_URL}/auth/profile`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};

export { auth };
