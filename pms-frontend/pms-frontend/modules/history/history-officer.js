PMS.requireAuth('officer');

const PAGE_SIZE = 10;
let currentPage = 1;
let totalPages = 1;
let bookings = [];
let activeFilters = {};

function statusClass(status) {
  return 'status-' + (status || '').toLowerCase().replace(/\s+/g, '-');
}

function formatDateTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

function renderPage(errorMessage) {
  const tbody = document.getElementById('history-table-body');
  const noBookings = document.getElementById('no-bookings');
  const pageInfo = document.getElementById('page-info');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');

  tbody.innerHTML = '';

  if (errorMessage || bookings.length === 0) {
    noBookings.textContent = errorMessage || 'No bookings match your search.';
    noBookings.style.display = 'block';
    pageInfo.textContent = '';
    prevBtn.disabled = true;
    nextBtn.disabled = true;
    return;
  }
  noBookings.style.display = 'none';

  bookings.forEach(b => {
    const tr = document.createElement('tr');

    const cells = [
      b.customerId,
      b.bookingId,
      formatDateTime(b.createdAt),
      b.receiver ? b.receiver.name : '',
      b.receiver ? b.receiver.address : '',
      '₹' + Number(b.cost || 0).toFixed(2)
    ];

    cells.forEach(text => {
      const td = document.createElement('td');
      td.textContent = text;
      tr.appendChild(td);
    });

    const statusTd = document.createElement('td');
    const badge = document.createElement('span');
    badge.className = 'status-badge ' + statusClass(b.status);
    badge.textContent = b.status;
    statusTd.appendChild(badge);
    tr.appendChild(statusTd);

    tbody.appendChild(tr);
  });

  pageInfo.textContent = 'Page ' + currentPage + ' of ' + totalPages;
  prevBtn.disabled = currentPage <= 1;
  nextBtn.disabled = currentPage >= totalPages;
}

async function loadPage(page) {
  try {
    const res = await PMS_API.officerSearch({ ...activeFilters, page, size: PAGE_SIZE });
    bookings = res.content;
    currentPage = res.page;
    totalPages = Math.max(res.totalPages, 1);
    renderPage();
  } catch (err) {
    bookings = [];
    renderPage(err.errors && err.errors.dateTo ? err.errors.dateTo : err.message);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  PMS.renderWelcome();

  loadPage(1);

  document.getElementById('filter-form').addEventListener('submit', (e) => {
    e.preventDefault();
    activeFilters = {
      customerId: document.getElementById('filterCustomerId').value.trim(),
      dateFrom: document.getElementById('dateFrom').value,
      dateTo: document.getElementById('dateTo').value
    };
    loadPage(1);
  });

  document.getElementById('prev-btn').addEventListener('click', () => {
    if (currentPage > 1) loadPage(currentPage - 1);
  });

  document.getElementById('next-btn').addEventListener('click', () => {
    if (currentPage < totalPages) loadPage(currentPage + 1);
  });
});
