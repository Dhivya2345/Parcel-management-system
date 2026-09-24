const session = PMS.getSession();

if (!session || session.role !== 'customer' || !sessionStorage.getItem('pms_token')) {
  window.location.replace('../login/login.html');
}

PMS.renderWelcome();

const greeting = document.getElementById('dashboard-greeting');

if (greeting) {
  greeting.textContent = 'Welcome back, ' + session.name;
}

window.addEventListener('pageshow', () => {
  const session = PMS.getSession();

  if (!session || session.role !== 'customer' || !sessionStorage.getItem('pms_token')) {
    window.location.replace('../login/login.html');
  }
});
