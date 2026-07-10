import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FileSearch,
  Mail,
  Lock,
  LogIn,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";

const Login = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      setError("Lütfen e-posta ve şifre alanlarını doldurun.");
      return;
    }

    setLoading(true);

    const result = await login({
      email: form.email,
      password: form.password,
    });

    if (result.success) {
      navigate("/");
    } else {
      setError(result.message || "Giriş yapılamadı.");
    }

    setLoading(false);
  };
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.25),_transparent_35%)]" />

      <div className="relative w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 rounded-3xl overflow-hidden border border-white/10 bg-white shadow-2xl">
        <div className="hidden lg:flex flex-col justify-between bg-slate-950 p-10 text-white">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600">
                <FileSearch size={26} />
              </div>

              <div>
                <h1 className="text-2xl font-bold">PYB AI</h1>
                <p className="text-sm text-slate-300">
                  Teknik Destek Analiz Sistemi
                </p>
              </div>
            </div>

            <div className="mt-14">
              <h2 className="text-4xl font-bold leading-tight">
                Başvuru analizlerini daha hızlı ve tutarlı hale getirin.
              </h2>

              <p className="mt-5 text-sm leading-relaxed text-slate-300">
                Rehber, şablon ve başvuru belgelerini kullanarak teknik destek
                başvurularında kalite, tutarlılık ve güçlendirme odaklı ön
                analiz oluşturun.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border mt-2 border-white/10 bg-white/5 p-5">
            <p className="text-sm font-semibold">Sistem Notu</p>
            <p className="mt-2 text-xs leading-relaxed text-slate-300">
              Bu sistem nihai karar vermez. Analiz çıktıları uzman incelemesini
              desteklemek için kullanılır.
            </p>
          </div>
        </div>

        <div className="p-8 sm:p-10 lg:p-12">
          <div className="lg:hidden mb-8 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
              <FileSearch size={23} />
            </div>

            <div>
              <h1 className="text-xl font-bold text-slate-900">PYB AI</h1>
              <p className="text-xs text-slate-500">
                Teknik Destek Analiz Sistemi
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Hesabınıza giriş yapın
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Yeni analiz oluşturmak ve rehberleri yönetmek için giriş yapın.
            </p>
          </div>

          {error && (
            <div className="mt-6 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                E-posta
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="admin@pybai.com"
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Şifre
              </label>

              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-12 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" className="h-4 w-4 rounded" />
                Beni hatırla
              </label>

              <button
                type="button"
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                Şifremi unuttum
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogIn size={18} />
              {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </button>
          </form>


        </div>
      </div>
    </div>
  );
};

export default Login;