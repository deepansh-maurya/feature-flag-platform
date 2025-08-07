import "./sidebar.css"
export default function Sidebar() {
  return (
    <aside className="dash-sidebar glass">
      <div className="dash-logo">Flagly</div>
      <nav className="dash-nav">
        <a href="/dashboard" className="active">
          🏠 Dashboard
        </a>
        <a href="/dashboard/projects">📁 Projects</a>
        <a href="#">🚩 Feature Flags</a>
        <a href="#">📜 Audit Logs</a>
        <a href="#">👥 Team</a>
        <a href="#">⚙️ Settings</a>
        <div className="dash-nav-footer">
          <a href="#">📄 Docs</a>
        </div>
      </nav>
    </aside>
  );
}
