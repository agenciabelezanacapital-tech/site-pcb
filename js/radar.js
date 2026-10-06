/* ---------------------------------------------------------------
   PCB Advogados — Radar do Site
   ---------------------------------------------------------------
   Carrega em TODAS as paginas do site. Responsabilidades:
     1. Guardar a URL do Apps Script em UM lugar so (RADAR_ENDPOINT).
     2. Registrar visita de pagina (type:'pageview').
     3. Registrar clique em botao de WhatsApp (type:'wa_click'),
        dizendo de qual pagina, de qual secao e de qual botao veio.
     4. Registrar clique de telefone e clique no perfil do Google.
     5. Registrar todo clique da pagina (type:'click') com a posicao em
        porcentagem, materia-prima do mapa de calor.
     6. Registrar o avanco dentro do formulario (type:'step') e o
        abandono com o campo onde a pessoa parou (type:'abandon').
     7. Registrar a saida (type:'exit') com a rolagem maxima.
     8. Expor window.PCBRadar para o script.js usar o mesmo cano.

   Se RADAR_ENDPOINT nao for uma URL http valida, tudo aqui fica inerte:
   o radar nunca pode travar a navegacao nem o clique do visitante.
--------------------------------------------------------------- */
(function () {
  'use strict';

  // >>> UNICO lugar do site onde a URL do Apps Script precisa ser colada <<<
  var RADAR_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxKhGsbGqRiBD6vLHUcGZYh080SW8bICKFh6SY3BFQqGXUcut8kQWEd-htuo5rRUOEvRQ/exec';
  var RADAR_TOKEN = 'pcb-radar-9bQ4mT2026';

  var ativo = typeof RADAR_ENDPOINT === 'string' && RADAR_ENDPOINT.indexOf('http') === 0;
  var inicio = Date.now();

  function gerarId() {
    var d = new Date();
    var p = function (n) { return String(n).padStart(2, '0'); };
    return '' + d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) +
      '-' + p(d.getHours()) + p(d.getMinutes()) + p(d.getSeconds()) +
      '-' + Math.random().toString(36).slice(2, 7);
  }

  // A visita dura a sessao do navegador: assim o funil liga "entrou pelo
  // artigo de pensao" com "clicou no WhatsApp da landing" como uma pessoa so.
  function visitaId() {
    try {
      var v = sessionStorage.getItem('pcb_visita');
      if (!v) { v = gerarId(); sessionStorage.setItem('pcb_visita', v); }
      return v;
    } catch (e) { return gerarId(); }
  }

  function dispositivo() {
    var l = (navigator.userAgent || '').toLowerCase();
    if (/ipad|tablet/.test(l)) return 'tablet';
    if (/mobi|android|iphone/.test(l)) return 'celular';
    return 'desktop';
  }

  function segundos() { return Math.round((Date.now() - inicio) / 1000); }

  function enviar(payload, usarBeacon) {
    if (!ativo) return;
    var corpo;
    try { corpo = JSON.stringify(Object.assign({ token: RADAR_TOKEN }, payload)); }
    catch (e) { return; }
    try {
      if (usarBeacon && navigator.sendBeacon) {
        navigator.sendBeacon(RADAR_ENDPOINT, new Blob([corpo], { type: 'text/plain;charset=UTF-8' }));
        return;
      }
      fetch(RADAR_ENDPOINT, {
        method: 'POST', mode: 'no-cors', keepalive: true,
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
        body: corpo
      }).catch(function () {});
    } catch (e) { /* silencio proposital */ }
  }

  // Descobre em que parte da pagina o elemento esta, sem marcar nada no HTML.
  function secaoDoElemento(el) {
    var no = el;
    while (no && no !== document.body) {
      if (no.id) return no.id;
      if (no.getAttribute && no.getAttribute('data-secao')) return no.getAttribute('data-secao');
      no = no.parentElement;
    }
    var titulo = null; no = el;
    while (no && no !== document.body && !titulo) {
      var ant = no.previousElementSibling;
      while (ant && !titulo) {
        if (/^H[1-4]$/.test(ant.tagName)) titulo = ant;
        else titulo = ant.querySelector ? ant.querySelector('h1,h2,h3') : null;
        ant = ant.previousElementSibling;
      }
      no = no.parentElement;
    }
    return titulo ? titulo.textContent.trim().slice(0, 60) : 'sem-secao';
  }

  function posicaoNaPagina(el) {
    try {
      var topo = el.getBoundingClientRect().top + window.scrollY;
      var altura = document.documentElement.scrollHeight || 1;
      return Math.round((topo / altura) * 100) + '%';
    } catch (e) { return ''; }
  }

  function contexto() {
    return {
      visitaId: visitaId(),
      pagina: window.location.pathname,
      url: window.location.href,
      titulo: document.title,
      referrer: document.referrer || '',
      dispositivo: dispositivo(),
      idioma: document.documentElement.lang || '',
      segundos: segundos()
    };
  }

  // ---------- 1) visita de pagina ----------
  enviar(Object.assign({ type: 'pageview' }, contexto()), false);

  // ---------- 2) profundidade de rolagem ----------
  var maiorRolagem = 0;
  window.addEventListener('scroll', function () {
    var altura = document.documentElement.scrollHeight - window.innerHeight;
    if (altura <= 0) return;
    var pct = Math.round((window.scrollY / altura) * 100);
    if (pct > maiorRolagem) maiorRolagem = Math.min(pct, 100);
  }, { passive: true });

  // ---------- 3) clique em botao de WhatsApp ----------
  document.addEventListener('click', function (ev) {
    var link = ev.target && ev.target.closest ? ev.target.closest('a[href*="wa.me"]') : null;
    if (!link) return;
    var href = link.getAttribute('href') || '';
    var prefill = '';
    var corte = href.indexOf('text=');
    if (corte > -1) {
      try { prefill = decodeURIComponent(href.slice(corte + 5).replace(/\+/g, ' ')); } catch (e) { prefill = ''; }
    }
    enviar(Object.assign({
      type: 'wa_click',
      numero: (href.match(/wa\.me\/(\d+)/) || [])[1] || '',
      secao: secaoDoElemento(link),
      textoBotao: (link.textContent || '').trim().slice(0, 60),
      posicao: posicaoNaPagina(link),
      rolagem: maiorRolagem + '%',
      prefill: prefill.slice(0, 160)
    }, contexto()), true);
  }, true);

  // ---------- 3b) clique em telefone e no perfil do Google ----------
  document.addEventListener('click', function (ev) {
    var alvo = ev.target && ev.target.closest ? ev.target.closest('a[href^="tel:"],[data-evt="perfil-google"]') : null;
    if (!alvo) return;
    var tel = (alvo.getAttribute('href') || '').indexOf('tel:') === 0;
    enviar(Object.assign({
      type: 'wa_click',
      numero: tel ? 'telefone' : 'perfil-google',
      secao: secaoDoElemento(alvo),
      textoBotao: (tel ? 'Ligar: ' : 'Avaliacoes: ') + (alvo.textContent || '').trim().slice(0, 44),
      posicao: posicaoNaPagina(alvo),
      rolagem: maiorRolagem + '%'
    }, contexto()), true);
  }, true);

  // ---------- 4) mapa de clique ----------
  var cliquesEnviados = 0;
  var TETO_CLIQUES = 40;

  function alvoClicavel(el) {
    if (!el || !el.closest) return el;
    return el.closest('a,button,input,select,textarea,label,[role="button"],[onclick]') || el;
  }
  function nomeDoAlvo(el) {
    if (!el) return '';
    var t = (el.textContent || '').replace(/\s+/g, ' ').trim();
    if (t) return t.slice(0, 60);
    var alt = el.getAttribute && (el.getAttribute('aria-label') || el.getAttribute('alt') || el.getAttribute('title'));
    if (alt) return String(alt).trim().slice(0, 60);
    return '<' + (el.tagName || '?').toLowerCase() + '>';
  }

  document.addEventListener('click', function (ev) {
    if (cliquesEnviados >= TETO_CLIQUES) return;
    var alvo = ev.target;
    if (!alvo || alvo.nodeType !== 1) return;
    if (alvo.closest && alvo.closest('a[href*="wa.me"]')) return; // ja tem evento proprio
    cliquesEnviados++;
    var x = '', y = '';
    try {
      var largura = document.documentElement.scrollWidth || window.innerWidth || 1;
      var altura = document.documentElement.scrollHeight || 1;
      x = Math.round(((ev.pageX || 0) / largura) * 1000) / 10;
      y = Math.round(((ev.pageY || 0) / altura) * 1000) / 10;
    } catch (e) {}
    enviar(Object.assign({
      type: 'click',
      secao: secaoDoElemento(alvo),
      textoBotao: nomeDoAlvo(alvoClicavel(alvo)),
      posicao: x + ',' + y,
      numero: window.innerWidth || '',
      rolagem: maiorRolagem + '%'
    }, contexto()), true);
  }, true);

  // ---------- 5) funil do formulario ----------
  // O formulario do PCB tem um passo so na tela, mas quatro campos. O funil
  // util e saber ate qual campo a pessoa chegou antes de desistir.
  var ETAPAS = [
    { id: 'f-nome', n: 1, nome: 'Nome' },
    { id: 'f-contato', n: 2, nome: 'Contato' },
    { id: 'f-assunto', n: 3, nome: 'Assunto' },
    { id: 'f-caso', n: 4, nome: 'Descricao do caso' }
  ];
  var etapaMax = 0, etapaNomeMax = '', campoAtual = '', enviouForm = false;
  var etapasVistas = {};

  function ligarFormulario() {
    ETAPAS.forEach(function (et) {
      var campo = document.getElementById(et.id);
      if (!campo) return;
      campo.addEventListener('focus', function () {
        campoAtual = et.nome;
        if (etapasVistas[et.n]) return;
        etapasVistas[et.n] = true;
        if (et.n > etapaMax) { etapaMax = et.n; etapaNomeMax = et.nome; }
        enviar(Object.assign({
          type: 'step', etapa: et.n, etapaNome: et.nome,
          secao: 'formulario', rolagem: maiorRolagem + '%'
        }, contexto()), false);
      }, { passive: true });
    });
    var form = document.getElementById('formCaso');
    if (form) form.addEventListener('submit', function () { enviouForm = true; });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ligarFormulario);
  } else { ligarFormulario(); }

  // ---------- 6) saida da pagina ----------
  var saidaEnviada = false;
  function registrarSaida() {
    if (saidaEnviada) return;
    saidaEnviada = true;
    if (etapaMax > 0 && !enviouForm) {
      enviar(Object.assign({
        type: 'abandon', etapa: etapaMax, etapaNome: etapaNomeMax,
        campoTravado: campoAtual || etapaNomeMax,
        secao: 'formulario', rolagem: maiorRolagem + '%'
      }, contexto()), true);
    }
    enviar(Object.assign({ type: 'exit', rolagem: maiorRolagem + '%' }, contexto()), true);
  }
  window.addEventListener('pagehide', registrarSaida);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') registrarSaida();
  });

  // ---------- 7) cano compartilhado ----------
  window.PCBRadar = {
    endpoint: RADAR_ENDPOINT,
    token: RADAR_TOKEN,
    ativo: ativo,
    enviar: enviar,
    visitaId: visitaId,
    dispositivo: dispositivo,
    gerarId: gerarId
  };
})();
