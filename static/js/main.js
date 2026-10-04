// ==========================================
// Jonoseba Portal - Main JavaScript Functions (Updated 2026)
// ==========================================

document.addEventListener('DOMContentLoaded', function () {
    
    // 1. Auto-dismiss Flash Messages after 5 seconds
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(function (alert) {
        setTimeout(function () {
            if (typeof bootstrap !== 'undefined' && bootstrap.Alert) {
                const bsAlert = new bootstrap.Alert(alert);
                bsAlert.close();
            } else {
                alert.style.transition = 'opacity 0.5s ease';
                alert.style.opacity = '0';
                setTimeout(() => alert.remove(), 500);
            }
        }, 5000);
    });

    // 2. Smooth Scroll to Top Functionality
    const scrollTopBtn = document.createElement('button');
    scrollTopBtn.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
    scrollTopBtn.className = 'btn btn-success rounded-circle shadow position-fixed bottom-0 end-0 m-4 d-none';
    scrollTopBtn.style.zIndex = '1000';
    scrollTopBtn.style.width = '45px';
    scrollTopBtn.style.height = '45px';
    document.body.appendChild(scrollTopBtn);

    window.addEventListener('scroll', function () {
        if (window.scrollY > 300) {
            scrollTopBtn.classList.remove('d-none');
        } else {
            scrollTopBtn.classList.add('d-none');
        }
    });

    scrollTopBtn.addEventListener('click', function () {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // 3. Form Client-side Validation & Loading Spinner Indicator
    const forms = document.querySelectorAll('form');
    forms.forEach(function (form) {
        form.addEventListener('submit', function (e) {
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn && form.checkValidity()) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>প্রসেসিং হচ্ছে...';
            }
        });
    });

    // 4. Dynamic Live Search Filter for Tables / Cards
    const searchInputs = document.querySelectorAll('.live-search-input');
    searchInputs.forEach(function (input) {
        input.addEventListener('keyup', function () {
            const query = input.value.toLowerCase();
            const targetSelector = input.getAttribute('data-target');
            const items = document.querySelectorAll(targetSelector);

            items.forEach(function (item) {
                const text = item.textContent.toLowerCase();
                if (text.includes(query)) {
                    item.style.display = '';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    // 5. Tooltip Initialization (Bootstrap Tooltips)
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // 6. Active Nav Link Highlighting based on current URL
    const currentLocation = window.location.pathname;
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    navLinks.forEach(function (link) {
        if (link.getAttribute('href') === currentLocation) {
            link.classList.add('active');
            link.style.fontWeight = 'bold';
        }
    });

    // 7. Console Log Project Status for Debugging & Presentation
    console.log("%c[Jonoseba Portal] JavaScript loaded successfully! 🚀", "color: #28a745; font-size: 14px; font-weight: bold;");
});