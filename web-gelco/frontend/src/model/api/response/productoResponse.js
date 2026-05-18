/**
 * @typedef {Object} ProductoResponse
 * @property {number} id
 * @property {string} nombre
 * @property {string} descripcion
 * @property {number} precio
 * @property {number} stock
 * @property {boolean} activo
 * @property {number} categoriaId
 * @property {string} categoriaNombre
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
 * @param {number} categoriaId
 * @param {string} categoriaNombre
 * @param {string} updatedAt
 * @returns {ProductoResponse}
 */
export const createProductoResponse = (id, nombre, descripcion, precio, stock, activo, categoriaId, categoriaNombre, updatedAt) => ({
  id,
  nombre,
  descripcion,
  precio,
  stock,
  activo,
  categoriaId,
  categoriaNombre,
  updatedAt
});