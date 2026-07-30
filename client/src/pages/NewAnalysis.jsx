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

import {
  downloadCommitteeReport,
} from "../services/committeeReportService";





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
  const [
    isDownloadingCommitteeReport,
    setIsDownloadingCommitteeReport,
  ] = useState(false);
  const [totalScore, setTotalScore] = useState("");

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

  const handleTotalScoreChange = (value) => {
    setTotalScore(value);

    setError("");
    setSuccessMessage("");
    setAnalysisResult(null);
  };

  const [analysisId, setAnalysisId] =
    useState(null);

  const handleAnalyze = async () => {
    if (!files.applicationForm) {
      setError("Lütfen Başvuru Formunu yükleyin.");
      return;
    }

    const scoreValues = evaluationCriteria.map(
      (criterion) => evaluationScores[criterion.code]
    );

    const filledScoreCount = scoreValues.filter(
      (value) =>
        value !== "" &&
        value !== null &&
        value !== undefined
    ).length;

    const allCriteriaScoresFilled =
      filledScoreCount === evaluationCriteria.length;

    const allCriteriaScoresEmpty =
      filledScoreCount === 0;

    const someCriteriaScoresFilled =
      filledScoreCount > 0 &&
      filledScoreCount < evaluationCriteria.length;

    const hasTotalScore =
      totalScore !== "" &&
      totalScore !== null &&
      totalScore !== undefined;

    if (someCriteriaScoresFilled) {
      setError(
        "Kriter bazlı değerlendirme için tüm puanları girmelisiniz. Alternatif olarak tüm kriterleri boş bırakıp yalnızca toplam puan girebilirsiniz."
      );
      return;
    }

    if (allCriteriaScoresFilled && hasTotalScore) {
      setError(
        "Kriter puanları ile toplam puanı aynı anda kullanamazsınız."
      );
      return;
    }

    if (allCriteriaScoresEmpty && !hasTotalScore) {
      setError(
        "Lütfen tüm kriter puanlarını veya yalnızca toplam puanı giriniz."
      );
      return;
    }

    if (allCriteriaScoresFilled) {
      const hasInvalidScore = evaluationCriteria.some(
        (criterion) => {
          const score = Number(
            evaluationScores[criterion.code]
          );

          return (
            !Number.isFinite(score) ||
            score < 0 ||
            score > criterion.maxScore
          );
        }
      );

      if (hasInvalidScore) {
        setError(
          "Girilen kriter puanlarından biri geçersiz veya maksimum puanı aşıyor."
        );
        return;
      }
    }

    const maximumTotalScore = evaluationCriteria.reduce(
      (sum, criterion) => sum + criterion.maxScore,
      0
    );

    if (hasTotalScore) {
      const parsedTotalScore = Number(totalScore);

      if (
        !Number.isInteger(parsedTotalScore) ||
        parsedTotalScore < 0 ||
        parsedTotalScore > maximumTotalScore
      ) {
        setError(
          `Toplam puan 0 ile ${maximumTotalScore} arasında bir tam sayı olmalıdır.`
        );
        return;
      }
    }

    const scoringMode = allCriteriaScoresFilled
      ? "criteria"
      : "total";

    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");
      setAnalysisResult(null);

      const response = await analyzeApplication(files, {
        scoringMode,
        evaluationScores:
          scoringMode === "criteria"
            ? evaluationScores
            : {},
        totalScore:
          scoringMode === "total"
            ? Number(totalScore)
            : null,
      });

      setAnalysisResult(response.result);
      setAnalysisId(response.analysisId);

      setSuccessMessage(
        response.message ||
        "Başvuru analizi başarıyla tamamlandı."
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

  const handleDownloadCommitteeReport =
    async () => {
      if (!analysisId) {
        alert(
          "Önce başvuru analizini tamamlamalısınız."
        );
        return;
      }

      try {
        setIsDownloadingCommitteeReport(true);

        const response =
          await downloadCommitteeReport(
            analysisId
          );

        const contentType =
          response.headers["content-type"];

        if (
          !contentType?.includes(
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          )
        ) {
          throw new Error(
            "Sunucudan geçerli bir Word dosyası alınamadı."
          );
        }

        const blob = new Blob(
          [response.data],
          {
            type: contentType,
          }
        );

        const url =
          window.URL.createObjectURL(blob);

        const link =
          document.createElement("a");

        link.href = url;

        link.download =
          `komite-uyesi-raporu-${analysisId}.docx`;

        document.body.appendChild(link);
        link.click();
        link.remove();

        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error(
          "Komite raporu indirme hatası:",
          error
        );

        alert(
          "Komite üyesi raporu indirilemedi."
        );
      } finally {
        setIsDownloadingCommitteeReport(false);
      }
    };

  const handleClear = () => {
    setFiles(emptyFiles);
    setEvaluationScores(createEmptyScores());
    setTotalScore("");
    setAnalysisResult(null);
    setError("");
    setSuccessMessage("");
    setAnalysisId(null);
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
        totalScoreInput={totalScore}
        onScoreChange={handleScoreChange}
        onTotalScoreChange={handleTotalScoreChange}
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

      <div className="my-5 mx-auto">
        {analysisId && (
          <button
            type="button"
            onClick={
              handleDownloadCommitteeReport
            }
            disabled={
              isDownloadingCommitteeReport
            }
            className="rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDownloadingCommitteeReport
              ? "Rapor hazırlanıyor..."
              : "Komite Üyesi Raporunu Word Olarak İndir"}
          </button>
        )}
      </div>
    </div>

  );
};

export default NewAnalysis;