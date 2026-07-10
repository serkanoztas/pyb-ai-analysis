const LegendItem = ({ color, title, text }) => {
  const colors = {
    green: "bg-green-500",
    orange: "bg-orange-500",
    red: "bg-red-500",
    purple: "bg-purple-500",
  };

  return (
    <div className="flex gap-3">
      <span className={`mt-1.5 h-2.5 w-2.5 rounded-full ${colors[color]}`} />
      <div>
        <p className="font-medium text-slate-800">{title}</p>
        <p className="text-slate-500">{text}</p>
      </div>
    </div>
  );
};

export default LegendItem;