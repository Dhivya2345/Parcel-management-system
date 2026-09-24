const session = PMS.getSession();

if (!session || session.role !== 'officer' || !sessionStorage.getItem('pms_token')) {
    window.location.replace('../login/login.html');
}

PMS.renderWelcome();

window.addEventListener('pageshow', () => {
    const session = PMS.getSession();

    if (!session || session.role !== 'officer' || !sessionStorage.getItem('pms_token')) {
        window.location.replace('../login/login.html');
    }
});
