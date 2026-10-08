import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Role } from "../types";
import { api } from "../services/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("petgrooming_token"));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem("petgrooming_user");
      const storedToken = localStorage.getItem("petgrooming_token");

      if (storedUser && storedToken) {
        try {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
        } catch {
          localStorage.removeItem("petgrooming_user");
          localStorage.removeItem("petgrooming_token");
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.post("/auth/login", { username, password });
      const data = res.data;
      const userData: User = {
        id: data.id,
        username: data.username,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        fullName: `${data.firstName} ${data.lastName}`,
        role: data.role,
        enabled: true
      };

      setUser(userData);
      setToken(data.token);
      localStorage.setItem("petgrooming_token", data.token);
      localStorage.setItem("petgrooming_user", JSON.stringify(userData));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("petgrooming_token");
    localStorage.removeItem("petgrooming_user");
  };

  return (
      <AuthContext.Provider
          value={{
            user,
            token,
            isLoading,
            isAdmin: user?.role === "ADMIN",
            login,
            logout
          }}
      >
        {children}
      </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};