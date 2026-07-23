import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const UploadCard = ({
  title,
  description,
  file,
  field,
  onChange,
  color,
}) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
    red: "bg-red-50 text-red-600 border-red-100",
    green: "bg-green-50 text-green-600 border-green-100",
  };

  const isRequired = field === "applicationForm";

  return (
    <label className="cursor-pointer rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-blue-300 hover:bg-white">
      <input
        type="file"
        accept=".pdf,.doc,.docx,.xls,.xlsx"
        className="hidden"
        onChange={(e) => onChange(e, field)}
      />

      <div className="flex items-start justify-between">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl border ${colors[color]}`}
        >
          <FileText size={24} />
        </div>

        {file ? (
          <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
            <CheckCircle size={13} />
            Yüklendi
          </span>
        ) : isRequired ? (
          <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
            <AlertCircle size={13} />
            Zorunlu
          </span>
        ) : (
          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
            Opsiyonel
          </span>
        )}
      </div>

      <div className="mt-4">
        <h3 className="font-semibold text-slate-900">
          {title}
        </h3>

        <p className="text-sm text-slate-500">
          {description}
        </p>
      </div>

      <div className="mt-4 border-t border-slate-200 pt-4">
        {file ? (
          <>
            <p className="truncate text-sm font-medium text-slate-800">
              {file.name}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {(file.size / 1024).toFixed(0)} KB
            </p>
          </>
        ) : (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Upload size={16} />
            Dosya seç
          </div>
        )}
      </div>
    </label>
  );
};

export default UploadCard;