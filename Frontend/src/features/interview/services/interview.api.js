import api from "../../../utils/api"

/**
 * @description Service to generate interview report based on user self description, resume and job description.
 */
export const generateInterviewReport = async ({ jobDescription, selfDescription, resumeFile }) => {

    const formData = new FormData()
    if (jobDescription) formData.append("jobDescription", jobDescription)
    if (selfDescription) formData.append("selfDescription", selfDescription)
    if (resumeFile) formData.append("resume", resumeFile)

    const response = await api.post("/api/interview/", formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    })

    return response.data

}


/**
 * @description Service to get interview report by interviewId.
 */
export const getInterviewReportById = async (interviewId) => {
    const response = await api.get(`/api/interview/report/${interviewId}`)

    return response.data
}


/**
 * @description Service to get all interview reports of logged in user.
 */
export const getAllInterviewReports = async () => {
    const response = await api.get("/api/interview/")

    return response.data
}


/**
 * @description Service to generate resume pdf based on user self description, resume content and job description.
 */
export const generateResumePdf = async ({ interviewReportId }) => {
    const response = await api.post(`/api/interview/resume/pdf/${interviewReportId}`, null, {
        responseType: "blob"
    })

    return response.data
}

export const deleteReport = async (id) => {
  try {
    const res = await api.delete(`/api/interview/${id}`);

    return res.data; // ✅ axios already gives data

  } catch (err) {
    console.error("Delete error:", err.response?.data || err.message);
    throw err;
  }
};

// 🔥 GENERATE MORE QUESTIONS
export const generateMoreQuestions = async (interviewId) => {
  try {
    const res = await api.post(
      `/api/interview/${interviewId}/more-questions`
    );

    return res.data;

  } catch (err) {
    console.error("Generate more error:", err.response?.data || err.message);
    throw err;
  }
};

// get more beavioural questions
export const generateMoreBehavioral = async(interviewId) =>{
    try{
        const res = await api.post(`/api/interview/${interviewId}/more-behavioral`);
        return res.data;
    }catch (err) {
    console.error("Generate more error:", err.response?.data || err.message);
    throw err;
  }
};

// get follow up questions

export const generateFollowUp = async ({ question, answer }) => {
  const res = await api.post("/api/interview/follow-up", {
    question,
    answer
  });

  return res.data;
};

// get evaluation for mock 
export const evaluateMockAnswer = async ({ question, answer }) => {
  const res = await api.post("/api/interview/mock/evaluate", {
    question,
    answer
  });

  return res.data;
};

export const generateQuestion = async ({ topic, type,difficulty }) => {
  const res = await api.post("/api/interview/mock/generate-question", {
    topic,
    type,
    difficulty
  });

  return res.data;
};

// 🔥 UPDATE ROADMAP DAY
export const updateRoadmap = async (interviewId, day, tasks) => {
  if (!interviewId || day === undefined) {
    console.error("❌ Invalid request:", { interviewId, day, tasks });
    return;
  }

  return api.put(`/api/interview/${interviewId}/roadmap/${day}`, {
    tasks
  });
};

// 🔥 RE-ANALYZE INTERVIEW REPORT
export const reAnalyzeReport = async (interviewId) => {
  if (!interviewId) return null;
  const res = await api.post(`/api/interview/${interviewId}/re-analyze`);
  return res.data;
};

