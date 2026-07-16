import { useState } from "react";
import {
  Download,
  FileText,
  RefreshCcw,
} from "lucide-react";

import { downloadPreliminaryReport } from "../../services/reportService";

const ReportActions = ({ analysisResult }) => {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  const handleDownload = async () => {
    try {
      setDownloading(true);
      setError("");

      const response =
        await downloadPreliminaryReport(analysisResult);

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);

      const contentDisposition =
        response.headers["content-disposition"];

      let fileName = "Teknik-Destek-On-Rapor.pdf";

      const match = contentDisposition?.match(
        /filename="?([^"]+)"?/
      );

      if (match?.[1]) {
        fileName = match[1];
      }

      const link = document.createElement("a");

      link.href = url;
      link.download = fileName;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      let errorMessage = "Ön rapor PDF indirilemedi.";

      const responseData = error.response?.data;

      if (responseData instanceof Blob) {
        try {
          const errorText = await responseData.text();
          const parsedError = JSON.parse(errorText);

          errorMessage = parsedError.message || errorMessage;

          console.error("PDF backend hatası:", parsedError);
        } catch {
          console.error("PDF hata Blob'u okunamadı:", responseData);
        }
      } else {
        errorMessage =
          responseData?.message ||
          error.message ||
          errorMessage;

        console.error("PDF indirme hatası:", responseData || error);
      }

      setError(errorMessage);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <FileText size={22} />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Ön Rapor
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Analiz bulgularını kurumsal PDF raporu olarak indirin.
            </p>

            {error && (
              <p className="mt-2 text-sm text-red-600">
                {error}
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {downloading ? (
            <>
              <RefreshCcw
                size={18}
                className="animate-spin"
              />
              PDF Hazırlanıyor
            </>
          ) : (
            <>
              <Download size={18} />
              PDF İndir
            </>
          )}
        </button>
      </div>
    </section>
  );
};

export default ReportActions;