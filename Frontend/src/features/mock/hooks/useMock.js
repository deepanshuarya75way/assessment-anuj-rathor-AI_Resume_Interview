import { useState } from "react";
import API from "../../../utils/api";

export const useMock = () => {
  const [loading, setLoading] = useState(false);
  const [feedbackHistory, setFeedbackHistory] = useState([]);

  // 🧠 GENERATE QUESTION (using follow-up API)
  const generateQuestion = async ({ topic, type, difficulty }) => {
    try {
      const res = await API.post("/interview/follow-up", {
        question: topic || "General interview question",
        answer: "Generate a question",
        type,
        difficulty
      });

      const q = res.data?.[0];

      return {
        question: q?.question || "Tell me about a challenging project.",
        intention: q?.intention || "Practice question"
      };

    } catch (err) {
      console.error("Generate Question Error:", err);

      return {
        question: "Tell me about a challenging project."
      };
    }
  };

  // 🧪 PRACTICE MODE
  const evaluateAnswer = async ({ question, answer }) => {
    try {
      setLoading(true);

      const res = await API.post("/interview/evaluate", {
        question,
        answer
      });

      return res.data;

    } catch (err) {
      console.error("Evaluate Error:", err);

      return {
        clarity: 60,
        confidence: 60,
        technical: 60,
        strengths: ["Basic attempt"],
        improvements: ["Improve explanation"]
      };

    } finally {
      setLoading(false);
    }
  };

  // 🎤 REAL INTERVIEW
  const submitLiveAnswer = async (data) => {
    try {
      setLoading(true);

      const res = await API.post("/interview/live", data);
      return res.data;

    } catch (err) {
      console.error("Live Interview Error:", err);
      return null;

    } finally {
      setLoading(false);
    }
  };

  // 📊 STORE FEEDBACK
  const pushFeedback = (item) => {
    setFeedbackHistory(prev => [...prev, item]);
  };

  // 🔄 RESET SESSION
  const resetFeedback = () => {
    setFeedbackHistory([]);
  };

  return {
    loading,
    feedbackHistory,

    generateQuestion,
    evaluateAnswer,
    submitLiveAnswer,

    pushFeedback,
    resetFeedback
  };
};