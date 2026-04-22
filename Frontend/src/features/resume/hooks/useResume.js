import { useEffect, useState } from "react";
import api from "../../../utils/api";
import {
  analyzeResume,
  getResume,
  improveResume,
  saveResume,
} from "../services/resume.api";

const sectionKeys = [
  "summary",
  "experience",
  "projects",
  "skills",
  "education",
  "certifications",
];

const defaultExperience = {
  title: "Student Coordinator",
  company: "Training and Placement Cell, AKGEC",
  location: "Ghaziabad",
  startDate: "May 2025",
  endDate: "Present",
  points: [
    "Coordinated recruitment operations and maintained placement data for 500+ students across multiple engineering streams.",
    "Streamlined student-recruiter scheduling, reducing clashes and improving communication turnaround.",
    "Facilitated mock interviews, technical sessions, and resume workshops to strengthen candidate readiness.",
  ],
};

const defaultProject = {
  name: "AI-Generated Interview Tool",
  role: "Full Stack Developer",
  stack: "React, Node.js, MongoDB, AI APIs",
  liveUrl: "https://resumeforge-ai.vercel.app",
  githubUrl: "https://github.com/krishgupta-dev/ai-interview-tool",
  points: [
    "Built an AI-powered platform that analyzes resumes and job descriptions to generate personalized interview questions.",
    "Implemented JWT authentication, ATS scoring, and resume improvement recommendations.",
    "Integrated LLM APIs for dynamic question generation and skill-based learning suggestions.",
  ],
};

const defaultEducation = {
  school: "Ajay Kumar Garg Engineering College",
  degree: "B.Tech in Computer Science and Engineering",
  location: "Ghaziabad",
  startDate: "2023",
  endDate: "2027",
  score: "CGPA 8.12",
};

const baseResume = {
  name: "Krish Gupta",
  role: "Full Stack Developer",
  phone: "+91 7465982627",
  email: "krish23153106@akgec.ac.in",
  github: "https://github.com/krishgupta-dev",
  linkedin: "https://linkedin.com/in/krish-gupta-dev",
  leetcode: "https://leetcode.com/u/krishgupta",
  portfolio: "https://krish-resumeforge.vercel.app",
  location: "Ghaziabad, Uttar Pradesh",
  summary:
    "Full Stack Developer with experience building scalable web applications using React.js, Node.js, Express.js, and MongoDB. Strong in secure authentication, ATS optimization, AI API integrations, and recruiter-friendly product delivery.",
  experience: [
    defaultExperience,
    {
      title: "HR Ambassador",
      company: "Slum Swaraj Foundation",
      location: "Remote",
      startDate: "2024",
      endDate: "Present",
      points: [
        "Led onboarding and coordination of student volunteers for NGO-led educational outreach initiatives.",
        "Improved communication between management and volunteers, enhancing execution efficiency.",
        "Supported community programs and outreach campaigns with cross-functional coordination.",
      ],
    },
  ],
  projects: [
    defaultProject,
    {
      name: "Banking Ledger System",
      role: "Backend Engineer",
      stack: "Node.js, Express, MongoDB",
      liveUrl: "https://ledger-demo.render.com",
      githubUrl: "https://github.com/krishgupta-dev/banking-ledger-system",
      points: [
        "Architected a secure double-entry ledger system with atomic MongoDB transactions.",
        "Designed idempotent transaction handling to prevent duplicate financial operations.",
        "Implemented RBAC, JWT authorization, and token blacklisting for secure access control.",
      ],
    },
  ],
  skills: [
    "React.js",
    "Vite",
    "Tailwind CSS",
    "Node.js",
    "Express.js",
    "MongoDB",
    "REST APIs",
    "JWT Authentication",
    "RBAC",
    "System Design",
    "DSA",
    "Git",
    "Postman",
    "Render",
    "Vercel",
  ],
  education: [
    defaultEducation,
    {
      school: "Colonel Brightland Public School",
      degree: "Senior Secondary (Class XII), CBSE",
      location: "Agra",
      startDate: "2022",
      endDate: "2022",
      score: "90%",
    },
  ],
  certifications: [
    "Oracle Certified Professional: Oracle Autonomous Database Cloud 2025, valid through October 2027.",
    "Secured 1st rank in Blind Coding Competition at IMS Ghaziabad TechFest.",
    "Solved 350+ DSA problems on LeetCode and GeeksforGeeks across trees, graphs, dynamic programming, and greedy algorithms.",
  ],
  sectionOrder: sectionKeys,
  template: "tech",
};

const baseAnalytics = {
  score: 91,
  percentile: "Top 7%",
  keywords: [
    "JWT Authentication",
    "MongoDB Transactions",
    "LLM APIs",
    "Role-Based Access Control",
  ],
  missingKeywords: ["CI/CD", "Unit Testing", "TypeScript", "Performance Metrics"],
  formattingIssues: [
    "Shorten a few long URLs in the header for cleaner recruiter scanning.",
    "Add one more quantified impact bullet in the NGO experience block.",
  ],
  suggestions: [
    "Move your strongest project directly under experience when applying for product startups.",
    "Mention cloud deployment impact in the summary for backend-heavy roles.",
    "Keep the header links to one line for stronger ATS readability.",
  ],
};

const normalizeList = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => `${item}`.trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/[,\n|]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const normalizeSectionOrder = (value) => {
  const incoming = Array.isArray(value) ? value.filter(Boolean) : [];
  const merged = [...incoming, ...sectionKeys];

  return merged.filter(
    (item, index) => sectionKeys.includes(item) && merged.indexOf(item) === index
  );
};

const normalizeExperience = (items) => {
  const source = items?.length ? items : baseResume.experience;

  return source.map((item) => ({
    ...defaultExperience,
    ...item,
    startDate: item.startDate || item.start || defaultExperience.startDate,
    endDate: item.endDate || item.end || defaultExperience.endDate,
    points: normalizeList(item.points || item.bullets || defaultExperience.points),
  }));
};

const normalizeProjects = (items) => {
  const source = items?.length ? items : baseResume.projects;

  return source.map((item) => ({
    ...defaultProject,
    ...item,
    liveUrl: item.liveUrl || item.demo || defaultProject.liveUrl,
    githubUrl: item.githubUrl || item.github || defaultProject.githubUrl,
    points: normalizeList(item.points || item.bullets || defaultProject.points),
  }));
};

const normalizeEducation = (items) => {
  const source = items?.length ? items : baseResume.education;

  return source.map((item) => ({
    ...defaultEducation,
    ...item,
    school:
      item.school ||
      item.university ||
      item.institution ||
      defaultEducation.school,
    degree: item.degree || item.course || defaultEducation.degree,
    startDate: item.startDate || item.start || defaultEducation.startDate,
    endDate: item.endDate || item.end || defaultEducation.endDate,
    score: item.score || item.grade || defaultEducation.score,
  }));
};

const normalizeResume = (data) => {
  if (!data) return baseResume;

  const skills = normalizeList(data.skills);
  const certifications = normalizeList(
    data.certifications || data.achievements || data.awards
  );

  return {
    ...baseResume,
    ...data,
    role: data.role || data.title || baseResume.role,
    phone: data.phone || data.contact?.phone || baseResume.phone,
    email: data.email || data.contact?.email || baseResume.email,
    github: data.github || data.contact?.github || baseResume.github,
    linkedin: data.linkedin || data.contact?.linkedin || baseResume.linkedin,
    leetcode: data.leetcode || data.contact?.leetcode || baseResume.leetcode,
    portfolio:
      data.portfolio || data.website || data.contact?.portfolio || baseResume.portfolio,
    location: data.location || data.contact?.location || baseResume.location,
    summary: data.summary || data.profile || baseResume.summary,
    experience: normalizeExperience(data.experience),
    projects: normalizeProjects(data.projects || data.portfolioProjects),
    skills: skills.length ? skills : baseResume.skills,
    education: normalizeEducation(data.education),
    certifications: certifications.length
      ? certifications
      : baseResume.certifications,
    sectionOrder: normalizeSectionOrder(data.sectionOrder),
    template: data.template || baseResume.template,
  };
};

export const useResume = (id) => {
  const [resume, setResume] = useState(baseResume);
  const [analytics, setAnalytics] = useState(baseAnalytics);
  const [lastAnalyzed, setLastAnalyzed] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getResume();

        if (data?.resume) {
          setResume(normalizeResume(data.resume));
        }
      } catch (err) {
        console.log("Load resume failed", err);
      }
    };

    load();
  }, []);

  useEffect(() => {
    if (!resume) return;

    const timer = setTimeout(() => {
      saveResume(resume);
    }, 1000);

    return () => clearTimeout(timer);
  }, [resume]);

  useEffect(() => {
    if (!resume) return;

    const current = JSON.stringify(resume);

    if (current === lastAnalyzed) return;

    const timer = setTimeout(async () => {
      try {
        const data = await analyzeResume(resume);

        if (data?.analysis) {
          setAnalytics((prev) => ({
            ...prev,
            ...data.analysis,
          }));
          setLastAnalyzed(current);
        }
      } catch (err) {
        console.log("ATS error", err);
      }
    }, 900);

    return () => clearTimeout(timer);
  }, [resume, lastAnalyzed]);

  useEffect(() => {
    if (!id) return;

    const fetchInterviewData = async () => {
      try {
        const res = await api.get(`/api/interview/report/${id}`);
        const report = res?.data?.interviewReport;

        if (!report) return;

        setResume((prev) =>
          normalizeResume({
            ...prev,
            role: report.selfDescription || prev.role,
          })
        );

        if (report.skillGaps?.length) {
          setAnalytics((prev) => ({
            ...prev,
            keywords: report.skillGaps.slice(0, 4).map((skill) => skill.skill),
          }));
        }
      } catch (err) {
        console.log("Interview fetch failed", err);
      }
    };

    fetchInterviewData();
  }, [id]);

  const handleAIImprove = async () => {
    try {
      const data = await improveResume(resume);

      if (data?.resume) {
        setResume(normalizeResume(data.resume));
      }
    } catch (err) {
      console.log("AI improve failed", err);
    }
  };

  return {
    resume,
    setResume,
    analytics,
    handleAIImprove,
  };
};
