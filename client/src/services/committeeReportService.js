import api from "./api";

const downloadCommitteeReport = async (
    analysisId,
    regenerate = false
) => {
    if (!analysisId) {
        throw new Error(
            "Analiz kimliği bulunamadı."
        );
    }

    const response = await api.post(
        `/committee-report/${analysisId}/download`,
        {
            regenerate,
        },
        {
            responseType: "blob",
        }
    );

    return response;
};

export {
    downloadCommitteeReport,
};