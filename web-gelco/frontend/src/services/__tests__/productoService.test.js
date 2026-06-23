import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ─── Mock del environment y authService ──────────────────────────────────────
vi.mock('../../environments/environment', () => ({
  environment: { url: 'http://localhost:8080/api/v1' }
}));

vi.mock('../authService', () => ({
  getToken: () => 'fake-jwt-token'
}));

// ─── Imports del módulo bajo prueba ──────────────────────────────────────────
import { crearProducto, actualizarProducto, eliminarProducto } from '../productoService';
import { getInventarioResumen, getSugerenciasReposicion, getTodosProductos } from '../inventarioService';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const mockFetch = (status, body) => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body
  });
};

beforeEach(() => { vi.clearAllMocks(); });
afterEach(() => { vi.restoreAllMocks(); });

// ═════════════════════════════════════════════════════════════════════════════
// 1. CREAR PRODUCTO
// ═════════════════════════════════════════════════════════════════════════════
describe('crearProducto', () => {

  it('CP-FE-CR-01 | Válido: envía POST con URLSearchParams y retorna el producto creado', async () => {
    const productoCreado = { id: 1, nombre: 'Crema Hidratante', precio: 25.50, stock: 10, activo: true };
    mockFetch(200, productoCreado);

    const result = await crearProducto({ nombre: 'Crema Hidratante', precio: 25.50, stock: 10 });

    expect(fetch).toHaveBeenCalledOnce();
    const [url, opts] = fetch.mock.calls[0];
    expect(url).toContain('/productos');
    expect(opts.method).toBe('POST');
    expect(opts.headers['Content-Type']).toBe('application/x-www-form-urlencoded');
    expect(opts.headers['Authorization']).toBe('Bearer fake-jwt-token');
    expect(result).toEqual(productoCreado);
  });

  it('CP-FE-CR-02 | Válido: stock omitido se envía como 0 por defecto', async () => {
    mockFetch(200, { id: 2, nombre: 'Sérum', stock: 0 });

    await crearProducto({ nombre: 'Sérum', precio: 45.00 });

    const body = fetch.mock.calls[0][1].body.toString();
    expect(body).toContain('stock=0');
  });

  it('CP-FE-CR-03 | Válido: con categoriaId incluye el parámetro en el body', async () => {
    mockFetch(200, { id: 3, nombre: 'Labial', categoriaId: 5 });

    await crearProducto({ nombre: 'Labial', precio: 12.00, stock: 5, categoriaId: 5 });

    const body = fetch.mock.calls[0][1].body.toString();
    expect(body).toContain('categoriaId=5');
  });

  it('CP-FE-CR-04 | Inválido: respuesta 400 del servidor lanza Error con mensaje', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ message: 'Nombre es obligatorio' })
    });

    await expect(
      crearProducto({ nombre: '', precio: 0 })
    ).rejects.toThrow('Nombre es obligatorio');
  });

  it('CP-FE-CR-05 | Inválido: error de red (fetch rechaza) propaga la excepción', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network Error'));

    await expect(
      crearProducto({ nombre: 'Producto', precio: 10 })
    ).rejects.toThrow('Network Error');
  });

  it('CP-FE-CR-06 | Límite: precio = 0 se envía en el body', async () => {
    mockFetch(200, { id: 4, nombre: 'Muestra', precio: 0 });

    await crearProducto({ nombre: 'Muestra', precio: 0, stock: 1 });

    const body = fetch.mock.calls[0][1].body.toString();
    expect(body).toContain('precio=0');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 2. ACTUALIZAR PRODUCTO / REPONER STOCK
// ═════════════════════════════════════════════════════════════════════════════
describe('actualizarProducto', () => {

  it('CP-FE-ST-01 | Válido: reponer stock envía PUT al endpoint correcto', async () => {
    const productoActualizado = { id: 1, nombre: 'Crema', stock: 20 };
    mockFetch(200, productoActualizado);

    const result = await actualizarProducto(1, { stock: 20 });

    const [url, opts] = fetch.mock.calls[0];
    expect(url).toContain('/productos/1');
    expect(opts.method).toBe('PUT');
    expect(opts.body.toString()).toContain('stock=20');
    expect(result.stock).toBe(20);
  });

  it('CP-FE-ST-02 | Límite: actualizar stock a 0 (agotar producto)', async () => {
    mockFetch(200, { id: 1, stock: 0 });

    await actualizarProducto(1, { stock: 0 });

    const body = fetch.mock.calls[0][1].body.toString();
    expect(body).toContain('stock=0');
  });

  it('CP-FE-ST-03 | Límite: actualizar stock al umbral exacto (stock = 5)', async () => {
    mockFetch(200, { id: 1, stock: 5 });

    await actualizarProducto(1, { stock: 5 });

    const body = fetch.mock.calls[0][1].body.toString();
    expect(body).toContain('stock=5');
  });

  it('CP-FE-ST-04 | Válido: actualizar nombre y precio junto con stock', async () => {
    mockFetch(200, { id: 1, nombre: 'Crema V2', precio: 30.00, stock: 15 });

    await actualizarProducto(1, { nombre: 'Crema V2', precio: 30.00, stock: 15 });

    const body = fetch.mock.calls[0][1].body.toString();
    expect(body).toContain('nombre=Crema+V2');
    expect(body).toContain('precio=30');
    expect(body).toContain('stock=15');
  });

  it('CP-FE-ST-05 | Inválido: respuesta 404 (producto no encontrado) lanza Error', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ message: 'Producto no encontrado' })
    });

    await expect(
      actualizarProducto(999, { stock: 10 })
    ).rejects.toThrow('Producto no encontrado');
  });

  it('CP-FE-ST-06 | Válido: desactivar producto envía activo=false', async () => {
    mockFetch(200, { id: 1, activo: false });

    await actualizarProducto(1, { activo: false });

    const body = fetch.mock.calls[0][1].body.toString();
    expect(body).toContain('activo=false');
  });

  it('CP-FE-ST-07 | Límite: actualizar sin parámetros opcionales no falla', async () => {
    mockFetch(200, { id: 1 });

    await expect(actualizarProducto(1, {})).resolves.toBeDefined();
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 3. ELIMINAR PRODUCTO
// ═════════════════════════════════════════════════════════════════════════════
describe('eliminarProducto', () => {

  it('CP-FE-EL-01 | Válido: eliminar producto existente retorna { success: true }', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({}) });

    const result = await eliminarProducto(1);

    const [url, opts] = fetch.mock.calls[0];
    expect(url).toContain('/productos/1');
    expect(opts.method).toBe('DELETE');
    expect(result).toEqual({ success: true });
  });

  it('CP-FE-EL-02 | Inválido: eliminar producto inexistente lanza Error', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ message: 'Producto no encontrado' })
    });

    await expect(eliminarProducto(999)).rejects.toThrow('Producto no encontrado');
  });

  it('CP-FE-EL-03 | Válido: incluye token JWT en el header Authorization', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });

    await eliminarProducto(1);

    expect(fetch.mock.calls[0][1].headers['Authorization']).toBe('Bearer fake-jwt-token');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 4. SERVICIO DE INVENTARIO – Sugerencias y Resumen
// ═════════════════════════════════════════════════════════════════════════════
describe('inventarioService', () => {

  describe('getSugerenciasReposicion', () => {
    it('CP-FE-SG-01 | Válido: retorna lista de sugerencias del endpoint correcto', async () => {
      const sugerencias = [
        { productoId: 1, nombre: 'Crema', stockActual: 2, ventasTotales: 6, cantidadSugerida: 18, precio: 25.50 }
      ];
      mockFetch(200, sugerencias);

      const result = await getSugerenciasReposicion();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/productos/renovacion/sugerencias'),
        expect.any(Object)
      );
      expect(result).toHaveLength(1);
      expect(result[0].cantidadSugerida).toBe(18);
    });

    it('CP-FE-SG-02 | Válido: lista vacía cuando no hay productos con stock bajo', async () => {
      mockFetch(200, []);

      const result = await getSugerenciasReposicion();

      expect(result).toEqual([]);
    });

    it('CP-FE-SG-03 | Inválido: error 401 (no autenticado) lanza excepción', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false, status: 401, json: async () => ({ message: 'No autorizado' })
      });

      await expect(getSugerenciasReposicion()).rejects.toThrow();
    });
  });

  describe('getInventarioResumen', () => {
    it('CP-FE-KPI-01 | Válido: retorna objeto con los 4 KPIs del inventario', async () => {
      const resumen = { totalProductos: 10, productosActivos: 8, productosAgotados: 1, productosStockBajo: 3 };
      mockFetch(200, resumen);

      const result = await getInventarioResumen();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/productos/inventario/resumen'),
        expect.any(Object)
      );
      expect(result.totalProductos).toBe(10);
      expect(result.productosStockBajo).toBe(3);
    });

    it('CP-FE-KPI-02 | Límite: todos los KPIs en 0 cuando BD está vacía', async () => {
      mockFetch(200, { totalProductos: 0, productosActivos: 0, productosAgotados: 0, productosStockBajo: 0 });

      const result = await getInventarioResumen();

      expect(result.totalProductos).toBe(0);
      expect(result.productosStockBajo).toBe(0);
    });

    it('CP-FE-KPI-03 | Inválido: error de servidor lanza excepción con mensaje', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false, status: 500, json: async () => ({ message: 'Error al obtener resumen de inventario' })
      });

      await expect(getInventarioResumen()).rejects.toThrow('Error al obtener resumen de inventario');
    });
  });

  describe('getTodosProductos', () => {
    it('CP-FE-TP-01 | Válido: retorna lista completa de productos', async () => {
      const productos = [
        { id: 1, nombre: 'Crema', stock: 10, activo: true },
        { id: 2, nombre: 'Sérum', stock: 0, activo: true }
      ];
      mockFetch(200, productos);

      const result = await getTodosProductos();

      expect(result).toHaveLength(2);
      expect(result[0].nombre).toBe('Crema');
    });

    it('CP-FE-TP-02 | Límite: lista vacía cuando no hay productos', async () => {
      mockFetch(200, []);

      const result = await getTodosProductos();

      expect(result).toEqual([]);
    });
  });
});