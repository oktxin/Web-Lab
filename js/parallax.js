document.addEventListener("DOMContentLoaded", function () {
  console.log("=== PARALLAX DEBUG START ===");

  const parallaxSection = document.getElementById("parallax-section");
  if (!parallaxSection) {
    console.error("- Parallax section not found!");
    return;
  }
  console.log("✅ Parallax section found");

  const layers = [
    {
      element: document.querySelector(".layer-background"),
      speed: 0.2,
      name: "Background",
    },
    { element: document.querySelector(".layer-mid"), speed: 0.5, name: "Mid" },
    {
      element: document.querySelector(".layer-foreground"),
      speed: 0.8,
      name: "Foreground",
    },
    {
      element: document.querySelector(".layer-reverse"),
      speed: -0.6,
      name: "Reverse",
    },
  ].filter((layer) => {
    const found = !!layer.element;
    console.log(`${found ? "+" : "-"} ${layer.name} layer:`, layer.element);
    return found;
  });

  console.log(`Total layers: ${layers.length}`);

  const shapes = document.querySelectorAll(".floating-shape");
  console.log(`Shapes found: ${shapes.length}`);

  let scrollCount = 0;

  function updateParallax() {
    const scrollY = window.scrollY;
    const sectionTop = parallaxSection.offsetTop;
    const sectionHeight = parallaxSection.offsetHeight;
    const windowHeight = window.innerHeight;

    const sectionStart = sectionTop - windowHeight;
    const sectionEnd = sectionTop + sectionHeight;

    if (scrollY >= sectionStart && scrollY <= sectionEnd) {
      const progress = (scrollY - sectionStart) / (sectionEnd - sectionStart);

      console.log(
        `🔄 Scroll #${++scrollCount}: progress=${progress.toFixed(2)}`
      );

      layers.forEach((layer) => {
        const movement = (progress - 0.5) * 500 * layer.speed;
        layer.element.style.transform = `translateY(${movement}px) ${getLayerTransform(
          layer.element
        )}`;
        console.log(`   ${layer.name}: ${movement.toFixed(1)}px`);
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

  console.log(" Parallax initialized - start scrolling!");
  console.log("=== PARALLAX DEBUG END ===");
});
