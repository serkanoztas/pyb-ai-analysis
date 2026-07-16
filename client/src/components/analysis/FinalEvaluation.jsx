import {
  Award,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

const FinalEvaluation = ({ evaluation }) => {
  if (!evaluation) return null;

  const {
    criteria = [],
    categoryScores = [],
    totalScore = 0,
    maxScore = 100,
    overallComment = "",
    expertNote = "",
  } = evaluation;

  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Award size={22} className="text-blue-600" />

            <h2 className="text-xl font-bold text-slate-900">
              Nihai Değerlendirme
            </h2>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Başvuru, rehberdeki resmî değerlendirme kriterlerine göre
            puanlanmıştır.
          </p>
        </div>

        <div className="rounded-2xl bg-blue-600 px-6 py-4 text-center text-white">
          <p className="text-sm text-blue-100">Toplam Puan</p>

          <p className="mt-1 text-3xl font-bold">
            {totalScore}
            <span className="text-lg font-medium"> / {maxScore}</span>
          </p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {categoryScores.map((category) => (
          <CategoryScoreCard
            key={category.code}
            category={category}
          />
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse">
            <thead>
              <tr className="bg-slate-100 text-left">
                <th className="w-20 border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
                  Kriter
                </th>

                <th className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
                  Değerlendirme
                </th>

                <th className="w-28 border-b border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-700">
                  Puan
                </th>
              </tr>
            </thead>

            <tbody>
              {criteria.map((criterion) => (
                <EvaluationRow
                  key={criterion.code}
                  criterion={criterion}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {overallComment && (
        <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-4">
          <h3 className="font-semibold text-blue-900">
            Genel Değerlendirme
          </h3>

          <p className="mt-2 text-sm leading-relaxed text-blue-800">
            {overallComment}
          </p>
        </div>
      )}

      {expertNote && (
        <div className="mt-4 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle
            size={20}
            className="mt-0.5 shrink-0 text-amber-600"
          />

          <div>
            <h3 className="font-semibold text-amber-900">
              Uzman Notu
            </h3>

            <p className="mt-1 text-sm leading-relaxed text-amber-800">
              {expertNote}
            </p>
          </div>
        </div>
      )}
    </section>
  );
};

const CategoryScoreCard = ({ category }) => {
  const percentage =
    category.maxScore > 0
      ? Math.round((category.score / category.maxScore) * 100)
      : 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-700">
            {category.code}. {category.title}
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {category.score}
            <span className="text-base font-medium text-slate-500">
              {" "}
              / {category.maxScore}
            </span>
          </p>
        </div>

        <CheckCircle2 size={20} className="text-green-600" />
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-blue-600"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>

      <p className="mt-2 text-xs text-slate-500">
        %{percentage}
      </p>
    </div>
  );
};

const EvaluationRow = ({ criterion }) => {
  const {
    code,
    question,
    score,
    maxScore,
    reason,
    evidence = [],
    improvement,
    reviewRequired,
  } = criterion;

  return (
    <tr className="border-b border-slate-200 align-top last:border-b-0">
      <td className="px-4 py-4 text-sm font-bold text-slate-900">
        {code}
      </td>

      <td className="px-4 py-4">
        <p className="text-sm font-semibold leading-relaxed text-slate-900">
          {question}
        </p>

        <div className="mt-3 rounded-xl bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Puan Gerekçesi
          </p>

          <p className="mt-1 text-sm leading-relaxed text-slate-700">
            {reason}
          </p>
        </div>

        {evidence.length > 0 && (
          <div className="mt-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Belge Kanıtları
            </p>

            <ul className="mt-2 space-y-1">
              {evidence.map((item, index) => (
                <li
                  key={`${code}-evidence-${index}`}
                  className="flex gap-2 text-sm text-slate-600"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {improvement && (
          <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
              Geliştirme Önerisi
            </p>

            <p className="mt-1 text-sm leading-relaxed text-amber-800">
              {improvement}
            </p>
          </div>
        )}

        {reviewRequired && (
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
            <AlertTriangle size={14} />
            Uzman kontrolü gerekli
          </div>
        )}
      </td>

      <td className="px-4 py-4 text-center">
        <div className="inline-flex min-w-20 items-center justify-center rounded-xl bg-blue-100 px-3 py-2">
          <span className="text-lg font-bold text-blue-700">
            {score}
          </span>

          <span className="ml-1 text-sm font-medium text-blue-600">
            / {maxScore}
          </span>
        </div>
      </td>
    </tr>
  );
};

export default FinalEvaluation;