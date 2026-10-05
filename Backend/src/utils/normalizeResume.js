const DEFAULT_EXPERIENCE = {
  title: "",
  company: "",
  location: "",
  startDate: "",
  endDate: "",
  points: []
};

const DEFAULT_PROJECT = {
  name: "",
  role: "",
  stack: "",
  liveUrl: "",
  githubUrl: "",
  points: []
};

const DEFAULT_EDUCATION = {
  school: "",
  degree: "",
  location: "",
  startDate: "",
  endDate: "",
  score: ""
};

function normalizeString(value = "") {
  return String(value || "").trim();
}

function normalizeArray(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => normalizeString(item))
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/[,\n|]/)
      .map((item) => normalizeString(item))
      .filter(Boolean);
  }

  return [];
}

function normalizeExperience(experience = []) {
  if (!Array.isArray(experience)) return [];

  return experience.map((item) => ({
    ...DEFAULT_EXPERIENCE,

    title: normalizeString(item.title || item.role),

    company: normalizeString(item.company),

    location: normalizeString(item.location),

    startDate: normalizeString(
      item.startDate || item.start
    ),

    endDate: normalizeString(
      item.endDate || item.end
    ),

    points: normalizeArray(
      item.points || item.bullets
    )
  }));
}

function normalizeProjects(projects = []) {
  if (!Array.isArray(projects)) return [];

  return projects.map((item) => ({
    ...DEFAULT_PROJECT,

    name: normalizeString(
      item.name || item.title
    ),

    role: normalizeString(item.role),

    stack: normalizeString(
      item.stack || item.techStack
    ),

    liveUrl: normalizeString(
      item.liveUrl || item.demo
    ),

    githubUrl: normalizeString(
      item.githubUrl || item.github
    ),

    points: normalizeArray(
      item.points || item.bullets
    )
  }));
}

function normalizeEducation(education = []) {
  if (!Array.isArray(education)) return [];

  return education.map((item) => ({
    ...DEFAULT_EDUCATION,

    school: normalizeString(
      item.school ||
      item.institute ||
      item.university
    ),

    degree: normalizeString(
      item.degree || item.course
    ),

    location: normalizeString(item.location),

    startDate: normalizeString(
      item.startDate || item.start
    ),

    endDate: normalizeString(
      item.endDate || item.end
    ),

    score: normalizeString(
      item.score || item.grade
    )
  }));
}

function normalizeResume(data = {}) {
  return {
    name: normalizeString(data.name),

    role: normalizeString(
      data.role || data.title
    ),

    email: normalizeString(data.email),

    phone: normalizeString(data.phone),

    linkedin: normalizeString(data.linkedin),

    github: normalizeString(data.github),

    leetcode: normalizeString(data.leetcode),

    portfolio: normalizeString(data.portfolio),

    location: normalizeString(data.location),

    summary: normalizeString(data.summary),

    template: normalizeString(
      data.template || "modern"
    ),

    skills: normalizeArray(data.skills),

    certifications: normalizeArray(
      data.certifications
    ),

    experience: normalizeExperience(
      data.experience
    ),

    projects: normalizeProjects(
      data.projects
    ),

    education: normalizeEducation(
      data.education
    ),

    sectionOrder: Array.isArray(data.sectionOrder)
      ? data.sectionOrder
      : [
          "summary",
          "experience",
          "projects",
          "skills",
          "education",
          "certifications"
        ]
  };
}

module.exports = {
  normalizeResume
};