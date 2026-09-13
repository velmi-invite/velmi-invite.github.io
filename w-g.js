document.addEventListener("DOMContentLoaded", () => {
    
    // 1. АНІМАЦІЯ ГЕРОЯ
    setTimeout(() => {
        document.querySelector('.hero').classList.add('ready');
    }, 100);

    // 2. СТАБІЛЬНИЙ SCROLL OBSERVER
    const observers = document.querySelectorAll('.blur-reveal, .fade-up');
    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            // Спрацьовує дуже швидко, як тільки блок з'являється (5%)
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.05, rootMargin: "0px 0px 50px 0px" }); // Margin 50px гарантує спрацювання до появи фрізів

    observers.forEach(el => scrollObserver.observe(el));

    // 3. ЖИВИЙ ТАЙМЛАЙН (Без CSS-фрізів)
    const timelineSection = document.getElementById('timeline-section');
    const timelineProgress = document.getElementById('timeline-progress');
    const timeNodes = document.querySelectorAll('.time-node');
    
    window.addEventListener('scroll', () => {
        requestAnimationFrame(() => {
            const windowHeight = window.innerHeight;

            if (timelineSection) {
                const tRect = timelineSection.getBoundingClientRect();
                if (tRect.top < windowHeight && tRect.bottom > 0) {
                    let scrolledPast = (windowHeight / 1.5) - tRect.top;
                    let percentage = (scrolledPast / tRect.height) * 100;
                    
                    percentage = Math.max(0, Math.min(100, percentage));
                    timelineProgress.style.height = `${percentage}%`;

                    timeNodes.forEach(node => {
                        const nRect = node.getBoundingClientRect();
                        if (nRect.top < windowHeight * 0.85) {
                            node.classList.add('active');
                        }
                    });
                }
            }
        });
    });

    // 4. ТАЙМЕР
    const weddingDate = new Date("June 20, 2027 15:00:00").getTime();
    function updateTimer() {
        const now = new Date().getTime();
        const distance = weddingDate - now;

        if (distance < 0) {
            document.getElementById("countdown").innerHTML = "<h3 class='editorial-text text-white'>Миті, що стали вічністю.</h3>";
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

        document.getElementById("days").innerText = days.toString().padStart(2, '0');
        document.getElementById("hours").innerText = hours.toString().padStart(2, '0');
        document.getElementById("minutes").innerText = minutes.toString().padStart(2, '0');
    }
    updateTimer();
    setInterval(updateTimer, 60000);

    // 5. МУЗИКА (З безпечним автоплеєм)
    const musicBtn = document.getElementById('music-btn');
    const audio = document.getElementById('bg-music');
    let isPlaying = false;

    let playPromise = audio.play();
    if (playPromise !== undefined) {
        playPromise.then(_ => {
            isPlaying = true;
            musicBtn.classList.remove('paused');
        }).catch(error => {
            musicBtn.classList.add('paused');
            const startAudioOnce = () => {
                if (!isPlaying) {
                    audio.play();
                    isPlaying = true;
                    musicBtn.classList.remove('paused');
                }
                ['touchstart', 'click', 'scroll'].forEach(evt => 
                    document.removeEventListener(evt, startAudioOnce)
                );
            };
            ['touchstart', 'click', 'scroll'].forEach(evt => 
                document.addEventListener(evt, startAudioOnce, { once: true })
            );
        });
    }

    musicBtn.addEventListener('click', (e) => {
        e.stopPropagation(); 
        if (isPlaying) {
            audio.pause();
            musicBtn.classList.add('paused');
        } else {
            audio.play();
            musicBtn.classList.remove('paused');
        }
        isPlaying = !isPlaying;
    });
});

// --- ЛОГІКА RSVP ---
function nextStep(answer) {
    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
    const stepSuccess = document.getElementById('step-success');

    step1.classList.remove('active');

    if (answer === 'yes') {
        step2.classList.add('active');
    } else {
        stepSuccess.classList.add('active');
        document.getElementById('success-message').innerText = "Нам шкода, що вас не буде поруч. Дякуємо за відповідь.";
    }
}

function handleAttendanceChange() {
    const type = document.getElementById('attendance-type').value;
    const partnerGroup = document.getElementById('partner-group');
    const familyGroup = document.getElementById('family-group');
    
    document.getElementById('attendance-type').parentElement.classList.remove('has-error');
    
    partnerGroup.classList.add('hidden');
    familyGroup.classList.add('hidden');

    if (type === 'partner') {
        partnerGroup.classList.remove('hidden');
    } else if (type === 'family') {
        familyGroup.classList.remove('hidden');
    }
}

function submitForm() {
    let isValid = true;
    document.querySelectorAll('.has-error').forEach(el => el.classList.remove('has-error'));

    const nameInput = document.getElementById('guest-name');
    if (!nameInput.value.trim()) {
        nameInput.parentElement.classList.add('has-error');
        isValid = false;
    }

    const typeSelect = document.getElementById('attendance-type');
    if (!typeSelect.value) {
        typeSelect.parentElement.classList.add('has-error');
        isValid = false;
    }

    if (typeSelect.value === 'partner') {
        const partnerInput = document.getElementById('partner-name');
        if (!partnerInput.value.trim()) {
            partnerInput.parentElement.classList.add('has-error');
            isValid = false;
        }
    }

    if (typeSelect.value === 'family') {
        const familyInput = document.getElementById('family-names');
        if (!familyInput.value.trim()) {
            familyInput.parentElement.classList.add('has-error');
            isValid = false;
        }
    }

    if (isValid) {
        document.getElementById('step-2').classList.remove('active');
        document.getElementById('step-success').classList.add('active');
    }
}