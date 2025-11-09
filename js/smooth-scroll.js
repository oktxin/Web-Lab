document.addEventListener("DOMContentLoaded", function () {
  function smoothScroll(targetId) {
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      const offsetTop = targetElement.offsetTop - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });

      history.pushState(null, null, `#${targetId}`);

      targetElement.style.animation = "none";
      setTimeout(() => {
        targetElement.style.animation = "highlight 2s ease";
      }, 10);
    }
  }

  function setupNavigationLinks() {
    const navLinks = document.querySelectorAll(".nav-link, .mobile-nav-link");

    navLinks.forEach((link) => {
      link.addEventListener("click", function (e) {
        e.preventDefault();

        const href = this.getAttribute("href");
        if (href.includes("#")) {
          const targetId = href.split("#")[1];
          smoothScroll(targetId);

          const mobileMenu = document.getElementById("mobileMenu");
          const overlay = document.getElementById("overlay");
          if (mobileMenu.classList.contains("active")) {
            mobileMenu.classList.remove("active");
            overlay.classList.remove("active");
          }
        } else {
          window.location.href = href;
        }
      });
    });
  }

  function updateActiveNavLink() {
    const sections = document.querySelectorAll("section");
    const navLinks = document.querySelectorAll(".nav-link, .mobile-nav-link");

    let currentSection = "";

    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 100;
      if (window.scrollY >= sectionTop) {
        currentSection = section.getAttribute("id");
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove("active");
      const href = link.getAttribute("href");
      if (href && href.includes(`#${currentSection}`)) {
        link.classList.add("active");
      }
    });
  }

  function handleInitialHash() {
    if (window.location.hash) {
      const targetId = window.location.hash.substring(1);
      setTimeout(() => {
        smoothScroll(targetId);
      }, 100);
    }
  }

  function initSmoothScroll() {
    const sections = document.querySelectorAll("main > section");
    sections.forEach((section, index) => {
      if (!section.id) {
        section.id = `section-${index + 1}`;
      }
    });

    const navLinks = document.querySelectorAll(".nav-link, .mobile-nav-link");
    navLinks.forEach((link, index) => {
      if (link.getAttribute("href") === "home.html") {
        link.setAttribute("href", `#section-${index + 1}`);
      }
    });

    setupNavigationLinks();
    handleInitialHash();

    window.addEventListener("scroll", updateActiveNavLink);
    window.addEventListener("load", updateActiveNavLink);
  }

  initSmoothScroll();
});
