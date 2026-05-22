import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import './Home.css';

// ── Scroll animation hook ─────────────────────────────────────────
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.animate-on-scroll');
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); }
      }),
      { threshold: 0.12 }
    );
    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

// ── Animated counter ──────────────────────────────────────────────
function useCounter(target, duration = 1800) {
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const step = (now) => {
          const p = Math.min((now - start) / duration, 1);
          const ease = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(ease * target).toLocaleString('es-PE');
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
    }, { threshold: 0.5 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return ref;
}

// ── Stat counter component ────────────────────────────────────────
function StatCounter({ value, suffix = '', label }) {
  const ref = useCounter(value);
  return (
    <div className="stat-bar-item">
      <div className="stat-bar-number">
        <span ref={ref}>0</span>{suffix}
      </div>
      <div className="stat-bar-label">{label}</div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────
export default function Home() {
  useScrollReveal();

  return (
    <main className="page">

      {/* ── NAVBAR ── */}
      <nav className="navbar">
        <div className="navbar-left">
          <img src="/assets/logo-empresa.png" alt="GELCO" className="navbar-logo" />
          <span className="navbar-brand">GELCO</span>
        </div>
        <div className="navbar-right">
          <Link to="/login" className="btn-nav-login">Iniciar Sesión</Link>
          <Link to="/register" className="btn-cta-nav">Empieza gratis →</Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero">
        {/* Decorative circles */}
        <div className="hero-deco hero-deco-1" />
        <div className="hero-deco hero-deco-2" />
        <div className="hero-deco hero-deco-3" />

        <div className="hero-content">
          <div className="hero-eyebrow">
            <span className="hero-eyebrow-dot" />
            Plataforma #1 para consultoras en Perú
          </div>

          <h1>
            Vende más,<br />
            gestiona <em>mejor</em>,<br />
            crece sin límites
          </h1>

          <p className="hero-desc">
            GELCO centraliza tus pedidos, clientes, inventario y distribución
            en un solo lugar. Diseñado para consultoras que quieren llevar su
            negocio al siguiente nivel.
          </p>

          <div className="hero-actions">
            <Link to="/register" className="btn-hero-primary">
              Comenzar ahora
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <a href="#features" className="btn-hero-secondary">
              Ver cómo funciona →
            </a>
          </div>
        </div>

        {/* Dashboard preview card */}
        <div className="hero-visual">
          <div className="hero-image-card">
            <div className="hero-floating-badge badge-top">
              <span className="badge-emoji">📈</span>
              +32% este mes
            </div>

            <div className="hero-card-header">
              <div className="hero-card-avatar">FP</div>
              <div>
                <div className="hero-card-name">Fayrus Peña</div>
                <div className="hero-card-role">Consultora · Nivel Oro</div>
              </div>
            </div>

            <div className="hero-card-stats">
              <div className="hero-stat-chip">
                <span className="chip-value">24</span>
                <span className="chip-label">Pedidos activos</span>
              </div>
              <div className="hero-stat-chip">
                <span className="chip-value pink">S/.1,280</span>
                <span className="chip-label">Esta campaña</span>
              </div>
              <div className="hero-stat-chip">
                <span className="chip-value">18</span>
                <span className="chip-label">Clientes</span>
              </div>
              <div className="hero-stat-chip">
                <span className="chip-value">42</span>
                <span className="chip-label">Productos</span>
              </div>
            </div>

            <div className="hero-card-bar-label">Meta de campaña — 73%</div>
            <div className="hero-card-bar">
              <div className="hero-card-bar-fill" />
            </div>

            <div className="hero-floating-badge badge-bottom">
              <span className="badge-emoji">✅</span>
              Pedido entregado
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div className="stats-bar">
        <StatCounter value={3200}  suffix="+"  label="Consultoras activas" />
        <StatCounter value={98000} suffix="+"  label="Pedidos procesados" />
        <StatCounter value={25}    suffix="+"  label="Departamentos cubiertos" />
        <StatCounter value={99}    suffix="%"  label="Satisfacción de usuarias" />
      </div>

      {/* ── FEATURES ── */}
      <section className="features-section" id="features">
        <div className="animate-on-scroll">
          <span className="section-eyebrow">¿Qué incluye GELCO?</span>
          <h2 className="section-title">Todo lo que necesitas<br />en un solo lugar</h2>
          <p className="section-subtitle">
            Sin hojas de cálculo, sin papeles, sin dolores de cabeza.
            Tu negocio digitalizado y en control.
          </p>
        </div>

        <div className="features-grid stagger animate-on-scroll">
          <div className="feature-card featured">
            <div className="feature-img-wrap">  
                  <img src="/assets/features/pedidos.jpg" alt="" className="feature-img" onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; } } />
                  <div className="feature-img-placeholder" style={{display:'none'}}></div>
                </div>
            <div className="feature-tag">Más popular</div>
            <div className="feature-title">Gestión de Pedidos</div>
            <div className="feature-desc">
              Registra, actualiza y rastrea cada pedido en tiempo real.
              Tus clientes siempre informados.
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-img-wrap">
                  <img src="/assets/features/ventas.jpeg" alt="" className="feature-img" onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; } } />
                  <div className="feature-img-placeholder" style={{display:'none'}}></div>
                </div>
            <div className="feature-title">Control de Ventas</div>
            <div className="feature-desc">
              Métricas claras de tu rendimiento por campaña, mes y cliente.
              Toma decisiones con datos reales.
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-img-wrap">
                  <img src="/assets/features/clientes.jpg" alt="" className="feature-img" onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; } } />
                  <div className="feature-img-placeholder" style={{display:'none'}}></div>
                </div>
            <div className="feature-title">Gestión de Clientes</div>
            <div className="feature-desc">
              Historial completo, preferencias y contacto de cada cliente
              al alcance de un clic.
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-img-wrap">
                  <img src="/assets/features/catalogo.jpg" alt="" className="feature-img" onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; } } />
                  <div className="feature-img-placeholder" style={{display:'none'}}></div>
                </div>
            <div className="feature-title">Catálogo Digital</div>
            <div className="feature-desc">
              Muestra tus productos con fotos, precios y stock actualizado.
              Comparte con tus clientes fácilmente.
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-img-wrap">
                  <img src="/assets/features/entregas.jpg" alt="" className="feature-img" onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; } } />
                  <div className="feature-img-placeholder" style={{display:'none'}}></div>
                </div>
            <div className="feature-title">Seguimiento de Entregas</div>
            <div className="feature-desc">
              Rutas de reparto, choferes asignados y estado de entrega
              en tiempo real.
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-img-wrap">
                  <img src="/assets/features/capacitacion.jpg" alt="" className="feature-img" onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; } } />
                  <div className="feature-img-placeholder" style={{display:'none'}}></div>
                </div>
            <div className="feature-title">Capacitaciones</div>
            <div className="feature-desc">
              Accede a entrenamientos y materiales para mejorar tus
              técnicas de venta y conocimiento de productos.
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="how-section">
        <div className="animate-on-scroll" style={{ textAlign: 'center' }}>
          <span className="section-eyebrow">Así de simple</span>
          <h2 className="section-title">En 3 pasos empiezas<br />a vender mejor</h2>
        </div>

        <div className="how-steps stagger animate-on-scroll">
          <div className="how-step">
            <div className="step-number s1">1</div>
            <div className="step-title">Crea tu cuenta</div>
            <div className="step-desc">
              Regístrate en minutos. Sin tarjeta de crédito,
              sin burocracia.
            </div>
          </div>
          <div className="how-step">
            <div className="step-number s2">2</div>
            <div className="step-title">Configura tu negocio</div>
            <div className="step-desc">
              Agrega tus clientes, productos y empieza
              a registrar pedidos de inmediato.
            </div>
          </div>
          <div className="how-step">
            <div className="step-number s3">3</div>
            <div className="step-title">Vende y crece</div>
            <div className="step-desc">
              Monitorea tu progreso, alcanza metas
              y sube de nivel campaña a campaña.
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="testimonials-section">
        <div className="animate-on-scroll">
          <span className="section-eyebrow">Lo que dicen nuestras consultoras</span>
          <h2 className="section-title">Historias reales,<br />resultados reales</h2>
        </div>

        <div className="testimonials-grid stagger animate-on-scroll">
          {[
            {
              text: '"Antes perdía horas anotando pedidos en cuadernos. Con GELCO todo lo veo en segundos desde mi celular. Mis ventas subieron 40% en dos campañas."',
              name: 'Carmen A.',
              location: 'Lima Norte · Nivel Oro',
              initials: 'CA',
            },
            {
              text: '"El catálogo digital es increíble. Mis clientes me piden los productos por WhatsApp y yo los registro al instante. Nunca más perdí un pedido."',
              name: 'Magdalena R.',
              location: 'San Juan de Lurigancho · Nivel Plata',
              initials: 'MR',
            },
            {
              text: '"Las capacitaciones me ayudaron a cerrar ventas que antes se me escapaban. Ahora soy consultora Diamante y GELCO fue clave para lograrlo."',
              name: 'Joselyn C.',
              location: 'Callao · Nivel Diamante',
              initials: 'JC',
            },
          ].map((t, i) => (
            <div key={i} className="testimonial-card">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">{t.text}</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">{t.initials}</div>
                <div>
                  <div className="testimonial-name">{t.name}</div>
                  <div className="testimonial-location">{t.location}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section animate-on-scroll">
        <div className="cta-content">
          <div className="cta-eyebrow">¿Lista para el cambio?</div>
          <h2 className="cta-title">
            Tu negocio merece<br />
            herramientas <em>profesionales</em>
          </h2>
          <p className="cta-desc">
            Únete a más de 3,200 consultoras que ya gestionan
            su negocio con GELCO. Empieza hoy, sin costo.
          </p>
        </div>
        <div className="cta-actions">
          <Link to="/register" className="btn-cta-main">
            🚀 Empezar ahora — es gratis
          </Link>
          <span className="cta-note">Sin tarjeta de crédito · Acceso inmediato</span>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="main-footer">
        <div className="footer-top">
          <div>
            <div className="footer-brand">GELCO</div>
            <div className="footer-tagline">
              Ventas por Catálogo Perú — la plataforma de las consultoras modernas.
            </div>
          </div>
          <div className="footer-links-col">
            <div className="footer-col-title">Plataforma</div>
            <a href="#features" className="footer-link">Características</a>
            <a href="#" className="footer-link">Precios</a>
            <a href="#" className="footer-link">Capacitaciones</a>
          </div>
          <div className="footer-links-col">
            <div className="footer-col-title">Soporte</div>
            <a href="#" className="footer-link">Centro de ayuda</a>
            <a href="#" className="footer-link">Contacto</a>
            <a href="#" className="footer-link">WhatsApp</a>
          </div>
          <div className="footer-links-col">
            <div className="footer-col-title">Legal</div>
            <a href="#" className="footer-link">Privacidad</a>
            <a href="#" className="footer-link">Términos de uso</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 GELCO · Todos los derechos reservados</span>
          <span>Hecho con <span className="footer-heart">♥</span> en Perú</span>
        </div>
      </footer>

    </main>
  );
}