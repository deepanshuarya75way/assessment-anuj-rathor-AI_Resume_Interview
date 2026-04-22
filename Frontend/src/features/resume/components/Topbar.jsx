export default function Topbar({
  activeTab,
  statusText = "Auto-saving...",
  actionLabel = "Download PDF",
}) {
  return (
    <header className="resume-topbar">

      <div>
        <h2>Alchemist AI</h2>
      </div>

      <div>
        <span>{statusText}</span>
        <button>{actionLabel}</button>
      </div>

    </header>
  );
}