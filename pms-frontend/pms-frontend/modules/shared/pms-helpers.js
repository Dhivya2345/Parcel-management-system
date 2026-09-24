// pms-helpers.js — session helpers + REST client for the Parcel Management System backend.
// Backend URL: change PMS_API_BASE below (or set window.PMS_API_BASE before this script loads).
const PMS_API_BASE = window.PMS_API_BASE || 'http://localhost:8080/api';

const PMS = {
  // Session (who is logged in) + JWT token, both kept per browser tab
  setSession: (s) => sessionStorage.setItem('pms_session', JSON.stringify(s)),
  getSession: () => JSON.parse(sessionStorage.getItem('pms_session') || 'null'),
  clearSession: () => {
    sessionStorage.removeItem('pms_session');
    sessionStorage.removeItem('pms_token');
  },

  // Auth guard — call at top of every protected page
  requireAuth: (role) => {
    const s = PMS.getSession();
    if (!s || !sessionStorage.getItem('pms_token') || (role && s.role !== role)) {
      window.location.replace('../login/login.html');
      return null;
    }
    return s;
  },

  // Render welcome + wire logout button
  renderWelcome: () => {
    const s = PMS.getSession();
    const el = document.getElementById('welcome-user');
    if (el && s) el.textContent = 'Welcome ' + s.name;
    const btn = document.getElementById('logout-btn');
    if (btn) btn.addEventListener('click', () => {
      PMS.clearSession();
      window.location.href = '../login/login.html';
    });
  },

  // Inline field error display
  showError: (inputId, msg) => {
    const e = document.getElementById(inputId + '-error');
    if (e) e.textContent = msg;
    const i = document.getElementById(inputId);
    if (i) i.classList.add('invalid');
  },
  clearError: (inputId) => {
    const e = document.getElementById(inputId + '-error');
    if (e) e.textContent = '';
    const i = document.getElementById(inputId);
    if (i) i.classList.remove('invalid');
  },

  // Show field errors returned by the backend. pathToId maps e.g. 'receiver.pin' -> 'receiverPin'
  applyApiErrors: (err, pathToId) => {
    Object.entries((err && err.errors) || {}).forEach(([path, msg]) => {
      PMS.showError((pathToId && pathToId[path]) || path, msg);
    });
  }
};

const PMS_API = (() => {
  async function request(path, { method = 'GET', body } = {}) {
    const headers = { 'Content-Type': 'application/json' };
    const token = sessionStorage.getItem('pms_token');
    if (token) headers['Authorization'] = 'Bearer ' + token;

    let res;
    try {
      res = await fetch(PMS_API_BASE + path, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined
      });
    } catch (e) {
      const err = new Error('Cannot reach the server. Please make sure the backend is running.');
      err.status = 0;
      err.errors = {};
      throw err;
    }

    let data = null;
    try { data = await res.json(); } catch (_) { /* empty body */ }

    // Expired / invalid token on a protected call -> back to login
    if (res.status === 401 && token) {
      PMS.clearSession();
      window.location.replace('../login/login.html');
    }

    if (!res.ok) {
      const err = new Error((data && data.message) || 'Request failed (' + res.status + ').');
      err.status = res.status;
      err.errors = (data && data.errors) || {};
      throw err;
    }
    return data;
  }

  const qs = (params) => {
    const p = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') p.append(k, v);
    });
    const s = p.toString();
    return s ? '?' + s : '';
  };
  const enc = encodeURIComponent;

  return {
    // auth
    async login(userId, password) {
      const r = await request('/auth/login', { method: 'POST', body: { userId, password } });
      sessionStorage.setItem('pms_token', r.token);
      PMS.setSession({ userId: r.userId, name: r.name, role: r.role });
      return r;
    },
    register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
    me: () => request('/users/me'),

    // customer
    createBooking: (payload) => request('/bookings', { method: 'POST', body: payload }),
    pay: (bookingId, payload) => request('/bookings/' + enc(bookingId) + '/payment', { method: 'POST', body: payload }),
    myBookings: (page = 1, size = 10) => request('/bookings/my' + qs({ page, size })),
    track: (bookingId) => request('/bookings/track/' + enc(bookingId)),
    getBooking: (bookingId) => request('/bookings/' + enc(bookingId)),

    // officer
    officerSearch: (filters = {}) => request('/officer/bookings' + qs(filters)),
    updateStatus: (bookingId, status) =>
      request('/officer/bookings/' + enc(bookingId) + '/status', { method: 'PATCH', body: { status } })
  };
})();
