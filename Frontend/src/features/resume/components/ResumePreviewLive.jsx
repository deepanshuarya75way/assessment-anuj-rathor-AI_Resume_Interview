const fallbackResume = {
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
    "Full Stack Developer with experience building scalable web applications using React.js, Node.js, Express.js, and MongoDB.",
  experience: [],
  projects: [],
  skills: [],
  education: [],
  certifications: [],
  sectionOrder: [
    "summary",
    "experience",
    "projects",
    "skills",
    "education",
    "certifications",
  ],
  template: "tech",
};

const toArray = (value) => {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/[,\n|]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const trimLink = (value) =>
  `${value || ""}`
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/$/, "");

function PreviewSection({ title, children }) {
  return (
    <section className="resume-preview-sheet__section">
      <h3>{title}</h3>
      {children}
    </section>
  );
}

function ContactItem({ label, value, href }) {
  if (!value) return null;

  return (
    <a className="resume-preview-sheet__contact-item" href={href || value}>
      <span>{label}</span>
      <strong>{trimLink(value)}</strong>
    </a>
  );
}

export default function ResumePreviewLive({ resume }) {
  const source = resume || fallbackResume;

  const safeResume = {
    ...fallbackResume,
    ...source,
    experience: source.experience?.length ? source.experience : fallbackResume.experience,
    projects: source.projects?.length ? source.projects : fallbackResume.projects,
    education: source.education?.length ? source.education : fallbackResume.education,
    skills: toArray(source.skills).length ? toArray(source.skills) : fallbackResume.skills,
    certifications: toArray(source.certifications).length
      ? toArray(source.certifications)
      : fallbackResume.certifications,
    sectionOrder: source.sectionOrder?.length
      ? source.sectionOrder
      : fallbackResume.sectionOrder,
  };

  const contactItems = [
    { key: "github", label: "GH", value: safeResume.github },
    { key: "linkedin", label: "IN", value: safeResume.linkedin },
    { key: "email", label: "@", value: safeResume.email, href: `mailto:${safeResume.email}` },
    { key: "phone", label: "PH", value: safeResume.phone, href: `tel:${safeResume.phone}` },
    { key: "leetcode", label: "LC", value: safeResume.leetcode },
    { key: "portfolio", label: "WB", value: safeResume.portfolio },
  ];

  const sectionMap = {
    summary: (
      <PreviewSection title="Summary" key="summary">
        <p className="resume-preview-sheet__summary">{safeResume.summary}</p>
      </PreviewSection>
    ),
    experience: (
      <PreviewSection title="Work Experience" key="experience">
        <div className="resume-preview-sheet__stack">
          {safeResume.experience.map((item, index) => (
            <article
              className="resume-preview-sheet__entry"
              key={`${item.company}-${item.title}-${index}`}
            >
              <div className="resume-preview-sheet__entry-head">
                <div>
                  <strong>{item.title}</strong>
                  <span>
                    {item.company}
                    {item.location ? ` | ${item.location}` : ""}
                  </span>
                </div>
                <time>
                  {item.startDate}
                  {item.endDate ? ` - ${item.endDate}` : ""}
                </time>
              </div>

              <ul>
                {(item.points || []).map((point, pointIndex) => (
                  <li key={`${point}-${pointIndex}`}>{point}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </PreviewSection>
    ),
    projects: (
      <PreviewSection title="Projects" key="projects">
        <div className="resume-preview-sheet__stack">
          {safeResume.projects.map((item, index) => (
            <article
              className="resume-preview-sheet__entry"
              key={`${item.name}-${item.role}-${index}`}
            >
              <div className="resume-preview-sheet__entry-head">
                <div>
                  <strong>{item.name}</strong>
                  <span>{item.role}</span>
                </div>
                <div className="resume-preview-sheet__project-links">
                  {item.liveUrl && <a href={item.liveUrl}>Live Demo</a>}
                  {item.githubUrl && <a href={item.githubUrl}>GitHub</a>}
                </div>
              </div>

              {item.stack && <p className="resume-preview-sheet__stack-line">{item.stack}</p>}

              <ul>
                {(item.points || []).map((point, pointIndex) => (
                  <li key={`${point}-${pointIndex}`}>{point}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </PreviewSection>
    ),
    skills: (
      <PreviewSection title="Skills" key="skills">
        <ul className="resume-preview-sheet__skills">
          {safeResume.skills.map((skill, index) => (
            <li key={`${skill}-${index}`}>{skill}</li>
          ))}
        </ul>
      </PreviewSection>
    ),
    education: (
      <PreviewSection title="Education" key="education">
        <div className="resume-preview-sheet__stack">
          {safeResume.education.map((item, index) => (
            <article
              className="resume-preview-sheet__entry resume-preview-sheet__entry--education"
              key={`${item.school}-${index}`}
            >
              <div className="resume-preview-sheet__entry-head">
                <div>
                  <strong>{item.school}</strong>
                  <span>{item.degree}</span>
                </div>
                <time>
                  {item.startDate}
                  {item.endDate ? ` - ${item.endDate}` : ""}
                </time>
              </div>

              <p className="resume-preview-sheet__education-meta">
                {item.location}
                {item.score ? ` | ${item.score}` : ""}
              </p>
            </article>
          ))}
        </div>
      </PreviewSection>
    ),
    certifications: (
      <PreviewSection title="Certifications & Achievements" key="certifications">
        <ul className="resume-preview-sheet__awards">
          {safeResume.certifications.map((item, index) => (
            <li key={`${item}-${index}`}>{item}</li>
          ))}
        </ul>
      </PreviewSection>
    ),
  };

  return (
    <article
      className={`resume-paper resume-preview-sheet resume-preview-sheet--${safeResume.template}`}
    >
      <header className="resume-preview-sheet__header">
        <div>
          <h1>{safeResume.name}</h1>
          <p>{safeResume.role}</p>
        </div>

        <div className="resume-preview-sheet__contact-grid">
          {contactItems.map(({ key, ...item }) => (
            <ContactItem key={key} {...item} />
          ))}
        </div>
      </header>

      {(safeResume.sectionOrder || fallbackResume.sectionOrder).map(
        (sectionKey) => sectionMap[sectionKey]
      )}
    </article>
  );
}
