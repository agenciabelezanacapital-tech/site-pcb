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
  initCaseForm();
}

function initCaseForm() {
  var card = document.querySelector('.cf-card');
  if (!card) return;
  var sit = '', at = '';
  function liga(groupId, setter) {
    var g = document.getElementById(groupId);
    if (!g) return;
    g.querySelectorAll('.cf-opt').forEach(function (b) {
      b.addEventListener('click', function () {
        var was = b.classList.contains('sel');
        g.querySelectorAll('.cf-opt').forEach(function (x) { x.classList.remove('sel'); });
        if (!was) { b.classList.add('sel'); setter(b.dataset.v); } else { setter(''); }
        upd();
      });
    });
  }
  liga('cf-situacao', function (v) { sit = v; });
  liga('cf-atend', function (v) { at = v; });
  var nome = document.getElementById('cf-nome');
  var btn = document.getElementById('cf-enviar');
  var pre = card.getAttribute('data-assunto');
  if (pre) {
    sit = pre;
    var pb = document.querySelector('#cf-situacao .cf-opt[data-v="' + pre + '"]');
    if (pb) pb.classList.add('sel');
  }
  if (nome) nome.addEventListener('input', upd);
  function texto() {
    var t = 'Olá, vim pelo site.';
    if (sit) t += '\nAssunto: ' + sit;
    if (at) t += '\nAtendimento: ' + at;
    var n = nome ? nome.value.trim() : '';
    if (n) t += '\nNome: ' + n;
    return t;
  }
  function upd() { if (btn) btn.disabled = !sit; }
  upd();
  if (btn) btn.addEventListener('click', function () {
    if (btn.disabled) return;
    var url = 'https://wa.me/5561991193026?text=' + encodeURIComponent(texto());
    if (typeof gtag === 'function') {
      gtag('event', 'conversion', { 'send_to': 'AW-18382324624/JFHuCMzKqeEcEJCHsL1E', 'value': 1.0, 'currency': 'BRL', 'transport_type': 'beacon' });
    }
    if (typeof track === 'function') track('envio_formulario', { assunto: sit || 'nao informado' });
    window.open(url, '_blank', 'noopener');
  });
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
