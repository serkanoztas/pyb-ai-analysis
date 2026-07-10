const MetricCard = ({ title, value, icon, color }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600",
    orange: "bg-orange-50 text-orange-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${colors[color]}`}
        >
          {icon}
        </div>

        <span className="text-xs text-slate-400">Detay</span>
      </div>

      <p className="mt-4 text-sm text-slate-500">{title}</p>
      <h3 className="mt-1 text-xl font-bold text-slate-900">{value}</h3>
    </div>
  );
};

export default MetricCard;