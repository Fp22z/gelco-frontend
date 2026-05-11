import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getProductosPublic } from '../../services/productoService';
import { useToast } from '../../services/toastService.jsx';
import './Home.css';

export default function Home() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { show: showToast } = useToast();

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        setLoading(true);
        const data = await getProductosPublic();
        setProductos(data);
      } catch (error) {
        console.error('Error fetching productos:', error);
        // Silently fail for home page - products section is optional
        setProductos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, []);

  return (
    <main className="page">

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="logo-container">
          <img src="/assets/logo-empresa.png" alt="Logo GELCO" className="logo" />
          <span className="brand-name">Ventas por Catálogo Perú</span>
        </div>
        <div className="auth-buttons">
          <Link to="/login" className="btn-nav btn-ini">Iniciar Sesión</Link>
          <a href="#" className="btn-nav btn-reg">Regístrate</a>
        </div>
      </nav>

      {/* HERO */}
      <header className="hero">
        <div className="hero-content">
          <h1>Gestiona tus ventas, pedidos y distribución</h1>
          <p>La plataforma integral para consultoras modernas en todo el Perú.</p>
        </div>
      </header>

      {/* SERVICIOS */}
      <section className="services">
        <article className="service-card">
          <img src="/assets/control-ventas.png" alt="Control de Ventas" />
          <h3>Control de Ventas</h3>
        </article>
        <article className="service-card">
          <img src="/assets/gestion-consultoras.png" alt="Gestión de Consultoras" />
          <h3>Gestión de Consultoras</h3>
        </article>
        <article className="service-card">
          <img src="/assets/seguimiento-pedidos.png" alt="Seguimiento de Pedidos" />
          <h3>Seguimiento de Pedidos</h3>
        </article>
        <article className="service-card">
          <img src="/assets/control-inventario.png" alt="Control de Inventario" />
          <h3>Control de Inventario</h3>
        </article>
      </section>

      {/* BIENVENIDA */}
      <section className="welcome-info">
        <h2>Bienvenidos a Ventas por Catálogo Perú</h2>
        <p className="welcome-subtitle">
          La herramienta integral para tu negocio de venta directa
        </p>
      </section>

      {/* CARACTERÍSTICAS */}
      <section className="characteristics">
        <article className="characteristic-card">
          <img src="/assets/facil.png" alt="Fácil de usar" />
          <h3>Fácil de usar y accesible</h3>
        </article>
        <article className="characteristic-card">
          <img src="/assets/optimiza.png" alt="Optimiza ganancias" />
          <h3>Optimiza tus ganancias</h3>
        </article>
        <article className="characteristic-card">
          <img src="/assets/soporte.png" alt="Soporte 24/7" />
          <h3>Soporte y asistencia 24/7</h3>
        </article>
      </section>

      {/* PRODUCTOS DESDE BD */}
      <section className="services">
        <h2 style={{ textAlign: 'center' }}>Productos disponibles</h2>

        {loading ? (
          <p style={{ textAlign: 'center' }}>Cargando productos...</p>
        ) : productos.length === 0 ? (
          <p style={{ textAlign: 'center' }}>No hay productos disponibles en este momento</p>
        ) : (
          productos.map(p => (
            <article key={p.id} className="service-card">
              <h3>{p.nombre}</h3>
              <p>S/. {p.precio}</p>
              <p>Stock: {p.stock}</p>
            </article>
          ))
        )}
      </section>

      {/* FOOTER */}
      <footer className="main-footer">
        <p>© 2026 Ventas por Catálogo - Todos los derechos reservados</p>
      </footer>

    </main>
  );
}
