import api from "./api";

const analyzeApplication = async (files) => {
  const formData = new FormData();

  Object.entries(files).forEach(([field, file]) => {
    if (file instanceof File) {
      formData.append(field, file);
    }
  });

  for (const [key, value] of formData.entries()) {
    console.log("FormData:", key, value.name);
  }

  const response = await api.post("/analysis", formData);

  return response.data;
};

export { analyzeApplication };