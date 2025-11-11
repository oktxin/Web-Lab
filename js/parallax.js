document.addEventListener("DOMContentLoaded", function() {
    const parallaxSection = document.getElementById("parallax-section");
    if (!parallaxSection) {
        return;
    }

    const layers = [{
            element: document.querySelector(".layer-background"),
            speed: 0.6,
        },
        {
            element: document.querySelector(".layer-mid"),
            speed: 0.9
        },
        {
            element: document.querySelector(".layer-foreground"),
            speed: 0.8,
        },
        {
            element: document.querySelector(".layer-reverse"),
            speed: -1.6,
        },
    ].filter((layer) => {
        return !!layer.element;
    });

    const shapes = document.querySelectorAll(".floating-shape");

    function updateParallax() {
        const scrollY = window.scrollY;
        const sectionTop = parallaxSection.offsetTop;
        const sectionHeight = parallaxSection.offsetHeight;
        const windowHeight = window.innerHeight;

        const sectionStart = sectionTop - windowHeight;
        const sectionEnd = sectionTop + sectionHeight;

        if (scrollY >= sectionStart && scrollY <= sectionEnd) {
            const progress = (scrollY - sectionStart) / (sectionEnd - sectionStart);

            layers.forEach((layer) => {
                const movement = (progress - 0.5) * 500 * layer.speed;
                layer.element.style.transform = `translateY(${movement}px) ${getLayerTransform(
                    layer.element
                )}`;
            });

            shapes.forEach((shape) => {
                const speed = parseFloat(shape.getAttribute("data-speed")) || 0.5;
                const movement = (progress - 0.5) * 300 * speed;
                shape.style.transform = `translateY(${movement}px)`;
            });
        }
    }

    function getLayerTransform(element) {
        if (element.classList.contains("layer-background")) {
            return "translateZ(-4px) scale(5)";
        } else if (element.classList.contains("layer-mid")) {
            return "translateZ(-2px) scale(3)";
        } else if (element.classList.contains("layer-foreground")) {
            return "translateZ(-1px) scale(2)";
        } else {
            return "translateZ(0) scale(1)";
        }
    }

    window.addEventListener("scroll", updateParallax);
    window.addEventListener("load", updateParallax);
});