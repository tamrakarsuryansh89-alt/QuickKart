
import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

const API_URL = "http://localhost:8080/api/v1/auth";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(
    () => localStorage.getItem("quickkart_token")
  );

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("quickkart_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const saveAuth = (data) => {
    localStorage.setItem("quickkart_token", data.token);
    localStorage.setItem(
      "quickkart_user",
      JSON.stringify({
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
      })
    );

    setToken(data.token);
    setUser({
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role,
    });
  };

  const login = async (email, password) => {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    saveAuth(data);
    return data;
  };

  const register = async (name, email, password) => {
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Registration failed");
    }

    saveAuth(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("quickkart_token");
    localStorage.removeItem("quickkart_user");
    setToken(null);
    setUser(null);
  };

  const authHeaders = () => ({
    Authorization: `Bearer ${token}`,
  });

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: Boolean(token),
        login,
        register,
        logout,
        authHeaders,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
