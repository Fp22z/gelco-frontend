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
        <div className="navbar-left">
          <img src="/assets/logo-empresa.png" alt="Logo GELCO" className="navbar-logo" />
          <div className="navbar-brand">
            <span>GELCO</span>
          </div>
        </div>
        <div className="navbar-right">
          <Link to="/login" className="btn-primary">Iniciar Sesión</Link>

          <Link to="/login" className="btn-register">Regístrate</Link>
        </div>
      </nav>

      {/* HERO */}
      <header className="hero">
        <div className="hero-text">
          <h1>Gestiona tus ventas, pedidos y distribución</h1>
          <p>La plataforma integral para consultoras modernas en todo el Perú.</p>
        </div>
      </header>

      {/* SERVICIOS */}
      <section className="services-icons">
        <article className="service-icon-card">
          <div className="service-icon">📊</div>
          <h3>Control de Ventas</h3>
        </article>
        <article className="service-icon-card">
          <div className="service-icon">👥</div>
          <h3>Gestión de Consultoras</h3>
        </article>
        <article className="service-icon-card">
          <div className="service-icon">📦</div>
          <h3>Seguimiento de Pedidos</h3>
        </article>
        <article className="service-icon-card">
          <div className="service-icon">📚</div>
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
          <div className="char-icon">⚡</div>
          <h3>Fácil de usar y accesible</h3>
        </article>
        <article className="characteristic-card">
          <div className="char-icon">💰</div>
          <h3>Optimiza tus ganancias</h3>
        </article>
        <article className="characteristic-card">
          <div className="char-icon">🎧</div>
          <h3>Soporte y asistencia 24/7</h3>
        </article>
      </section>

      {/* PRODUCTOS DISPONIBLES */}
      <section className="products-section">
        <h2>Productos disponibles</h2>

        <div className="products-grid">
          {loading ? (
            <p className="loading-text">Cargando productos...</p>
          ) : productos.length === 0 ? (
            <p className="loading-text">No hay productos disponibles en este momento</p>
          ) : (
            productos.map(p => (
              <article key={p.id} className="product-card">
                <h3>{p.nombre}</h3>
                <p className="product-price">S/. {p.precio}</p>
                <p className="product-stock">Stock: {p.stock}</p>
              </article>
            ))
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="main-footer">
        <p>© 2026 Ventas por Catálogo - Todos los derechos reservados</p>
      </footer>

    </main>
  );
}

