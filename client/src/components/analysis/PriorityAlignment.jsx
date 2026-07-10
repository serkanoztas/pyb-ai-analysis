import { Target } from "lucide-react";
import InfoRow from "../ui/InfoRow";
import StatusBadge from "../ui/StatusBadge";
import LegendItem from "../ui/LegendItem";

const PriorityAlignment = ({ data }) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center gap-2">
        <Target size={20} className="text-blue-600" />
        <h2 className="text-lg font-semibold text-slate-900">
          Öncelik Uygunluğu
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="space-y-4">
          <InfoRow label="Seçilen Öncelik" value={data.selectedPriority} />

          <InfoRow
            label="AI Değerlendirmesi"
            value={<StatusBadge text="Kısmen Uyumlu" color="orange" />}
          />

          <div>
            <p className="mb-1 text-sm font-medium text-slate-500">Gerekçe</p>
            <p className="text-sm leading-relaxed text-slate-700">
              {data.reason}
            </p>
          </div>

          <div>
            <p className="mb-1 text-sm font-medium text-slate-500">Öneri</p>
            <p className="text-sm leading-relaxed text-slate-700">
              {data.recommendation}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="mb-3 font-semibold text-slate-900">
            Durum Anlamları
          </h3>

          <div className="space-y-3 text-sm">
            <LegendItem
              color="green"
              title="Uyumlu"
              text="Başvuru seçilen öncelikle güçlü şekilde uyumludur."
            />
            <LegendItem
              color="orange"
              title="Kısmen Uyumlu"
              text="Başvuru öncelikle ilişkili ancak bazı bağlar güçlendirilmelidir."
            />
            <LegendItem
              color="red"
              title="Uyumsuz"
              text="Başvuru seçilen öncelikle yeterli ilişki kurmamaktadır."
            />
            <LegendItem
              color="purple"
              title="Uzman Kontrolü Gerekli"
              text="Net değerlendirme için uzman incelemesi gerekir."
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default PriorityAlignment;