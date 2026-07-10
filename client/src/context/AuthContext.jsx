import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("pyb-ai-token");
    const storedUser = localStorage.getItem("pyb-ai-user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }

    setAuthLoading(false);
  }, []);

  const login = async ({ email, password }) => {
    // Şimdilik mock login
    // Backend bağlayınca burası axios.post("/api/auth/login") olacak

    if (email === "admin@pybai.com" && password === "123456") {
      const mockToken = "mock-token"; // bu token backendden gelecek

      const mockUser = {
        name: "PYB Uzmanı",
        email,
        role: "admin",
      };

      localStorage.setItem("pyb-ai-token", mockToken);
      localStorage.setItem("pyb-ai-user", JSON.stringify(mockUser));

      setToken(mockToken);
      setUser(mockUser);

      return {
        success: true,
      };
    }

    return {
      success: false,
      message: "E-posta veya şifre hatalı.",
    };
  };

  const logout = () => {
    localStorage.removeItem("pyb-ai-token");
    localStorage.removeItem("pyb-ai-user");

    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token && !!user;

  const value = {
    user,
    token,
    authLoading,
    isAuthenticated,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};