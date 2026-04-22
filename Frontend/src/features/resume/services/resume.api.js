import api from "../../../utils/api";

// 🔥 GET RESUME
export const getResume = async () => {
  const res = await api.get("/api/resume");
  return res.data;
};

// 🔥 SAVE RESUME
export const saveResume = async (data) => {
  const res = await api.post("/api/resume", data);
  return res.data;
};

// 🔥 AI IMPROVE
export const improveResume = async (data) => {
  const res = await api.post("/api/resume/improve", data);
  return res.data;
};

// 🔥 ATS ANALYZE
export const analyzeResume = async (data) => {
  const res = await api.post("/api/resume/analyze", data);
  return res.data;
};

// 🔥 PDF DOWNLOAD
export const downloadPDF = async (data) => {
  const res = await api.post("/api/resume/pdf", data, {
    responseType: "blob"
  });

  return res.data;
};