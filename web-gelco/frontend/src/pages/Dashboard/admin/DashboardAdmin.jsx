import { useState } from 'react';
import './DashboardAdmin.css';

export default function DashboardAdmin() {
  // Placeholder KPI data
  const kpis = [
    { label: 'Ventas Totales del Mes', value: 'S/. 75,200', icon: '💰' },
    { label: 'Crecimiento vs Meta', value: '15%', icon: '📈' },
    { label: 'Consultoras Activas', value: '412', icon: '👥' },
    { label: 'Pedidos Pendientes', value: '24', icon: '📦' },
  ];

  // Placeholder chart data
  const chartData = [
    { month: 'Ene', sales: 45000 },
    { month: 'Feb', sales: 52000 },
    { month: 'Mar', sales: 48000 },
    { month: 'Abr', sales: 61000 },
    { month: 'May', sales: 68000 },
    { month: 'Jun', sales: 75200 },
  ];

  // Placeholder top consultoras
  const topConsultoras = [
    { id: 1, name: 'María García', level: 'Oro', amount: 'S/. 12,500', initials: 'MG' },
    { id: 2, name: 'Laura Martínez', level: 'Oro', amount: 'S/. 11,200', initials: 'LM' },
    { id: 3, name: 'Carmen López', level: 'Plata', amount: 'S/. 9,800', initials: 'CL' },
    { id: 4, name: 'Ana Rodríguez', level: 'Plata', amount: 'S/. 8,900', initials: 'AR' },
    { id: 5, name: 'Sofia Pérez', level: 'Bronce', amount: 'S/. 7,600', initials: 'SP' },
  ];

  const getLevelColor = (level) => {
    switch (level) {
      case 'Oro':
        return '#F59E0B';
      case 'Plata':
        return '#9CA3AF';
      case 'Bronce':
        return '#D97706';
      default:
        return '#6B7280';
    }
  };

  return (
    <div className="dashboard-admin">
      {/* KPI CARDS */}
      <section className="kpi-section">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="kpi-card">
            <div className="kpi-icon">{kpi.icon}</div>
            <div className="kpi-content">
              <p className="kpi-label">{kpi.label}</p>
              <p className="kpi-value">{kpi.value}</p>
            </div>
          </div>
        ))}
      </section>

      {/* CONTENT GRID */}
      <div className="admin-content-grid">
        {/* CHART SECTION */}
        <section className="chart-section">
          <h3>Ventas en los últimos 6 meses</h3>
          <div className="chart-container">
            <div className="css-bar-chart">
              <div className="chart-y-axis">
                <div className="y-axis-label">S/. 75k</div>
                <div className="y-axis-label">S/. 50k</div>
                <div className="y-axis-label">S/. 25k</div>
                <div className="y-axis-label">S/. 0</div>
              </div>
              <div className="chart-bars-wrapper">
                <div className="chart-grid-lines">
                  <div className="grid-line"></div>
                  <div className="grid-line"></div>
                  <div className="grid-line"></div>
                  <div className="grid-line"></div>
                </div>
                <div className="chart-bars">
                  {chartData.map((data) => {
                    const maxValue = 75000;
                    const heightPercent = (data.sales / maxValue) * 100;
                    return (
                      <div key={data.month} className="bar-group">
                        <div
                          className="bar"
                          style={{ height: `${heightPercent}%` }}
                          title={`${data.month}: S/. ${data.sales.toLocaleString()}`}
                        ></div>
                        <p className="bar-label">{data.month}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TOP CONSULTORAS PANEL */}
        <section className="top-consultoras-section">
          <h3>Top 5 Consultoras</h3>
          <div className="consultoras-list">
            {topConsultoras.map((consultora) => (
              <div key={consultora.id} className="consultora-item">
                <div
                  className="consultora-avatar"
                  style={{ backgroundColor: '#E8956D' }}
                >
                  {consultora.initials}
                </div>
                <div className="consultora-info">
                  <p className="consultora-name">{consultora.name}</p>
                  <span
                    className="level-badge"
                    style={{ backgroundColor: getLevelColor(consultora.level) }}
                  >
                    {consultora.level}
                  </span>
                </div>
                <p className="consultora-amount">{consultora.amount}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
