import { useEffect, useState, useContext } from "react";
import { ResumeContext } from "../context/resume.context";
import api from "../../../utils/api";
import {
  analyzeResume,
  getResume,
  improveResume,
  saveResume,
  getResumeErrorMessage,
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
  githubUrl: "",
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
  name: "Your Full Name",
  role: "Full Stack Developer",
  phone: "+91 7465982627",
  email: "candidate@example.com",
  github: "",
  linkedin: "",
  leetcode: "",
  portfolio: "",
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
      githubUrl: "",
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

/**
 * Real ATS scoring calculation based on actual resume completeness & signal depth
 */
export function calculateLiveATS(resume, jobDescription = "") {
  if (!resume) {
    return {
      score: 0,
      breakdown: { contact: 0, summary: 0, experience: 0, projects: 0, skills: 0, education: 0 },
      formattingIssues: ["No resume data provided."],
      suggestions: ["Start by filling in your identity and contact information."],
      keywords: [],
      missingKeywords: [],
      percentile: "Unranked"
    };
  }

  let contactScore = 0;
  if (resume.name?.trim()) contactScore += 4;
  if (resume.email?.includes("@")) contactScore += 4;
  if (resume.phone?.trim()) contactScore += 4;
  if (resume.location?.trim()) contactScore += 4;
  if (resume.github?.trim() || resume.linkedin?.trim() || resume.portfolio?.trim()) contactScore += 4;

  let summaryScore = 0;
  const summaryLen = (resume.summary || "").trim().length;
  if (summaryLen > 0) summaryScore += 5;
  if (summaryLen >= 150 && summaryLen <= 650) summaryScore += 10;
  else if (summaryLen > 50) summaryScore += 5;

  let experienceScore = 0;
  const exps = resume.experience || [];
  if (exps.length > 0) {
    experienceScore += 10;
    const hasDetails = exps.some(e => e.title && e.company);
    if (hasDetails) experienceScore += 5;
    
    // Check for metrics/numbers in bullets
    const allBullets = exps.flatMap(e => e.points || []);
    const metricRegex = /(\d+%|\d+\+|\d+k|\b\d+\b|reduced|increased|optimized|scaled|engineered|architected)/i;
    const hasMetrics = allBullets.some(b => metricRegex.test(b));
    if (hasMetrics) experienceScore += 5;
    if (allBullets.length >= 3) experienceScore += 5;
  }

  let projectScore = 0;
  const projs = resume.projects || [];
  if (projs.length > 0) {
    projectScore += 10;
    const hasStack = projs.some(p => p.stack?.trim());
    if (hasStack) projectScore += 5;
    const projBullets = projs.flatMap(p => p.points || []);
    if (projBullets.length >= 2) projectScore += 5;
  }

  let skillsScore = 0;
  const skillsCount = (resume.skills || []).length;
  if (skillsCount >= 4) skillsScore += 8;
  if (skillsCount >= 8) skillsScore += 7;

  let educationScore = 0;
  if ((resume.education || []).some(e => e.school || e.degree)) educationScore += 5;

  const totalScore = Math.min(100, Math.round(contactScore + summaryScore + experienceScore + projectScore + skillsScore + educationScore));

  const formattingIssues = [];
  const suggestions = [];

  if (!resume.email || !resume.phone) {
    formattingIssues.push("Missing critical contact details (email or phone).");
  }
  if (summaryLen < 150) {
    formattingIssues.push("Professional summary is too brief for ATS parsing (aim for 300-500 characters).");
  }
  if (exps.length === 0) {
    suggestions.push("Add at least one professional work experience or internship.");
  } else {
    const allBullets = exps.flatMap(e => e.points || []);
    const metricCount = allBullets.filter(b => /(\d+%|\d+\+|\d+k)/i.test(b)).length;
    if (metricCount === 0) {
      suggestions.push("Add quantifiable metrics (e.g., '% latency reduction', 'number of users served') to your experience bullets.");
    }
  }

  if (projs.length === 0) {
    suggestions.push("Feature 2-3 technical projects demonstrating your core stack.");
  }
  if (skillsCount < 6) {
    suggestions.push("Expand your skills list with databases, cloud tools, and modern frameworks.");
  }

  // Job description matching if provided
  let matchedKeywords = [];
  let missingKeywords = [];
  if (jobDescription && jobDescription.trim()) {
    const jdLower = jobDescription.toLowerCase();
    const commonKeywords = [
      "react", "node", "typescript", "javascript", "python", "mongodb", "postgresql",
      "redis", "docker", "aws", "ci/cd", "microservices", "system design", "rest api",
      "graphql", "kubernetes", "sql", "git", "express", "next.js", "tailwind"
    ];
    const resumeText = JSON.stringify(resume).toLowerCase();

    commonKeywords.forEach(kw => {
      if (jdLower.includes(kw)) {
        if (resumeText.includes(kw)) {
          matchedKeywords.push(kw.toUpperCase());
        } else {
          missingKeywords.push(kw.toUpperCase());
        }
      }
    });
  } else {
    matchedKeywords = (resume.skills || []).slice(0, 4);
    missingKeywords = ["Docker", "CI/CD", "System Design", "Cloud Infrastructure"].filter(
      k => !(resume.skills || []).some(s => s.toLowerCase() === k.toLowerCase())
    );
  }

  let percentile = "Top 40%";
  if (totalScore >= 85) percentile = "Top 5%";
  else if (totalScore >= 75) percentile = "Top 15%";
  else if (totalScore >= 60) percentile = "Top 30%";

  return {
    score: totalScore,
    percentile,
    breakdown: {
      contact: Math.round((contactScore / 20) * 100),
      summary: Math.round((summaryScore / 15) * 100),
      experience: Math.round((experienceScore / 25) * 100),
      projects: Math.round((projectScore / 20) * 100),
      skills: Math.round((skillsScore / 15) * 100),
      education: Math.round((educationScore / 5) * 100)
    },
    keywords: matchedKeywords.length ? matchedKeywords : (resume.skills || []).slice(0, 4),
    missingKeywords: missingKeywords.length ? missingKeywords : ["CI/CD", "Docker", "Unit Testing"],
    formattingIssues: formattingIssues.length ? formattingIssues : ["Ensure all bullet points end with periods.", "Keep links clean without https:// prefix."],
    suggestions: suggestions.length ? suggestions : ["Move your strongest technical project to the top.", "Highlight cloud and deployment experience in summary."]
  };
}

export const templateLibrary = [
  {
    key: "modern",
    title: "Modern",
    category: "Tech & Product",
    rating: "4.9",
    atsScore: "98%",
    copy: "Clean single-column layout with subtle brand accent bar and crisp metadata.",
  },
  {
    key: "professional",
    title: "Professional",
    category: "Corporate & Executive",
    rating: "4.8",
    atsScore: "99%",
    copy: "Classic serif typography and traditional horizontal dividers for corporate roles.",
  },
  {
    key: "tech",
    title: "Tech / Developer",
    category: "Software & Engineering",
    rating: "5.0",
    atsScore: "97%",
    copy: "Developer-focused design with monospace tech tags and prominent project links.",
  },
  {
    key: "minimal",
    title: "Minimal",
    category: "Design & Startups",
    rating: "4.8",
    atsScore: "99%",
    copy: "Swiss-inspired minimalist layout with generous whitespace and quiet typography.",
  },
  {
    key: "ats-classic",
    title: "ATS Classic",
    category: "ATS Universal",
    rating: "4.9",
    atsScore: "100%",
    copy: "Strict top-down hierarchy engineered for 100% parseability by legacy ATS.",
  },
];

export const useResume = (id) => {
  const context = useContext(ResumeContext);
  const [interviewData, setInterviewData] = useState(null);

  if (!context) {
    throw new Error("useResume must be used within ResumeProvider");
  }

  const {
    resume,
    updateResumeLocal,
    improveResume,
    analyzeResume: analyzeResumeCtx,
    error,
    loading,
  } = context;

  const activeResume = resume || normalizeResume(baseResume);
  const liveAnalytics = calculateLiveATS(activeResume);

  // Fetch interview data if ID provided
  useEffect(() => {
    if (!id) return;

    const fetchInterviewData = async () => {
      try {
        const res = await api.get(`/api/interview/report/${id}`);
        const report = res?.data?.interviewReport;
        if (!report) return;

        setInterviewData(report);
        if (report.selfDescription) {
          updateResumeLocal({ role: report.selfDescription });
        }
      } catch (err) {
        console.warn("[useResume] Interview data fetch error:", err.message);
      }
    };

    fetchInterviewData();
  }, [id]);

  const handleAIImprove = async () => {
    try {
      const improved = await improveResume(activeResume);
      if (improved) {
        updateResumeLocal(normalizeResume(improved));
      }
    } catch (err) {
      console.error("[useResume] AI improve failed:", err);
      throw err;
    }
  };

  const getErrorMessage = () => {
    return getResumeErrorMessage(error);
  };

  return {
    resume: activeResume,
    setResume: updateResumeLocal,
    analytics: liveAnalytics,
    calculateLiveATS,
    handleAIImprove,
    error,
    errorMessage: error ? getErrorMessage() : null,
    loading,
    interviewData,
    templateLibrary,
    templateFilters: [
      { key: "all", label: "All Templates" },
      { key: "tech", label: "Software & Tech" },
      { key: "executive", label: "Executive" },
      { key: "minimal", label: "Minimalist" }
    ],
    dashboardSidebar: [
      { key: "builder", label: "Resume Builder" },
      { key: "templates", label: "Browse Templates" },
      { key: "ats", label: "ATS Scanner" },
      { key: "cover-letter", label: "Cover Letter Generator" }
    ],
    recentResumes: [
      { key: "1", name: activeResume.name, role: activeResume.role, template: activeResume.template || "tech" }
    ],
    dashboardStats: [
      { key: "ats", label: "ATS Readiness", value: `${liveAnalytics.score}%` },
      { key: "percentile", label: "Market Tier", value: liveAnalytics.percentile },
      { key: "skills", label: "Verified Skills", value: `${activeResume.skills?.length || 0} skills` }
    ],
    dashboardSuggestion: {
      eyebrow: "AI Recommendation",
      title: "Elevate your Resume Impact",
      copy: "Add quantifiable metrics to your recent projects to push your ATS score into the top 5% tier.",
      action: "Optimize in Builder"
    },
    quickStartTemplates: templateLibrary.slice(0, 3)
  };
};
