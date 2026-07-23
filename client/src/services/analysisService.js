import api from "./api";

const analyzeApplication = async (
  files,
  evaluationScores
) => {

  const formData = new FormData();

  Object.entries(files).forEach(([field, file]) => {
    if (file instanceof File) {
      formData.append(field, file);
    }
  });

  formData.append(
    "evaluationScores",
    JSON.stringify(evaluationScores)
  );

  const response = await api.post(
    "/analysis",
    formData
  );

  return response.data;
};

export { analyzeApplication };