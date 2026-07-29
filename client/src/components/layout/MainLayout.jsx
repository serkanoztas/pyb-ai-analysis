import { useState } from "react";
import { Menu } from "lucide-react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] =
    useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      <header className="sticky top-0 z-30 flex h-16 items-center border-b border-slate-200 bg-white px-4 shadow-sm lg:hidden">
        <button
          type="button"
          onClick={() => setIsSidebarOpen(true)}
          className="rounded-lg p-2 text-slate-700 transition hover:bg-slate-100"
          aria-label="Menüyü aç"
        >
          <Menu size={24} />
        </button>

        <h1 className="ml-3 font-semibold text-slate-900">
          PYB AI
        </h1>
      </header>

      <main className="min-h-screen lg:ml-72">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;