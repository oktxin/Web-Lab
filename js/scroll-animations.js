document.addEventListener('DOMContentLoaded', function() {
    console.log('Scroll animations script loaded');

    const animatedElements = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right, .fade-in-up, .scale-in');
    const counterSection = document.getElementById('counter-section');
    const counterNumbers = document.querySelectorAll('.counter-number');
    const progressBar = document.getElementById('progressBar');
    const backToTop = document.getElementById('backToTop');
    
    let countersAnimated = false;
    
    console.log('Found elements:', {
        animated: animatedElements.length,
        counterSection: !!counterSection,
        counters: counterNumbers.length,
        progressBar: !!progressBar,
        backToTop: !!backToTop
    });

    function isElementInViewport(el) {
        if (!el) return false;
        
        const rect = el.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        const windowWidth = window.innerWidth || document.documentElement.clientWidth;
        
        return (
            rect.top <= windowHeight * 0.85 &&
            rect.bottom >= 0 &&
            rect.left <= windowWidth &&
            rect.right >= 0
        );
    }

    function checkScroll() {
        animatedElements.forEach(element => {
            if (isElementInViewport(element)) {
                element.classList.add('is-visible');
            }
        });

        if (counterSection && !countersAnimated && isElementInViewport(counterSection)) {
            countersAnimated = true;
            animateCounters();
        }

        if (progressBar) {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            progressBar.style.width = scrollPercent + '%';
        }

        if (backToTop) {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            if (scrollTop > 1000) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        }
    }

    function animateCounters() {
        console.log('Starting counter animation');
        
        counterNumbers.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target')) || 0;
            const duration = 2000;
            const startTime = Date.now();
            const startValue = 0;
            
            function updateCounter() {
                const currentTime = Date.now();
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);

                const easeOutQuart = 1 - Math.pow(1 - progress, 4);
                const currentValue = Math.round(easeOutQuart * target);
                
                counter.textContent = currentValue.toLocaleString();
                
                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target.toLocaleString();
                }
            }
            
            updateCounter();
        });
    }

    if (backToTop) {
        backToTop.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    function initScrollAnimations() {
        console.log('Initializing scroll animations');

        checkScroll();
        
        window.addEventListener('scroll', checkScroll);
        window.addEventListener('resize', checkScroll);

        setInterval(checkScroll, 500);
    }

    setTimeout(initScrollAnimations, 100);
});