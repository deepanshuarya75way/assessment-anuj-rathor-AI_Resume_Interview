import {
  getAllInterviewReports,
  generateInterviewReport,
  getInterviewReportById,
  generateResumePdf
} from "../services/interview.api";

import { useContext, useEffect } from "react";
import { InterviewContext } from "../interview.context";
import { useParams } from "react-router-dom";

export const useInterview = () => {

  const context = useContext(InterviewContext);
  const { interviewId } = useParams();

  if (!context) {
    throw new Error("useInterview must be used within an InterviewProvider");
  }

  const {
    loading,
    setLoading,
    report,
    setReport,
    reports,
    setReports
  } = context;

  // 🔥 GENERATE REPORT
  const generateReport = async ({ jobDescription, selfDescription, resumeFile }) => {
    try {
      setLoading(true);

      const res = await generateInterviewReport({
        jobDescription,
        selfDescription,
        resumeFile
      });

      setReport(res?.interviewReport || null);
      return res?.interviewReport || null;

    } catch (err) {
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // 🔥 GET SINGLE REPORT
  const getReportById = async (id) => {
    try {
      setLoading(true);

      const res = await getInterviewReportById(id);
      setReport(res?.interviewReport || null);

      return res?.interviewReport || null;

    } catch (err) {
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // 🔥 GET ALL REPORTS
  const getReports = async () => {
    try {
      setLoading(true);

      const res = await getAllInterviewReports();
      setReports(res?.interviewReports || []);

      return res?.interviewReports || [];

    } catch (err) {
      console.error(err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // 🔥 DOWNLOAD PDF
  const getResumePdf = async (interviewReportId) => {
    try {
      setLoading(true);

      const res = await generateResumePdf({ interviewReportId });

      const url = window.URL.createObjectURL(
        new Blob([res], { type: "application/pdf" })
      );

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `resume_${interviewReportId}.pdf`);
      document.body.appendChild(link);
      link.click();

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 AUTO FETCH
  useEffect(() => {
    if (interviewId) {
      getReportById(interviewId);
    } else {
      getReports();
    }
  }, [interviewId]);

  return {
    loading,
    report,
    reports,
    generateReport,
    getReportById,
    getReports,
    getResumePdf
  };
};