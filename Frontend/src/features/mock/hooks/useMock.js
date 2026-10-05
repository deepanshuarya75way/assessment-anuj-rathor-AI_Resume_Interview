import { useState, useRef } from "react";
import API from "../../../utils/api";

export const useMock = () => {
  const [loading, setLoading] = useState(false);
  const [feedbackHistory, setFeedbackHistory] = useState([]);

  const abortRef = useRef(null);

  // 🧠 GENERATE QUESTION
  const generateQuestion = async ({ topic, type, difficulty }) => {
    try {
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      const res = await API.post(
        "/api/interview/mock/generate-question",
        { topic, type, difficulty },
        { signal: abortRef.current.signal }
      );

      const q = res.data?.data || res.data?.[0] || res.data;

      return {
        question:
          q?.question ||
          (topic
            ? `Explain your experience with ${topic}`
            : "Tell me about yourself."),
        intention: q?.intention || "Practice question"
      };

    } catch (err) {
      if (err.name !== "CanceledError") {
        console.error("Generate Question Error:", err);
      }

      return {
        question: topic
          ? `Explain your experience with ${topic}`
          : "Tell me about yourself."
      };
    }
  };

  // 🧪 PRACTICE MODE
  const evaluateAnswer = async ({ question, answer }) => {
    try {
      setLoading(true);

      const res = await API.post(
        "/api/interview/mock/evaluate",
        { question, answer }
      );

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

      const res = await API.post(
        "/api/interview/live",
        data
      );

      return res.data;

    } catch (err) {
      console.error("Live Interview Error:", err);
      return null;

    } finally {
      setLoading(false);
    }
  };

  // 📊 STORE FEEDBACK (LIMITED)
  const pushFeedback = (item) => {
    setFeedbackHistory(prev => {
      const updated = [...prev, item];
      return updated.slice(-10); // 🔥 keep last 10
    });
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