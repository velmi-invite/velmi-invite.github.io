// Персоналізація на основі URL (ВИПРАВЛЕНО: ігнорує файли .html)
window.addEventListener('DOMContentLoaded', () => {
    const urlPath = window.location.pathname;
    const segments = urlPath.split('/').filter(Boolean);
    
    if (segments.length > 0) {
        const lastSegment = decodeURIComponent(segments[segments.length - 1]);
        
        // Перевіряємо, щоб це не був сам файл index.html або порожній шлях
        if (!lastSegment.toLowerCase().includes('.html') && window.location.protocol !== 'file:') {
            const guestName = lastSegment.toUpperCase();
            const heroNames = document.getElementById('hero-names');
            if(heroNames) {
                heroNames.innerHTML = `${guestName},<br><span style="font-size: 0.4em; font-family: var(--font-mono); opacity: 0.8; font-style: normal;">З НЕТЕРПІННЯМ ЧЕКАЄМО НА ВАС.</span>`;
            }
            const nameInput = document.getElementById('guest-name');
            if(nameInput) nameInput.value = guestName;
        }
    }
});

// Плавне завантаження (Лоадер)
window.addEventListener('load', () => {
    const bar = document.getElementById('loader-bar');
    if(bar) bar.style.width = '100%';
    setTimeout(() => {
        gsap.to('#loader', { opacity: 0, duration: 0.8, ease: "power2.inOut", onComplete: () => document.getElementById('loader').style.display = 'none' });
    }, 600);
});

// --- КЕРУВАННЯ МУЗИКОЮ ТА АВТОЗАПУСК ПРИ СКРОЛІ ---
const musicBtn = document.getElementById('music-btn');
const audio = document.getElementById('bg-audio');
const iconOn = document.getElementById('icon-sound-on');
const iconOff = document.getElementById('icon-sound-off');
let isPlaying = false;
let musicInitiated = false;

function toggleMusic(forcePlay = false) {
    if (forcePlay || !isPlaying) {
        audio.play().then(() => {
            isPlaying = true;
            musicInitiated = true;
            iconOff.style.display = 'none';
            iconOn.style.display = 'block';
        }).catch(err => console.log("Браузер очікує прямої взаємодії для відтворення аудіо."));
    } else {
        audio.pause();
        isPlaying = false;
        iconOn.style.display = 'none';
        iconOff.style.display = 'block';
    }
}

// Ручне перемикання по кліку
if (musicBtn) {
    musicBtn.addEventListener('click', () => toggleMusic());
}

// Автоматичний запуск музики при будь-якому скролі або кліку
function autoPlayOnInteraction() {
    if (!musicInitiated) {
        audio.play().then(() => {
            isPlaying = true;
            musicInitiated = true;
            iconOff.style.display = 'none';
            iconOn.style.display = 'block';
            // Видаляємо слухачі після успішного запуску
            window.removeEventListener('scroll', autoPlayOnInteraction);
            window.removeEventListener('click', autoPlayOnInteraction);
            window.removeEventListener('touchstart', autoPlayOnInteraction);
        }).catch(err => {
            // Якщо браузер заблокував, чекаємо наступної дії
        });
    }
}

// Слухаємо скрол та інші дії для автозапуску
window.addEventListener('scroll', autoPlayOnInteraction, { passive: true });
window.addEventListener('click', autoPlayOnInteraction, { passive: true });
window.addEventListener('touchstart', autoPlayOnInteraction, { passive: true });

// --- ПЛАВНИЙ ВІДЛІК ЧАСУ ---
const targetDate = new Date('June 20, 2027 15:00:00').getTime();

function updateCountdown() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance < 0) {
        const timerEl = document.getElementById('countdown-timer');
        if(timerEl) timerEl.innerHTML = "<h2 class='huge-text display-italic'>ЦЕЙ ДЕНЬ НАСТАВ.</h2>";
        return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    updateNumber('cd-days', days, 3);
    updateNumber('cd-hours', hours, 2);
    updateNumber('cd-minutes', minutes, 2);
    updateNumber('cd-seconds', seconds, 2);
    
    requestAnimationFrame(() => setTimeout(updateCountdown, 1000));
}

function updateNumber(id, newValue, padLength) {
    const el = document.getElementById(id);
    if(!el) return;
    const currentVal = el.innerText;
    const formattedVal = newValue.toString().padStart(padLength, '0');
    
    if (currentVal !== formattedVal) {
        el.classList.add('updating');
        setTimeout(() => {
            el.innerText = formattedVal;
            el.classList.remove('updating');
        }, 150); 
    }
}
updateCountdown();

// --- ЛОГІКА RSVP ---
let rsvpState = { attendance: null, name: '', companions: 'alone', companionNames: '', drinks: [] };

function hideAllSteps() {
    document.querySelectorAll('.form-group').forEach(el => el.classList.remove('active'));
}

function nextStep(current, attendanceVal) {
    rsvpState.attendance = attendanceVal;
    hideAllSteps();
    setTimeout(() => document.getElementById('step-2').classList.add('active'), 50);
}

function triggerError(inputId, errorId) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(errorId);
    input.classList.add('slide-error');
    error.style.display = 'block';
    setTimeout(() => input.classList.remove('slide-error'), 400);
    input.focus();
}

function validateNameAndProceed() {
    const nameInput = document.getElementById('guest-name');
    const val = nameInput.value.trim();
    if (!val) {
        triggerError('guest-name', 'name-error');
        return;
    }
    document.getElementById('name-error').style.display = 'none';
    rsvpState.name = val;
    
    hideAllSteps();
    if (rsvpState.attendance === 'no') {
        setTimeout(showSuccess, 50);
    } else {
        setTimeout(() => document.getElementById('step-3').classList.add('active'), 50);
    }
}

function handleCompanionSelection(val) {
    rsvpState.companions = val;
    hideAllSteps();
    if (val === 'alone') {
        setTimeout(() => document.getElementById('step-drinks').classList.add('active'), 50);
    } else {
        setTimeout(() => document.getElementById('step-4').classList.add('active'), 50);
    }
}

function validateCompanionsAndProceed() {
    const compInput = document.getElementById('companion-names');
    const val = compInput.value.trim();
    if (!val) {
        triggerError('companion-names', 'companion-error');
        return;
    }
    document.getElementById('companion-error').style.display = 'none';
    rsvpState.companionNames = val;
    
    hideAllSteps();
    setTimeout(() => document.getElementById('step-drinks').classList.add('active'), 50);
}

// Вибір напоїв
const drinkBtns = document.querySelectorAll('#step-drinks .drink-btn');
drinkBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        this.classList.toggle('active');
        if (this.classList.contains('active')) {
            const rect = this.getBoundingClientRect();
            const x = (rect.left + rect.width / 2) / window.innerWidth;
            const y = (rect.top + rect.height / 2) / window.innerHeight;
            confetti({ particleCount: 10, spread: 30, origin: { x, y }, colors: ['#FAF8F5', '#9A031E'], disableForReducedMotion: true, gravity: 0.5, ticks: 50 });
        }
    });
});

function submitRSVP() {
    if (!rsvpState.name.trim()) return triggerError('guest-name', 'name-error');
    if (rsvpState.attendance === 'yes' && rsvpState.companions !== 'alone' && !rsvpState.companionNames.trim()) {
         return triggerError('companion-names', 'companion-error');
    }
    
    const selectedDrinks = Array.from(document.querySelectorAll('#step-drinks .drink-btn.active')).map(b => b.innerText);
    rsvpState.drinks = selectedDrinks;
    showSuccess();
}

function showSuccess() {
    hideAllSteps();
    setTimeout(() => {
        document.getElementById('step-success').classList.add('active');
        confetti({
            particleCount: 60, spread: 70, origin: { y: 0.6 },
            colors: ['#FAF8F5', '#9A031E', '#0047AB', '#FEEA00'],
            disableForReducedMotion: true,
            gravity: 0.8, ticks: 150 
        });
    }, 50);
}

// --- ОПТИМІЗОВАНІ GSAP АНІМАЦІЇ ---
gsap.registerPlugin(ScrollTrigger);

// Hero Паралакс
gsap.to('#hero-img', {
    yPercent: 10, 
    scale: 1.02, 
    ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.5 }
});

gsap.to('.hero-content', {
    y: 30, 
    opacity: 0, 
    ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "center top", scrub: 0.5 }
});

// Глобальне проявлення всіх основних секцій (випливають знизу)
gsap.utils.toArray('.fade-in-section').forEach(section => {
    gsap.fromTo(section, 
        { autoAlpha: 0, y: 30 }, 
        { 
            autoAlpha: 1, 
            y: 0, 
            duration: 1, 
            ease: "power2.out",
            scrollTrigger: {
                trigger: section,
                start: "top 90%",
                toggleActions: "play none none reverse"
            }
        }
    );
});

// Спокійне проявлення слів історії
const words = document.querySelectorAll('.story-word');
words.forEach((word) => {
    gsap.to(word, {
        opacity: 1, 
        ease: "none",
        scrollTrigger: { trigger: word, start: "top 90%", end: "top 60%", scrub: 1 }
    });
});

// Каскадна поява елементів Дрес-коду
gsap.from('.dc-block', {
    opacity: 0, y: 20, stagger: 0.1, duration: 0.8, ease: "power2.out",
    scrollTrigger: { trigger: '.dc-grid', start: "top 90%" }
});

// Розклад (Timeline)
const tlItems = document.querySelectorAll('.tl-item');
tlItems.forEach((item) => {
    gsap.to(item, {
        opacity: 1, y: 0, duration: 0.8, ease: "power2.out",
        scrollTrigger: { trigger: item, start: "top 90%", toggleActions: "play none none reverse" }
    });
});