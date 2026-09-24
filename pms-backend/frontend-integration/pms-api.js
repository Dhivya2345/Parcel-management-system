// pms-api.js — REST client that replaces the localStorage data layer for bookings/users.
// Load AFTER pms-helpers.js:  <script src="../shared/pms-helpers.js"></script>
//                             <script src="../shared/pms-api.js"></script>
// If the frontend is served by Spring Boot itself (src/main/resources/static), use BASE = '/api'.

const PMS_API = (() => {
  const BASE = window.PMS_API_BASE || 'http://localhost:8080/api';
  const TOKEN_KEY = 'pms_token';

  async function request(path, { method = 'GET', body } = {}) {
    const headers = { 'Content-Type': 'application/json' };
    const token = sessionStorage.getItem(TOKEN_KEY);
    if (token) headers['Authorization'] = 'Bearer ' + token;

    const res = await fetch(BASE + path, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined
    });

    let data = null;
    try { data = await res.json(); } catch (_) { /* empty body */ }

    // Expired / invalid token on a protected call -> back to login
    if (res.status === 401 && token) {
      sessionStorage.removeItem(TOKEN_KEY);
      PMS.clearSession();
      window.location.replace('../login/login.html');
    }

    if (!res.ok) {
      const err = new Error((data && data.message) || 'Request failed (' + res.status + ')');
      err.status = res.status;
      err.errors = (data && data.errors) || {};   // e.g. { "receiver.pin": "Pin code must be exactly 6 digits." }
      throw err;
    }
    return data;
  }

  const qs = (params) => {
    const p = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') p.append(k, v); });
    const s = p.toString();
    return s ? '?' + s : '';
  };

  return {
    // ---- auth ----
    async login(userId, password) {
      const r = await request('/auth/login', { method: 'POST', body: { userId, password } });
      sessionStorage.setItem(TOKEN_KEY, r.token);
      PMS.setSession({ userId: r.userId, name: r.name, role: r.role });   // same shape the pages already expect
      return r;
    },
    logout() { sessionStorage.removeItem(TOKEN_KEY); PMS.clearSession(); },
    register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
    me: () => request('/users/me'),

    // ---- customer ----
    createBooking: (payload) => request('/bookings', { method: 'POST', body: payload }),
    pay: (bookingId, payload) => request('/bookings/' + encodeURIComponent(bookingId) + '/payment', { method: 'POST', body: payload }),
    myBookings: (page = 1, size = 10) => request('/bookings/my' + qs({ page, size })),
    track: (bookingId) => request('/bookings/track/' + encodeURIComponent(bookingId)),
    getBooking: (bookingId) => request('/bookings/' + encodeURIComponent(bookingId)),

    // ---- officer ----
    officerSearch: (filters = {}) => request('/officer/bookings' + qs(filters)),   // customerId, bookingId, dateFrom, dateTo, page, size
    updateStatus: (bookingId, status) =>
      request('/officer/bookings/' + encodeURIComponent(bookingId) + '/status', { method: 'PATCH', body: { status } })
  };
})();
