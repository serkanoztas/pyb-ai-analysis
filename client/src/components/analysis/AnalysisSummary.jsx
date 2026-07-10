import { FileText } from "lucide-react";
import InfoRow from "../ui/InfoRow";
import StatusBadge from "../ui/StatusBadge";

const AnalysisSummary = ({ data }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center gap-2">
        <FileText size={20} className="text-blue-600" />
        <h2 className="text-lg font-semibold text-slate-900">Analiz Özeti</h2>
      </div>

      <div className="space-y-1">
        <InfoRow label="Başvuru Sahibi" value={data.applicantName} />
        <InfoRow label="Proje Konusu" value={data.projectName} />
        <InfoRow label="Destek Türü" value={data.supportType} />
        <InfoRow label="Süre" value={data.duration} />
        <InfoRow label="Coğrafi Uygulama Alanı" value={data.location} />
        <InfoRow label="Öncelik" value={data.priority} />
        <InfoRow
          label="Öncelik Uygunluğu"
          value={<StatusBadge text={data.priorityStatus} color="orange" />}
        />
        <InfoRow
          label="Analiz Durumu"
          value={<StatusBadge text="Analiz Tamamlandı" color="green" />}
        />
      </div>
    </div>
  );
};

export default AnalysisSummary;