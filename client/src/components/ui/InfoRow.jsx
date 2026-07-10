const InfoRow = ({ label, value }) => {
  return (
    <div className="grid grid-cols-2 gap-3 border-b border-slate-100 py-2 last:border-0">
      <span className="text-sm font-medium text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-800">{value}</span>
    </div>
  );
};

export default InfoRow;