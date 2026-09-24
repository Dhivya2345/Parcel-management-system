// ---- booking.js page logic ----

const session = PMS.requireAuth('customer');

const RATE_PER_KG = { Standard: 50, Express: 100, Overnight: 150 };

const FIELD_IDS = [
  'receiverName', 'receiverAddress', 'receiverPin', 'receiverContact',
  'parcelWeight', 'parcelSize', 'parcelContents',
  'deliverySpeed', 'packaging',
  'pickupTime', 'dropoffTime'
];

// Backend error paths -> input ids
const SERVER_FIELD_MAP = {
  'receiver.name': 'receiverName',
  'receiver.address': 'receiverAddress',
  'receiver.pin': 'receiverPin',
  'receiver.contact': 'receiverContact',
  'parcel.weight': 'parcelWeight',
  'parcel.size': 'parcelSize',
  'parcel.contents': 'parcelContents',
  'shipping.speed': 'deliverySpeed',
  'shipping.packaging': 'packaging',
  'schedule.pickupTime': 'pickupTime',
  'schedule.dropoffTime': 'dropoffTime'
};

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

function isNonEmpty(value) {
  return (value || '').toString().trim().length > 0;
}

function isValidPin(value) {
  return /^\d{6}$/.test((value || '').trim());
}

function isValidContact(value) {
  return /^\d{10}$/.test((value || '').trim());
}

function isValidWeight(value) {
  const n = parseFloat(value);
  return !isNaN(n) && n > 0 && n <= 50;
}

// Live estimate only; the backend recalculates the final cost.
function calculateCost() {
  const speed = document.getElementById('deliverySpeed').value;
  const weight = parseFloat(document.getElementById('parcelWeight').value);
  const insurance = document.getElementById('insurance').checked;
  const trackingService = document.getElementById('trackingService').checked;

  let cost = 0;
  if (speed && RATE_PER_KG[speed] && !isNaN(weight) && weight > 0) {
    cost = RATE_PER_KG[speed] * weight;
  }
  if (insurance) cost += 50;
  if (trackingService) cost += 20;

  document.getElementById('cost-display').textContent = '₹' + cost.toFixed(2);
  return cost;
}

async function populateSenderInfo() {
  try {
    const user = await PMS_API.me();
    document.getElementById('senderName').value = user.name || '';
    document.getElementById('senderAddress').value = user.address || '';
    document.getElementById('senderContact').value = user.mobile || '';
  } catch (err) {
    showFormError(err.message);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  PMS.renderWelcome();
  populateSenderInfo();
  calculateCost();

  const nowLocal = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
  document.getElementById('pickupTime').min = nowLocal;
  document.getElementById('dropoffTime').min = nowLocal;

  document.getElementById('pickupTime').addEventListener('change', () => {
    document.getElementById('dropoffTime').min = document.getElementById('pickupTime').value || nowLocal;
  });

  ['deliverySpeed', 'parcelWeight', 'insurance', 'trackingService'].forEach(id => {
    document.getElementById(id).addEventListener('input', calculateCost);
    document.getElementById(id).addEventListener('change', calculateCost);
  });

  const form = document.getElementById('booking-form');
  const submitBtn = document.getElementById('submit-btn');

  form.addEventListener('reset', () => {
    FIELD_IDS.forEach(id => PMS.clearError(id));
    showFormError('');
    setTimeout(calculateCost, 0);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    showFormError('');
    FIELD_IDS.forEach(id => PMS.clearError(id));

    const receiverName = document.getElementById('receiverName').value.trim();
    const receiverAddress = document.getElementById('receiverAddress').value.trim();
    const receiverPin = document.getElementById('receiverPin').value.trim();
    const receiverContact = document.getElementById('receiverContact').value.trim();
    const parcelWeight = document.getElementById('parcelWeight').value;
    const parcelSize = document.getElementById('parcelSize').value;
    const parcelContents = document.getElementById('parcelContents').value.trim();
    const deliverySpeed = document.getElementById('deliverySpeed').value;
    const packaging = document.getElementById('packaging').value;
    const pickupTime = document.getElementById('pickupTime').value;
    const dropoffTime = document.getElementById('dropoffTime').value;
    const insurance = document.getElementById('insurance').checked;
    const trackingService = document.getElementById('trackingService').checked;

    let valid = true;

    if (!isNonEmpty(receiverName)) {
      PMS.showError('receiverName', 'Receiver name is required.');
      valid = false;
    }
    if (!isNonEmpty(receiverAddress)) {
      PMS.showError('receiverAddress', 'Receiver address is required.');
      valid = false;
    }
    if (!isValidPin(receiverPin)) {
      PMS.showError('receiverPin', 'Pin code must be exactly 6 digits.');
      valid = false;
    }
    if (!isValidContact(receiverContact)) {
      PMS.showError('receiverContact', 'Contact number must be exactly 10 digits.');
      valid = false;
    }
    if (!isValidWeight(parcelWeight)) {
      PMS.showError('parcelWeight', 'Enter a valid weight between 0.1 and 50 kg.');
      valid = false;
    }
    if (!isNonEmpty(parcelSize)) {
      PMS.showError('parcelSize', 'Please select a parcel size.');
      valid = false;
    }
    if (!isNonEmpty(parcelContents)) {
      PMS.showError('parcelContents', 'Please describe the parcel contents.');
      valid = false;
    }
    if (!isNonEmpty(deliverySpeed)) {
      PMS.showError('deliverySpeed', 'Please select a delivery speed.');
      valid = false;
    }
    if (!isNonEmpty(packaging)) {
      PMS.showError('packaging', 'Please select a packaging preference.');
      valid = false;
    }
    if (!isNonEmpty(pickupTime)) {
      PMS.showError('pickupTime', 'Please choose a pickup date and time.');
      valid = false;
    } else if (new Date(pickupTime) < new Date()) {
      PMS.showError('pickupTime', 'Pickup time must be after the current date and time.');
      valid = false;
    }
    if (!isNonEmpty(dropoffTime)) {
      PMS.showError('dropoffTime', 'Please choose a drop-off date and time.');
      valid = false;
    } else if (pickupTime && new Date(dropoffTime) < new Date(pickupTime)) {
      PMS.showError('dropoffTime', 'Drop-off time cannot be before pickup time.');
      valid = false;
    }
    if (!valid) {
      showFormError('Please fix the highlighted fields and try again.');
      return;
    }

    const payload = {
      receiver: {
        name: receiverName,
        address: receiverAddress,
        pin: receiverPin,
        contact: receiverContact
      },
      parcel: {
        weight: parseFloat(parcelWeight),
        size: parcelSize,
        contents: parcelContents
      },
      shipping: {
        speed: deliverySpeed,
        packaging: packaging,
        insurance: insurance,
        trackingService: trackingService
      },
      schedule: {
        pickupTime: pickupTime,
        dropoffTime: dropoffTime
      }
    };

    submitBtn.disabled = true;
    try {
      const booking = await PMS_API.createBooking(payload);
      window.location.href = '../payment/payment.html?bookingId=' + encodeURIComponent(booking.bookingId);
    } catch (err) {
      PMS.applyApiErrors(err, SERVER_FIELD_MAP);
      showFormError(err.message);
      submitBtn.disabled = false;
    }
  });
});
