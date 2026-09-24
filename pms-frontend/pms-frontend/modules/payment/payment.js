// ---- payment.js page logic ----

const session = PMS.requireAuth('customer');

const FIELD_IDS = ['modeOfPayment', 'cardNumber', 'cardHolder', 'expiry', 'cvv'];

function showFormError(message) {
  const el = document.getElementById('form-error');
  if (!el) return;
  if (message) {
    el.textContent = message;
    el.style.display = 'block';
  } else {
    el.textContent = '';
    el.style.display = 'none';
  }
}

function isValidCardNumber(value) {
  return /^\d{16}$/.test((value || '').trim());
}

function isValidCardHolder(value) {
  return (value || '').trim().length > 0;
}

function isValidExpiry(value) {
  const v = (value || '').trim();
  const match = /^(\d{2})\/(\d{2})$/.exec(v);
  if (!match) return false;
  const month = parseInt(match[1], 10);
  const year = parseInt(match[2], 10);
  if (month < 1 || month > 12) return false;

  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;

  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;
  return true;
}

function isValidCvv(value) {
  return /^\d{3}$/.test((value || '').trim());
}

document.addEventListener('DOMContentLoaded', async () => {
  PMS.renderWelcome();

  const billSection = document.getElementById('payment-form');
  const cardForm = document.getElementById('card-form');
  const successSection = document.getElementById('payment-success');

  // Auto-format expiry as MM/YY
  const expiryInput = document.getElementById('expiry');
  expiryInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.substring(0, 4);
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2);
    }
    e.target.value = value;
  });

  // The booking page redirects here with ?bookingId=...
  const bookingId = new URLSearchParams(window.location.search).get('bookingId');

  function hideAll() {
    billSection.style.display = 'none';
    cardForm.style.display = 'none';
  }

  if (!bookingId) {
    showFormError('No pending booking found. Please start a new booking.');
    hideAll();
    return;
  }

  let booking;
  try {
    booking = await PMS_API.getBooking(bookingId);
  } catch (err) {
    showFormError(err.status === 404
      ? 'No pending booking found. Please start a new booking.'
      : err.message);
    hideAll();
    return;
  }

  if (booking.payment && booking.payment.status === 'Successful') {
    showFormError('This booking has already been paid.');
    hideAll();
    return;
  }

  document.getElementById('bill-amount').textContent = '₹' + Number(booking.cost).toFixed(2);

  document.getElementById('pay-now-btn').addEventListener('click', () => {
    PMS.clearError('modeOfPayment');
    showFormError('');

    const modeOfPayment = document.getElementById('modeOfPayment').value;
    if (!modeOfPayment) {
      PMS.showError('modeOfPayment', 'Please select a mode of payment.');
      return;
    }

    document.getElementById('card-title-display').textContent = modeOfPayment + ' Card';

    billSection.style.display = 'none';
    cardForm.style.display = 'block';
  });

  const payBtn = document.getElementById('make-payment-btn');

  cardForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    showFormError('');
    ['cardNumber', 'cardHolder', 'expiry', 'cvv'].forEach(id => PMS.clearError(id));

    const cardNumber = document.getElementById('cardNumber').value.trim();
    const cardHolder = document.getElementById('cardHolder').value.trim();
    const expiry = document.getElementById('expiry').value.trim();
    const cvv = document.getElementById('cvv').value.trim();

    let valid = true;

    if (!isValidCardNumber(cardNumber)) {
      PMS.showError('cardNumber', 'Card number must be exactly 16 digits.');
      valid = false;
    }
    if (!isValidCardHolder(cardHolder)) {
      PMS.showError('cardHolder', 'Card holder name is required.');
      valid = false;
    }
    if (!isValidExpiry(expiry)) {
      PMS.showError('expiry', 'Enter a valid expiry in MM/YY format that is not in the past.');
      valid = false;
    }
    if (!isValidCvv(cvv)) {
      PMS.showError('cvv', 'CVV must be exactly 3 digits.');
      valid = false;
    }

    if (!valid) {
      showFormError('Please fix the highlighted fields and try again.');
      return;
    }

    const modeOfPayment = document.getElementById('modeOfPayment').value;

    payBtn.disabled = true;
    try {
      const paid = await PMS_API.pay(bookingId, { modeOfPayment, cardNumber, cardHolder, expiry, cvv });

      cardForm.style.display = 'none';
      successSection.style.display = 'block';
      document.getElementById('payment-success-msg').textContent =
        'Payment Successful — Booking ID: ' + paid.bookingId;

      setTimeout(() => {
        window.location.href = '../invoice/invoice.html?bookingId=' + encodeURIComponent(paid.bookingId);
      }, 1500);
    } catch (err) {
      PMS.applyApiErrors(err);
      showFormError(err.message);
      payBtn.disabled = false;
    }
  });
});
