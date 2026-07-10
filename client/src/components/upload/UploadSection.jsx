import { Upload, Play, RefreshCcw } from "lucide-react";
import UploadCard from "./UploadCard";

const UploadSection = ({ files, loading, onFileChange, onAnalyze }) => {
  const uploadedCount = Object.values(files).filter(Boolean).length;

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
            KAYS eksik belge kontrolünü yaptığı için bu sistem kalite,
            tutarlılık ve öneri analizine odaklanır.
          </p>
        </div>

        <div className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
          Yüklenen Belge: {uploadedCount}/4
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

      <div className="mt-5 flex justify-end">
        <button
          onClick={onAnalyze}
          disabled={loading || uploadedCount === 0}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
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