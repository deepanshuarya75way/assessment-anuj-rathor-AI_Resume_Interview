import { apiClient, APIError } from "../../../utils/apiClient";

/**
 * Resume API Service Layer
 * 
 * Features:
 * - Automatic error handling with user-friendly messages
 * - Request/response logging
 * - Retry logic for network failures
 * - Type safety with JSDoc comments
 */

/**
 * Fetch user's resume
 * @returns {Promise<Object>} Resume data
 * @throws {APIError} If fetch fails
 */
export const getResume = async () => {
  try {
    const response = await apiClient.get("/resume");
    
    if (!response.data) {
      return null;
    }

    if (typeof response.data === "object" && "resume" in response.data) {
      return response.data.resume;
    }

    return response.data;
  } catch (error) {
    if (error.statusCode === 404 || error.statusCode === 401) {
      return null;
    }
    console.error("[Resume API] Get resume failed:", error);
    throw error;
  }
};

/**
 * Save or update user's resume
 * @param {Object} data - Resume data to save
 * @returns {Promise<Object>} Saved resume
 * @throws {APIError} If save fails
 */
export const saveResume = async (data) => {
  try {
    if (!data || typeof data !== "object") {
      throw new APIError("Invalid resume data", 400, "INVALID_DATA");
    }

    const response = await apiClient.post("/resume", data);
    
    if (response.data && typeof response.data === "object" && "resume" in response.data) {
      return response.data.resume;
    }

    return response.data;
  } catch (error) {
    console.error("[Resume API] Save resume failed:", error);
    throw error;
  }
};

/**
 * Improve resume using AI (ATS optimization)
 * @param {Object} data - Resume data to improve
 * @returns {Promise<Object>} Improved resume
 * @throws {APIError} If improvement fails
 */
export const improveResume = async (data) => {
  try {
    if (!data || typeof data !== "object") {
      throw new APIError("Invalid resume data", 400, "INVALID_DATA");
    }

    if (Object.keys(data).length === 0) {
      throw new APIError("Resume cannot be empty", 400, "EMPTY_RESUME");
    }

    const response = await apiClient.post("/resume/improve", data);
    
    return response.data.resume || response.data;
  } catch (error) {
    console.error("[Resume API] Improve resume failed:", error);
    throw error;
  }
};

/**
 * Analyze resume for ATS compatibility
 * @param {Object} data - Resume and optional job description
 * @returns {Promise<Object>} Analysis results with scores and recommendations
 * @throws {APIError} If analysis fails
 */
export const analyzeResume = async (data) => {
  try {
    if (!data || !data.resume) {
      throw new APIError("Resume is required for analysis", 400, "MISSING_RESUME");
    }

    const response = await apiClient.post("/resume/analyze", data);
    
    return response.data.analysis || response.data;
  } catch (error) {
    console.error("[Resume API] Analyze resume failed:", error);
    throw error;
  }
};

/**
 * Generate PDF from resume data
 * @param {Object} data - Resume data
 * @returns {Promise<Blob>} PDF file blob
 * @throws {APIError} If PDF generation fails
 */
export const downloadPDF = async (data) => {
  try {
    if (!data || typeof data !== "object") {
      throw new APIError("Invalid resume data for PDF", 400, "INVALID_DATA");
    }

    const response = await apiClient.post("/resume/pdf", data);
    
    // If response is a blob, return it directly
    if (response.data instanceof Blob) {
      return response.data;
    }

    // Otherwise, convert to blob
    return new Blob([JSON.stringify(response.data)], {
      type: "application/json",
    });
  } catch (error) {
    console.error("[Resume API] PDF download failed:", error);
    throw error;
  }
};

/**
 * Rewrite bullets using AI
 */
export const rewriteBullets = async (data) => {
  try {
    const response = await apiClient.post("/resume/rewrite-bullets", data);
    return response.data.bullets || response.data;
  } catch (error) {
    console.error("[Resume API] Rewrite bullets failed:", error);
    throw error;
  }
};

/**
 * Generate professional summary
 */
export const generateSummary = async (data) => {
  try {
    const response = await apiClient.post("/resume/generate-summary", data);
    return response.data.summary || response.data;
  } catch (error) {
    console.error("[Resume API] Generate summary failed:", error);
    throw error;
  }
};

/**
 * Suggest in-demand skills
 */
export const suggestSkills = async (data) => {
  try {
    const response = await apiClient.post("/resume/suggest-skills", data);
    return response.data.skills || response.data;
  } catch (error) {
    console.error("[Resume API] Suggest skills failed:", error);
    throw error;
  }
};

/**
 * Chat with AI Assistant
 */
export const chatAssistant = async (data) => {
  try {
    const response = await apiClient.post("/resume/chat", data);
    return response.data.reply || response.data;
  } catch (error) {
    console.error("[Resume API] Chat failed:", error);
    throw error;
  }
};

/**
 * Generate Tailored Cover Letter
 */
export const generateCoverLetter = async (data) => {
  try {
    const response = await apiClient.post("/resume/cover-letter", data);
    return response.data.coverLetter || response.data;
  } catch (error) {
    console.error("[Resume API] Cover letter failed:", error);
    throw error;
  }
};

/**
 * Predict interview chances
 */
export const predictInterviewChance = async (data) => {
  try {
    const response = await apiClient.post("/resume/interview-chance", data);
    return response.data.prediction || response.data;
  } catch (error) {
    console.error("[Resume API] Interview chance failed:", error);
    throw error;
  }
};

/**
 * Get resume error message for UI display
 * @param {APIError|Error} error - Error object
 * @returns {string} User-friendly error message
 */
export const getResumeErrorMessage = (error) => {
  if (error instanceof APIError) {
    switch (error.errorCode) {
      case "NO_RESUME":
        return "No resume found. Create a new one to get started.";
      case "INVALID_DATA":
        return "Invalid resume data. Please check your input.";
      case "EMPTY_RESUME":
        return "Resume cannot be empty. Please add some content.";
      case "MISSING_RESUME":
        return "Resume is required for this operation.";
      case "VALIDATION_ERROR":
        return "Please fix the validation errors and try again.";
      case "UNAUTHORIZED":
        return "You need to log in to access this feature.";
      case "FORBIDDEN":
        return "You don't have permission to access this resume.";
      case "NOT_FOUND":
        return "Resume not found.";
      case "CONFLICT":
        return "Resume was modified. Please refresh and try again.";
      case "RATE_LIMITED":
        return "Too many requests. Please wait a moment and try again.";
      case "AI_FAILED":
        return "AI service temporarily unavailable. Please try again.";
      case "PDF_GENERATION_FAILED":
        return "Could not generate PDF. Please try again.";
      default:
        return error.message || "An error occurred while processing your resume.";
    }
  }

  if (error instanceof TypeError && error.message.includes("fetch")) {
    return "Network error. Please check your connection and try again.";
  }

  return error?.message || "An unexpected error occurred.";
};
