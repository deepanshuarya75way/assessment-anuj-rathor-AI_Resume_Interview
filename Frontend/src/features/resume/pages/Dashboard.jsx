import ResumePreview from "../components/ResumePreviewLive";
import Sidebar from "../components/Sidebar";
import TemplateCard from "../components/TemplateCard";
import Topbar from "../components/Topbar";
import { useResume } from "../hooks/useResume";
import "../style/resume.scss";

export default function Dashboard() {
  const {
    dashboardSidebar,
    recentResumes,
    dashboardStats,
    dashboardSuggestion,
    quickStartTemplates,
  } = useResume();

  return (
    <div className="resume-ui resume-page resume-page--dashboard">
      <Topbar activeTab="" />

      <div className="resume-layout">
        <Sidebar
          title="Resume Editor"
          subtitle="AI Workspace"
          avatar="https://i.pravatar.cc/96?img=15"
          items={dashboardSidebar}
          assist={{ label: "AI Assist", variant: "gradient" }}
        />

        <main className="resume-main resume-main--dashboard">
          <section className="dashboard-hero">
            <div>
              <h1 className="dashboard-hero__title">Command Center</h1>
              <p className="dashboard-hero__copy">
                Your career evolution, architected by AI.
              </p>
            </div>

            <div className="dashboard-hero__stats">
              {dashboardStats.map((stat) => (
                <article className="dashboard-stat" key={stat.key}>
                  
                  <div>
                    <p className="dashboard-stat__label">{stat.label}</p>
                    <p className="dashboard-stat__value">{stat.value}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="dashboard-grid">
            <div className="dashboard-grid__recent">
              {recentResumes.map((item) => (
                <ResumePreview key={item.key} {...item} />
              ))}

              <article className="dashboard-suggestion">
                <p className="dashboard-suggestion__eyebrow">{dashboardSuggestion.eyebrow}</p>
                <h2 className="dashboard-suggestion__title">{dashboardSuggestion.title}</h2>
                <p className="dashboard-suggestion__copy">{dashboardSuggestion.copy}</p>
                <button className="dashboard-suggestion__button" type="button">
                  {dashboardSuggestion.action}
                </button>
              </article>
            </div>
          </section>

          <section className="dashboard-templates">
            <div className="dashboard-templates__header">
              <h2>Quick Start Templates</h2>
              <button className="dashboard-templates__link" type="button">
                View All Library
              </button>
            </div>

            {/* <div className="dashboard-templates__grid">
              {quickStartTemplates.map((template) => (
                // <TemplateCard key={template.key} {...template} />
              ))}
            </div> */}
          </section>
        </main>
      </div>
    </div>
  );
}
