/**
 * @typedef {Object} Categoria
 * @property {number} id
 * @property {string} nombre
 */

/**
 * @typedef {Object} ProductoResponse
 * @property {number} id
 * @property {string} nombre
 * @property {string} descripcion
 * @property {number} precio
 * @property {number} stock
 * @property {boolean} activo
 * @property {Categoria} categoria
 * @property {string} updatedAt
 */

/**
 * Create a producto response
 * @param {number} id
 * @param {string} nombre
 * @param {string} descripcion
 * @param {number} precio
 * @param {number} stock
 * @param {boolean} activo
 * @param {Categoria} categoria
 * @param {string} updatedAt
 * @returns {ProductoResponse}
 */
export const createProductoResponse = (id, nombre, descripcion, precio, stock, activo, categoria, updatedAt) => ({
  id,
  nombre,
  descripcion,
  precio,
  stock,
  activo,
  categoria,
  updatedAt
});
