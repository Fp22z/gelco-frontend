/**
 * @typedef {Object} LoginRequest
 * @property {string} email - User email
 * @property {string} password - User password
 */

/**
 * Create a login request
 * @param {string} email
 * @param {string} password
 * @returns {LoginRequest}
 */
export const createLoginRequest = (email, password) => ({
  email,
  password
});
