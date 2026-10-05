import { useNavigate } from "react-router";
import { 
  FileText, 
  Sparkles, 
  ArrowRight, 
  Plus, 
  Target, 
  Award, 
  Clock, 
  Download, 
  ExternalLink 
} from "lucide-react";
import { useResume } from "../hooks/useResume";
import Navbar from "../../interview/components/Navbar";
import "../style/resume.scss";

export default function Dashboard() {
  const navigate = useNavigate();
  const { resume, dashboardStats, dashboardSuggestion, templateLibrary } = useResume();

  return (
    <div className="rf-page-dashboard">
      <Navbar />

      <main className="rf-dashboard-container">
        {/* Hero Section */}
        <section className="rf-dash-hero">
          <div className="rf-dash-hero__text">
            <span className="rf-badge-pill">
              <Sparkles size={13} /> AI Career Hub
            </span>
            <h1>Resume Command Center</h1>
            <p>Manage, optimize, and export your production-ready resumes from a single workspace.</p>
          </div>

          <div className="rf-dash-hero__action">
            <button
              type="button"
              className="rf-btn-primary"
              onClick={() => navigate("/resume")}
            >
              <Plus size={15} /> Open Resume Builder
            </button>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="rf-stats-row">
          {dashboardStats.map((stat) => (
            <div className="rf-stat-card" key={stat.key}>
              <span className="rf-stat-label">{stat.label}</span>
              <strong className="rf-stat-value">{stat.value}</strong>
            </div>
          ))}
        </section>

        {/* Main Content Grid: Recent Resumes & AI Recommendation */}
        <section className="rf-dash-content-grid">
          {/* Active Resumes */}
          <div className="rf-dash-card rf-dash-card--main">
            <div className="rf-dash-card__head">
              <div>
                <h3>Active Documents</h3>
                <p>Your current active resumes and drafts</p>
              </div>
              <button
                type="button"
                className="rf-btn-ghost"
                onClick={() => navigate("/resume")}
              >
                Create New <Plus size={13} />
              </button>
            </div>

            <div className="rf-resumes-list">
              <div className="rf-resume-item">
                <div className="rf-resume-item__icon">
                  <FileText size={20} />
                </div>
                <div className="rf-resume-item__info">
                  <h4>{resume.name || "Candidate Resume"} — {resume.role || "Software Engineer"}</h4>
                  <div className="rf-resume-item__meta">
                    <span><Clock size={12} /> Auto-synced just now</span>
                    <span>Template: <strong>{resume.template || "Modern"}</strong></span>
                    <span className="rf-tag-verified">Ready for Applications</span>
                  </div>
                </div>
                <div className="rf-resume-item__actions">
                  <button
                    type="button"
                    className="rf-btn-primary-sm"
                    onClick={() => navigate("/resume")}
                  >
                    Open Editor <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* AI Suggestion Card */}
          <div className="rf-dash-card rf-dash-card--suggestion">
            <span className="rf-badge-pill">
              <Sparkles size={12} /> {dashboardSuggestion.eyebrow}
            </span>
            <h3>{dashboardSuggestion.title}</h3>
            <p>{dashboardSuggestion.copy}</p>
            <button
              type="button"
              className="rf-btn-primary rf-btn-block"
              onClick={() => navigate("/resume")}
            >
              {dashboardSuggestion.action} <ArrowRight size={14} />
            </button>
          </div>
        </section>

        {/* Quick Templates Selector */}
        <section className="rf-dash-templates-section">
          <div className="rf-dash-card__head">
            <div>
              <h3>Featured Templates</h3>
              <p>Switch themes seamlessly without losing content</p>
            </div>
            <button
              type="button"
              className="rf-btn-ghost"
              onClick={() => navigate("/templates")}
            >
              View All 5 Templates <ArrowRight size={13} />
            </button>
          </div>

          <div className="rf-dash-templates-grid">
            {templateLibrary.slice(0, 3).map((t) => (
              <div
                className="rf-dash-template-card"
                key={t.key}
                onClick={() => navigate(`/resume?template=${t.key}`)}
              >
                <h4>{t.title}</h4>
                <p>{t.copy}</p>
                <div className="rf-dash-template-foot">
                  <span>ATS: {t.atsScore}</span>
                  <span className="rf-link-text">Apply →</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
