(() => {
  'use strict';

  const header = document.querySelector('[data-header]');
  const menuButton = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');
  const form = document.querySelector('.enquiry-form');
  const formStatus = document.querySelector('.form-status');
  const heroVideo = document.querySelector('[data-hero-video]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Header state keeps navigation legible once the hero has scrolled away.
  const updateHeader = () => {
    if (header) header.classList.toggle('scrolled', window.scrollY > 24);
  };
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  // Accessible mobile navigation.
  if (menuButton && mobileNav) {
    const setMenu = (open) => {
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.classList.toggle('open', open);
      mobileNav.classList.toggle('open', open);
      document.body.classList.toggle('menu-open', open);
    };

    menuButton.addEventListener('click', () => {
      setMenu(menuButton.getAttribute('aria-expanded') !== 'true');
    });

    mobileNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setMenu(false));
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 1080) setMenu(false);
    });
  }

  // Progressive reveal; content remains fully visible when motion is reduced.
  const revealItems = [...document.querySelectorAll('.reveal, .reveal-group > *')];
  if (!reduceMotion.matches && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -50px' });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('in-view'));
  }

  // Hero video gracefully falls back to the supplied poster if autoplay/media fails.
  if (heroVideo && !reduceMotion.matches) {
    const usePoster = () => {
      heroVideo.style.display = 'none';
      const media = heroVideo.closest('.hero-media');
      if (media) media.style.background = 'url("assets/img/hero-poster.jpg") center/cover no-repeat';
    };
    heroVideo.addEventListener('error', usePoster);
    const playAttempt = heroVideo.play();
    if (playAttempt && typeof playAttempt.catch === 'function') playAttempt.catch(() => {});
  }

  // Smooth anchor navigation, respecting reduced-motion preferences.
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const selector = link.getAttribute('href');
      if (!selector || selector === '#') return;
      const target = document.querySelector(selector);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });
    });
  });

  // Front-end validation only; final WordPress build can connect this to the chosen form handler.
  if (form && formStatus) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const required = ['name', 'email', 'sites'];
      const missing = required.some((key) => !String(data.get(key) || '').trim());

      if (missing) {
        formStatus.textContent = 'Please complete the required fields.';
        return;
      }

      const email = String(data.get('email') || '').trim();
      if (!/^\S+@\S+\.\S+$/.test(email)) {
        formStatus.textContent = 'Please enter a valid email address.';
        return;
      }

      formStatus.textContent = 'Form ready for WordPress/email integration.';
    });
  }
})();
