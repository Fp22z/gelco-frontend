/**
 * @typedef {Object} LoginResponse
 * @property {string} token - JWT token
 */

/**
 * Create a login response
 * @param {string} token
 * @returns {LoginResponse}
 */
export const createLoginResponse = (token) => ({
  token
});
