const FindingCard = ({ number, title, icon, color, items = [] }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    green: "bg-green-50 text-green-600 border-green-100",
    red: "bg-red-50 text-red-600 border-red-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-xl border ${colors[color]}`}
          >
            {icon}
          </div>

          <h2 className="font-semibold text-slate-900">
            {number}. {title}
          </h2>
        </div>

        <span className={`rounded-full px-2 py-1 text-xs ${colors[color]}`}>
          {items.length} Bulgu
        </span>
      </div>

      <ul className="space-y-3">
        {items.map((item, index) => (
          <li key={index} className="text-sm">
            <p className="font-medium text-slate-900">{item.title}</p>
            <p className="mt-1 leading-relaxed text-slate-500">
              {item.description}
            </p>
          </li>
        ))}
      </ul>

      <button className="mt-5 text-sm font-medium text-blue-600 hover:underline">
        Tümünü Görüntüle →
      </button>
    </div>
  );
};

export default FindingCard;