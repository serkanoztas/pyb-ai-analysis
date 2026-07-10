const StatusBadge = ({ text, color }) => {
  const colors = {
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
    orange: "bg-orange-100 text-orange-700",
    blue: "bg-blue-100 text-blue-700",
    purple: "bg-purple-100 text-purple-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${colors[color]}`}
    >
      {text}
    </span>
  );
};

export default StatusBadge;