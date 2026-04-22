import Sidebar from "../components/Sidebar";
// import TemplateCard from "../components/TemplateCard";
import Topbar from "../components/Topbar";
import { useResume } from "../hooks/useResume";
import "../style/resume.scss";

export default function Templates() {
  const { templateFilters, templateLibrary } = useResume();

  return (
    <div className="resume-ui resume-page resume-page--templates">
      <Topbar activeTab="templates" />

      <div className="resume-layout">
        <Sidebar label="Filter Templates" items={templateFilters} variant="filters" />

        <main className="resume-main resume-main--templates">
          <header className="templates-hero">
            <h1 className="templates-hero__title">Resume Templates</h1>
            <p className="templates-hero__copy">
              Select a foundation for your professional narrative. Our AI will
              automatically adapt your content to match the chosen architectural
              style.
            </p>
          </header>

          {/* <section className="templates-grid">
            {templateLibrary.map((template) => (
              <TemplateCard key={template.key} {...template} />
            ))}
          </section> */}
        </main>
      </div>
    </div>
  );
}
