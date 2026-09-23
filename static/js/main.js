// ==========================================
// Jonoseba Portal - Main JavaScript Functions
// ==========================================

document.addEventListener('DOMContentLoaded', function () {
    
    // 1. Auto-dismiss Flash Messages after 5 seconds
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(function (alert) {
        setTimeout(function () {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }, 5000);
    });

    // 2. Smooth Scroll to Top Functionality (If scrolled down)
    const scrollTopBtn = document.createElement('button');
    scrollTopBtn.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
    scrollTopBtn.className = 'btn btn-primary rounded-circle shadow position-fixed bottom-0 end-0 m-4 d-none';
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

    // 3. Form Client-side Validation Indicator
    const forms = document.querySelectorAll('form');
    forms.forEach(function (form) {
        form.addEventListener('submit', function (e) {
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn && form.checkValidity()) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></i>প্রসেসিং হচ্ছে...';
            }
        });
    });

});