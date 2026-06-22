export const environment = {
  production: import.meta.env.PROD,
  url: import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'
};
