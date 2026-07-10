import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <main className="min-h-screen lg:ml-72">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;