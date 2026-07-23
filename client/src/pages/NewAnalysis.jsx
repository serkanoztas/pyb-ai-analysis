import { useState } from "react";
import {
  RefreshCcw,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

import UploadSection from "../components/upload/UploadSection";
import LoadingState from "../components/analysis/LoadingState";
import AnalysisResults from "../components/analysis/AnalysisResults";
import EvaluationSection from "../components/evaluation/EvaluationSection";

import { analyzeApplication } from "../services/analysisService";

import {
  evaluationCriteria,
} from "../constants/evaluationCriteria.js";

const createEmptyScores = () =>
  Object.fromEntries(
    evaluationCriteria.map((criterion) => [criterion.code, ""])
  );

const emptyFiles = {
  applicationForm: null,
  technicalSpec: null,
  signatureDeclaration: null,
  priceOffers: null,
};

const NewAnalysis = () => {
  const [files, setFiles] = useState(emptyFiles);
  const [evaluationScores, setEvaluationScores] = useState(
    createEmptyScores
  );

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

  const handleScoreChange = (criterionCode, value) => {
    setEvaluationScores((prev) => ({
      ...prev,
      [criterionCode]: value,
    }));

    setError("");
    setSuccessMessage("");
    setAnalysisResult(null);
  };

  const handleAnalyze = async () => {
    if (!files.applicationForm) {
      setError("Lütfen Başvuru Formunu yükleyin.");
      return;
    }

    const hasEmptyScore = evaluationCriteria.some((criterion) => {
      const value = evaluationScores[criterion.code];

      return value === "" || value === null || value === undefined;
    });

    if (hasEmptyScore) {
      setError("Lütfen tüm değerlendirme puanlarını giriniz.");
      return;
    }

    const hasInvalidScore = evaluationCriteria.some((criterion) => {
      const score = Number(evaluationScores[criterion.code]);

      return (
        !Number.isFinite(score) ||
        score < 0 ||
        score > criterion.maxScore
      );
    });

    if (hasInvalidScore) {
      setError(
        "Girilen puanlardan biri geçersiz veya maksimum puanı aşıyor."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");
      setAnalysisResult(null);

      const data = await analyzeApplication(
        files,
        evaluationScores
      );

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
    setEvaluationScores(createEmptyScores());
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
            Başvuru belgelerini yükleyin, değerlendirme puanlarını
            girin ve yapay zekâ destekli gerekçe oluşturma işlemini
            başlatın.
          </p>

          <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
            <h3 className="text-sm font-semibold text-blue-900">
              Belge Yükleme Bilgisi
            </h3>

            <p className="mt-1 text-sm text-blue-700">
              Başvuru Formu zorunludur.
            </p>

            <p className="text-sm text-blue-700">
              Teknik Şartname, Tatbiki İmza Beyanı ve Fiyat Teklifleri
              isteğe bağlıdır. Yüklenmeleri durumunda analiz kapsamına
              dahil edilir.
            </p>
          </div>
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

      <EvaluationSection
        scores={evaluationScores}
        onScoreChange={handleScoreChange}
        disabled={loading}
      />

      {loading && <LoadingState />}

      {!analysisResult && !loading && (
        <section className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <h3 className="text-lg font-semibold text-slate-800">
            Henüz analiz sonucu yok
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Başvuru Formunu yükleyin, değerlendirme puanlarını girin
            ve Analizi Başlat butonuna basın.
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

export default NewAnalysis;