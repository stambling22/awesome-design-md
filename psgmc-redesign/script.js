// ============================================================
// PSGMC Interactive Engine
// Nav scroll, reveal animations, carousel, mobile menu
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

    // ---- NAVIGATION SCROLL ----
    const nav = document.getElementById('navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 60) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // ---- MOBILE MENU ----
    const toggle = document.getElementById('navToggle');
    const menu = document.getElementById('navMenu');

    if (toggle && menu) {
        toggle.addEventListener('click', () => {
            menu.classList.toggle('open');
            // Animate hamburger
            const spans = toggle.querySelectorAll('span');
            if (menu.classList.contains('open')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });

        // Close on link click
        menu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                menu.classList.remove('open');
                const spans = toggle.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            });
        });
    }

    // ---- SMOOTH SCROLL ----
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const offset = 80; // nav height
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // ---- SCROLL REVEAL ----
    const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .stagger-children');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -60px 0px'
    });

    revealEls.forEach(el => revealObserver.observe(el));


    // ---- PERFORMANCE CAROUSEL ----
    const track = document.getElementById('carouselTrack');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (track && prevBtn && nextBtn) {
        let position = 0;
        const cardWidth = 336; // 320 + 16 gap
        const cards = track.children;
        const visibleCards = Math.floor(track.parentElement.offsetWidth / cardWidth);
        const maxPosition = -(cards.length - visibleCards) * cardWidth;

        function updateCarousel() {
            track.style.transform = `translateX(${position}px)`;
        }

        nextBtn.addEventListener('click', () => {
            position -= cardWidth;
            if (position < maxPosition) position = 0; // loop
            updateCarousel();
        });

        prevBtn.addEventListener('click', () => {
            position += cardWidth;
            if (position > 0) position = maxPosition; // loop
            updateCarousel();
        });

        // Touch/drag support
        let isDragging = false;
        let startX = 0;
        let startPos = 0;

        track.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.pageX;
            startPos = position;
            track.style.cursor = 'grabbing';
            track.style.transition = 'none';
        });

        track.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const diff = e.pageX - startX;
            position = startPos + diff;
            track.style.transform = `translateX(${position}px)`;
        });

        const stopDrag = () => {
            if (!isDragging) return;
            isDragging = false;
            track.style.cursor = 'grab';
            track.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';

            // Snap to nearest card
            position = Math.round(position / cardWidth) * cardWidth;
            if (position > 0) position = 0;
            if (position < maxPosition) position = maxPosition;
            updateCarousel();
        };

        track.addEventListener('mouseup', stopDrag);
        track.addEventListener('mouseleave', stopDrag);

        // Touch events
        track.addEventListener('touchstart', (e) => {
            startX = e.touches[0].pageX;
            startPos = position;
            track.style.transition = 'none';
        }, { passive: true });

        track.addEventListener('touchmove', (e) => {
            const diff = e.touches[0].pageX - startX;
            position = startPos + diff;
            track.style.transform = `translateX(${position}px)`;
        }, { passive: true });

        track.addEventListener('touchend', () => {
            track.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
            position = Math.round(position / cardWidth) * cardWidth;
            if (position > 0) position = 0;
            if (position < maxPosition) position = maxPosition;
            updateCarousel();
        });

        // Auto-advance every 5s
        let autoPlay = setInterval(() => {
            position -= cardWidth;
            if (position < maxPosition) position = 0;
            updateCarousel();
        }, 5000);

        // Pause on hover
        track.parentElement.addEventListener('mouseenter', () => clearInterval(autoPlay));
        track.parentElement.addEventListener('mouseleave', () => {
            autoPlay = setInterval(() => {
                position -= cardWidth;
                if (position < maxPosition) position = 0;
                updateCarousel();
            }, 5000);
        });
    }


    // ---- COUNTER ANIMATION ----
    const statNumbers = document.querySelectorAll('.stat-number');
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const text = el.textContent;
                const num = parseInt(text);
                if (isNaN(num)) return;
                const suffix = text.replace(/[0-9]/g, '');

                let current = 0;
                const step = Math.ceil(num / 40);
                const timer = setInterval(() => {
                    current += step;
                    if (current >= num) {
                        current = num;
                        clearInterval(timer);
                    }
                    el.textContent = current + suffix;
                }, 30);

                counterObserver.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(el => counterObserver.observe(el));


    // ---- PARALLAX HERO ----
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY;
            if (scrolled < window.innerHeight) {
                heroContent.style.transform = `translateY(${scrolled * 0.15}px)`;
                heroContent.style.opacity = 1 - (scrolled / window.innerHeight) * 0.6;
            }
        });
    }

});
