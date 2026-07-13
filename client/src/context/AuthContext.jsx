import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../services/api.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("pyb-ai-token");

      if (!storedToken) {
        setAuthLoading(false);
        return;
      }

      try {
        setToken(storedToken);

        const response = await api.get("/auth/me");

        setUser(response.data.user);

        localStorage.setItem(
          "pyb-ai-user",
          JSON.stringify(response.data.user)
        );
      } catch (error) {
        console.error(
          "Oturum doğrulama hatası:",
          error.response?.data || error.message
        );

        localStorage.removeItem("pyb-ai-token");
        localStorage.removeItem("pyb-ai-user");

        setToken(null);
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async ({ email, password }) => {
    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const { token: receivedToken, user: receivedUser } = response.data;

      localStorage.setItem("pyb-ai-token", receivedToken);
      localStorage.setItem(
        "pyb-ai-user",
        JSON.stringify(receivedUser)
      );

      setToken(receivedToken);
      setUser(receivedUser);

      return {
        success: true,
      };
    } catch (error) {
      console.error(
        "Login hatası:",
        error.response?.data || error.message
      );

      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Sunucuya bağlanılamadı.",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("pyb-ai-token");
    localStorage.removeItem("pyb-ai-user");

    setToken(null);
    setUser(null);
  };

  const isAuthenticated = Boolean(token && user);

  const value = {
    user,
    token,
    authLoading,
    isAuthenticated,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth, AuthProvider içerisinde kullanılmalıdır."
    );
  }

  return context;
};