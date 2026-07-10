import { Upload, FileText, Eye } from "lucide-react";
import StatusBadge from "../ui/StatusBadge";

const UploadedFiles = ({ files }) => {
  const fileList = [
    ["Başvuru Formu", files.applicationForm],
    ["Teknik Şartname", files.technicalSpec],
    ["Tatbiki İmza Beyanı", files.signatureDeclaration],
    ["Fiyat Teklifleri", files.priceOffers],
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center gap-2">
        <Upload size={20} className="text-blue-600" />
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Yüklenen Belgeler
          </h2>
          <p className="text-sm text-slate-500">
            Bu sistem belge varlığından çok içerik analizine odaklanır.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {fileList.map(([title, file]) => (
          <div
            key={title}
            className="flex items-center justify-between rounded-xl border border-slate-200 p-3"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <FileText size={20} />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-900">{title}</p>
                <p className="text-xs text-slate-500">
                  {file ? file.name : "Dosya yüklenmedi"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {file && (
                <button className="text-slate-400 hover:text-blue-600">
                  <Eye size={17} />
                </button>
              )}

              <StatusBadge
                text={file ? "Yüklendi" : "Eksik"}
                color={file ? "green" : "red"}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UploadedFiles;