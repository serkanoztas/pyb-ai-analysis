import {
  Upload,
  Play,
  RefreshCcw,
  CheckCircle,
  Info,
} from "lucide-react";

import UploadCard from "./UploadCard";

const UploadSection = ({
  files,
  loading,
  onFileChange,
  onAnalyze,
}) => {
  const uploadedCount = Object.values(files).filter(Boolean).length;

  const canStartAnalysis = Boolean(files.applicationForm);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Upload size={20} className="text-blue-600" />

            <h2 className="text-lg font-semibold text-slate-900">
              Belge Seti Yükleme
            </h2>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Başvuru Formu zorunludur. Diğer belgeler yüklenmeleri
            durumunda analiz kapsamına dahil edilir.
          </p>
        </div>

        <div className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
          Yüklenen Belge: {uploadedCount}/4
        </div>
      </div>

      <div className="mb-5 flex gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
        <Info
          size={19}
          className="mt-0.5 shrink-0 text-blue-600"
        />

        <div>
          <p className="text-sm font-semibold text-blue-900">
            Belge yükleme kuralları
          </p>

          <p className="mt-1 text-sm text-blue-700">
            Başvuru Formu zorunludur. Teknik Şartname, Tatbiki
            İmza Beyanı ve Fiyat Teklifleri opsiyoneldir.
          </p>

          <p className="mt-1 text-sm text-blue-700">
            Opsiyonel belgeler yüklenmezse eksik belge olarak
            değerlendirilmez.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <UploadCard
          title="Başvuru Formu"
          description="Başvuru formu PDF"
          file={files.applicationForm}
          field="applicationForm"
          onChange={onFileChange}
          color="blue"
        />

        <UploadCard
          title="Teknik Şartname"
          description="Teknik şartname PDF"
          file={files.technicalSpec}
          field="technicalSpec"
          onChange={onFileChange}
          color="orange"
        />

        <UploadCard
          title="Tatbiki İmza Beyanı"
          description="İmza beyanı PDF"
          file={files.signatureDeclaration}
          field="signatureDeclaration"
          onChange={onFileChange}
          color="red"
        />

        <UploadCard
          title="Fiyat Teklifleri"
          description="Teklif dosyaları PDF / Excel"
          file={files.priceOffers}
          field="priceOffers"
          onChange={onFileChange}
          color="green"
        />
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm">
          {canStartAnalysis ? (
            <>
              <CheckCircle
                size={18}
                className="shrink-0 text-green-600"
              />

              <span className="text-green-700">
                Zorunlu belge yüklendi. Analiz başlatılabilir.
              </span>
            </>
          ) : (
            <>
              <Info
                size={18}
                className="shrink-0 text-slate-500"
              />

              <span className="text-slate-500">
                Analizi başlatmak için Başvuru Formunu yükleyin.
              </span>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={onAnalyze}
          disabled={loading || !canStartAnalysis}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCcw size={18} className="animate-spin" />
              Analiz Ediliyor
            </>
          ) : (
            <>
              <Play size={18} />
              Analizi Başlat
            </>
          )}
        </button>
      </div>
    </section>
  );
};

export default UploadSection;