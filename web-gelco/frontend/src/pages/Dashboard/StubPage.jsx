import './StubPage.css';

export default function StubPage({ title, icon = '🚧' }) {
  return (
    <div className="stub-page">
      <div className="stub-content">
        <div className="stub-badge">
          <span className="stub-badge-dot" />
          En desarrollo
        </div>
        <div className="stub-icon">{icon}</div>
        <h2>{title}</h2>
        <p>Este módulo estará disponible próximamente.</p>
        <div className="stub-progress">
          <span className="stub-dot active" />
          <span className="stub-dot" />
          <span className="stub-dot" />
        </div>
      </div>
    </div>
  );
}