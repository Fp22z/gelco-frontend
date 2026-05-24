import { useState } from 'react';
import './DashboardDistribuidor.css';

export default function DashboardDistribuidor() {
  const [searchTerm, setSearchTerm] = useState('');

  // Placeholder pedidos listos para asignar
  const pedidosListos = [
    { id: 1, client: 'Juan Pérez García', address: 'Jr. Comercio 456, San Isidro', priority: 'ALTA' },
    { id: 2, client: 'Ana López Martínez', address: 'Av. Pardo 789, Miraflores', priority: 'MEDIA' },
    { id: 3, client: 'Carlos Ruiz Torres', address: 'Calle Principal 123, Surco', priority: 'BAJA' },
    { id: 4, client: 'Laura Martínez Rodríguez', address: 'Jr. Independencia 234, La Molina', priority: 'ALTA' },
  ];

  // Placeholder rutas activas
  const rutasActivas = [
    { id: 'RT001', driver: 'Roberto Silva', vehicle: 'Furgoneta Blanca #14', status: 'En tránsito', progress: 65, pedidos: 8, tiempoEst: '2h 15m' },
    { id: 'RT002', driver: 'Miguel Torres', vehicle: 'Camión Rojo #7', status: 'En tránsito', progress: 40, pedidos: 12, tiempoEst: '3h 30m' },
    { id: 'RT003', driver: 'Pedro Gómez', vehicle: 'Furgoneta Azul #21', status: 'En tránsito', progress: 85, pedidos: 5, tiempoEst: '1h 10m' },
  ];

  // Placeholder incidencias
  const incidencias = [
    { id: 1, icon: '⚠️', title: 'Retraso en Ruta RT001', description: 'Tráfico en Av. Arequipa', date: 'Hace 15 min' },
    { id: 2, icon: '❌', title: 'Cliente no disponible', description: 'Pedido PED145 - Reintentar mañana', date: 'Hace 45 min' },
    { id: 3, icon: '⚠️', title: 'Furgoneta #14 con bajo combustible', description: 'Repostar antes de continuar', date: 'Hace 1h' },
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'ALTA':
        return '#ef4444';
      case 'MEDIA':
        return '#f59e0b';
      case 'BAJA':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'En tránsito':
        return '#3b82f6';
      case 'Completada':
        return '#10b981';
      case 'Pausada':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className="dashboard-distribuidor">
      <div className="distribuidor-layout">
        {/* LEFT PANEL */}
        <div className="distribuidor-left">
          <section className="pedidos-listos-section">
            <h3>Pedidos Listos para Asignar</h3>
            <input
              type="text"
              placeholder="Buscar por cliente o dirección..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <div className="pedidos-listos-list">
              {pedidosListos.map((pedido) => (
                <div key={pedido.id} className="pedido-listo-item">
                  <div className="pedido-info">
                    <p className="pedido-client">{pedido.client}</p>
                    <p className="pedido-address">{pedido.address}</p>
                  </div>
                  <div className="pedido-actions">
                    <span
                      className="priority-badge"
                      style={{ backgroundColor: getPriorityColor(pedido.priority) }}
                    >
                      {pedido.priority}
                    </span>
                    <button className="add-btn">+</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* CENTER - MAP PLACEHOLDER */}
        <div className="distribuidor-center">
          <div className="map-placeholder">
            <div className="map-icon">🗺️</div>
            <p>Mapa interactivo</p>
          </div>
          <div className="map-bottom-bar">
            <span>8 paradas</span>
            <span>15.2 km aprox</span>
            <span>2h 45m estimado</span>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="distribuidor-right">
          <section className="rutas-activas-section">
            <h3>Seguimiento de Rutas Activas</h3>
            <div className="rutas-table">
              <div className="rutas-header">
                <div>ID Ruta</div>
                <div>Chofer</div>
                <div>Vehículo</div>
                <div>Estado</div>
                <div>Progreso</div>
                <div>Pedidos</div>
                <div>T. Est</div>
              </div>
              {rutasActivas.map((ruta) => (
                <div key={ruta.id} className="rutas-row">
                  <div className="rutas-cell">{ruta.id}</div>
                  <div className="rutas-cell">{ruta.driver}</div>
                  <div className="rutas-cell">{ruta.vehicle}</div>
                  <div className="rutas-cell">
                    <span
                      className="status-badge-ruta"
                      style={{ backgroundColor: getStatusColor(ruta.status) }}
                    >
                      {ruta.status}
                    </span>
                  </div>
                  <div className="rutas-cell">
                    <div className="progress-bar-small">
                      <div
                        className="progress-fill-small"
                        style={{ width: `${ruta.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="rutas-cell">{ruta.pedidos}</div>
                  <div className="rutas-cell">{ruta.tiempoEst}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="incidencias-section">
            <h3>Incidencias Recientes</h3>
            <div className="incidencias-list">
              {incidencias.map((incidencia) => (
                <div key={incidencia.id} className="incidencia-item">
                  <div className="incidencia-icon">{incidencia.icon}</div>
                  <div className="incidencia-content">
                    <p className="incidencia-title">{incidencia.title}</p>
                    <p className="incidencia-description">{incidencia.description}</p>
                    <p className="incidencia-date">{incidencia.date}</p>
                  </div>
                  <button className="attend-btn">Atender</button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* BOTTOM TABLE */}
      <section className="bottom-rutas-table">
        {/* This is responsive and moves to bottom on smaller screens */}
      </section>
    </div>
  );
}
