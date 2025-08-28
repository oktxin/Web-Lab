document.addEventListener('DOMContentLoaded', function() {
    console.log('Parallax script loaded');
    
    const parallaxSection = document.getElementById('parallax-section');
    if (!parallaxSection) {
        console.error('Parallax section not found');
        return;
    }
    
    const layers = [
        { element: document.querySelector('.parallax-background'), speed: 0.2 },
        { element: document.querySelector('.parallax-mid'), speed: 0.4 },
        { element: document.querySelector('.parallax-foreground'), speed: 0.6 },
        { element: document.querySelector('.parallax-reverse'), speed: -0.3 } // Обратное движение
    ].filter(layer => layer.element);
    
    console.log('Found layers:', layers.length);
    
    let isEnabled = true;

    function updateParallax() {
        if (!isEnabled) return;
        
        const scrollY = window.scrollY;
        const sectionTop = parallaxSection.offsetTop;
        const sectionHeight = parallaxSection.offsetHeight;
        const windowHeight = window.innerHeight;

        const sectionStart = sectionTop - windowHeight;
        const sectionEnd = sectionTop + sectionHeight;
        
        if (scrollY >= sectionStart && scrollY <= sectionEnd) {
            const progress = (scrollY - sectionStart) / (sectionEnd - sectionStart);
            
            layers.forEach(layer => {
                const movement = progress * 100 * layer.speed;
                layer.element.style.transform = `translateY(${movement}px) translateZ(0)`;
            });
        }
    }

    let ticking = false;
    
    function onScroll() {
        if (!ticking) {
            requestAnimationFrame(() => {
                updateParallax();
                ticking = false;
            });
            ticking = true;
        }
    }

    function checkMobile() {
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
            isEnabled = false;
            layers.forEach(layer => {
                layer.element.style.transform = 'none';
            });
        } else {
            isEnabled = true;
        }
    }

    function initParallax() {
        console.log('Initializing parallax');
        
        checkMobile();
        updateParallax();

        window.addEventListener('scroll', onScroll);
        window.addEventListener('resize', function() {
            checkMobile();
            updateParallax();
        });

        if ('connection' in navigator && navigator.connection.saveData === true) {
            isEnabled = false;
        }
    }

    setTimeout(initParallax, 100);
});