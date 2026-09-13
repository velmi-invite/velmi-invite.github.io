const templates = [
    { id: 1, name: "AURA", category: "ВЕСІЛЛЯ", price: "999 ГРН", img: "/general_photo.png", link: "/Project_1/index.html" },
    { id: 2, name: "NOIR", category: "ВЕСІЛЛЯ", price: "999 ГРН", img: "general_photo_2.png", link: "/Project_2/index.html" },
    { id: 3, name: "W-G", category: "ВЕСІЛЛЯ", price: "999 ГРН", img: "general_photo_3.png", link: "w-g.html" },
    { id: 4, name: "ROMA", category: "ВЕСІЛЛЯ", price: "999 ГРН", img: "general_photo_4.png", link: "roma.html" },
    { id: 5, name: "HAPPY", category: "ВЕСІЛЛЯ", price: "999 ГРН", img: "general_photo_5.png", link: "happy.html" },
    { id: 6, name: "FILM", category: "ВЕСІЛЛЯ", price: "999 ГРН", img: "general_photo_6.png", link: "film.html" },
    // { id: 7, name: "BLANC", category: "ВЕСІЛЛЯ", price: "999 ГРН", img: "https://images.unsplash.com/photo-1513278974582-3e1b4a4fa21e?q=80&w=1000&auto=format&fit=crop", link: "#" },
    // { id: 8, name: "DISCOTECA", category: "ДЕНЬ НАРОДЖЕННЯ", price: "999 ГРН", img: "https://images.unsplash.com/photo-1574169208507-84376144848b?q=80&w=1000&auto=format&fit=crop", link: "#" }
];

const catalogueContainer = document.getElementById('catalogue');
let currentCategory = 'УСІ';

function renderCatalogue(category) {
    currentCategory = category;
    
    const existingItems = document.querySelectorAll('.template-item');
    if (existingItems.length > 0) {
        existingItems.forEach(item => item.classList.add('is-hiding'));
        
        setTimeout(() => {
            injectHTML(category);
        }, 400); 
    } else {
        injectHTML(category);
    }
}

function injectHTML(category) {
    catalogueContainer.innerHTML = ''; 

    const filteredTemplates = category === 'УСІ' 
        ? templates 
        : templates.filter(t => t.category === category);

    filteredTemplates.forEach((template, index) => {
        const item = document.createElement('article');
        item.className = 'template-item interactable';
        
        item.innerHTML = `
            <!-- Фотографія тепер є посиланням на шаблон -->
            <a href="${template.link}" target="_blank" onclick="if(this.getAttribute('href') === '#') event.preventDefault();" class="circle-wrapper" style="display: block;">
                <img src="${template.img}" alt="${template.name} preview" loading="lazy">
            </a>
            <div class="template-info">
                <div class="text-ui" style="color: var(--text-secondary); margin-bottom: -2px;">
                    ${String(index + 1).padStart(2, '0')} / ${template.category}
                </div>
                <h3 class="template-name">${template.name}</h3>
                <div class="template-price">${template.price}</div>
                <a href="${template.link}" target="_blank" onclick="if(this.getAttribute('href') === '#') event.preventDefault();" class="text-ui view-btn">ПЕРЕГЛЯНУТИ ДИЗАЙН</a>
            </div>
        `;
        
        catalogueContainer.appendChild(item);
    });

    observeElements();
}

const filterBtns = document.querySelectorAll('.filter-btn');
filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const targetCategory = e.target.getAttribute('data-filter');
        if (targetCategory === currentCategory) return; 

        filterBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');

        renderCatalogue(targetCategory);
    });
});

window.filterCatalogue = function(event, category) {
    if (event) {
        event.preventDefault(); 
    }

    const btn = document.querySelector(`.filter-btn[data-filter="${category}"]`);
    if(btn) btn.click();
    
    const targetSection = document.querySelector('.filter-container');
    if(targetSection) {
        window.scrollTo({ 
            top: targetSection.offsetTop - 80, 
            behavior: 'smooth' 
        });
    }
};

function observeElements() {
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.1
    };

    const templateObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.template-item').forEach(item => {
        templateObserver.observe(item);
    });

    document.querySelectorAll('.scroll-reveal').forEach(el => {
        if(!el.classList.contains('initialized')) {
            el.style.opacity = '0';
            el.style.transform = 'translateY(25px)';
            el.style.filter = 'blur(8px)';
            el.style.transition = 'opacity 1.4s cubic-bezier(0.16, 1, 0.3, 1), transform 1.4s cubic-bezier(0.16, 1, 0.3, 1), filter 1.4s cubic-bezier(0.16, 1, 0.3, 1)';
            el.classList.add('initialized');
        }
        
        const textObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    entry.target.style.filter = 'blur(0)';
                    textObserver.unobserve(entry.target);
                }
            });
        }, observerOptions);
        textObserver.observe(el);
    });
}

const cursor = document.getElementById('custom-cursor');

if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    document.addEventListener('mousemove', e => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });

    document.body.addEventListener('mouseover', e => {
        if (e.target.closest('.interactable') || e.target.closest('.circle-wrapper')) {
            cursor.classList.add('active');
        } else if (e.target.tagName.toLowerCase() === 'a' || e.target.tagName.toLowerCase() === 'button') {
            cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
            cursor.style.mixBlendMode = 'difference';
            cursor.style.backgroundColor = '#fff';
        }
    });

    document.body.addEventListener('mouseout', e => {
        cursor.classList.remove('active');
        cursor.style.transform = 'translate(-50%, -50%) scale(1)';
        cursor.style.mixBlendMode = 'normal';
        cursor.style.backgroundColor = 'var(--text-primary)';
    });
    
    document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { cursor.style.opacity = '1'; });
}

let lastScrollTop = 0;
const header = document.getElementById('header');

window.addEventListener('scroll', () => {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollTop > lastScrollTop && scrollTop > 100) {
        header.style.transform = 'translateY(-100%)';
    } else {
        header.style.transform = 'translateY(0)';
    }
    lastScrollTop = scrollTop;
});

document.addEventListener('DOMContentLoaded', () => {
    renderCatalogue('УСІ');
    setTimeout(() => { if(window.matchMedia("(hover: hover)").matches) cursor.style.opacity = '1'; }, 100);
});