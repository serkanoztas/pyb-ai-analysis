import api from "./api";

const analyzeApplication = async (
  files,
  scoringData
) => {
  const formData = new FormData();

  Object.entries(files).forEach(([field, file]) => {
    if (file instanceof File) {
      formData.append(field, file);
    }
  });

  formData.append(
    "scoringMode",
    scoringData.scoringMode
  );

  formData.append(
    "evaluationScores",
    JSON.stringify(
      scoringData.evaluationScores ?? {}
    )
  );

  if (
    scoringData.totalScore !== null &&
    scoringData.totalScore !== undefined
  ) {
    formData.append(
      "totalScore",
      String(scoringData.totalScore)
    );
  }

  const response = await api.post(
    "/analysis",
    formData
  );

  return response.data;
};

export { analyzeApplication };