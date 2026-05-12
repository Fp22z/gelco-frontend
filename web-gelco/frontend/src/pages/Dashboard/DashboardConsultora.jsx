import './DashboardConsultora.css';

export default function DashboardConsultora() {
  // Placeholder profile data
  const profileData = {
    name: 'María García',
    level: 'Oro',
    current: 850,
    target: 1000,
    initials: 'MG',
  };

  // Placeholder pedidos data
  const pedidos = [
    { id: 'PED001', client: 'Juan Pérez', date: '2026-05-10', total: 'S/. 1,250', status: 'Entregado' },
    { id: 'PED002', client: 'Ana López', date: '2026-05-09', total: 'S/. 2,100', status: 'En camino' },
    { id: 'PED003', client: 'Carlos Ruiz', date: '2026-05-08', total: 'S/. 890', status: 'En proceso' },
    { id: 'PED004', client: 'Laura Martínez', date: '2026-05-07', total: 'S/. 3,450', status: 'Entregado' },
  ];

  // Placeholder capacitaciones data
  const capacitaciones = [
    { id: 1, title: 'Técnicas de Ventas Avanzadas', progress: 85 },
    { id: 2, title: 'Gestión de Clientes', progress: 60 },
    { id: 3, title: 'Productos Estratégicos Q2', progress: 40 },
  ];

  const percentage = Math.round((profileData.current / profileData.target) * 100);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Entregado':
        return '#10b981';
      case 'En camino':
        return '#f59e0b';
      case 'En proceso':
        return '#f97316';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className="dashboard-consultora">
      {/* LEFT PANEL */}
      <div className="consultora-left">
        {/* PERFIL DE VENTAS */}
        <section className="perfil-ventas-card">
          <h3>Mi Perfil de Ventas</h3>
          <div className="perfil-header">
            <div className="perfil-avatar">
              {profileData.initials}
            </div>
            <div className="perfil-info">
              <p className="perfil-name">{profileData.name}</p>
              <span className="perfil-level">{profileData.level}</span>
            </div>
          </div>
          <div className="perfil-progress">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
            <p className="progress-text">
              S/. {profileData.current.toLocaleString()} / S/. {profileData.target.toLocaleString()} ({percentage}%)
            </p>
          </div>
        </section>

        {/* ESTADO DE PEDIDOS */}
        <section className="pedidos-section">
          <h3>Estado de Pedidos</h3>
          <div className="pedidos-table">
            <div className="table-header">
              <div>Pedido ID</div>
              <div>Cliente</div>
              <div>Fecha</div>
              <div>Total</div>
              <div>Estado</div>
            </div>
            {pedidos.map((pedido) => (
              <div key={pedido.id} className="table-row">
                <div className="table-cell">{pedido.id}</div>
                <div className="table-cell">{pedido.client}</div>
                <div className="table-cell">{pedido.date}</div>
                <div className="table-cell">{pedido.total}</div>
                <div className="table-cell">
                  <span
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(pedido.status) }}
                  >
                    {pedido.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* RIGHT PANEL */}
      <div className="consultora-right">
        {/* ACCIONES RÁPIDAS */}
        <section className="acciones-rapidas">
          <h3>Acciones Rápidas</h3>
          <div className="action-buttons">
            <button className="action-btn">Nuevo Pedido</button>
            <button className="action-btn">Ver Catálogo</button>
          </div>
        </section>

        {/* MIS CAPACITACIONES */}
        <section className="capacitaciones-section">
          <h3>Mis Capacitaciones</h3>
          <div className="capacitaciones-list">
            {capacitaciones.map((cap) => (
              <div key={cap.id} className="capacitacion-item">
                <p className="cap-title">{cap.title}</p>
                <div className="cap-progress">
                  <div className="cap-progress-bar">
                    <div
                      className="cap-progress-fill"
                      style={{ width: `${cap.progress}%` }}
                    ></div>
                  </div>
                  <span className="cap-percentage">{cap.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
