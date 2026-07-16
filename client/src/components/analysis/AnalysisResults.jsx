import MetricsSection from "./MetricsSection";
import AnalysisSummary from "./AnalysisSummary";
import UploadedFiles from "./UploadedFiles";
import PriorityAlignment from "./PriorityAlignment";
import FindingCard from "./FindingCard";
import ReportActions from "./ReportActions";

import {
  AlertTriangle,
  BarChart3,
  ClipboardCheck,
  FileCheck,
  Lightbulb,
  ShieldAlert,
} from "lucide-react";

const AnalysisResults = ({ analysisResult, files }) => {
  return (
    <div className="mt-6 space-y-6">
      <MetricsSection metrics={analysisResult.metrics} />

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <AnalysisSummary data={analysisResult.summary} />
        <UploadedFiles files={files} />
      </section>

      <PriorityAlignment data={analysisResult.priorityAlignment} />

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <FindingCard
          number="1"
          title="Başvuru - Şartname Tutarlılığı"
          icon={<FileCheck size={20} />}
          color="blue"
          items={analysisResult.consistencyFindings}
        />

        <FindingCard
          number="2"
          title="Fiyat Teklifi Analizi"
          icon={<BarChart3 size={20} />}
          color="orange"
          items={analysisResult.priceOfferAnalysis}
        />

        <FindingCard
          number="3"
          title="Performans Göstergeleri"
          icon={<ClipboardCheck size={20} />}
          color="green"
          items={analysisResult.performanceIndicators}
        />
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <FindingCard
          number="4"
          title="Projenin Zayıf Yönleri"
          icon={<AlertTriangle size={20} />}
          color="red"
          items={analysisResult.weakPoints}
        />

        <FindingCard
          number="5"
          title="Güçlendirme Önerileri"
          icon={<Lightbulb size={20} />}
          color="green"
          items={analysisResult.recommendations}
        />

        <FindingCard
          number="6"
          title="Uzman Kontrolü Gereken Hususlar"
          icon={<ShieldAlert size={20} />}
          color="purple"
          items={analysisResult.expertReviewItems}
        />
      </section>

      <ReportActions analysisResult={analysisResult} />
    </div>
  );
};

export default AnalysisResults;