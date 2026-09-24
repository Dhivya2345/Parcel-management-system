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
  PMS.clearSession();
  const form = document.getElementById('login-form');
  const submitBtn = document.getElementById('submit-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    showFormError('');
    PMS.clearError('userId');
    PMS.clearError('password');

    const userId = document.getElementById('userId').value.trim();
    const password = document.getElementById('password').value;

    let valid = true;

    if (!isValidUserId(userId)) {
      PMS.showError('userId', 'User ID must be between 5 and 20 characters.');
      valid = false;
    }

    if (!isValidPasswordFormat(password)) {
      PMS.showError('password', 'Password must be at most 30 characters and include an uppercase letter, a lowercase letter, and a special character.');
      valid = false;
    }

    if (!valid) return;

    submitBtn.disabled = true;
    try {
      const result = await PMS_API.login(userId, password);
      window.location.href = result.role === 'officer'
        ? '../home/officer-home.html'
        : '../home/customer-home.html';
    } catch (err) {
      if (err.status === 401) {
        PMS.showError('userId', 'Invalid credentials.');
        showFormError('Invalid User ID or password.');
      } else {
        showFormError(err.message);
      }
    } finally {
      submitBtn.disabled = false;
    }
  });
});
