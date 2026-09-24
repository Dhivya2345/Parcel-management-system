// ---- invoice.js page logic ----

// Invoice is viewable by either role; require any logged-in session.
const session = PMS.requireAuth();

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function formatDateTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

document.addEventListener('DOMContentLoaded', async () => {
  PMS.renderWelcome();

  // Back link goes to the home page matching the logged-in user's role
  const homeHref = session && session.role === 'officer'
    ? '../home/officer-home.html'
    : '../home/customer-home.html';
  const backLink = document.getElementById('back-link');
  const backLinkNotFound = document.getElementById('back-link-notfound');
  if (backLink) backLink.href = homeHref;
  if (backLinkNotFound) backLinkNotFound.href = homeHref;

  const invoiceView = document.getElementById('invoice-view');
  const notFound = document.getElementById('not-found');

  const bookingId = new URLSearchParams(window.location.search).get('bookingId');

  let booking = null;
  if (bookingId) {
    try {
      booking = await PMS_API.getBooking(bookingId);
    } catch (err) {
      booking = null;
    }
  }

  if (!booking) {
    invoiceView.style.display = 'none';
    notFound.style.display = 'block';
    return;
  }

  setText('inv-bookingId', booking.bookingId);
  setText('inv-receiverName', booking.receiver ? booking.receiver.name : '');
  setText('inv-receiverAddress', booking.receiver ? booking.receiver.address : '');
  setText('inv-receiverPin', booking.receiver ? booking.receiver.pin : '');
  setText('inv-receiverMobile', booking.receiver ? booking.receiver.contact : '');

  const weightG = booking.parcel && typeof booking.parcel.weight === 'number'
    ? (booking.parcel.weight * 1000).toFixed(0)
    : '';
  setText('inv-parcelWeight', weightG);
  setText('inv-parcelContents', booking.parcel ? booking.parcel.contents : '');
  setText('inv-deliveryType', booking.shipping ? booking.shipping.speed : '');
  setText('inv-packingPreference', booking.shipping ? booking.shipping.packaging : '');
  setText('inv-pickupTime', booking.schedule ? formatDateTime(booking.schedule.pickupTime) : '');
  setText('inv-dropoffTime', booking.schedule ? formatDateTime(booking.schedule.dropoffTime) : '');
  setText('inv-serviceCost', '₹' + Number(booking.cost || 0).toFixed(2));
  setText('inv-paymentTime', booking.payment ? formatDateTime(booking.payment.time) : '');

  document.getElementById('print-btn').addEventListener('click', () => {
    window.print();
  });
});
