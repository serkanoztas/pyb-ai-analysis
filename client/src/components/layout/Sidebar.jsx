import { NavLink, useNavigate } from "react-router-dom";
import { Upload, FileText, FileSearch, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";




const Sidebar = () => {

  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-72 flex-col justify-between bg-slate-950 text-white">
      <div>
        <div className="border-b border-white/10 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
              <FileSearch size={22} />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-wide">PYB AI</h1>
              <p className="text-xs text-slate-300">
                Teknik Destek Analiz Sistemi
              </p>
            </div>
          </div>
        </div>

        <nav className="space-y-2 p-4">
          <SidebarLink
            to="/"
            icon={<Upload size={18} />}
            text="Yeni Analiz"
            end
          />

          <SidebarLink
            to="/templates"
            icon={<FileText size={18} />}
            text="Şablonlar & Rehber"
          />
        </nav>
      </div>

      <div className="p-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm font-medium">Sistem Notu</p>
          <p className="mt-2 text-xs leading-relaxed text-slate-300">
            Analiz sonuçları kullanıcıya ön rapor olarak sunulur. Nihai karar
            uzman incelemesine aittir.
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/15 hover:text-white"
        >
          <LogOut size={17} />
          Çıkış Yap
        </button>
        {user && (
          <div className="mb-3 rounded-xl bg-white/5 p-3">
            <p className="text-sm font-medium text-white">
              {user.name}
            </p>

            <p className="mt-1 truncate text-xs text-slate-400">
              {user.email}
            </p>
          </div>
        )}
      </div>
    </aside>
  );
};

const SidebarLink = ({ to, icon, text, end }) => {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${isActive
          ? "bg-blue-600 text-white"
          : "text-slate-300 hover:bg-white/10 hover:text-white"
        }`
      }
    >
      {icon}
      <span>{text}</span>
    </NavLink>
  );
};

export default Sidebar;