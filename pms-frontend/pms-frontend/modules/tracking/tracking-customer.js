// ---- tracking-customer.js page logic ----

PMS.requireAuth('customer');

function statusClass(status) {
  return 'status-' + (status || '').toLowerCase().replace(/\s+/g, '-');
}

function formatDateTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

document.addEventListener('DOMContentLoaded', () => {
  PMS.renderWelcome();

  const form = document.getElementById('tracking-form');
  const resultPanel = document.getElementById('tracking-result');
  const notFoundPanel = document.getElementById('tracking-not-found');
  const searchBtn = document.getElementById('search-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    PMS.clearError('bookingId');
    resultPanel.style.display = 'none';
    notFoundPanel.style.display = 'none';

    const bookingId = document.getElementById('bookingId').value.trim();

    if (!/^\d{12}$/.test(bookingId)) {
      PMS.showError('bookingId', 'Booking ID must be exactly 12 digits.');
      return;
    }

    searchBtn.disabled = true;
    try {
      const result = await PMS_API.track(bookingId);

      const statusEl = document.getElementById('result-status');
      statusEl.textContent = result.status;
      statusEl.className = 'status-badge ' + statusClass(result.status);

      document.getElementById('result-receiverName').textContent = result.receiverName || '';
      document.getElementById('result-bookingDate').textContent = formatDateTime(result.bookingDate);

      resultPanel.style.display = 'block';
    } catch (err) {
      if (err.status === 404) {
        notFoundPanel.style.display = 'block';
      } else {
        PMS.showError('bookingId', err.message);
      }
    } finally {
      searchBtn.disabled = false;
    }
  });
});
