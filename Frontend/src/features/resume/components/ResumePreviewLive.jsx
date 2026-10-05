import { useRef, useEffect, useState } from "react";

const toArray = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string") {
    return value.split(/[,\n|]/).map((item) => item.trim()).filter(Boolean);
  }
  return [];
};

const cleanUrl = (url) => {
  return `${url || ""}`
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/$/, "");
};

const formatExternalUrl = (url) => {
  if (!url) return "#";
  const str = `${url}`.trim();
  if (!str) return "#";
  if (str.startsWith("http://") || str.startsWith("https://") || str.startsWith("mailto:") || str.startsWith("tel:")) {
    return str;
  }
  return `https://${str}`;
};

export default function ResumePreviewLive({ resume, zoom = 1 }) {
  const paperRef = useRef(null);
  const [pageCount, setPageCount] = useState(1);

  const safe = {
    name: resume?.name || "Your Full Name",
    role: resume?.role || "Professional Title",
    email: resume?.email || "",
    phone: resume?.phone || "",
    location: resume?.location || "",
    github: resume?.github || "",
    linkedin: resume?.linkedin || "",
    leetcode: resume?.leetcode || "",
    portfolio: resume?.portfolio || "",
    summary: resume?.summary || "",
    experience: resume?.experience || [],
    projects: resume?.projects || [],
    skills: toArray(resume?.skills),
    education: resume?.education || [],
    certifications: toArray(resume?.certifications),
    sectionOrder: resume?.sectionOrder || [
      "summary",
      "experience",
      "projects",
      "skills",
      "education",
      "certifications"
    ],
    template: resume?.template || "modern"
  };

  // Check height to calculate pages
  useEffect(() => {
    if (paperRef.current) {
      const scrollH = paperRef.current.scrollHeight;
      const clientH = paperRef.current.clientHeight || 1122; // ~297mm in pixels at 96dpi
      const pages = Math.max(1, Math.ceil(scrollH / clientH));
      setPageCount(pages);
    }
  }, [resume]);

  const contacts = [
    safe.email && { key: "email", text: safe.email, href: `mailto:${safe.email}` },
    safe.phone && { key: "phone", text: safe.phone, href: `tel:${safe.phone}` },
    safe.location && { key: "location", text: safe.location },
    safe.github && { key: "github", text: cleanUrl(safe.github), href: formatExternalUrl(safe.github) },
    safe.linkedin && { key: "linkedin", text: cleanUrl(safe.linkedin), href: formatExternalUrl(safe.linkedin) },
    safe.leetcode && { key: "leetcode", text: cleanUrl(safe.leetcode), href: formatExternalUrl(safe.leetcode) },
    safe.portfolio && { key: "portfolio", text: cleanUrl(safe.portfolio), href: formatExternalUrl(safe.portfolio) },
  ].filter(Boolean);

  const renderSection = (key) => {
    switch (key) {
      case "summary":
        if (!safe.summary?.trim()) return null;
        return (
          <section className="a4-section a4-section--summary" key="summary">
            <h3 className="a4-section__title">Professional Summary</h3>
            <p className="a4-summary-text">{safe.summary}</p>
          </section>
        );

      case "experience":
        if (!safe.experience?.length) return null;
        return (
          <section className="a4-section a4-section--experience" key="experience">
            <h3 className="a4-section__title">Work Experience</h3>
            <div className="a4-entry-list">
              {safe.experience.map((item, idx) => (
                <article className="a4-entry" key={idx}>
                  <div className="a4-entry__header">
                    <div>
                      <h4 className="a4-entry__role">{item.title || "Job Title"}</h4>
                      <span className="a4-entry__org">
                        {item.company}
                        {item.location ? ` • ${item.location}` : ""}
                      </span>
                    </div>
                    {(item.startDate || item.endDate) && (
                      <span className="a4-entry__dates">
                        {item.startDate} {item.endDate ? `— ${item.endDate}` : ""}
                      </span>
                    )}
                  </div>
                  {item.points?.length > 0 && (
                    <ul className="a4-bullet-list">
                      {item.points.map((pt, pIdx) => (
                        <li key={pIdx}>{pt}</li>
                      ))}
                    </ul>
                  )}
                </article>
              ))}
            </div>
          </section>
        );

      case "projects":
        if (!safe.projects?.length) return null;
        return (
          <section className="a4-section a4-section--projects" key="projects">
            <h3 className="a4-section__title">Technical Projects</h3>
            <div className="a4-entry-list">
              {safe.projects.map((item, idx) => (
                <article className="a4-entry" key={idx}>
                  <div className="a4-entry__header">
                    <div>
                      <h4 className="a4-entry__role">
                        {item.name}
                        {item.role ? ` — ${item.role}` : ""}
                      </h4>
                      {item.stack && (
                        <span className="a4-entry__tech-stack">Tech: {item.stack}</span>
                      )}
                    </div>
                    <div className="a4-entry__links">
                      {item.liveUrl && (
                        <a href={formatExternalUrl(item.liveUrl)} target="_blank" rel="noopener noreferrer">
                          Live Demo ↗
                        </a>
                      )}
                      {item.githubUrl && (
                        <a href={formatExternalUrl(item.githubUrl)} target="_blank" rel="noopener noreferrer">
                          GitHub ↗
                        </a>
                      )}
                    </div>
                  </div>
                  {item.points?.length > 0 && (
                    <ul className="a4-bullet-list">
                      {item.points.map((pt, pIdx) => (
                        <li key={pIdx}>{pt}</li>
                      ))}
                    </ul>
                  )}
                </article>
              ))}
            </div>
          </section>
        );

      case "skills":
        if (!safe.skills?.length) return null;
        return (
          <section className="a4-section a4-section--skills" key="skills">
            <h3 className="a4-section__title">Skills & Technologies</h3>
            <div className="a4-skills-tags">
              {safe.skills.map((skill, idx) => (
                <span className="a4-skill-pill" key={idx}>
                  {skill}
                </span>
              ))}
            </div>
          </section>
        );

      case "education":
        if (!safe.education?.length) return null;
        return (
          <section className="a4-section a4-section--education" key="education">
            <h3 className="a4-section__title">Education</h3>
            <div className="a4-entry-list">
              {safe.education.map((item, idx) => (
                <article className="a4-entry" key={idx}>
                  <div className="a4-entry__header">
                    <div>
                      <h4 className="a4-entry__role">{item.degree || "Degree"}</h4>
                      <span className="a4-entry__org">
                        {item.school}
                        {item.location ? ` • ${item.location}` : ""}
                      </span>
                    </div>
                    <div className="a4-entry__meta-right">
                      {(item.startDate || item.endDate) && (
                        <span className="a4-entry__dates">
                          {item.startDate} {item.endDate ? `— ${item.endDate}` : ""}
                        </span>
                      )}
                      {item.score && (
                        <span className="a4-entry__score">{item.score}</span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        );

      case "certifications":
        if (!safe.certifications?.length) return null;
        return (
          <section className="a4-section a4-section--certifications" key="certifications">
            <h3 className="a4-section__title">Certifications & Achievements</h3>
            <ul className="a4-bullet-list">
              {safe.certifications.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div 
      className="a4-preview-sizer"
      style={{
        width: `${Math.round(794 * zoom)}px`,
        minHeight: `${Math.round(1122 * pageCount * zoom)}px`,
        position: "relative",
        margin: "0 auto"
      }}
    >
      <div 
        className="a4-preview-wrapper" 
        style={{ 
          transform: `scale(${zoom})`,
          transformOrigin: "top left",
          position: "absolute",
          top: 0,
          left: 0
        }}
      >
        <article
          ref={paperRef}
          className={`a4-document a4-template--${safe.template}`}
          id="resume-a4-document"
        >
          {/* Top Header */}
          <header className="a4-header">
            <div className="a4-header__identity">
              <h1 className="a4-header__name">{safe.name}</h1>
              {safe.role && <p className="a4-header__title">{safe.role}</p>}
            </div>

            {/* Sleek inline contact list */}
            {contacts.length > 0 && (
              <div className="a4-header__contacts">
                {contacts.map((c, i) => (
                  <span className="a4-contact-item" key={c.key}>
                    {i > 0 && <span className="a4-contact-bullet">•</span>}
                    {c.href ? (
                      <a href={c.href} target="_blank" rel="noreferrer">
                        {c.text}
                      </a>
                    ) : (
                      <span>{c.text}</span>
                    )}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* Dynamic Reordered Sections */}
          <div className="a4-body">
            {safe.sectionOrder.map((sectionKey) => renderSection(sectionKey))}
          </div>
        </article>
      </div>
    </div>
  );
}