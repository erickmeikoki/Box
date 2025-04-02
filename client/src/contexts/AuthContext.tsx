import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { auth } from "../api";
import type { User } from "../types";

const API_URL = "http://localhost:5001"; // Add server URL
const TOKEN_EXPIRY_KEY = "token_expiry";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isTokenExpired = () => {
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
    if (!expiry) return true;
    return new Date().getTime() > parseInt(expiry);
  };

  const setTokenExpiry = (expiresIn: number) => {
    const expiry = new Date().getTime() + expiresIn * 1000;
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiry.toString());
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && !isTokenExpired()) {
      checkAuth();
    } else if (isTokenExpired()) {
      logout();
    }
  }, []);

  const checkAuth = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (token && !isTokenExpired()) {
        const response = await auth.getCurrentUser();
        if (response.data) {
          setUser(response.data);
        } else {
          logout();
        }
      } else {
        logout();
      }
    } catch (error) {
      console.error("Error checking auth:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      const response = await auth.login(email, password);
      localStorage.setItem("token", response.data.token);
      setTokenExpiry(response.data.expiresIn || 3600); // Default to 1 hour
      setUser(response.data.user);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Invalid email or password";
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string
  ) => {
    try {
      setError(null);
      setLoading(true);
      const response = await auth.register(username, email, password);
      localStorage.setItem("token", response.data.token);
      setTokenExpiry(response.data.expiresIn || 3600); // Default to 1 hour
      setUser(response.data.user);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "Registration failed. Please try again.";
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
    setUser(null);
    setError(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateUser,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
