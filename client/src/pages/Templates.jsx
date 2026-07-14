import { useEffect, useState } from "react";
import {
  Upload,
  FileText,
  BookOpen,
  FileSignature,
  CheckCircle,
  Database,
  FileCog,
  AlertTriangle,
  Save,
  RefreshCcw,
  CircleAlert,
} from "lucide-react";

import {
  createTemplate,
  getActiveTemplates,
} from "../services/templateService";

const Templates = () => {
  const [templates, setTemplates] = useState([]);

  const [form, setForm] = useState({
    name: "",
    type: "guide",
    file: null,
  });

  const [pageLoading, setPageLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchTemplates = async () => {
    try {
      setPageLoading(true);
      setError("");

      const data = await getActiveTemplates();

      setTemplates(data.templates || []);
    } catch (error) {
      console.error(
        "Şablonlar alınamadı:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message ||
        "Aktif dokümanlar alınamadı."
      );
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setForm((prev) => ({
      ...prev,
      file,
      name: prev.name || file.name.replace(/\.[^/.]+$/, ""),
    }));

    setError("");
    setSuccessMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      setError("Lütfen doküman adını girin.");
      return;
    }

    if (!form.file) {
      setError("Lütfen bir dosya seçin.");
      return;
    }

    try {
      setUploadLoading(true);
      setError("");
      setSuccessMessage("");

      const data = await createTemplate({
        name: form.name.trim(),
        type: form.type,
        file: form.file,
      });

      setSuccessMessage(
        data.message || "Doküman başarıyla yüklendi."
      );

      setForm({
        name: "",
        type: "guide",
        file: null,
      });

      await fetchTemplates();
    } catch (error) {
      console.error(
        "Doküman yükleme hatası:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message ||
        "Doküman yüklenirken bir hata oluştu."
      );
    } finally {
      setUploadLoading(false);
    }
  };

  const activeTemplates = templates.filter(
    (template) => template.isActive
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Şablonlar & Rehber
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            AI analizinde kullanılacak Teknik Destek rehberi, belge
            şablonları ve kontrol kurallarını yönetin.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchTemplates}
          disabled={pageLoading}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCcw
            size={16}
            className={pageLoading ? "animate-spin" : ""}
          />

          Listeyi Yenile
        </button>
      </div>

      {error && (
        <div className="mb-6 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <CircleAlert size={19} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 flex gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          <CheckCircle size={19} className="mt-0.5 shrink-0" />
          <p>{successMessage}</p>
        </div>
      )}

      <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Toplam Aktif Doküman"
          value={activeTemplates.length}
          icon={<FileText size={22} />}
          color="blue"
        />

        <StatCard
          title="Başvuru Rehberi"
          value={
            hasActiveType(activeTemplates, "guide")
              ? "Yüklü"
              : "Eksik"
          }
          icon={<BookOpen size={22} />}
          color="green"
        />

        <StatCard
          title="Doküman Türü"
          value={documentTypes.length}
          icon={<FileCog size={22} />}
          color="orange"
        />

        <StatCard
          title="AI Bilgi Kaynağı"
          value={
            activeTemplates.length === documentTypes.length
              ? "Hazır"
              : "Eksik"
          }
          icon={<Database size={22} />}
          color="purple"
        />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-1">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5">
              <div className="flex items-center gap-2">
                <Upload size={20} className="text-blue-600" />

                <h2 className="text-lg font-semibold text-slate-900">
                  Yeni Doküman Yükle
                </h2>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Yüklenen doküman aynı türdeki eski aktif
                dokümanın yerine geçer.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Doküman Adı
                </label>

                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="Örn: 2026 Teknik Destek Başvuru Rehberi"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Doküman Türü
                </label>

                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      type: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  {documentTypes.map((item) => (
                    <option
                      key={item.value}
                      value={item.value}
                    >
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <label className="block cursor-pointer rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center transition hover:border-blue-400 hover:bg-blue-50">
                <input
                  key={form.file ? form.file.name : "empty"}
                  type="file"
                  accept=".pdf,.docx,.txt"
                  className="hidden"
                  onChange={handleFileChange}
                />

                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <Upload size={24} />
                </div>

                {form.file ? (
                  <div className="mt-3">
                    <p className="break-all text-sm font-semibold text-slate-900">
                      {form.file.name}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {formatFileSize(form.file.size)}
                    </p>
                  </div>
                ) : (
                  <div className="mt-3">
                    <p className="text-sm font-semibold text-slate-900">
                      Dosya seç
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      PDF, DOCX veya TXT desteklenir
                    </p>
                  </div>
                )}
              </label>

              <button
                type="submit"
                disabled={uploadLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {uploadLoading ? (
                  <>
                    <RefreshCcw
                      size={18}
                      className="animate-spin"
                    />
                    Doküman Yükleniyor
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Dokümanı Kaydet
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex gap-3">
              <AlertTriangle
                size={20}
                className="mt-0.5 shrink-0 text-amber-600"
              />

              <div>
                <h3 className="text-sm font-semibold text-amber-900">
                  Sistem Notu
                </h3>

                <p className="mt-1 text-sm leading-relaxed text-amber-800">
                  Rehber ve şablon metinleri sistemde saklanır.
                  Analiz sırasında aktif dokümanlar AI’a bilgi
                  kaynağı olarak gönderilir.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="xl:col-span-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Analizde Kullanılacak Aktif Dokümanlar
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Yeni analiz yapılırken bu dokümanlar AI’a bilgi
                  kaynağı olarak gönderilecektir.
                </p>
              </div>

              <StatusBadge
                text={`${activeTemplates.length}/${documentTypes.length} Hazır`}
                color={
                  activeTemplates.length === documentTypes.length
                    ? "green"
                    : "orange"
                }
              />
            </div>

            {pageLoading ? (
              <TemplatesLoading />
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {documentTypes.map((type) => {
                  const activeItem = activeTemplates.find(
                    (item) => item.type === type.value
                  );

                  return (
                    <ActiveTemplateCard
                      key={type.value}
                      type={type}
                      activeItem={activeItem}
                    />
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </section>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    orange: "bg-orange-50 text-orange-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl ${colors[color]}`}
      >
        {icon}
      </div>

      <p className="mt-4 text-sm text-slate-500">{title}</p>

      <h3 className="mt-1 text-2xl font-bold text-slate-900">
        {value}
      </h3>
    </div>
  );
};

const ActiveTemplateCard = ({ type, activeItem }) => {
  const Icon = type.icon;

  const colors = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    orange:
      "bg-orange-50 text-orange-600 border-orange-100",
    red: "bg-red-50 text-red-600 border-red-100",
    green:
      "bg-green-50 text-green-600 border-green-100",
    purple:
      "bg-purple-50 text-purple-600 border-purple-100",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${colors[type.color]}`}
        >
          <Icon size={22} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold text-slate-900">
                {type.label}
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                {type.description}
              </p>
            </div>

            {activeItem ? (
              <StatusBadge text="Yüklü" color="green" />
            ) : (
              <StatusBadge text="Eksik" color="red" />
            )}
          </div>

          {activeItem ? (
            <div className="mt-3 rounded-xl bg-white p-3">
              <p className="truncate text-sm font-medium text-slate-800">
                {activeItem.name}
              </p>

              <p className="mt-1 truncate text-xs text-slate-500">
                {activeItem.originalFileName}
              </p>

              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-xs text-slate-400">
                  {formatDate(activeItem.createdAt)}
                </p>

                <p className="text-xs font-medium text-green-600">
                  {activeItem.extractionStatus === "ready"
                    ? "Metin çıkarımı hazır"
                    : "İşleniyor"}
                </p>
              </div>

              <p className="mt-2 text-xs text-slate-400">
                {formatFileSize(activeItem.fileSize)}
              </p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-500">
              Bu tür için henüz doküman yüklenmemiş.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const TemplatesLoading = () => {
  return (
    <div className="flex min-h-64 items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

        <p className="mt-4 text-sm text-slate-500">
          Aktif dokümanlar yükleniyor...
        </p>
      </div>
    </div>
  );
};

const StatusBadge = ({ text, color }) => {
  const colors = {
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
    orange: "bg-orange-100 text-orange-700",
    blue: "bg-blue-100 text-blue-700",
    purple: "bg-purple-100 text-purple-700",
  };

  return (
    <span
      className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${colors[color]}`}
    >
      {text}
    </span>
  );
};

const hasActiveType = (templates, type) => {
  return templates.some((item) => item.type === type);
};

const formatFileSize = (size) => {
  if (!size) return "0 KB";

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(0)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
};

const formatDate = (dateValue) => {
  if (!dateValue) return "-";

  return new Date(dateValue).toLocaleDateString("tr-TR");
};

const documentTypes = [
  {
    value: "guide",
    label: "Başvuru Rehberi",
    description:
      "Program kuralları, uygunluk kriterleri ve öncelikler",
    icon: BookOpen,
    color: "blue",
  },
  {
    value: "technical_spec_template",
    label: "Teknik Şartname Şablonu",
    description:
      "Hizmet kapsamı, çıktı, süre ve teslim kuralları",
    icon: FileCog,
    color: "purple",
  },
  {
    value: "signature_declaration_template",
    label: "Tatbiki İmza Beyanı",
    description:
      "Yetkili kişi, imza ve beyan kontrol alanları",
    icon: FileSignature,
    color: "red",
  }
];

export default Templates;