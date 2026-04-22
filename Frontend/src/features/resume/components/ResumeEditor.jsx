import { useState } from "react";

const emptyExperience = {
  title: "",
  company: "",
  location: "",
  startDate: "",
  endDate: "",
  points: [],
};

const emptyProject = {
  name: "",
  role: "",
  stack: "",
  liveUrl: "",
  githubUrl: "",
  points: [],
};

const emptyEducation = {
  school: "",
  degree: "",
  location: "",
  startDate: "",
  endDate: "",
  score: "",
};

const sectionLabels = {
  summary: "Summary",
  experience: "Experience",
  projects: "Projects",
  skills: "Skills",
  education: "Education",
  certifications: "Certifications",
};

const suggestedSkills = [
  "React.js",
  "Node.js",
  "MongoDB",
  "Express.js",
  "System Design",
  "JWT Authentication",
  "Tailwind CSS",
  "REST APIs",
];

export default function ResumeEditor({
  resume,
  setResume,
  onAIImprove,
  onOpenAssistant,
}) {
  const [skillDraft, setSkillDraft] = useState("");
  const [draggedSection, setDraggedSection] = useState("");

  const safeResume = {
    name: "",
    role: "",
    phone: "",
    email: "",
    github: "",
    linkedin: "",
    leetcode: "",
    portfolio: "",
    location: "",
    summary: "",
    experience: [emptyExperience],
    projects: [emptyProject],
    skills: [],
    education: [emptyEducation],
    certifications: [],
    sectionOrder: Object.keys(sectionLabels),
    ...resume,
  };

  const updateField = (field, value) => {
    setResume((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateArrayItem = (collection, index, field, value) => {
    setResume((prev) => {
      const items = [...(prev[collection] || [])];

      items[index] = {
        ...(items[index] || {}),
        [field]: value,
      };

      return {
        ...prev,
        [collection]: items,
      };
    });
  };

  const updateArrayLines = (collection, index, value) => {
    updateArrayItem(
      collection,
      index,
      "points",
      value
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean)
    );
  };

  const addItem = (collection, itemTemplate) => {
    setResume((prev) => ({
      ...prev,
      [collection]: [...(prev[collection] || []), itemTemplate],
    }));
  };

  const removeItem = (collection, index) => {
    setResume((prev) => {
      const items = [...(prev[collection] || [])];
      items.splice(index, 1);

      return {
        ...prev,
        [collection]: items.length ? items : [collection === "projects" ? emptyProject : collection === "education" ? emptyEducation : emptyExperience],
      };
    });
  };

  const updateCertifications = (value) => {
    setResume((prev) => ({
      ...prev,
      certifications: value
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
    }));
  };

  const addSkill = (skill) => {
    const nextSkill = skill.trim();

    if (!nextSkill) return;

    setResume((prev) => ({
      ...prev,
      skills: [...new Set([...(prev.skills || []), nextSkill])],
    }));

    setSkillDraft("");
  };

  const removeSkill = (skillToRemove) => {
    setResume((prev) => ({
      ...prev,
      skills: (prev.skills || []).filter((skill) => skill !== skillToRemove),
    }));
  };

  const reorderSections = (fromKey, toKey) => {
    if (!fromKey || !toKey || fromKey === toKey) return;

    setResume((prev) => {
      const currentOrder = [...(prev.sectionOrder || Object.keys(sectionLabels))];
      const fromIndex = currentOrder.indexOf(fromKey);
      const toIndex = currentOrder.indexOf(toKey);

      if (fromIndex < 0 || toIndex < 0) return prev;

      const [moved] = currentOrder.splice(fromIndex, 1);
      currentOrder.splice(toIndex, 0, moved);

      return {
        ...prev,
        sectionOrder: currentOrder,
      };
    });
  };

  return (
    <section className="resume-smart-editor">
      <header className="resume-smart-editor__header">
        <div>
          <p className="resume-smart-editor__eyebrow">Smart Input Form</p>
          <h2>Recruiter-ready content blocks</h2>
        </div>
      </header>

      <div className="resume-smart-editor__status">
        <span>Autosave enabled</span>
        <span>Drag sections to reorder the preview</span>
      </div>

      <section className="resume-smart-editor__card">
        <div className="resume-smart-editor__card-head">
          <h3>Section Order</h3>
          <button
            type="button"
            onClick={() => updateField("sectionOrder", Object.keys(sectionLabels))}
          >
            Reset
          </button>
        </div>

        <div className="resume-smart-editor__section-order">
          {(safeResume.sectionOrder || Object.keys(sectionLabels)).map((sectionKey) => (
            <button
              key={sectionKey}
              className="resume-smart-editor__section-chip"
              draggable
              type="button"
              onDragStart={() => setDraggedSection(sectionKey)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => {
                reorderSections(draggedSection, sectionKey);
                setDraggedSection("");
              }}
            >
              <span>::</span>
              {sectionLabels[sectionKey] || sectionKey}
            </button>
          ))}
        </div>
      </section>

      <section className="resume-smart-editor__card">
        <div className="resume-smart-editor__card-head">
          <h3>Identity</h3>
          <span>Header and personal brand</span>
        </div>

        <div className="resume-smart-editor__grid resume-smart-editor__grid--double">
          <label>
            <span>Full Name</span>
            <input
              value={safeResume.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="Krish Gupta"
            />
          </label>

          <label>
            <span>Role</span>
            <input
              value={safeResume.role}
              onChange={(event) => updateField("role", event.target.value)}
              placeholder="Full Stack Developer"
            />
          </label>
        </div>

        <label className="resume-smart-editor__field">
          <span>Location</span>
          <input
            value={safeResume.location}
            onChange={(event) => updateField("location", event.target.value)}
            placeholder="Ghaziabad, Uttar Pradesh"
          />
        </label>

        <label className="resume-smart-editor__field">
          <span>Professional Summary</span>
          <textarea
            rows={4}
            value={safeResume.summary}
            onChange={(event) => updateField("summary", event.target.value)}
            placeholder="Summarize your strongest engineering and product impact."
          />
        </label>
      </section>

      <section className="resume-smart-editor__card">
        <div className="resume-smart-editor__card-head">
          <h3>Contact Links</h3>
          <span>Live URLs are shown in the preview instantly</span>
        </div>

        <div className="resume-smart-editor__grid resume-smart-editor__grid--double">
          <label>
            <span>Phone</span>
            <input
              value={safeResume.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              placeholder="+91 7465982627"
            />
          </label>

          <label>
            <span>Email</span>
            <input
              value={safeResume.email}
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="you@example.com"
            />
          </label>

          <label>
            <span>GitHub</span>
            <input
              value={safeResume.github}
              onChange={(event) => updateField("github", event.target.value)}
              placeholder="https://github.com/username"
            />
          </label>

          <label>
            <span>LinkedIn</span>
            <input
              value={safeResume.linkedin}
              onChange={(event) => updateField("linkedin", event.target.value)}
              placeholder="https://linkedin.com/in/username"
            />
          </label>

          <label>
            <span>LeetCode</span>
            <input
              value={safeResume.leetcode}
              onChange={(event) => updateField("leetcode", event.target.value)}
              placeholder="https://leetcode.com/u/username"
            />
          </label>

          <label>
            <span>Portfolio</span>
            <input
              value={safeResume.portfolio}
              onChange={(event) => updateField("portfolio", event.target.value)}
              placeholder="https://yourportfolio.dev"
            />
          </label>
        </div>
      </section>

      <section className="resume-smart-editor__card">
        <div className="resume-smart-editor__card-head">
          <h3>Experience</h3>
          <button type="button" onClick={() => addItem("experience", emptyExperience)}>
            Add Role
          </button>
        </div>

        {(safeResume.experience || []).map((item, index) => (
          <article className="resume-smart-editor__block" key={`${item.company}-${index}`}>
            <div className="resume-smart-editor__block-head">
              <strong>Experience Block {index + 1}</strong>
              {(safeResume.experience || []).length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem("experience", index)}
                >
                  Remove
                </button>
              )}
            </div>

            <div className="resume-smart-editor__grid resume-smart-editor__grid--double">
              <label>
                <span>Job Title</span>
                <input
                  value={item.title || ""}
                  onChange={(event) =>
                    updateArrayItem("experience", index, "title", event.target.value)
                  }
                  placeholder="Student Coordinator"
                />
              </label>

              <label>
                <span>Company</span>
                <input
                  value={item.company || ""}
                  onChange={(event) =>
                    updateArrayItem("experience", index, "company", event.target.value)
                  }
                  placeholder="Company Name"
                />
              </label>

              <label>
                <span>Location</span>
                <input
                  value={item.location || ""}
                  onChange={(event) =>
                    updateArrayItem("experience", index, "location", event.target.value)
                  }
                  placeholder="Remote"
                />
              </label>

              <div className="resume-smart-editor__grid resume-smart-editor__grid--triple">
                <label>
                  <span>Start</span>
                  <input
                    value={item.startDate || ""}
                    onChange={(event) =>
                      updateArrayItem("experience", index, "startDate", event.target.value)
                    }
                    placeholder="May 2025"
                  />
                </label>

                <label>
                  <span>End</span>
                  <input
                    value={item.endDate || ""}
                    onChange={(event) =>
                      updateArrayItem("experience", index, "endDate", event.target.value)
                    }
                    placeholder="Present"
                  />
                </label>
              </div>
            </div>

            <label className="resume-smart-editor__field">
              <span>Impact Bullets</span>
              <textarea
                rows={4}
                value={(item.points || []).join("\n")}
                onChange={(event) =>
                  updateArrayLines("experience", index, event.target.value)
                }
                placeholder="One bullet per line"
              />
            </label>
          </article>
        ))}
      </section>

      <section className="resume-smart-editor__card">
        <div className="resume-smart-editor__card-head">
          <h3>Projects</h3>
          <button type="button" onClick={() => addItem("projects", emptyProject)}>
            Add Project
          </button>
        </div>

        {(safeResume.projects || []).map((item, index) => (
          <article className="resume-smart-editor__block" key={`${item.name}-${index}`}>
            <div className="resume-smart-editor__block-head">
              <strong>Project Block {index + 1}</strong>
              {(safeResume.projects || []).length > 1 && (
                <button type="button" onClick={() => removeItem("projects", index)}>
                  Remove
                </button>
              )}
            </div>

            <div className="resume-smart-editor__grid resume-smart-editor__grid--double">
              <label>
                <span>Project Name</span>
                <input
                  value={item.name || ""}
                  onChange={(event) =>
                    updateArrayItem("projects", index, "name", event.target.value)
                  }
                  placeholder="AI-Generated Interview Tool"
                />
              </label>

              <label>
                <span>Role</span>
                <input
                  value={item.role || ""}
                  onChange={(event) =>
                    updateArrayItem("projects", index, "role", event.target.value)
                  }
                  placeholder="Full Stack Developer"
                />
              </label>

              <label className="resume-smart-editor__field resume-smart-editor__field--full">
                <span>Tech Stack</span>
                <input
                  value={item.stack || ""}
                  onChange={(event) =>
                    updateArrayItem("projects", index, "stack", event.target.value)
                  }
                  placeholder="React, Node.js, MongoDB, AI APIs"
                />
              </label>

              <label>
                <span>Live Demo</span>
                <input
                  value={item.liveUrl || ""}
                  onChange={(event) =>
                    updateArrayItem("projects", index, "liveUrl", event.target.value)
                  }
                  placeholder="https://project-demo.app"
                />
              </label>

              <label>
                <span>GitHub Link</span>
                <input
                  value={item.githubUrl || ""}
                  onChange={(event) =>
                    updateArrayItem("projects", index, "githubUrl", event.target.value)
                  }
                  placeholder="https://github.com/username/repo"
                />
              </label>
            </div>

            <label className="resume-smart-editor__field">
              <span>Project Highlights</span>
              <textarea
                rows={4}
                value={(item.points || []).join("\n")}
                onChange={(event) => updateArrayLines("projects", index, event.target.value)}
                placeholder="Describe outcomes, architecture, and impact"
              />
            </label>
          </article>
        ))}
      </section>

      <section className="resume-smart-editor__card">
        <div className="resume-smart-editor__card-head">
          <h3>Skills</h3>
          <span>Tags input with suggested stacks</span>
        </div>

        <div className="resume-smart-editor__skill-entry">
          <input
            value={skillDraft}
            onChange={(event) => setSkillDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === ",") {
                event.preventDefault();
                addSkill(skillDraft);
              }
            }}
            placeholder="Add a skill and press Enter"
          />
          <button type="button" onClick={() => addSkill(skillDraft)}>
            Add Tag
          </button>
        </div>

        <div className="resume-smart-editor__skills">
          {(safeResume.skills || []).map((skill) => (
            <button
              className="resume-smart-editor__skill-tag"
              key={skill}
              type="button"
              onClick={() => removeSkill(skill)}
            >
              {skill}
              <span>x</span>
            </button>
          ))}
        </div>

        <div className="resume-smart-editor__skill-suggestions">
          {suggestedSkills.map((skill) => (
            <button key={skill} type="button" onClick={() => addSkill(skill)}>
              {skill}
            </button>
          ))}
        </div>
      </section>

      <section className="resume-smart-editor__card">
        <div className="resume-smart-editor__card-head">
          <h3>Education</h3>
          <button type="button" onClick={() => addItem("education", emptyEducation)}>
            Add Degree
          </button>
        </div>

        {(safeResume.education || []).map((item, index) => (
          <article className="resume-smart-editor__block" key={`${item.school}-${index}`}>
            <div className="resume-smart-editor__block-head">
              <strong>Education Block {index + 1}</strong>
              {(safeResume.education || []).length > 1 && (
                <button type="button" onClick={() => removeItem("education", index)}>
                  Remove
                </button>
              )}
            </div>

            <div className="resume-smart-editor__grid resume-smart-editor__grid--double">
              <label>
                <span>Institution</span>
                <input
                  value={item.school || ""}
                  onChange={(event) =>
                    updateArrayItem("education", index, "school", event.target.value)
                  }
                  placeholder="University Name"
                />
              </label>

              <label>
                <span>Degree</span>
                <input
                  value={item.degree || ""}
                  onChange={(event) =>
                    updateArrayItem("education", index, "degree", event.target.value)
                  }
                  placeholder="B.Tech in Computer Science"
                />
              </label>

              <label>
                <span>Location</span>
                <input
                  value={item.location || ""}
                  onChange={(event) =>
                    updateArrayItem("education", index, "location", event.target.value)
                  }
                  placeholder="Ghaziabad"
                />
              </label>

              <label>
                <span>Score / GPA</span>
                <input
                  value={item.score || ""}
                  onChange={(event) =>
                    updateArrayItem("education", index, "score", event.target.value)
                  }
                  placeholder="CGPA 8.12"
                />
              </label>

              <div className="resume-smart-editor__grid resume-smart-editor__grid--triple">
                <label>
                  <span>Start</span>
                  <input
                    value={item.startDate || ""}
                    onChange={(event) =>
                      updateArrayItem("education", index, "startDate", event.target.value)
                    }
                    placeholder="2023"
                  />
                </label>

                <label>
                  <span>End</span>
                  <input
                    value={item.endDate || ""}
                    onChange={(event) =>
                      updateArrayItem("education", index, "endDate", event.target.value)
                    }
                    placeholder="2027"
                  />
                </label>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="resume-smart-editor__card">
        <div className="resume-smart-editor__card-head">
          <h3>Certifications & Achievements</h3>
          <span>One item per line</span>
        </div>

        <label className="resume-smart-editor__field">
          <span>Highlights</span>
          <textarea
            rows={4}
            value={(safeResume.certifications || []).join("\n")}
            onChange={(event) => updateCertifications(event.target.value)}
            placeholder="Oracle Certified Professional..."
          />
        </label>
      </section>

      <section className="resume-smart-editor__card resume-smart-editor__card--actions">
        <div className="resume-smart-editor__card-head">
          <h3>AI Actions</h3>
          <span>Optimization shortcuts</span>
        </div>

        <div className="resume-smart-editor__actions">
          <button type="button" onClick={onAIImprove}>
            AI Optimize Resume
          </button>
          <button type="button" onClick={onAIImprove}>
            Rewrite Bullet Points
          </button>
          <button type="button" onClick={onAIImprove}>
            Generate Summary
          </button>
          <button type="button" onClick={onAIImprove}>
            Suggest Skills
          </button>
          <button type="button" onClick={onOpenAssistant}>
            Open Chat Assistant
          </button>
        </div>
      </section>
    </section>
  );
}
