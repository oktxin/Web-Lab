document.addEventListener("DOMContentLoaded", function () {
  const burgerMenu = document.getElementById("burgerMenu");
  const mobileMenu = document.getElementById("mobileMenu");
  const overlay = document.getElementById("overlay");
  const closeMenu = document.getElementById("closeMenu");
  const body = document.body;

  function openMenu() {
    burgerMenu.classList.add("active");
    mobileMenu.classList.add("active");
    overlay.classList.add("active");
    body.classList.add("no-scroll");
  }

  function closeMobileMenu() {
    burgerMenu.classList.remove("active");
    mobileMenu.classList.remove("active");
    overlay.classList.remove("active");
    body.classList.remove("no-scroll");
  }

  burgerMenu.addEventListener("click", function (e) {
    e.stopPropagation();
    if (burgerMenu.classList.contains("active")) {
      closeMobileMenu();
    } else {
      openMenu();
    }
  });

  closeMenu.addEventListener("click", closeMobileMenu);

  overlay.addEventListener("click", closeMobileMenu);

  const mobileLinks = document.querySelectorAll(
    ".mobile-nav-link, .mobile-nav-button"
  );
  mobileLinks.forEach((link) => {
    link.addEventListener("click", function () {
      closeMobileMenu();
    });
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 768) {
      closeMobileMenu();
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && mobileMenu.classList.contains("active")) {
      closeMobileMenu();
    }
  });
});
