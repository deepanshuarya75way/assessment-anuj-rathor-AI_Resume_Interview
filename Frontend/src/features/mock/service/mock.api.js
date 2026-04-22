import api from "../../../utils/api";

// 🎤 LIVE INTERVIEW
export const liveInterview = async ({ question, answer, history, sessionId, mode }) => {
  const res = await api.post("/api/interview/live", {
    question,
    answer,
    history,
    sessionId,
    mode
  });

  return res.data;
};

// 🏁 END INTERVIEW
export const endInterview = async ({ sessionId, feedback }) => {
  const res = await api.post("/api/interview/end", {
    sessionId,
    feedback
  });
  return res.data;
};

// 💬 FOLLOW-UP
export const generateFollowUp = async (data) => {
  const res = await api.post("/interview/follow-up", data);
  return res.data;
};