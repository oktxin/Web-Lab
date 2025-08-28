document.addEventListener('DOMContentLoaded', function() {
    initSlider();
});

function initSlider() {
    const slider = document.querySelector('.started-section-slider');
    const slides = document.querySelectorAll('.started-section-slide');
    const prevBtn = document.querySelector('.slider-prev');
    const nextBtn = document.querySelector('.slider-next');
    const dots = document.querySelectorAll('.pagination-dot');
    
    if (!slider || slides.length === 0) return;
    
    let currentSlide = 0;
    let slideWidth = slides[0].offsetWidth;
    let autoSlideInterval;

    function updateSlideWidth() {
        slideWidth = slider.offsetWidth / getSlidesPerView();
        slides.forEach(slide => {
            slide.style.minWidth = `${slideWidth}px`;
        });
        goToSlide(currentSlide);
    }

    function getSlidesPerView() {
        const width = window.innerWidth;
        if (width >= 1024) return 4;
        if (width >= 768) return 3;
        if (width >= 480) return 2;
        return 1;
    }

    function goToSlide(index) {

        if (index < 0) {
            index = slides.length - 1;
        } else if (index >= slides.length) {
            index = 0;
        }
        
        currentSlide = index;
        const offset = -currentSlide * slideWidth;
        slider.style.transform = `translateX(${offset}px)`;

        updatePagination();
    }

    function updatePagination() {
        dots.forEach((dot, index) => {
            if (index === currentSlide) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    function startAutoSlide() {
        autoSlideInterval = setInterval(() => {
            goToSlide(currentSlide + 1);
        }, 5000);
    }

    function stopAutoSlide() {
        clearInterval(autoSlideInterval);
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            stopAutoSlide();
            goToSlide(currentSlide - 1);
            startAutoSlide();
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            stopAutoSlide();
            goToSlide(currentSlide + 1);
            startAutoSlide();
        });
    }

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            stopAutoSlide();
            goToSlide(index);
            startAutoSlide();
        });
    });

    slider.addEventListener('mouseenter', stopAutoSlide);
    slider.addEventListener('mouseleave', startAutoSlide);

    window.addEventListener('resize', () => {
        updateSlideWidth();
    });

    updateSlideWidth();
    startAutoSlide();

    let touchStartX = 0;
    let touchEndX = 0;
    
    slider.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
        stopAutoSlide();
    }, {passive: true});
    
    slider.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
        startAutoSlide();
    }, {passive: true});
    
    function handleSwipe() {
        const minSwipeDistance = 50;
        
        if (touchStartX - touchEndX > minSwipeDistance) {
            goToSlide(currentSlide + 1);
        } 
        
        if (touchEndX - touchStartX > minSwipeDistance) {
            goToSlide(currentSlide - 1);
        }
    }
}