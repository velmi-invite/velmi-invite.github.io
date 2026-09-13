// Register GSAP Plugin
gsap.registerPlugin(ScrollTrigger);

// Вирішує проблему зі стрибками на мобільних телефонах
ScrollTrigger.config({ ignoreMobileResize: true });

document.addEventListener("DOMContentLoaded", () => {
    
    /* ==========================================
       1. LOADER & HERO
    ========================================== */
    const loaderProgress = document.querySelector('.loader-progress');
    let progress = 0;
    
    // Трохи повільніший та плавніший лічильник лоадера
    const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 15) + 5;
        if (progress > 100) progress = 100;
        loaderProgress.textContent = `${progress}%`;
        
        if (progress === 100) {
            clearInterval(interval);
            
            const tl = gsap.timeline();
            tl.to('.loader', { yPercent: -100, duration: 1.5, ease: "power3.inOut", delay: 0.3 })
              .from('.hero-bg img', { scale: 1.15, duration: 2.5, ease: "power2.out" }, "-=1")
              .from('.hero-date span', { y: 40, opacity: 0, duration: 1.5, stagger: 0.3, ease: "power3.out" }, "-=1.5")
              .from('.hero-title .name, .hero-title .ampersand', { y: 60, opacity: 0, duration: 1.8, stagger: 0.3, ease: "power4.out" }, "-=1.5");
        }
    }, 120);

    /* ==========================================
       2. AUDIO PLAYER
    ========================================== */
    const audioToggle = document.getElementById('audio-toggle');
    const bgAudio = document.getElementById('bg-audio');
    const iconOn = document.querySelector('.icon-on');
    const iconOff = document.querySelector('.icon-off');
    let isPlaying = false;

    audioToggle.addEventListener('click', () => {
        if (isPlaying) {
            bgAudio.pause();
            iconOn.style.display = 'none';
            iconOff.style.display = 'block';
        } else {
            bgAudio.play().catch(e => console.log("Audio prevented"));
            iconOff.style.display = 'none';
            iconOn.style.display = 'block';
        }
        isPlaying = !isPlaying;
    });

    /* ==========================================
       3. GSAP SCROLL ANIMATIONS (СПОВІЛЬНЕНІ)
    ========================================== */
    gsap.utils.toArray('.gs-fade-up').forEach(elem => {
        gsap.from(elem, { 
            scrollTrigger: { trigger: elem, start: "top 85%" }, 
            y: 50, 
            opacity: 0, 
            duration: 1.2, 
            ease: "power2.out" 
        });
    });

    gsap.utils.toArray('.gs-slide-right').forEach((elem) => {
        gsap.from(elem, { 
            scrollTrigger: { trigger: elem, start: "top 90%" }, 
            x: -40, 
            opacity: 0, 
            duration: 1.2, 
            ease: "power2.out" 
        });
    });

    /* ==========================================
       4. COUNTDOWN LOGIC
    ========================================== */
    const weddingDate = new Date("June 20, 2027 15:00:00").getTime();
    
    const updateCountdown = () => {
        const now = new Date().getTime();
        const distance = weddingDate - now;

        if (distance < 0) {
            document.getElementById("countdown").innerHTML = "<h2 class='huge-text'>ЧАС НАСТАВ.</h2>";
            return;
        }

        document.getElementById("days").innerText = Math.floor(distance / (1000 * 60 * 60 * 24)).toString().padStart(2, '0');
        document.getElementById("hours").innerText = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0');
        document.getElementById("minutes").innerText = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
        document.getElementById("seconds").innerText = Math.floor((distance % (1000 * 60)) / 1000).toString().padStart(2, '0');
    };
    
    setInterval(updateCountdown, 1000);
    updateCountdown();

    /* ==========================================
       5. RESET ERROR MSG ON INPUT
    ========================================== */
    const nameInput = document.getElementById('main-guest-name');
    const familyInput = document.getElementById('family-names');
    const errorMsg = document.getElementById('name-error');

    [nameInput, familyInput].forEach(input => {
        if (input) {
            input.addEventListener('input', () => {
                input.classList.remove('input-error');
                errorMsg.style.opacity = '0';
            });
        }
    });
});

/* ==========================================
   6. RSVP STEP-BY-STEP LOGIC & VALIDATION
========================================== */
window.nextStep = function(step) {
    const currentActive = document.querySelector('.rsvp-step.active');
    
    // ВАЛІДАЦІЯ (не пускаємо без імені на 3-й крок)
    if (currentActive.id === 'step-2' && step === 3) {
        const nameInput = document.getElementById('main-guest-name');
        const familyInput = document.getElementById('family-names');
        const errorMsg = document.getElementById('name-error');
        let hasError = false;
        let errorTarget = null;
        
        if (nameInput.value.trim() === '') {
            nameInput.classList.add('input-error');
            errorMsg.textContent = "Будь ласка, введіть ваше ім'я";
            hasError = true;
            errorTarget = nameInput;
        } else if (!familyInput.classList.contains('hidden') && familyInput.value.trim() === '') {
            familyInput.classList.add('input-error');
            errorMsg.textContent = "Вкажіть, будь ласка, імена супроводжуючих";
            hasError = true;
            errorTarget = familyInput;
        }

        if (hasError) {
            errorMsg.style.opacity = '1';
            gsap.fromTo(errorTarget, 
                { x: -5 }, 
                { x: 5, yoyo: true, repeat: 5, duration: 0.08, onComplete: () => gsap.set(errorTarget, {x: 0}) }
            );
            return; 
        }
    }

    if (currentActive) {
        // Сповільнена і плавна анімація зникнення кроку
        currentActive.style.opacity = '0';
        currentActive.style.transform = 'translateY(-30px)';
        
        setTimeout(() => {
            currentActive.classList.remove('active');
            currentActive.style.display = 'none';
            
            const nextElem = document.getElementById(`step-${step}`);
            nextElem.style.display = 'block';
            
            requestAnimationFrame(() => {
                nextElem.classList.add('active');
                nextElem.style.opacity = '1';
                nextElem.style.transform = 'translateY(0)';
            });
        }, 600); // Збільшено час затримки для більшої плавності
    }
}

window.toggleFamily = function(hasFamily) {
    const familyInput = document.getElementById('family-names');
    const errorMsg = document.getElementById('name-error');
    if (hasFamily) {
        familyInput.classList.remove('hidden');
        familyInput.focus();
    } else {
        familyInput.classList.add('hidden');
        familyInput.value = '';
        familyInput.classList.remove('input-error');
        errorMsg.style.opacity = '0';
    }
}
