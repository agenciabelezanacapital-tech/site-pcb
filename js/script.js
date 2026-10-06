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
  initTracking();
  initForm();
}



/* ===== medicao e formulario ===== */
var LEAD_ENDPOINT = ''; // quando houver endpoint proprio (Apps Script/Formspree), colar a URL aqui

function track(nome, params) {
  if (typeof gtag === 'function') { gtag('event', nome, params || {}); }
}

function initTracking() {
  document.querySelectorAll('a[href*="wa.me"]').forEach(function (a) {
    a.addEventListener('click', function () {
      track('clique_whatsapp', { local: a.closest('section') ? (a.closest('section').id || 'secao') : 'topo' });
    });
  });
  document.querySelectorAll('a[href^="tel:"]').forEach(function (a) {
    a.addEventListener('click', function () { track('clique_telefone', {}); });
  });
  document.querySelectorAll('[data-evt="perfil-google"]').forEach(function (a) {
    a.addEventListener('click', function () { track('clique_avaliacoes_google', {}); });
  });

  var marcos = [25, 50, 75, 100], vistos = {};
  window.addEventListener('scroll', function () {
    var h = document.documentElement;
    var pct = (h.scrollTop + window.innerHeight) / h.scrollHeight * 100;
    marcos.forEach(function (m) {
      if (pct >= m && !vistos[m]) { vistos[m] = true; track('rolagem', { profundidade: m }); }
    });
  }, { passive: true });
}

function initForm() {
  var form = document.getElementById('formCaso');
  if (!form) return;
  var nota = document.getElementById('formNota');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (document.getElementById('f-empresa').value) return; // honeypot

    var nome = form.nome.value.trim();
    var contato = form.contato.value.trim();
    var assunto = form.assunto.value;
    var caso = form.caso.value.trim();

    if (!nome || !contato) {
      nota.textContent = 'Preencha o nome e um contato para o escritório retornar.';
      nota.className = 'form-nota erro';
      return;
    }

    track('envio_formulario', { assunto: assunto });
    if (typeof gtag_report_conversion === 'function') { gtag_report_conversion(); }

    // Grava o lead no radar antes de abrir o WhatsApp. Fire and forget:
    // se o radar estiver fora do ar, a conversa acontece do mesmo jeito.
    if (window.PCBRadar && window.PCBRadar.ativo) {
      window.PCBRadar.enviar({
        type: 'lead',
        leadId: window.PCBRadar.gerarId(),
        visitaId: window.PCBRadar.visitaId(),
        pagina: window.location.pathname,
        dispositivo: window.PCBRadar.dispositivo(),
        referrer: document.referrer || '',
        campos: { nome: nome, contato: contato, assunto: assunto, caso: caso }
      }, false);
    }

    var texto = 'Olá, vim pelo site.\nNome: ' + nome + '\nContato: ' + contato + '\nAssunto: ' + assunto + (caso ? '\nSituação: ' + caso : '');

    if (LEAD_ENDPOINT) {
      nota.textContent = 'Enviando...';
      nota.className = 'form-nota';
      fetch(LEAD_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: nome, contato: contato, assunto: assunto, caso: caso, origem: 'site-pcb' })
      }).then(function () {
        form.reset();
        nota.textContent = 'Recebemos o seu contato. O escritório retorna pelo número informado.';
        nota.className = 'form-nota ok';
      }).catch(function () {
        window.open('https://wa.me/5561991193026?text=' + encodeURIComponent(texto), '_blank', 'noopener');
      });
    } else {
      window.open('https://wa.me/5561991193026?text=' + encodeURIComponent(texto), '_blank', 'noopener');
      form.reset();
      nota.textContent = 'Abrimos o WhatsApp com o seu resumo pronto. É só enviar.';
      nota.className = 'form-nota ok';
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
