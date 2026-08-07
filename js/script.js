'use strict';

function initRevealOnScroll() {
  const revealEls = document.querySelectorAll('.reveal');
  if (!revealEls.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealEls.forEach((el) => observer.observe(el));
}

function initFaqAccordion() {
  const faqButtons = document.querySelectorAll('.faq-q');

  faqButtons.forEach((button) => {
    const item = button.parentElement;
    button.setAttribute('aria-expanded', 'false');

    button.addEventListener('click', () => {
      const isOpen = item.classList.toggle('open');
      button.setAttribute('aria-expanded', String(isOpen));
    });
  });
}

function initNavToggle() {
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('site-nav');
  const backdrop = document.getElementById('navBackdrop');
  if (!toggle || !nav || !backdrop) return;

  const closeNav = () => {
    nav.classList.remove('open');
    backdrop.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  };

  const openNav = () => {
    nav.classList.add('open');
    backdrop.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
  };

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.contains('open');
    if (isOpen) closeNav(); else openNav();
  });

  backdrop.addEventListener('click', closeNav);
  nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeNav));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeNav();
  });
}

function init() {
  initRevealOnScroll();
  initFaqAccordion();
  initNavToggle();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
