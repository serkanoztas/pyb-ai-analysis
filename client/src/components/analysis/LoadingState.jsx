import { RefreshCcw } from "lucide-react";

const LoadingState = () => {
  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
        <RefreshCcw size={26} className="animate-spin" />
      </div>

      <h3 className="mt-4 text-lg font-semibold text-slate-900">
        Belgeler analiz ediliyor
      </h3>

      <p className="mt-2 text-sm text-slate-500">
        Öncelik uyumu, şartname tutarlılığı, fiyat teklifleri, performans
        göstergeleri ve zayıf yönler inceleniyor.
      </p>
    </section>
  );
};

export default LoadingState;