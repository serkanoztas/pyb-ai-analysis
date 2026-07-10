import { useState } from "react";
import { RefreshCcw } from "lucide-react";

import UploadSection from "../components/upload/UploadSection";
import LoadingState from "../components/analysis/LoadingState";
import AnalysisResults from "../components/analysis/AnalysisResults";

import { mockAnalysisResult } from "../data/mockAnalysisResult";

const NewAnalysis = () => {
  const [files, setFiles] = useState({
    applicationForm: null,
    technicalSpec: null,
    signatureDeclaration: null,
    priceOffers: null,
  });

  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(mockAnalysisResult);

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];

    if (!file) return;

    setFiles((prev) => ({
      ...prev,
      [field]: file,
    }));
  };

  const handleAnalyze = () => {
    setLoading(true);

    setTimeout(() => {
      setAnalysisResult(mockAnalysisResult);
      setLoading(false);
    }, 1200);
  };

  const handleClear = () => {
    setFiles({
      applicationForm: null,
      technicalSpec: null,
      signatureDeclaration: null,
      priceOffers: null,
    });

    setAnalysisResult(null);
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
          onClick={handleClear}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          <RefreshCcw size={16} />
          Temizle
        </button>
      </div>

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
            Belgeleri yükleyip Analizi Başlat butonuna bastığınızda sonuçlar
            burada görüntülenecek.
          </p>
        </section>
      )}

      {analysisResult && !loading && (
        <AnalysisResults analysisResult={analysisResult} files={files} />
      )}
    </div>
  );
};

export default NewAnalysis;