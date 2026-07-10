import { Download, FileText } from "lucide-react";

const ReportActions = () => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <FileText size={22} />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Ön Rapor Oluşturma
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Tüm analiz bulguları birleştirilerek ön inceleme raporu
              oluşturulur ve PDF formatında indirilebilir.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button className="flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-5 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-50">
            <FileText size={18} />
            Ön Rapor Oluştur
          </button>

          <button className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700">
            <Download size={18} />
            PDF İndir
          </button>
        </div>
      </div>
    </section>
  );
};

export default ReportActions;