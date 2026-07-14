import api from "./api";

const getActiveTemplates = async () => {
  const response = await api.get("/templates");
  return response.data;
};

const createTemplate = async ({ name, type, file }) => {
  const formData = new FormData();

  formData.append("name", name);
  formData.append("type", type);
  formData.append("file", file);

  const response = await api.post("/templates", formData);

  return response.data;
};

export { getActiveTemplates, createTemplate };