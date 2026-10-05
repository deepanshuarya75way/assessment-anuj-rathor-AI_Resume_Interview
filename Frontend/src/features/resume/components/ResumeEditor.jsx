import { useState } from "react";
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  Copy, 
  ChevronUp, 
  ChevronDown, 
  ChevronRight,
  ChevronsUpDown,
  ChevronsDownUp,
  RotateCcw, 
  Briefcase, 
  FolderGit2, 
  GraduationCap, 
  Award, 
  Wrench, 
  User, 
  FileText,
  GripVertical
} from "lucide-react";

const emptyExperience = {
  title: "",
  company: "",
  location: "",
  startDate: "",
  endDate: "",
  current: false,
  points: [""],
};

const emptyProject = {
  name: "",
  role: "",
  stack: "",
  liveUrl: "",
  githubUrl: "",
  points: [""],
};

const emptyEducation = {
  school: "",
  degree: "",
  location: "",
  startDate: "",
  endDate: "",
  score: "",
};

const sectionMeta = {
  summary: { label: "Summary", icon: FileText },
  experience: { label: "Experience", icon: Briefcase },
  projects: { label: "Projects", icon: FolderGit2 },
  skills: { label: "Skills", icon: Wrench },
  education: { label: "Education", icon: GraduationCap },
  certifications: { label: "Certifications", icon: Award },
};

export default function ResumeEditor({
  resume,
  setResume,
  onAISummary,
  onAIBullet,
  onAISkills,
  isAILoading = false,
}) {
  const [skillInput, setSkillInput] = useState("");
  const [certInput, setCertInput] = useState("");
  const [draggedKey, setDraggedKey] = useState(null);
  const [collapsedSections, setCollapsedSections] = useState({});

  const safe = {
    name: resume?.name || "",
    role: resume?.role || "",
    email: resume?.email || "",
    phone: resume?.phone || "",
    location: resume?.location || "",
    github: resume?.github || "",
    linkedin: resume?.linkedin || "",
    leetcode: resume?.leetcode || "",
    portfolio: resume?.portfolio || "",
    summary: resume?.summary || "",
    experience: resume?.experience || [emptyExperience],
    projects: resume?.projects || [emptyProject],
    skills: resume?.skills || [],
    education: resume?.education || [emptyEducation],
    certifications: resume?.certifications || [],
    sectionOrder: resume?.sectionOrder || Object.keys(sectionMeta),
  };

  const updateField = (field, value) => {
    setResume((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ── Collapse / Expand Controls ───────────────────────────────
  const toggleSection = (key) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const expandAll = () => {
    setCollapsedSections({});
  };

  const collapseAll = () => {
    setCollapsedSections({
      personal: true,
      summary: true,
      experience: true,
      projects: true,
      skills: true,
      education: true,
      certifications: true,
    });
  };

  const openSection = (key) => {
    setCollapsedSections((prev) => ({ ...prev, [key]: false }));
  };

  // ── Section Ordering ──────────────────────────────────────────
  const moveSection = (index, direction) => {
    const order = [...safe.sectionOrder];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= order.length) return;
    const temp = order[index];
    order[index] = order[targetIdx];
    order[targetIdx] = temp;
    updateField("sectionOrder", order);
  };

  const resetSectionOrder = () => {
    updateField("sectionOrder", Object.keys(sectionMeta));
  };

  // ── Experience Handlers ───────────────────────────────────────
  const updateExp = (index, field, value) => {
    const updated = [...safe.experience];
    updated[index] = { ...updated[index], [field]: value };
    updateField("experience", updated);
  };

  const addExp = () => {
    openSection("experience");
    updateField("experience", [...safe.experience, { ...emptyExperience }]);
  };

  const duplicateExp = (index) => {
    openSection("experience");
    const item = { ...safe.experience[index] };
    const updated = [...safe.experience];
    updated.splice(index + 1, 0, item);
    updateField("experience", updated);
  };

  const removeExp = (index) => {
    const updated = safe.experience.filter((_, i) => i !== index);
    updateField("experience", updated.length ? updated : [{ ...emptyExperience }]);
  };

  const updateExpBullet = (expIndex, bulletIndex, text) => {
    const updated = [...safe.experience];
    const points = [...(updated[expIndex].points || [])];
    points[bulletIndex] = text;
    updated[expIndex].points = points;
    updateField("experience", updated);
  };

  const addExpBullet = (expIndex) => {
    const updated = [...safe.experience];
    const points = [...(updated[expIndex].points || []), ""];
    updated[expIndex].points = points;
    updateField("experience", updated);
  };

  const removeExpBullet = (expIndex, bulletIndex) => {
    const updated = [...safe.experience];
    const points = (updated[expIndex].points || []).filter((_, i) => i !== bulletIndex);
    updated[expIndex].points = points.length ? points : [""];
    updateField("experience", updated);
  };

  // ── Project Handlers ──────────────────────────────────────────
  const updateProj = (index, field, value) => {
    const updated = [...safe.projects];
    updated[index] = { ...updated[index], [field]: value };
    updateField("projects", updated);
  };

  const addProj = () => {
    openSection("projects");
    updateField("projects", [...safe.projects, { ...emptyProject }]);
  };

  const removeProj = (index) => {
    const updated = safe.projects.filter((_, i) => i !== index);
    updateField("projects", updated.length ? updated : [{ ...emptyProject }]);
  };

  const updateProjBullet = (projIndex, bulletIndex, text) => {
    const updated = [...safe.projects];
    const points = [...(updated[projIndex].points || [])];
    points[bulletIndex] = text;
    updated[projIndex].points = points;
    updateField("projects", updated);
  };

  const addProjBullet = (projIndex) => {
    const updated = [...safe.projects];
    const points = [...(updated[projIndex].points || []), ""];
    updated[projIndex].points = points;
    updateField("projects", updated);
  };

  const removeProjBullet = (projIndex, bulletIndex) => {
    const updated = [...safe.projects];
    const points = (updated[projIndex].points || []).filter((_, i) => i !== bulletIndex);
    updated[projIndex].points = points.length ? points : [""];
    updateField("projects", updated);
  };

  // ── Skills Handlers ───────────────────────────────────────────
  const addSkill = (val) => {
    const trimmed = (val || skillInput).trim();
    if (!trimmed) return;
    const current = new Set(safe.skills);
    current.add(trimmed);
    updateField("skills", Array.from(current));
    setSkillInput("");
  };

  const removeSkill = (skillToRemove) => {
    updateField("skills", safe.skills.filter((s) => s !== skillToRemove));
  };

  // ── Education Handlers ────────────────────────────────────────
  const updateEdu = (index, field, value) => {
    const updated = [...safe.education];
    updated[index] = { ...updated[index], [field]: value };
    updateField("education", updated);
  };

  const addEdu = () => {
    openSection("education");
    updateField("education", [...safe.education, { ...emptyEducation }]);
  };

  const removeEdu = (index) => {
    const updated = safe.education.filter((_, i) => i !== index);
    updateField("education", updated.length ? updated : [{ ...emptyEducation }]);
  };

  // ── Certifications Handlers ───────────────────────────────────
  const addCert = () => {
    if (!certInput.trim()) return;
    openSection("certifications");
    updateField("certifications", [...safe.certifications, certInput.trim()]);
    setCertInput("");
  };

  const removeCert = (index) => {
    updateField("certifications", safe.certifications.filter((_, i) => i !== index));
  };

  const summaryCharCount = safe.summary.length;

  return (
    <div className="rf-editor">
      {/* ── Section Order Reordering Card & Master Controls ── */}
      <div className="rf-card rf-card--order">
        <div className="rf-card__header">
          <div>
            <h3 className="rf-card__title">Section Order</h3>
            <p className="rf-card__desc">Drag or move sections to organize your resume layout</p>
          </div>
          <div className="rf-card__header-right">
            <div className="rf-sec-ctrl-group">
              <button
                type="button"
                className="rf-sec-ctrl-btn"
                onClick={expandAll}
                title="Expand all sections"
              >
                <ChevronsUpDown size={12} /> Expand All
              </button>
              <button
                type="button"
                className="rf-sec-ctrl-btn"
                onClick={collapseAll}
                title="Compress all sections"
              >
                <ChevronsDownUp size={12} /> Compress All
              </button>
            </div>
            <button type="button" className="rf-btn-ghost" onClick={resetSectionOrder} title="Reset default order">
              <RotateCcw size={13} /> Reset
            </button>
          </div>
        </div>

        <div className="rf-order-pills">
          {safe.sectionOrder.map((key, idx) => {
            const meta = sectionMeta[key] || { label: key, icon: FileText };
            const Icon = meta.icon;
            return (
              <div
                key={key}
                className="rf-order-pill"
                draggable
                onDragStart={() => setDraggedKey(key)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (draggedKey && draggedKey !== key) {
                    const order = [...safe.sectionOrder];
                    const fromIdx = order.indexOf(draggedKey);
                    const toIdx = order.indexOf(key);
                    order.splice(fromIdx, 1);
                    order.splice(toIdx, 0, draggedKey);
                    updateField("sectionOrder", order);
                    setDraggedKey(null);
                  }
                }}
              >
                <GripVertical size={13} className="rf-order-pill__grip" />
                <Icon size={14} />
                <span>{meta.label}</span>
                <div className="rf-order-pill__arrows">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveSection(idx, -1)}
                    title="Move Up"
                  >
                    <ChevronUp size={12} />
                  </button>
                  <button
                    type="button"
                    disabled={idx === safe.sectionOrder.length - 1}
                    onClick={() => moveSection(idx, 1)}
                    title="Move Down"
                  >
                    <ChevronDown size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Personal Identity ── */}
      <div className={`rf-card ${collapsedSections.personal ? "is-collapsed" : ""}`}>
        <div 
          className="rf-card__header rf-card__header--collapsible"
          onClick={() => toggleSection("personal")}
          role="button"
          tabIndex={0}
        >
          <div className="rf-card__title-row">
            <span className="rf-card__chevron">
              {collapsedSections.personal ? <ChevronRight size={15} /> : <ChevronDown size={15} />}
            </span>
            <User size={16} className="rf-card__icon" />
            <h3 className="rf-card__title">Personal Identity & Contact</h3>
          </div>
          <div className="rf-card__header-right" onClick={(e) => e.stopPropagation()}>
            {collapsedSections.personal && (
              <span className="rf-card__summary-pill" title={safe.name ? `${safe.name} • ${safe.role || ""}` : "Unfilled"}>
                {safe.name ? `${safe.name}${safe.role ? ` • ${safe.role}` : ""}` : "Incomplete"}
              </span>
            )}
            <span className="rf-card__badge">Essential</span>
          </div>
        </div>

        {!collapsedSections.personal && (
          <div className="rf-grid-2">
            <div className="rf-field">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={safe.name}
                onChange={(e) => updateField("name", e.target.value)}
              />
            </div>

            <div className="rf-field">
              <label>Professional Title</label>
              <input
                type="text"
                placeholder="Enter your professional title"
                value={safe.role}
                onChange={(e) => updateField("role", e.target.value)}
              />
            </div>

            <div className="rf-field">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="candidate@example.com"
                value={safe.email}
                onChange={(e) => updateField("email", e.target.value)}
              />
            </div>

            <div className="rf-field">
              <label>Phone Number</label>
              <input
                type="tel"
                placeholder="+91 9876543210"
                value={safe.phone}
                onChange={(e) => updateField("phone", e.target.value)}
              />
            </div>

            <div className="rf-field rf-field--full">
              <label>Location</label>
              <input
                type="text"
                placeholder="Enter city, state, country"
                value={safe.location}
                onChange={(e) => updateField("location", e.target.value)}
              />
            </div>

            <div className="rf-field">
              <label>LinkedIn URL</label>
              <input
                type="text"
                placeholder="linkedin.com/in/your-profile"
                value={safe.linkedin}
                onChange={(e) => updateField("linkedin", e.target.value)}
              />
            </div>

            <div className="rf-field">
              <label>GitHub URL</label>
              <input
                type="text"
                placeholder="github.com/your-username"
                value={safe.github}
                onChange={(e) => updateField("github", e.target.value)}
              />
            </div>

            <div className="rf-field">
              <label>Portfolio / Website</label>
              <input
                type="text"
                placeholder="your-portfolio.vercel.app"
                value={safe.portfolio}
                onChange={(e) => updateField("portfolio", e.target.value)}
              />
            </div>

            <div className="rf-field">
              <label>LeetCode / Other</label>
              <input
                type="text"
                placeholder="leetcode.com/u/your-username"
                value={safe.leetcode}
                onChange={(e) => updateField("leetcode", e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Professional Summary ── */}
      <div className={`rf-card ${collapsedSections.summary ? "is-collapsed" : ""}`}>
        <div 
          className="rf-card__header rf-card__header--collapsible"
          onClick={() => toggleSection("summary")}
          role="button"
          tabIndex={0}
        >
          <div className="rf-card__title-row">
            <span className="rf-card__chevron">
              {collapsedSections.summary ? <ChevronRight size={15} /> : <ChevronDown size={15} />}
            </span>
            <FileText size={16} className="rf-card__icon" />
            <h3 className="rf-card__title">Professional Summary</h3>
          </div>
          <div className="rf-card__header-right" onClick={(e) => e.stopPropagation()}>
            <div className="rf-summary-char-counter">
              <span className={summaryCharCount >= 200 && summaryCharCount <= 600 ? "is-optimal" : "is-warning"}>
                {summaryCharCount} chars
              </span>
              <small>(300–600 recommended)</small>
            </div>
          </div>
        </div>

        {!collapsedSections.summary && (
          <>
            <div className="rf-field">
              <textarea
                rows={4}
                placeholder="High-impact summary highlighting your core tech stack, years of experience, and key engineering achievements..."
                value={safe.summary}
                onChange={(e) => updateField("summary", e.target.value)}
              />
            </div>

            <div className="rf-ai-action-bar">
              <button
                type="button"
                className="rf-ai-btn"
                disabled={isAILoading}
                onClick={() => onAISummary && onAISummary("standard")}
              >
                <Sparkles size={13} />
                {isAILoading ? "Optimizing..." : "✨ AI Improve Summary"}
              </button>
              <button
                type="button"
                className="rf-ai-btn rf-ai-btn--secondary"
                disabled={isAILoading}
                onClick={() => onAISummary && onAISummary("ats")}
              >
                Make ATS Friendly
              </button>
              <button
                type="button"
                className="rf-ai-btn rf-ai-btn--secondary"
                disabled={isAILoading}
                onClick={() => onAISummary && onAISummary("concise")}
              >
                Make Concise
              </button>
            </div>
          </>
        )}
      </div>

      {/* ── Work Experience ── */}
      <div className={`rf-card ${collapsedSections.experience ? "is-collapsed" : ""}`}>
        <div 
          className="rf-card__header rf-card__header--collapsible"
          onClick={() => toggleSection("experience")}
          role="button"
          tabIndex={0}
        >
          <div className="rf-card__title-row">
            <span className="rf-card__chevron">
              {collapsedSections.experience ? <ChevronRight size={15} /> : <ChevronDown size={15} />}
            </span>
            <Briefcase size={16} className="rf-card__icon" />
            <h3 className="rf-card__title">Work Experience</h3>
          </div>
          <div className="rf-card__header-right" onClick={(e) => e.stopPropagation()}>
            {collapsedSections.experience && (
              <span className="rf-card__summary-pill">
                {safe.experience.length} {safe.experience.length === 1 ? "role" : "roles"}
                {safe.experience[0]?.company ? ` • ${safe.experience[0].company}` : ""}
              </span>
            )}
            <button 
              type="button" 
              className="rf-btn-primary-sm" 
              onClick={() => addExp()}
            >
              <Plus size={14} /> Add Role
            </button>
          </div>
        </div>

        {!collapsedSections.experience && (
          <div className="rf-entry-blocks">
            {safe.experience.map((item, idx) => (
              <div className="rf-block" key={idx}>
                <div className="rf-block__top">
                  <span className="rf-block__index">#{idx + 1} Role</span>
                  <div className="rf-block__controls">
                    <button type="button" onClick={() => duplicateExp(idx)} title="Duplicate">
                      <Copy size={13} />
                    </button>
                    <button type="button" className="rf-danger" onClick={() => removeExp(idx)} title="Delete">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div className="rf-grid-2">
                  <div className="rf-field">
                    <label>Job Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Senior Software Engineer"
                      value={item.title}
                      onChange={(e) => updateExp(idx, "title", e.target.value)}
                    />
                  </div>
                  <div className="rf-field">
                    <label>Company Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Acme Labs"
                      value={item.company}
                      onChange={(e) => updateExp(idx, "company", e.target.value)}
                    />
                  </div>
                  <div className="rf-field">
                    <label>Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Remote / Bangalore"
                      value={item.location}
                      onChange={(e) => updateExp(idx, "location", e.target.value)}
                    />
                  </div>
                  <div className="rf-field rf-grid-dates">
                    <div>
                      <label>Start Date</label>
                      <input
                        type="text"
                        placeholder="e.g. May 2023"
                        value={item.startDate}
                        onChange={(e) => updateExp(idx, "startDate", e.target.value)}
                      />
                    </div>
                    <div>
                      <label>End Date</label>
                      <input
                        type="text"
                        placeholder={item.current ? "Present" : "e.g. Present"}
                        value={item.endDate}
                        disabled={item.current}
                        onChange={(e) => updateExp(idx, "endDate", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Bullet Points Builder */}
                <div className="rf-bullet-builder">
                  <div className="rf-bullet-builder__head">
                    <label>Key Impact & Responsibilities (Action + Tech + Result)</label>
                    <button type="button" className="rf-bullet-add-btn" onClick={() => addExpBullet(idx)}>
                      <Plus size={12} /> Add Bullet
                    </button>
                  </div>

                  <div className="rf-bullet-list">
                    {(item.points || []).map((pt, pIdx) => (
                      <div className="rf-bullet-row" key={pIdx}>
                        <span className="rf-bullet-dot">•</span>
                        <textarea
                          rows={2}
                          placeholder="Engineered high-concurrency Node.js microservices, reducing API response latency by 35%..."
                          value={pt}
                          onChange={(e) => updateExpBullet(idx, pIdx, e.target.value)}
                        />
                        <div className="rf-bullet-actions">
                          <button
                            type="button"
                            className="rf-bullet-ai-btn"
                            title="✨ Polish with AI (Action + Metric)"
                            onClick={() => onAIBullet && onAIBullet(pt, (improved) => updateExpBullet(idx, pIdx, improved))}
                          >
                            <Sparkles size={12} />
                          </button>
                          <button
                            type="button"
                            className="rf-bullet-del-btn"
                            title="Delete bullet"
                            onClick={() => removeExpBullet(idx, pIdx)}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Technical Projects ── */}
      <div className={`rf-card ${collapsedSections.projects ? "is-collapsed" : ""}`}>
        <div 
          className="rf-card__header rf-card__header--collapsible"
          onClick={() => toggleSection("projects")}
          role="button"
          tabIndex={0}
        >
          <div className="rf-card__title-row">
            <span className="rf-card__chevron">
              {collapsedSections.projects ? <ChevronRight size={15} /> : <ChevronDown size={15} />}
            </span>
            <FolderGit2 size={16} className="rf-card__icon" />
            <h3 className="rf-card__title">Technical Projects</h3>
          </div>
          <div className="rf-card__header-right" onClick={(e) => e.stopPropagation()}>
            {collapsedSections.projects && (
              <span className="rf-card__summary-pill">
                {safe.projects.length} {safe.projects.length === 1 ? "project" : "projects"}
                {safe.projects[0]?.name ? ` • ${safe.projects[0].name}` : ""}
              </span>
            )}
            <button 
              type="button" 
              className="rf-btn-primary-sm" 
              onClick={() => addProj()}
            >
              <Plus size={14} /> Add Project
            </button>
          </div>
        </div>

        {!collapsedSections.projects && (
          <div className="rf-entry-blocks">
            {safe.projects.map((item, idx) => (
              <div className="rf-block" key={idx}>
                <div className="rf-block__top">
                  <span className="rf-block__index">#{idx + 1} Project</span>
                  <button type="button" className="rf-danger" onClick={() => removeProj(idx)} title="Delete">
                    <Trash2 size={13} />
                  </button>
                </div>

                <div className="rf-grid-2">
                  <div className="rf-field">
                    <label>Project Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Distributed Ledger System"
                      value={item.name}
                      onChange={(e) => updateProj(idx, "name", e.target.value)}
                    />
                  </div>
                  <div className="rf-field">
                    <label>Your Role</label>
                    <input
                      type="text"
                      placeholder="e.g. Lead Architect / Full Stack"
                      value={item.role}
                      onChange={(e) => updateProj(idx, "role", e.target.value)}
                    />
                  </div>
                  <div className="rf-field rf-field--full">
                    <label>Technologies Used</label>
                    <input
                      type="text"
                      placeholder="e.g. React.js, Node.js, MongoDB, Redis, Docker"
                      value={item.stack}
                      onChange={(e) => updateProj(idx, "stack", e.target.value)}
                    />
                  </div>
                  <div className="rf-field">
                    <label>Live URL</label>
                    <input
                      type="text"
                      placeholder="https://demo.app"
                      value={item.liveUrl}
                      onChange={(e) => updateProj(idx, "liveUrl", e.target.value)}
                    />
                  </div>
                  <div className="rf-field">
                    <label>GitHub Repository</label>
                    <input
                      type="text"
                      placeholder="https://github.com/user/repo"
                      value={item.githubUrl}
                      onChange={(e) => updateProj(idx, "githubUrl", e.target.value)}
                    />
                  </div>
                </div>

                {/* Project Bullets */}
                <div className="rf-bullet-builder">
                  <div className="rf-bullet-builder__head">
                    <label>Project Accomplishments & Architecture</label>
                    <button type="button" className="rf-bullet-add-btn" onClick={() => addProjBullet(idx)}>
                      <Plus size={12} /> Add Bullet
                    </button>
                  </div>
                  <div className="rf-bullet-list">
                    {(item.points || []).map((pt, pIdx) => (
                      <div className="rf-bullet-row" key={pIdx}>
                        <span className="rf-bullet-dot">•</span>
                        <textarea
                          rows={2}
                          placeholder="Architected transactional double-entry accounting engine handling 50k requests/sec..."
                          value={pt}
                          onChange={(e) => updateProjBullet(idx, pIdx, e.target.value)}
                        />
                        <div className="rf-bullet-actions">
                          <button
                            type="button"
                            className="rf-bullet-ai-btn"
                            title="✨ Polish with AI"
                            onClick={() => onAIBullet && onAIBullet(pt, (improved) => updateProjBullet(idx, pIdx, improved))}
                          >
                            <Sparkles size={12} />
                          </button>
                          <button
                            type="button"
                            className="rf-bullet-del-btn"
                            onClick={() => removeProjBullet(idx, pIdx)}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Skills (Categorized, NO fake progress bars) ── */}
      <div className={`rf-card ${collapsedSections.skills ? "is-collapsed" : ""}`}>
        <div 
          className="rf-card__header rf-card__header--collapsible"
          onClick={() => toggleSection("skills")}
          role="button"
          tabIndex={0}
        >
          <div className="rf-card__title-row">
            <span className="rf-card__chevron">
              {collapsedSections.skills ? <ChevronRight size={15} /> : <ChevronDown size={15} />}
            </span>
            <Wrench size={16} className="rf-card__icon" />
            <h3 className="rf-card__title">Skills & Technologies</h3>
          </div>
          <div className="rf-card__header-right" onClick={(e) => e.stopPropagation()}>
            {collapsedSections.skills && (
              <span className="rf-card__summary-pill">
                {safe.skills.length} skills{safe.skills.length > 0 ? ` (${safe.skills.slice(0, 3).join(", ")})` : ""}
              </span>
            )}
            <button
              type="button"
              className="rf-ai-btn rf-ai-btn--secondary"
              onClick={() => {
                openSection("skills");
                onAISkills && onAISkills();
              }}
              disabled={isAILoading}
            >
              <Sparkles size={12} /> Suggest Skills
            </button>
          </div>
        </div>

        {!collapsedSections.skills && (
          <>
            <div className="rf-skill-input-row">
              <input
                type="text"
                placeholder="Type skill and press Enter (e.g. TypeScript, Docker, PostgreSQL)..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill();
                  }
                }}
              />
              <button type="button" className="rf-btn-primary-sm" onClick={() => addSkill()}>
                <Plus size={14} /> Add
              </button>
            </div>

            <div className="rf-skills-chips">
              {safe.skills.map((skill) => (
                <span className="rf-skill-chip" key={skill}>
                  {skill}
                  <button type="button" onClick={() => removeSkill(skill)}>
                    ×
                  </button>
                </span>
              ))}
              {safe.skills.length === 0 && (
                <p className="rf-empty-hint">No skills added yet. Add core technical skills above.</p>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Education ── */}
      <div className={`rf-card ${collapsedSections.education ? "is-collapsed" : ""}`}>
        <div 
          className="rf-card__header rf-card__header--collapsible"
          onClick={() => toggleSection("education")}
          role="button"
          tabIndex={0}
        >
          <div className="rf-card__title-row">
            <span className="rf-card__chevron">
              {collapsedSections.education ? <ChevronRight size={15} /> : <ChevronDown size={15} />}
            </span>
            <GraduationCap size={16} className="rf-card__icon" />
            <h3 className="rf-card__title">Education</h3>
          </div>
          <div className="rf-card__header-right" onClick={(e) => e.stopPropagation()}>
            {collapsedSections.education && (
              <span className="rf-card__summary-pill">
                {safe.education.length} {safe.education.length === 1 ? "degree" : "degrees"}
                {safe.education[0]?.degree ? ` • ${safe.education[0].degree}` : ""}
              </span>
            )}
            <button 
              type="button" 
              className="rf-btn-primary-sm" 
              onClick={() => addEdu()}
            >
              <Plus size={14} /> Add Education
            </button>
          </div>
        </div>

        {!collapsedSections.education && (
          <div className="rf-entry-blocks">
            {safe.education.map((item, idx) => (
              <div className="rf-block" key={idx}>
                <div className="rf-block__top">
                  <span className="rf-block__index">#{idx + 1} Degree</span>
                  <button type="button" className="rf-danger" onClick={() => removeEdu(idx)}>
                    <Trash2 size={13} />
                  </button>
                </div>

                <div className="rf-grid-2">
                  <div className="rf-field">
                    <label>Degree / Certificate</label>
                    <input
                      type="text"
                      placeholder="B.Tech in Computer Science and Engineering"
                      value={item.degree}
                      onChange={(e) => updateEdu(idx, "degree", e.target.value)}
                    />
                  </div>
                  <div className="rf-field">
                    <label>Institution / University</label>
                    <input
                      type="text"
                      placeholder="Ajay Kumar Garg Engineering College"
                      value={item.school}
                      onChange={(e) => updateEdu(idx, "school", e.target.value)}
                    />
                  </div>
                  <div className="rf-field">
                    <label>Location</label>
                    <input
                      type="text"
                      placeholder="Ghaziabad, Uttar Pradesh"
                      value={item.location}
                      onChange={(e) => updateEdu(idx, "location", e.target.value)}
                    />
                  </div>
                  <div className="rf-field rf-grid-dates">
                    <div>
                      <label>Start / End Year</label>
                      <input
                        type="text"
                        placeholder="2023 — 2027"
                        value={item.startDate ? `${item.startDate} — ${item.endDate || ""}` : ""}
                        onChange={(e) => {
                          const parts = e.target.value.split("—");
                          updateEdu(idx, "startDate", parts[0]?.trim() || "");
                          updateEdu(idx, "endDate", parts[1]?.trim() || "");
                        }}
                      />
                    </div>
                    <div>
                      <label>CGPA / Percentage</label>
                      <input
                        type="text"
                        placeholder="e.g. CGPA 8.12 / 10"
                        value={item.score}
                        onChange={(e) => updateEdu(idx, "score", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Certifications & Honors ── */}
      <div className={`rf-card ${collapsedSections.certifications ? "is-collapsed" : ""}`}>
        <div 
          className="rf-card__header rf-card__header--collapsible"
          onClick={() => toggleSection("certifications")}
          role="button"
          tabIndex={0}
        >
          <div className="rf-card__title-row">
            <span className="rf-card__chevron">
              {collapsedSections.certifications ? <ChevronRight size={15} /> : <ChevronDown size={15} />}
            </span>
            <Award size={16} className="rf-card__icon" />
            <h3 className="rf-card__title">Certifications & Honors</h3>
          </div>
          <div className="rf-card__header-right" onClick={(e) => e.stopPropagation()}>
            {collapsedSections.certifications && (
              <span className="rf-card__summary-pill">
                {safe.certifications.length} items
              </span>
            )}
          </div>
        </div>

        {!collapsedSections.certifications && (
          <>
            <div className="rf-skill-input-row">
              <input
                type="text"
                placeholder="Add certification, award, or competition ranking..."
                value={certInput}
                onChange={(e) => setCertInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCert();
                  }
                }}
              />
              <button type="button" className="rf-btn-primary-sm" onClick={addCert}>
                <Plus size={14} /> Add
              </button>
            </div>

            <div className="rf-cert-list">
              {safe.certifications.map((item, idx) => (
                <div className="rf-cert-item" key={idx}>
                  <span className="rf-cert-item__badge">✦</span>
                  <p>{item}</p>
                  <button type="button" onClick={() => removeCert(idx)} title="Delete">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
