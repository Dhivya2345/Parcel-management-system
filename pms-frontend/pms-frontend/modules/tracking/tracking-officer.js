// ---- tracking-officer.js page logic ----

PMS.requireAuth('officer');

function statusClass(status) {
  return 'status-' + (status || '').toLowerCase().replace(/\s+/g, '-');
}

function formatDateTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

function renderTable(bookings, errorMessage) {
  const tbody = document.getElementById('tracking-table-body');
  const noResults = document.getElementById('no-results');

  tbody.innerHTML = '';

  if (errorMessage) {
    noResults.textContent = errorMessage;
    noResults.style.display = 'block';
    return;
  }

  if (bookings.length === 0) {
    noResults.textContent = 'No bookings match your search.';
    noResults.style.display = 'block';
    return;
  }
  noResults.style.display = 'none';

  bookings.forEach(b => {
    const tr = document.createElement('tr');

    const tdBookingId = document.createElement('td');
    tdBookingId.textContent = b.bookingId;

    const tdCustomerId = document.createElement('td');
    tdCustomerId.textContent = b.customerId;

    const tdReceiver = document.createElement('td');
    tdReceiver.textContent = b.receiver ? b.receiver.name : '';

    const tdStatus = document.createElement('td');
    const badge = document.createElement('span');
    badge.className = 'status-badge ' + statusClass(b.status);
    badge.textContent = b.status;
    tdStatus.appendChild(badge);

    const tdDate = document.createElement('td');
    tdDate.textContent = formatDateTime(b.createdAt);

    tr.appendChild(tdBookingId);
    tr.appendChild(tdCustomerId);
    tr.appendChild(tdReceiver);
    tr.appendChild(tdStatus);
    tr.appendChild(tdDate);

    tbody.appendChild(tr);
  });
}

// The page has no pagination controls, so load every page of results (100 per request).
async function loadAll(filters) {
  const all = [];
  let page = 1;
  let totalPages = 1;
  do {
    const res = await PMS_API.officerSearch({ ...filters, page, size: 100 });
    all.push(...res.content);
    totalPages = res.totalPages;
    page += 1;
  } while (page <= totalPages && page <= 50);
  return all;
}

async function search(filters) {
  try {
    renderTable(await loadAll(filters));
  } catch (err) {
    renderTable([], err.message);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  PMS.renderWelcome();

  search({});

  const form = document.getElementById('tracking-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const customerId = document.getElementById('customerId').value.trim();
    const bookingId = document.getElementById('bookingId').value.trim();

    search({ customerId, bookingId });
  });
});
