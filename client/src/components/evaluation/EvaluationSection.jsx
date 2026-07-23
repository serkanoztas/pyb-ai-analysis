import { Calculator, CheckCircle, Info } from "lucide-react";

import {
    evaluationCategories,
    evaluationCriteria,
} from "../../constants/evaluationCriteria.js";

const EvaluationSection = ({
    scores,
    onScoreChange,
    disabled = false,
}) => {
    const totalScore = evaluationCriteria.reduce((total, criterion) => {
        const score = Number(scores[criterion.code]);

        if (!Number.isFinite(score)) {
            return total;
        }

        return total + score;
    }, 0);

    const totalMaxScore = evaluationCriteria.reduce(
        (total, criterion) => total + criterion.maxScore,
        0
    );

    const completedScoreCount = evaluationCriteria.filter((criterion) => {
        const value = scores[criterion.code];

        return value !== "" && value !== null && value !== undefined;
    }).length;

    const allScoresCompleted =
        completedScoreCount === evaluationCriteria.length;

    const handleInputChange = (criterion, event) => {
        const rawValue = event.target.value;

        if (rawValue === "") {
            onScoreChange(criterion.code, "");
            return;
        }

        const numericValue = Number(rawValue);

        if (!Number.isFinite(numericValue)) {
            return;
        }

        const normalizedValue = Math.min(
            Math.max(numericValue, 0),
            criterion.maxScore
        );

        onScoreChange(criterion.code, normalizedValue);
    };

    const getCategoryScore = (categoryCode) =>
        evaluationCriteria
            .filter((criterion) => criterion.categoryCode === categoryCode)
            .reduce((total, criterion) => {
                const score = Number(scores[criterion.code]);

                return Number.isFinite(score) ? total + score : total;
            }, 0);

    return (
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <Calculator size={20} className="text-blue-600" />

                        <h2 className="text-lg font-semibold text-slate-900">
                            Nihai Değerlendirme Puanları
                        </h2>
                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                        Birim çalışanı tarafından belirlenen puanları girin. Yapay zekâ
                        puanları değiştirmeden yalnızca gerekçelerini oluşturacaktır.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                        Doldurulan: {completedScoreCount}/{evaluationCriteria.length}
                    </div>

                    <div className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
                        Toplam: {totalScore}/{totalMaxScore}
                    </div>
                </div>
            </div>

            <div className="mb-5 flex gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
                <Info
                    size={19}
                    className="mt-0.5 shrink-0 text-blue-600"
                />

                <div>
                    <p className="text-sm font-semibold text-blue-900">
                        Puan giriş kuralları
                    </p>

                    <p className="mt-1 text-sm text-blue-700">
                        Tüm kriterlere puan girilmelidir. Puanlar sıfırdan küçük ve
                        kriterin maksimum puanından büyük olamaz.
                    </p>
                </div>
            </div>

            <div className="space-y-5">
                {evaluationCategories.map((category) => {
                    const categoryCriteria = evaluationCriteria.filter(
                        (criterion) => criterion.categoryCode === category.code
                    );

                    const categoryScore = getCategoryScore(category.code);

                    return (
                        <div
                            key={category.code}
                            className="overflow-hidden rounded-xl border border-slate-200"
                        >
                            <div className="flex flex-col gap-2 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h3 className="font-semibold text-slate-900">
                                        {category.code}. {category.title}
                                    </h3>

                                    <p className="mt-0.5 text-xs text-slate-500">
                                        Bu kategori altındaki tüm kriterleri puanlayın.
                                    </p>
                                </div>

                                <div className="rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm">
                                    {categoryScore}/{category.maxScore}
                                </div>
                            </div>

                            <div className="divide-y divide-slate-100">
                                {categoryCriteria.map((criterion) => {
                                    const value = scores[criterion.code] ?? "";
                                    const hasValue =
                                        value !== "" &&
                                        value !== null &&
                                        value !== undefined;

                                    return (
                                        <div
                                            key={criterion.code}
                                            className="grid gap-4 p-4 lg:grid-cols-[80px_1fr_150px] lg:items-center"
                                        >
                                            <div>
                                                <span className="inline-flex rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-bold text-blue-700">
                                                    {criterion.code}
                                                </span>
                                            </div>

                                            <div>
                                                <p className="text-sm leading-6 text-slate-700">
                                                    {criterion.question}
                                                </p>
                                            </div>

                                            <div>
                                                <label
                                                    htmlFor={`score-${criterion.code}`}
                                                    className="mb-1.5 block text-xs font-medium text-slate-500"
                                                >
                                                    Verilen puan
                                                </label>

                                                <div className="flex items-center gap-2">
                                                    <input
                                                        id={`score-${criterion.code}`}
                                                        type="number"
                                                        min={0}
                                                        max={criterion.maxScore}
                                                        step={1}
                                                        value={value}
                                                        disabled={disabled}
                                                        onChange={(event) =>
                                                            handleInputChange(criterion, event)
                                                        }
                                                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-right text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                                                        placeholder="0"
                                                    />

                                                    <span className="min-w-10 text-sm font-semibold text-slate-500">
                                                        /{criterion.maxScore}
                                                    </span>
                                                </div>

                                                {hasValue &&
                                                    Number(value) === criterion.maxScore && (
                                                        <p className="mt-1 text-xs text-green-600">
                                                            Tam puan
                                                        </p>
                                                    )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-5 flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                    {allScoresCompleted ? (
                        <>
                            <CheckCircle
                                size={19}
                                className="shrink-0 text-green-600"
                            />

                            <span className="text-sm font-medium text-green-700">
                                Tüm değerlendirme puanları girildi.
                            </span>
                        </>
                    ) : (
                        <>
                            <Info
                                size={19}
                                className="shrink-0 text-slate-500"
                            />

                            <span className="text-sm text-slate-500">
                                Analizi başlatmadan önce tüm puanları girin.
                            </span>
                        </>
                    )}
                </div>

                <div className="text-right">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Genel Toplam
                    </p>

                    <p className="text-2xl font-bold text-slate-900">
                        {totalScore}
                        <span className="text-base font-semibold text-slate-500">
                            /{totalMaxScore}
                        </span>
                    </p>
                </div>
            </div>
        </section>
    );
};

export default EvaluationSection;