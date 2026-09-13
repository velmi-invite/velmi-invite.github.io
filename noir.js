document.addEventListener('DOMContentLoaded', () => {

    // 1. MUSIC PLAYER & SMART AUTOPLAY
    const musicBtn = document.getElementById('musicBtn');
    const bgMusic = document.getElementById('bgMusic');
    
    // Синхронізація анімації іконки зі станом аудіо
    if(bgMusic) {
        bgMusic.addEventListener('play', () => musicBtn.classList.add('playing'));
        bgMusic.addEventListener('pause', () => musicBtn.classList.remove('playing'));
        
        // Кнопка вмикає/вимикає музику
        musicBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Щоб не спрацював клік по body
            if(bgMusic.paused) {
                bgMusic.play();
            } else {
                bgMusic.pause();
            }
        });

        // SMART AUTOPLAY: Вмикаємо музику при першій взаємодії користувача з сайтом
        const startAudio = () => {
            if(bgMusic.paused) {
                bgMusic.play().catch(err => console.log("Браузер заблокував autoplay"));
            }
            // Видаляємо слухачів після першого запуску
            document.removeEventListener('click', startAudio);
            document.removeEventListener('touchstart', startAudio);
            document.removeEventListener('scroll', startAudio);
        };

        document.addEventListener('click', startAudio);
        document.addEventListener('touchstart', startAudio);
        document.addEventListener('scroll', startAudio, { once: true });
    }

    // 2. SOFT REVEALS ON SCROLL
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.1
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); 
            }
        });
    }, observerOptions);

    document.querySelectorAll('.soft-reveal').forEach(el => revealObserver.observe(el));

    // 3. ELEGANT TIMER
    const weddingDate = new Date("June 20, 2027 15:00:00").getTime();
    
    function updateCountdown() {
        const now = new Date().getTime();
        const distance = weddingDate - now;

        if (distance < 0) {
            const timerDisplay = document.querySelector('.timer-display');
            if(timerDisplay) timerDisplay.innerHTML = "<h3 class='section-title'>СЬОГОДНІ ТОЙ САМИЙ ДЕНЬ</h3>";
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        updateTimeElement('days', formatNumber(days, 3));
        updateTimeElement('hours', formatNumber(hours, 2));
        updateTimeElement('minutes', formatNumber(minutes, 2));
        updateTimeElement('seconds', formatNumber(seconds, 2));
    }

    function formatNumber(num, length) {
        let str = num.toString();
        while (str.length < length) str = '0' + str;
        return str;
    }

    function updateTimeElement(id, newValue) {
        const el = document.getElementById(id);
        if (!el) return;
        if (el.innerText !== newValue) {
            el.classList.add('blur-anim');
            setTimeout(() => {
                el.innerText = newValue;
                el.classList.remove('blur-anim');
            }, 200); 
        }
    }

    setInterval(updateCountdown, 1000);
    updateCountdown();

    // 4. MILD PARALLAX EFFECT
    const images = document.querySelectorAll('.image-inner');
    window.addEventListener('scroll', () => {
        requestAnimationFrame(() => {
            images.forEach(img => {
                const parent = img.parentElement;
                const rect = parent.getBoundingClientRect();
                
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
                    const movement = (progress - 0.5) * -70; 
                    img.style.transform = `scale(1.15) translateY(${movement}px)`;
                }
            });
        });
    });

});

// 5. RSVP LOGIC & VALIDATION
window.openForm = function(isYes) {
    document.getElementById('rsvp-stage-1').classList.remove('active');
    setTimeout(() => {
        document.getElementById('rsvp-stage-2').classList.add('active');
    }, 300);
};

window.showDecline = function() {
    document.getElementById('rsvp-stage-1').classList.remove('active');
    setTimeout(() => {
        document.getElementById('rsvp-stage-msg').classList.add('active');
        document.getElementById('finalMsg').innerText = "Нам дуже вас бракуватиме.";
    }, 300);
};

window.toggleExtra = function() {
    const format = document.querySelector('input[name="format"]:checked').value;
    const extraContainer = document.getElementById('extraNamesContainer');
    if (format === '1') {
        extraContainer.style.display = 'none';
    } else {
        extraContainer.style.display = 'block';
    }
};

window.submitForm = function() {
    const name = document.getElementById('guestName').value;
    const format = document.querySelector('input[name="format"]:checked').value;
    const extraNames = document.getElementById('extraNamesInput').value;

    // Перевірка 1: Головне ім'я
    if(name.trim() === '') {
        alert("Будь ласка, вкажіть ваше ім'я.");
        return;
    }

    // Перевірка 2: Додаткові імена (тільки якщо вибрано пару або сім'ю)
    if((format === '2' || format === 'family') && extraNames.trim() === '') {
        alert("Будь ласка, вкажіть імена ваших супутників.");
        return; // Зупиняємо відправку, поки не заповнять
    }

    // Якщо всі перевірки пройдені — успішна відправка
    document.getElementById('rsvp-stage-2').classList.remove('active');
    setTimeout(() => {
        document.getElementById('rsvp-stage-msg').classList.add('active');
        document.getElementById('finalMsg').innerText = "Дякуємо! Вашу відповідь збережено.";
    }, 300);
};