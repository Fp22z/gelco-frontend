import { environment } from '../environments/environment';
import { getToken, saveToken, logout } from './authService';

// ── Spinner global ──────────────────────────────────────────────
let activeRequests = 0;

const showSpinner = () => {
  activeRequests++;
  document.getElementById('global-spinner')?.classList.add('visible');
};

const hideSpinner = () => {
  activeRequests = Math.max(0, activeRequests - 1);
  if (activeRequests === 0) {
    document.getElementById('global-spinner')?.classList.remove('visible');
  }
};

// ── Refresh token ───────────────────────────────────────────────
let isRefreshing = false;
let pendingQueue = [];

const processPendingQueue = (error, token = null) => {
  pendingQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token)
  );
  pendingQueue = [];
};

const doRefresh = async () => {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) throw new Error('No refresh token');

  const res = await fetch(`${environment.url}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });

  if (!res.ok) throw new Error('Refresh failed');
  const data = await res.json();

  saveToken(data.token);
  localStorage.setItem('refresh_token', data.refreshToken);
  return data.token;
};

// ── Cliente HTTP principal ──────────────────────────────────────
const request = async (method, path, body = null, isFormData = false) => {
  const url = path.startsWith('http') ? path : `${environment.url}${path}`;

  const buildHeaders = (token) => {
    const h = { Authorization: `Bearer ${token}` };
    if (!isFormData) h['Content-Type'] = 'application/json';
    return h;
  };

  const execute = async (token) => {
    const options = { method, headers: buildHeaders(token) };
    if (body) options.body = isFormData ? body : JSON.stringify(body);
    return fetch(url, options);
  };

  showSpinner();
  try {
    let res = await execute(getToken());

    if (res.status === 401 || res.status === 403) {
      if (isRefreshing) {
        const newToken = await new Promise((resolve, reject) =>
          pendingQueue.push({ resolve, reject })
        );
        res = await execute(newToken);
      } else {
        isRefreshing = true;
        try {
          const newToken = await doRefresh();
          processPendingQueue(null, newToken);
          res = await execute(newToken);
        } catch (err) {
          processPendingQueue(err);
          logout();
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
          throw err;
        } finally {
          isRefreshing = false;
        }
      }
    }

    return res;
  } finally {
    hideSpinner();
  }
};

export const httpClient = {
  get:    (path)               => request('GET',    path),
  post:   (path, body)         => request('POST',   path, body),
  put:    (path, body)         => request('PUT',    path, body),
  delete: (path)               => request('DELETE', path),
  postForm: (path, formData)   => request('POST',   path, formData, true),
  putForm:  (path, formData)   => request('PUT',    path, formData, true),
};