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

let currentBooking = null;

function showBooking(booking) {
  currentBooking = booking;

  document.getElementById('det-bookingId').textContent = booking.bookingId;
  document.getElementById('det-customerId').textContent = booking.customerId;
  document.getElementById('det-receiverName').textContent = booking.receiver ? booking.receiver.name : '';
  document.getElementById('det-receiverAddress').textContent = booking.receiver ? booking.receiver.address : '';
  document.getElementById('det-bookingDate').textContent = formatDateTime(booking.createdAt);

  const statusBadge = document.getElementById('det-status');
  statusBadge.textContent = booking.status;
  statusBadge.className = 'status-badge ' + statusClass(booking.status);

  document.getElementById('booking-details').style.display = 'block';
  document.getElementById('delivery-update-card').style.display = 'block';

  document.getElementById('newStatus').value = '';
  PMS.clearError('newStatus');
  document.getElementById('update-success').style.display = 'none';
  document.getElementById('update-success').textContent = '';
}

document.addEventListener('DOMContentLoaded', () => {
  PMS.renderWelcome();

  const searchBtn = document.getElementById('search-btn');
  const notFoundMsg = document.getElementById('search-not-found');
  const detailsCard = document.getElementById('booking-details');
  const updateCard = document.getElementById('delivery-update-card');

  searchBtn.addEventListener('click', async () => {
    notFoundMsg.style.display = 'none';
    detailsCard.style.display = 'none';
    updateCard.style.display = 'none';
    currentBooking = null;

    const bookingId = document.getElementById('searchBookingId').value.trim();
    if (!bookingId) {
      notFoundMsg.textContent = 'Please enter a Booking ID to search.';
      notFoundMsg.style.display = 'block';
      return;
    }

    searchBtn.disabled = true;
    try {
      const booking = await PMS_API.getBooking(bookingId);
      showBooking(booking);
    } catch (err) {
      notFoundMsg.textContent = err.status === 404
        ? 'No booking found for that Booking ID.'
        : err.message;
      notFoundMsg.style.display = 'block';
    } finally {
      searchBtn.disabled = false;
    }
  });

  const form = document.getElementById('delivery-form');
  const updateBtn = document.getElementById('update-status-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    PMS.clearError('newStatus');
    document.getElementById('update-success').style.display = 'none';

    if (!currentBooking) return;

    const newStatus = document.getElementById('newStatus').value;
    const allowed = ['Picked up', 'In Transit', 'Delivered', 'Returned'];

    if (!allowed.includes(newStatus)) {
      PMS.showError('newStatus', 'Please select a valid status.');
      return;
    }

    updateBtn.disabled = true;
    try {
      currentBooking = await PMS_API.updateStatus(currentBooking.bookingId, newStatus);

      const statusBadge = document.getElementById('det-status');
      statusBadge.textContent = currentBooking.status;
      statusBadge.className = 'status-badge ' + statusClass(currentBooking.status);

      const successMsg = document.getElementById('update-success');
      successMsg.textContent = 'Status updated to "' + newStatus + '" for Booking ID ' + currentBooking.bookingId + '.';
      successMsg.style.display = 'block';
    } catch (err) {
      PMS.showError('newStatus', (err.errors && err.errors.status) || err.message);
    } finally {
      updateBtn.disabled = false;
    }
  });
});
