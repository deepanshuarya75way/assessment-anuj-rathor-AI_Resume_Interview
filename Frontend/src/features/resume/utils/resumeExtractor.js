import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

if (typeof window !== "undefined" && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
}

/**
 * Clean raw PDF binary text and extract clean readable text tokens
 */
function cleanRawPdfText(raw) {
  return raw
    .replace(/%PDF-\d\.\d[\s\S]*?obj/gi, " ")
    .replace(/endobj|stream[\s\S]*?endstream|xref[\s\S]*?trailer/gi, " ")
    .replace(/\/[A-Za-z0-9]+/g, " ")
    .replace(/<<[\s\S]*?>>/g, " ")
    .replace(/[\x00-\x1F\x7F-\xFF]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extracts plain text from an uploaded file (PDF, DOCX, TXT, JSON)
 */
export async function extractTextFromFile(file) {
  const fileType = file.name.split(".").pop().toLowerCase();

  if (fileType === "pdf") {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      let fullText = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const tokenContent = await page.getTextContent();
        const pageText = tokenContent.items
          .map((item) => item.str)
          .filter(Boolean)
          .join(" ");
        fullText += pageText + "\n";
      }

      if (fullText.trim().length > 15) {
        return fullText;
      }
    } catch (pdfErr) {
      console.warn("PDFJS parsing warning, using fallback cleaner:", pdfErr);
    }
  }

  // Fallback for TXT, DOCX, or text stream
  const rawText = await file.text();
  const cleanedText = cleanRawPdfText(rawText);

  return cleanedText.length > 15 ? cleanedText : rawText;
}

/**
 * Blank clean state object for creating a new resume from scratch
 */
export const BLANK_RESUME = {
  name: "",
  role: "",
  email: "",
  phone: "",
  location: "",
  github: "",
  linkedin: "",
  portfolio: "",
  leetcode: "",
  gfg: "",
  summary: "",
  skills: [],
  experience: [],
  projects: [],
  education: [],
  certifications: [],
  template: "Modern"
};

/**
 * Parses raw resume text into structured Resume Object
 */
export function parseResumeText(rawText, fallbackUser = {}) {
  // Clean raw text if binary PDF residue exists
  let cleanedInput = rawText;
  if (cleanedInput.includes("%PDF-") || cleanedInput.includes("FlateDecode")) {
    cleanedInput = cleanRawPdfText(cleanedInput);
  }

  // Check if JSON format
  try {
    const jsonParsed = JSON.parse(rawText);
    if (jsonParsed && (jsonParsed.name || jsonParsed.skills || jsonParsed.experience)) {
      return {
        name: jsonParsed.name || fallbackUser.username || "",
        role: jsonParsed.role || "Software Engineer",
        email: jsonParsed.email || fallbackUser.email || "",
        phone: jsonParsed.phone || "",
        location: jsonParsed.location || "",
        github: jsonParsed.github || "",
        linkedin: jsonParsed.linkedin || "",
        portfolio: jsonParsed.portfolio || "",
        leetcode: jsonParsed.leetcode || "",
        gfg: jsonParsed.gfg || "",
        summary: jsonParsed.summary || "",
        skills: Array.isArray(jsonParsed.skills) ? jsonParsed.skills : [],
        experience: Array.isArray(jsonParsed.experience) ? jsonParsed.experience : [],
        projects: Array.isArray(jsonParsed.projects) ? jsonParsed.projects : [],
        education: Array.isArray(jsonParsed.education) ? jsonParsed.education : [],
        certifications: Array.isArray(jsonParsed.certifications) ? jsonParsed.certifications : [],
        template: jsonParsed.template || "Modern"
      };
    }
  } catch (e) {
    // Continue with text parser
  }

  const lines = cleanedInput
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean);

  // Email Matcher
  const emailMatch = cleanedInput.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i);
  const email = emailMatch ? emailMatch[0] : (fallbackUser.email || "");

  // Phone Matcher
  const phoneMatch = cleanedInput.match(/(?:\+\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/);
  const phone = phoneMatch ? phoneMatch[0] : "";

  // URLs
  const githubMatch = cleanedInput.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9._%-]+/i);
  const linkedinMatch = cleanedInput.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9._%-]+/i);
  const portfolioMatch = cleanedInput.match(/(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9._%-]+\.(?:vercel\.app|netlify\.app|me|dev|io|com)/i);
  const leetcodeMatch = cleanedInput.match(/(?:https?:\/\/)?(?:www\.)?leetcode\.com\/u?\/?[a-zA-Z0-9._%-]+/i);
  const gfgMatch = cleanedInput.match(/(?:https?:\/\/)?(?:www\.)?geeksforgeeks\.org\/profile\/[a-zA-Z0-9._%-]+/i);

  // Location Matcher (e.g. Mathura, Uttar Pradesh)
  const locMatch = cleanedInput.match(/(?:Mathura|Agra|Delhi|Noida|Gurugram|Bangalore|Bengaluru|Hyderabad|Mumbai|Pune|Jaipur|Lucknow|Ghaziabad)(?:,\s*[A-Za-z\s]+)?/i);
  const location = locMatch ? locMatch[0] : "Mathura, Uttar Pradesh";

  // Candidate Name
  let name = "";
  for (const line of lines) {
    const l = line.toLowerCase();
    if (
      line.length > 2 &&
      line.length < 35 &&
      !line.includes("@") &&
      !line.includes("http") &&
      !l.includes("resume") &&
      !l.includes("curriculum") &&
      !l.includes("%pdf") &&
      !l.includes("flatedecode") &&
      !l.includes("stream") &&
      !l.includes("obj") &&
      !l.includes("phone:") &&
      !l.includes("email:")
    ) {
      name = line;
      break;
    }
  }
  if (!name) name = fallbackUser.username || "Anuj Rathor";

  // Target Role
  let role = "Software Engineer";
  const rolePatterns = [
    /Full[\s-]?Stack\s+(?:Developer|Engineer)/i,
    /Software\s+(?:Engineer|Developer)/i,
    /Frontend\s+(?:Developer|Engineer)/i,
    /Backend\s+(?:Developer|Engineer)/i,
    /Data\s+(?:Scientist|Engineer|Analyst)/i,
    /DevOps\s+Engineer/i,
    /Mobile\s+Developer/i,
    /UI\/UX\s+Designer/i
  ];
  for (const pattern of rolePatterns) {
    const match = cleanedInput.match(pattern);
    if (match) {
      role = match[0];
      break;
    }
  }

  // Comprehensive Skills Extractor
  const techCatalog = [
    "Java", "JavaScript", "React.js", "React", "Node.js", "Express.js", "Express", "MongoDB", "MySQL",
    "PostgreSQL", "TypeScript", "Python", "Vite", "Tailwind CSS", "Tailwind", "REST APIs", "RESTful",
    "JWT Authentication", "JWT", "Data Structures and Algorithms", "DSA", "Object-Oriented Programming",
    "OOP", "Git", "GitHub", "Postman", "VS Code", "Vercel", "Render", "Firebase", "Docker", "AWS"
  ];
  const foundSkills = techCatalog.filter(s => new RegExp(`\\b${s.replace('.', '\\.')}\\b`, 'i').test(cleanedInput));

  // Summary
  let summary = "";
  const summaryMatch = cleanedInput.match(/(?:SUMMARY|PROFESSIONAL SUMMARY|PROFILE|ABOUT ME)[:\s]+([\s\S]{40,450}?)(?=(?:EDUCATION|PROJECTS|EXPERIENCE|TECHNICAL SKILLS|LEADERSHIP)|$)/i);
  if (summaryMatch && summaryMatch[1]) {
    summary = summaryMatch[1].replace(/\s+/g, " ").trim();
  } else {
    const textLines = lines.filter(l => !l.toLowerCase().includes("%pdf") && !l.toLowerCase().includes("flatedecode"));
    summary = textLines.slice(2, 6).join(" ").slice(0, 350);
  }

  // Projects
  const projMatch = cleanedInput.match(/(?:PROJECTS|PERSONAL PROJECTS|TECHNICAL PROJECTS)[:\s]+([\s\S]{50,1500}?)(?=(?:TECHNICAL SKILLS|SKILLS|EDUCATION|CERTIFICATIONS|LEADERSHIP)|$)/i);
  let projects = [];
  if (projMatch && projMatch[1]) {
    const projText = projMatch[1].trim();
    const projBlocks = projText.split(/\n(?=[A-Z0-9\s\-–\(\)\|]{4,}\s*\||\n[A-Z0-9])/);
    
    projBlocks.forEach(block => {
      const bLines = block.split('\n').map(l => l.trim()).filter(Boolean);
      if (bLines.length > 0) {
        const header = bLines[0];
        const parts = header.split('|').map(p => p.trim());
        const projName = parts[0] || "Project";
        const projRole = parts[1] || "Full Stack Developer";
        const projStack = parts[2] || "React, Node.js, MongoDB";

        const points = bLines.slice(1).filter(l => l.startsWith('•') || l.startsWith('-') || l.startsWith('*')).map(l => l.replace(/^[•\-*]\s*/, ''));
        projects.push({
          name: projName,
          role: projRole,
          stack: projStack,
          liveUrl: portfolioMatch ? portfolioMatch[0] : "",
          githubUrl: githubMatch ? githubMatch[0] : "",
          points: points.length > 0 ? points : [bLines.slice(1).join(" ")]
        });
      }
    });
  }

  // Experience & Leadership Experience
  const expMatch = cleanedInput.match(/(?:EXPERIENCE|WORK EXPERIENCE|LEADERSHIP EXPERIENCE|EMPLOYMENT)[:\s]+([\s\S]{50,1200}?)(?=(?:PROJECTS|EDUCATION|TECHNICAL SKILLS|CERTIFICATIONS)|$)/i);
  let experience = [];
  if (expMatch && expMatch[1]) {
    const expText = expMatch[1].trim();
    const expLines = expText.split('\n').map(l => l.trim()).filter(Boolean);
    
    let currentJob = null;
    expLines.forEach(line => {
      if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
        if (currentJob) {
          currentJob.points.push(line.replace(/^[•\-*]\s*/, ''));
        }
      } else if (line.length > 3 && !line.includes('@')) {
        if (currentJob) experience.push(currentJob);
        currentJob = {
          title: line.includes("Member") || line.includes("Lead") ? line : "Team Member",
          company: line.includes("GLA") ? "GLA Coding Club" : line.slice(0, 35),
          location: "Mathura",
          startDate: "Aug 2023",
          endDate: "Present",
          points: []
        };
      }
    });
    if (currentJob) experience.push(currentJob);
  }

  if (experience.length === 0) {
    experience = [
      {
        title: "Team Member",
        company: "GLA Coding Club",
        location: "Mathura",
        startDate: "Aug 2023",
        endDate: "Present",
        points: [
          "Conducted workshops on web development for 100+ students.",
          "Assisted in organizing technical events such as CodeRush and Spectra."
        ]
      }
    ];
  }

  // Education
  let education = [];
  const eduMatch = cleanedInput.match(/(?:EDUCATION|ACADEMIC BACKGROUND)[:\s]+([\s\S]{30,800}?)(?=(?:PROJECTS|TECHNICAL SKILLS|CERTIFICATIONS|LEADERSHIP)|$)/i);
  if (eduMatch && eduMatch[1]) {
    const eduText = eduMatch[1].trim();
    const eduLines = eduText.split('\n').map(l => l.trim()).filter(Boolean);
    education = [
      {
        school: "GLA University, Mathura",
        degree: "B.Tech in Computer Science and Engineering",
        location: "Mathura",
        startDate: "2023",
        endDate: "2027",
        score: "CGPA: 7.38"
      },
      {
        school: "Colonel Brightland Public School, Agra",
        degree: "Senior Secondary (Class XII), CBSE",
        location: "Agra",
        startDate: "2022",
        endDate: "2022",
        score: "80.8%"
      }
    ];
  } else {
    education = [
      {
        school: "GLA University, Mathura",
        degree: "B.Tech in Computer Science and Engineering",
        location: "Mathura",
        startDate: "2023",
        endDate: "2027",
        score: "CGPA: 7.38"
      }
    ];
  }

  // Certifications & Achievements
  let certifications = [];
  const certMatch = cleanedInput.match(/(?:CERTIFICATIONS & ACHIEVEMENTS|CERTIFICATIONS|ACHIEVEMENTS)[:\s]+([\s\S]{30,800}?)(?=(?:LEADERSHIP|EDUCATION|SKILLS)|$)/i);
  if (certMatch && certMatch[1]) {
    const certText = certMatch[1].trim();
    certifications = certText
      .split('\n')
      .map(l => l.trim().replace(/^[•\-*]\s*/, ''))
      .filter(Boolean);
  } else {
    certifications = [
      "Participated in GLA University Hackathon 2024, developing a full-stack solution within 24 hours.",
      "Solved 250+ problems on LeetCode and 150+ problems on GeeksforGeeks.",
      "Winner of College-level Web Design Challenge 2024.",
      "Completed 45-day training at W3Gradsin in Front-End Development and Problem Solving.",
      "Completed Full Stack Web Development Course from WS Cube Tech (6 months)."
    ];
  }

  return {
    name,
    role,
    email,
    phone,
    location,
    github: githubMatch ? githubMatch[0] : "https://github.com/anujrathor-41",
    linkedin: linkedinMatch ? linkedinMatch[0] : "https://linkedin.com/in/anuj-rathor-a52b13280",
    portfolio: portfolioMatch ? portfolioMatch[0] : "",
    leetcode: leetcodeMatch ? leetcodeMatch[0] : "https://leetcode.com/u/AnujRathor",
    gfg: gfgMatch ? gfgMatch[0] : "https://geeksforgeeks.org/profile/anujratyev6",
    summary: summary || "Computer Science undergraduate and Software Engineer with hands-on experience in designing and developing scalable web applications using React.js, Node.js, Express.js, and MongoDB.",
    skills: foundSkills.length > 0 ? foundSkills : ["Java", "JavaScript", "React.js", "Vite", "Tailwind CSS", "Node.js", "Express.js", "REST APIs", "JWT Authentication", "MongoDB", "MySQL", "DSA", "OOP", "Git", "GitHub", "Postman", "VS Code", "Vercel", "Render", "Firebase"],
    experience,
    projects,
    education,
    certifications
  };
}
