import { useState } from "react";
import {
  RefreshCcw,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

import UploadSection from "../components/upload/UploadSection";
import LoadingState from "../components/analysis/LoadingState";
import AnalysisResults from "../components/analysis/AnalysisResults";

import { analyzeApplication } from "../services/analysisService";

const emptyFiles = {
  applicationForm: null,
  technicalSpec: null,
  signatureDeclaration: null,
  priceOffers: null,
};

const NewAnalysis = () => {
  const [files, setFiles] = useState(emptyFiles);
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleFileChange = (e, field) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setFiles((prev) => ({
      ...prev,
      [field]: file,
    }));

    setError("");
    setSuccessMessage("");
    setAnalysisResult(null);
  };

  const handleAnalyze = async () => {
    console.log("Gönderilecek dosyalar:", files);
    const missingFiles = Object.entries(files)
      .filter(([, file]) => !file)
      .map(([field]) => fieldLabels[field]);

    if (missingFiles.length > 0) {
      setError(
        `Lütfen şu belgeleri yükleyin: ${missingFiles.join(", ")}`
      );
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");
      setAnalysisResult(null);

      const data = await analyzeApplication(files);

      setAnalysisResult(data.result);
      setSuccessMessage(
        data.message || "Başvuru analizi başarıyla tamamlandı."
      );
    } catch (error) {
      console.error(
        "Analiz hatası:",
        error.response?.data || error.message
      );

      const responseData = error.response?.data;

      if (responseData?.missingFiles?.length) {
        setError(
          `${responseData.message} ${responseData.missingFiles.join(", ")}`
        );
      } else if (responseData?.missingTemplates?.length) {
        setError(
          `${responseData.message} ${responseData.missingTemplates.join(", ")}`
        );
      } else {
        setError(
          responseData?.message ||
          "Başvuru analizi sırasında bir hata oluştu."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFiles(emptyFiles);
    setAnalysisResult(null);
    setError("");
    setSuccessMessage("");
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Yeni Başvuru Analizi
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Başvuru belgelerini yükleyin, yapay zeka destekli kalite ve
            tutarlılık analizini başlatın.
          </p>
        </div>

        <button
          type="button"
          onClick={handleClear}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCcw size={16} />
          Temizle
        </button>
      </div>

      {error && (
        <div className="mb-6 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 flex gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          <CheckCircle size={19} className="mt-0.5 shrink-0" />
          <p>{successMessage}</p>
        </div>
      )}

      <UploadSection
        files={files}
        loading={loading}
        onFileChange={handleFileChange}
        onAnalyze={handleAnalyze}
      />

      {loading && <LoadingState />}

      {!analysisResult && !loading && (
        <section className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <h3 className="text-lg font-semibold text-slate-800">
            Henüz analiz sonucu yok
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Dört belgeyi yükleyip Analizi Başlat butonuna bastığınızda
            sonuçlar burada görüntülenecek.
          </p>
        </section>
      )}

      {analysisResult && !loading && (
        <AnalysisResults
          analysisResult={analysisResult}
          files={files}
        />
      )}
    </div>
  );
};

const fieldLabels = {
  applicationForm: "Başvuru Formu",
  technicalSpec: "Teknik Şartname",
  signatureDeclaration: "Tatbiki İmza Beyanı",
  priceOffers: "Fiyat Teklifleri",
};

export default NewAnalysis;