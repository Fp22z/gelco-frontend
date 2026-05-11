/**
 * @typedef {Object} RegisterRequest
 * @property {string} email - User email
 * @property {string} password - User password
 * @property {string} nombre - User name
 */

/**
 * Create a register request
 * @param {string} email
 * @param {string} password
 * @param {string} nombre
 * @returns {RegisterRequest}
 */
export const createRegisterRequest = (email, password, nombre) => ({
  email,
  password,
  nombre
});
