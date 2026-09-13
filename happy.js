document.addEventListener("DOMContentLoaded", () => {
    // 1. DOM Elements
    const bgMusic = document.getElementById('bg-music');
    const musicBtn = document.getElementById('music-btn');
    
    let isMusicPlaying = false;
    let hasAttemptedAutoplay = false;

    // Helper: Fade In Audio
    function fadeInAudio(audio, targetVolume, duration) {
        audio.volume = 0;
        const step = targetVolume / (duration / 50);
        const fade = setInterval(() => {
            if (audio.volume + step < targetVolume) {
                audio.volume += step;
            } else {
                audio.volume = targetVolume;
                clearInterval(fade);
            }
        }, 50);
    }

    // Helper: Fade Out Audio
    function fadeOutAudio(audio, duration) {
        return new Promise(resolve => {
            const step = audio.volume / (duration / 50);
            const fade = setInterval(() => {
                if (audio.volume - step > 0) {
                    audio.volume -= step;
                } else {
                    audio.volume = 0;
                    clearInterval(fade);
                    resolve();
                }
            }, 50);
        });
    }

    // Встановлення UI стану кнопки музики
    function setMusicState(state) {
        isMusicPlaying = state;
        if (state) {
            musicBtn.classList.remove('music-off');
            musicBtn.classList.add('music-on');
        } else {
            musicBtn.classList.remove('music-on');
            musicBtn.classList.add('music-off');
        }
    }

    // =========================================================
    // НАДІЙНИЙ АВТОЗАПУСК МУЗИКИ ПРИ СКРОЛІ/ДОТИКУ
    // =========================================================
    // Оскільки конверта більше немає, ми вмикаємо музику при першій же дії користувача на сайті
    
    const startMusicOnInteraction = () => {
        if (isMusicPlaying || hasAttemptedAutoplay) return;
        hasAttemptedAutoplay = true;

        // Перевірка на помилку, якщо користувач ще не додав файл music.mp3
        if (!bgMusic.src || bgMusic.src.includes('undefined') || bgMusic.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
            console.warn("Файл music.mp3 не знайдено. Будь ласка, завантажте ваш аудіофайл у папку з проєктом та назвіть його music.mp3");
            hasAttemptedAutoplay = false; // Дозволити спробувати пізніше
            return;
        }

        bgMusic.volume = 0;
        let playPromise = bgMusic.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                fadeInAudio(bgMusic, 0.5, 1000);
                setMusicState(true);
                
                // Після успішного старту знімаємо слухачі, щоб не навантажувати процесор
                window.removeEventListener('scroll', startMusicOnInteraction);
                window.removeEventListener('touchstart', startMusicOnInteraction);
                document.removeEventListener('click', startMusicOnInteraction);
            }).catch(e => {
                // Якщо браузер все одно заблокував, дозволимо спробувати знову
                hasAttemptedAutoplay = false;
                console.log("Браузер заблокував відтворення аудіо:", e);
            });
        }
    };

    // Вішаємо тригери на скрол, торкання екрану або клік мишкою
    window.addEventListener('scroll', startMusicOnInteraction, { passive: true });
    window.addEventListener('touchstart', startMusicOnInteraction, { passive: true });
    document.addEventListener('click', startMusicOnInteraction, { passive: true });


    // Ручне керування музикою через кнопку в правому кутку
    musicBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Щоб не спрацьовував глобальний клік
        
        if (!bgMusic.src || bgMusic.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
            alert("Помилка аудіо: Будь ласка, додайте файл music.mp3 у папку з сайтом.");
            return;
        }

        if (isMusicPlaying) {
            fadeOutAudio(bgMusic, 600).then(() => bgMusic.pause());
            setMusicState(false);
        } else {
            bgMusic.play().then(() => {
                fadeInAudio(bgMusic, 0.5, 600);
                setMusicState(true);
            }).catch(e => console.log("Помилка відтворення:", e));
        }
    });

    // =========================================================
    // АНІМАЦІЇ, ЧАСТИНКИ ТА ІНТЕРСЕКЦІЇ
    // =========================================================
    const ambientWorld = document.getElementById('ambient-world');
    const colors = ['var(--powder)', 'var(--butter)', 'var(--coral)'];
    for(let i = 0; i < 15; i++) {
        let el = document.createElement('div');
        el.className = 'ambient-particle';
        const size = Math.random() * 20 + 5;
        el.style.width = size + 'px';
        el.style.height = size + 'px';
        el.style.background = colors[Math.floor(Math.random() * colors.length)];
        el.style.left = Math.random() * 100 + 'vw';
        el.style.animationDuration = (Math.random() * 20 + 15) + 's';
        el.style.animationDelay = (Math.random() * 5) + 's';
        ambientWorld.appendChild(el);
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.card-section, .photo-frame, .timeline-item').forEach(el => {
        observer.observe(el);
    });

    const targetDate = new Date('2027-06-20T00:00:00').getTime();
    const elDays = document.getElementById('cd-days');
    const elHours = document.getElementById('cd-hours');
    const elMins = document.getElementById('cd-mins');
    const elSecs = document.getElementById('cd-secs');

    setInterval(() => {
        const now = new Date().getTime();
        const distance = targetDate - now;
        
        if(distance < 0) return;

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        elDays.innerText = days.toString().padStart(3, '0');
        elHours.innerText = hours.toString().padStart(2, '0');
        elMins.innerText = minutes.toString().padStart(2, '0');
        elSecs.innerText = seconds.toString().padStart(2, '0');
    }, 1000);

    // =========================================================
    // RSVP ЛОГІКА
    // =========================================================
    const rsvpForm = document.getElementById('rsvp-form');
    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
    const step3 = document.getElementById('step-3');
    const stepSuccess = document.getElementById('rsvp-success');
    
    const choiceBtns = document.querySelectorAll('.choice-btn');
    let willAttend = false;

    choiceBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            willAttend = btn.dataset.attend === 'yes';
            if (willAttend) {
                step1.classList.remove('active');
                step2.classList.add('active');
            } else {
                step1.classList.remove('active');
                stepSuccess.classList.add('active');
                stepSuccess.querySelector('h2').innerText = "БУДЕМО СУМУВАТИ!";
            }
        });
    });

    const nameInput = document.getElementById('guest-name');
    const guestCountSelect = document.getElementById('guest-count');
    const extraNamesGroup = document.getElementById('extra-names-group');
    const extraNamesInput = document.getElementById('extra-names');
    const nextBtn = document.getElementById('next-btn');

    function validateRSVP() {
        let isValid = true;
        const mainName = nameInput.value.trim();
        if (!mainName) isValid = false;

        const countType = guestCountSelect.value;
        if (countType === 'partner' || countType === 'family') {
            const extraStr = extraNamesInput.value;
            const namesArray = extraStr.split(',').map(n => n.trim()).filter(n => n.length > 0);
            if (namesArray.length === 0) isValid = false;
        }

        nextBtn.disabled = !isValid;
        return isValid;
    }

    nameInput.addEventListener('input', validateRSVP);
    guestCountSelect.addEventListener('change', (e) => {
        if(e.target.value === 'just_me') {
            extraNamesGroup.classList.add('hidden');
        } else {
            extraNamesGroup.classList.remove('hidden');
        }
        validateRSVP();
    });
    extraNamesInput.addEventListener('input', validateRSVP);

    nextBtn.addEventListener('click', () => {
        if(validateRSVP()) {
            step2.classList.remove('active');
            step3.classList.add('active');
        }
    });

    const drinkBtns = document.querySelectorAll('.drink-btn');
    const selectedDrinks = new Set();
    drinkBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('selected');
            const drink = btn.innerText;
            if(btn.classList.contains('selected')) {
                selectedDrinks.add(drink);
            } else {
                selectedDrinks.delete(drink);
            }
        });
    });

    rsvpForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const mainName = nameInput.value.trim();
        const countType = guestCountSelect.value;
        let finalExtraNames = [];
        if (countType === 'partner' || countType === 'family') {
            finalExtraNames = extraNamesInput.value.split(',').map(n => n.trim()).filter(n => n.length > 0);
        }

        const guestStat = {
            main_guest: mainName,
            attendance: 'YES',
            category: countType,
            extra_guests: finalExtraNames.join(', '),
            total_count: 1 + finalExtraNames.length
        };
        
        const drinkStat = Array.from(selectedDrinks);

        console.log("Payload for GET_GUESTS_STAT:", guestStat);
        console.log("Payload for GET_DRINK_STAT:", drinkStat);

        step3.classList.remove('active');
        stepSuccess.classList.add('active');
    });
});
