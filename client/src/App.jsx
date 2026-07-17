import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import ProtectedRoute from "./components/auth/ProtectedRoute";
import MainLayout from "./components/layout/MainLayout";

import Login from "./pages/Login";
import NewAnalysis from "./pages/NewAnalysis";
import Templates from "./pages/Templates";
import Users from "./pages/Users";
import AdminRoute from "./components/routes/AdminRoute";

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={<NewAnalysis />}
            />

            <Route
              path="templates"
              element={<Templates />}
            />

            <Route element={<AdminRoute />}>
              <Route
                path="users"
                element={<Users />}
              />
            </Route>

          </Route>


          <Route
            path="*"
            element={
              <Navigate
                to="/"
                replace
              />
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;