document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Preloader ---
    const preloader = document.getElementById('preloader');
    setTimeout(() => {
        preloader.classList.add('hide');
    }, 1200);

    // --- 2. Parallax (Оптимізовано) ---
    const heroImg = document.getElementById('hero-parallax');
    let ticking = false;

    if (heroImg) {
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    let scrolled = window.scrollY;
                    heroImg.style.transform = `translate3d(0, ${scrolled * 0.3}px, 0)`;
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    // --- 3. Intersection Observer (Анімації) ---
    const observerOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Тепер спостерігаємо і за img-reveal (маскування фото)
    document.querySelectorAll('.fade-in, .reveal, .img-reveal').forEach(el => observer.observe(el));
    setTimeout(() => {
        document.querySelectorAll('.hero .fade-in').forEach(el => el.classList.add('in-view'));
    }, 300);

    // --- 4. Countdown Timer ---
    function initCountdown() {
        const targetDate = new Date('2027-06-20T15:00:00').getTime();
        const daysEl = document.getElementById('days');
        const hoursEl = document.getElementById('hours');
        const minsEl = document.getElementById('minutes');
        const secsEl = document.getElementById('seconds');

        if (!daysEl) return; 

        function updateTimer() {
            const now = new Date().getTime();
            const distance = targetDate - now;

            if (distance < 0) {
                document.querySelector('.timer-grid').innerHTML = '<h3 style="font-family: var(--font-heading); font-size: 2.5rem; color: var(--accent);">Цей день настав!</h3>';
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            daysEl.textContent = days < 10 ? '0' + days : days;
            hoursEl.textContent = hours < 10 ? '0' + hours : hours;
            minsEl.textContent = minutes < 10 ? '0' + minutes : minutes;
            secsEl.textContent = seconds < 10 ? '0' + seconds : seconds;
        }

        updateTimer(); 
        setInterval(updateTimer, 1000); 
    }
    initCountdown();

    // --- 5. RSVP Form (Ідеальна логіка) ---
    const formStep1 = document.getElementById('form-step-1');
    const formStep2 = document.getElementById('form-step-2');
    
    const step1Container = document.getElementById('rsvp-step-1');
    const step2Container = document.getElementById('rsvp-step-2');
    const successContainer = document.getElementById('rsvp-success');
    
    const attendanceRadios = document.querySelectorAll('input[name="attendance"]');
    const extraGuestsDiv = document.getElementById('extra-guests');
    const guestCountSelect = document.getElementById('guest-count');
    const partnerNameGroup = document.getElementById('partner-name-group');
    const partnerNameInput = document.getElementById('partner-name');
    
    if (attendanceRadios.length > 0) {
        attendanceRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                document.getElementById('attendance-error').style.display = 'none';
                
                if (e.target.value === 'yes') {
                    extraGuestsDiv.classList.add('show');
                    guestCountSelect.setAttribute('required', 'required');
                } else {
                    extraGuestsDiv.classList.remove('show');
                    guestCountSelect.removeAttribute('required');
                    partnerNameGroup.style.display = 'none';
                    partnerNameInput.removeAttribute('required');
                }
            });
        });
    }

    if (guestCountSelect) {
        guestCountSelect.addEventListener('change', (e) => {
            if (e.target.value === 'partner' || e.target.value === 'family') {
                partnerNameGroup.style.display = 'block';
                partnerNameInput.setAttribute('required', 'required');
            } else {
                partnerNameGroup.style.display = 'none';
                partnerNameInput.removeAttribute('required');
                partnerNameGroup.classList.remove('input-error');
            }
        });
    }

    document.querySelectorAll('.premium-form input[type="text"]').forEach(input => {
        input.addEventListener('input', () => {
            input.parentElement.classList.remove('input-error');
        });
    });

    if (formStep1) {
        formStep1.addEventListener('submit', (e) => {
            e.preventDefault();
            let isValid = true;

            const guestName = document.getElementById('guest-name');
            if (!guestName.value.trim()) {
                guestName.parentElement.classList.add('input-error');
                isValid = false;
            }

            const checkedRadio = document.querySelector('input[name="attendance"]:checked');
            if (!checkedRadio) {
                document.getElementById('attendance-error').style.display = 'block';
                isValid = false;
            }

            if (checkedRadio && checkedRadio.value === 'yes' && (guestCountSelect.value === 'partner' || guestCountSelect.value === 'family')) {
                if (!partnerNameInput.value.trim()) {
                    partnerNameInput.parentElement.classList.add('input-error');
                    isValid = false;
                }
            }

            if (!isValid) return; 

            const isAttending = checkedRadio.value;
            step1Container.classList.remove('active');
            
            setTimeout(() => {
                if (isAttending === 'yes') {
                    step2Container.classList.add('active'); // Крок з напоями ТІЛЬКИ тут
                } else {
                    document.getElementById('success-msg').innerHTML = "Шкода, що вас не буде.<br>Дякуємо за відповідь!";
                    successContainer.classList.add('active');
                }
            }, 300); 
        });
    }

    if (formStep2) {
        formStep2.addEventListener('submit', (e) => {
            e.preventDefault();
            step2Container.classList.remove('active');
            setTimeout(() => {
                successContainer.classList.add('active');
            }, 300);
        });
    }
});