import './StubPage.css';

export default function StubPage({ title }) {
  return (
    <div className="stub-page">
      <div className="stub-content">
        <div className="stub-icon">🚧</div>
        <h2>{title}</h2>
        <p>Módulo en desarrollo</p>
      </div>
    </div>
  );
}
