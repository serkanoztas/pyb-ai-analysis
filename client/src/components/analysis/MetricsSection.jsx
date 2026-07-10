import {
  Target,
  ClipboardCheck,
  AlertTriangle,
  Lightbulb,
  ShieldAlert,
} from "lucide-react";

import MetricCard from "./MetricCard";

const MetricsSection = ({ metrics }) => {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
      <MetricCard
        title="Öncelik Uygunluğu"
        value={metrics.priority}
        icon={<Target size={22} />}
        color="orange"
      />

      <MetricCard
        title="Tutarlılık Bulgusu"
        value={metrics.consistency}
        icon={<ClipboardCheck size={22} />}
        color="blue"
      />

      <MetricCard
        title="Zayıf Yön"
        value={metrics.weaknesses}
        icon={<AlertTriangle size={22} />}
        color="red"
      />

      <MetricCard
        title="Güçlendirme Önerisi"
        value={metrics.recommendations}
        icon={<Lightbulb size={22} />}
        color="green"
      />

      <MetricCard
        title="Uzman Kontrolü"
        value={metrics.expertReview}
        icon={<ShieldAlert size={22} />}
        color="purple"
      />
    </section>
  );
};

export default MetricsSection;