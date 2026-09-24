// ---- register.js page logic ----

const FIELD_IDS = ['name', 'email', 'mobile', 'address', 'userId', 'password', 'confirmPassword'];

function isValidName(value) {
  const v = (value || '').trim();
  return v.length > 0 && v.length <= 50;
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((value || '').trim());
}

function isValidMobile(value) {
  return /^\d{10}$/.test((value || '').trim());
}

function isValidAddress(value) {
  return (value || '').trim().length > 0;
}

function isValidUserId(value) {
  const v = (value || '').trim();
  return v.length >= 5 && v.length <= 20;
}

function isValidPasswordFormat(value) {
  const v = value || '';
  if (v.length === 0 || v.length > 30) return false;
  const hasUpper = /[A-Z]/.test(v);
  const hasLower = /[a-z]/.test(v);
  const hasSpecial = /[^A-Za-z0-9]/.test(v);
  return hasUpper && hasLower && hasSpecial;
}

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

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('register-form');
  const ackPanel = document.getElementById('registration-ack');
  const submitBtn = document.getElementById('submit-btn');

  form.addEventListener('reset', () => {
    FIELD_IDS.forEach(id => PMS.clearError(id));
    showFormError('');
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    showFormError('');
    FIELD_IDS.forEach(id => PMS.clearError(id));

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const countryCode = document.getElementById('countryCode').value;
    const mobile = document.getElementById('mobile').value.trim();
    const address = document.getElementById('address').value.trim();
    const userId = document.getElementById('userId').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    let valid = true;

    if (!isValidName(name)) {
      PMS.showError('name', 'Name is required and must be 50 characters or fewer.');
      valid = false;
    }

    if (!isValidEmail(email)) {
      PMS.showError('email', 'Enter a valid email address.');
      valid = false;
    }

    if (!isValidMobile(mobile)) {
      PMS.showError('mobile', 'Mobile number must be exactly 10 digits.');
      valid = false;
    }

    if (!isValidAddress(address)) {
      PMS.showError('address', 'Address is required.');
      valid = false;
    }

    if (!isValidUserId(userId)) {
      PMS.showError('userId', 'User ID must be between 5 and 20 characters.');
      valid = false;
    }

    if (!isValidPasswordFormat(password)) {
      PMS.showError('password', 'Password must be at most 30 characters and include an uppercase letter, a lowercase letter, and a special character.');
      valid = false;
    }

    if (confirmPassword !== password || confirmPassword.length === 0) {
      PMS.showError('confirmPassword', 'Passwords do not match.');
      valid = false;
    }

    if (!valid) {
      showFormError('Please fix the highlighted fields and try again.');
      return;
    }

    const payload = {
      name,
      email,
      countryCode,
      mobile,
      address,
      userId,
      password,
      confirmPassword,
      preferences: {
        emailUpdates: document.getElementById('prefEmailUpdates').checked,
        smsUpdates: document.getElementById('prefSmsUpdates').checked,
        ecoPackaging: document.getElementById('prefEcoPackaging').checked
      }
    };

    submitBtn.disabled = true;
    try {
      const result = await PMS_API.register(payload);

      document.getElementById('ack-username').textContent = result.userId;
      document.getElementById('ack-name').textContent = result.name;
      document.getElementById('ack-email').textContent = result.email;

      form.style.display = 'none';
      ackPanel.style.display = 'block';
    } catch (err) {
      PMS.applyApiErrors(err);
      showFormError(err.message);
    } finally {
      submitBtn.disabled = false;
    }
  });
});
