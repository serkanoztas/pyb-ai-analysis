import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const AdminRoute = () => {
    const { user, authLoading } = useAuth();

    if (authLoading) {
        return <div>Yükleniyor...</div>;
    }

    if (!user || user.role !== "admin") {
        return (
            <Navigate
                to="/"
                replace
            />
        );
    }

    return <Outlet />;
};

export default AdminRoute;