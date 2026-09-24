document.addEventListener("DOMContentLoaded", () => {
    // 1. Get the session securely using your existing PMS helper
    const session = typeof PMS !== 'undefined' ? PMS.getSession() : null;
    const role = session ? session.role : null;

    // 2. Define links dynamically based on role
    let navLinks = '';
    if (role === 'officer') {
        navLinks = `
            <a href="../home/officer-home.html">Home</a>
            <a href="../tracking/tracking-officer.html">Tracking</a>
            <a href="../delivery/delivery-update.html">Delivery Status</a>
            <a href="../history/history-officer.html">Previous Bookings</a>
        `;
    } else if (role === 'customer') {
        navLinks = `
            <a href="../home/customer-home.html">Home</a>
            <a href="../booking/booking.html">Booking Service</a>
            <a href="../tracking/tracking-customer.html">Tracking</a>
            <a href="../history/history-customer.html">Previous Bookings</a>
        `;
    }

    // 3. Construct the HTML
    const navbarHTML = `
        <nav id="main-nav">
            <span class="nav-brand">Parcel Management System</span>
            <div class="nav-links">
                ${navLinks}
            </div>
            <div class="nav-user">
                <span id="welcome-user">${session ? 'Welcome ' + session.name : ''}</span>
                ${session ? `<button id="logout-btn">Logout</button>` : ''}
            </div>
        </nav>
    `;

    // 4. Inject it into the placeholder
    const placeholder = document.getElementById("navbar-placeholder");
    if (placeholder) {
        placeholder.innerHTML = navbarHTML;

        // 5. Auto-highlight the active link based on current URL
        const currentPath = window.location.pathname;
        const links = placeholder.querySelectorAll('.nav-links a');
        links.forEach(link => {
            const linkHref = link.getAttribute('href').split('/').pop();
            if (linkHref && currentPath.includes(linkHref)) {
                link.classList.add('active');
            }
        });

        // 6. Bind the logout button globally so you don't need it in every script
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn && typeof PMS !== 'undefined') {
            logoutBtn.addEventListener('click', () => {
                PMS.clearSession();
                window.location.href = '../login/login.html';
            });
        }
    }
});
