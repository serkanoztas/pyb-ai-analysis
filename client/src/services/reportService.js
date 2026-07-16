import api from "./api";

const downloadPreliminaryReport = async (analysisResult) => {
  const response = await api.post(
    "/reports/pdf",
    {
      analysisResult,
    },
    {
      responseType: "blob",
    }
  );

  return response;
};

export { downloadPreliminaryReport };