/**
 * PCB Advogados — Radar do Site
 * ---------------------------------------------------------------
 * Recebe os eventos do site site-pcb e grava na planilha
 * "PCB Advogados — Radar do Site".
 *
 * Endpoints:
 *   POST {type:'pageview'|'step'|'abandon'|'wa_click'|'exit'|'click'}
 *        -> grava uma linha na aba Funil
 *   POST {type:'lead', campos:{...}}
 *        -> grava uma linha na aba Leads
 *   GET  ?token=...&action=funil        -> devolve os eventos do funil
 *   GET  ?token=...&action=funil&dias=7 -> so os ultimos N dias
 *   GET  ?token=...&action=leads        -> devolve os leads
 *
 * Implantar: Implantar > Nova implantacao > Tipo: App da Web
 *            Executar como: Eu | Quem pode acessar: Qualquer pessoa
 * Depois de implantar, cole a URL /exec em js/radar.js (RADAR_ENDPOINT).
 */

const SHEET_ID = '1it2_lraD35kmb48yuzV0_27s2VEacOoBJVB78pFDoN8';
const SHEET_LEADS = 'Leads';
const SHEET_FUNIL = 'Funil';
const TOKEN = 'pcb-radar-9bQ4mT2026';
const TZ = 'America/Sao_Paulo';

// Aba Leads: um envio de formulario por linha.
const HEADERS_LEADS = [
  'Data/Hora', 'Lead ID', 'Status', 'Nome', 'Contato', 'Assunto',
  'Descricao do caso', 'Pagina de origem', 'Dispositivo', 'Referrer',
  'Clicou no WhatsApp', 'Avisado no Claude'
];

// Aba Funil: um evento por linha. Mesmas colunas do radar da BNC, para o
// painel e os scripts de leitura funcionarem igual nos dois sites.
const HEADERS_FUNIL = [
  'Data/Hora', 'Visita ID', 'Evento', 'Pagina', 'Titulo',
  'Etapa', 'Nome da Etapa', 'Campo travado', 'Secao', 'Texto do botao',
  'Numero', 'Posicao na pagina', 'Rolagem', 'Texto pre-preenchido',
  'Segundos', 'Dispositivo', 'Idioma', 'Referrer', 'URL'
];

const COLL = {};
HEADERS_LEADS.forEach(function (h, i) { COLL[h] = i + 1; });
const COLF = {};
HEADERS_FUNIL.forEach(function (h, i) { COLF[h] = i + 1; });

const TIPOS_FUNIL = ['pageview', 'step', 'abandon', 'wa_click', 'exit', 'click'];

function aba_(nome, headers) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sh = ss.getSheetByName(nome);
  if (!sh) sh = ss.insertSheet(nome);
  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
    sh.getRange(1, 1, 1, headers.length)
      .setFontWeight('bold')
      .setBackground('#0C1B2A')
      .setFontColor('#C9A96E');
    sh.setFrozenRows(1);
    sh.setColumnWidth(1, 150);
    sh.setColumnWidth(2, 140);
  }
  return sh;
}

function agora_() {
  return Utilities.formatDate(new Date(), TZ, 'dd/MM/yyyy HH:mm:ss');
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const body = JSON.parse(e.postData.contents);
    if (body.token !== TOKEN) return json_({ ok: false, erro: 'token' });

    if (TIPOS_FUNIL.indexOf(body.type) > -1) {
      aba_(SHEET_FUNIL, HEADERS_FUNIL).appendRow([
        agora_(),
        body.visitaId || '',
        body.type,
        body.pagina || '',
        body.titulo || '',
        body.etapa || '',
        body.etapaNome || '',
        body.campoTravado || '',
        body.secao || '',
        body.textoBotao || '',
        body.numero || '',
        body.posicao || '',
        body.rolagem || '',
        body.prefill || '',
        body.segundos || '',
        body.dispositivo || '',
        body.idioma || '',
        body.referrer || '',
        body.url || ''
      ]);
      return json_({ ok: true, aba: SHEET_FUNIL });
    }

    if (body.type === 'lead') {
      const c = body.campos || {};
      aba_(SHEET_LEADS, HEADERS_LEADS).appendRow([
        agora_(),
        body.leadId || body.visitaId || '',
        'Novo',
        c.nome || '',
        c.contato || '',
        c.assunto || '',
        c.caso || '',
        body.pagina || '',
        body.dispositivo || '',
        body.referrer || '',
        '',
        ''
      ]);
      return json_({ ok: true, aba: SHEET_LEADS });
    }

    return json_({ ok: false, erro: 'tipo desconhecido' });
  } catch (erro) {
    return json_({ ok: false, erro: String(erro) });
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.token !== TOKEN) return json_({ ok: false, erro: 'token' });

  if (p.action === 'funil') {
    const sh = aba_(SHEET_FUNIL, HEADERS_FUNIL);
    const fim = sh.getLastRow();
    if (fim < 2) return json_({ ok: true, total: 0, eventos: [] });
    const brutos = sh.getRange(2, 1, fim - 1, HEADERS_FUNIL.length).getValues();
    const dias = parseInt(p.dias, 10);
    const limite = dias > 0 ? new Date(Date.now() - dias * 86400000) : null;
    const eventos = [];
    brutos.forEach(function (linha) {
      if (limite) {
        const partes = String(linha[0]).match(/(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}):(\d{2})/);
        if (partes) {
          const d = new Date(+partes[3], +partes[2] - 1, +partes[1], +partes[4], +partes[5], +partes[6]);
          if (d < limite) return;
        }
      }
      const ev = {};
      HEADERS_FUNIL.forEach(function (h, j) { ev[h] = linha[j]; });
      eventos.push(ev);
    });
    return json_({ ok: true, total: eventos.length, eventos: eventos });
  }

  const sh = aba_(SHEET_LEADS, HEADERS_LEADS);
  const fim = sh.getLastRow();
  if (fim < 2) return json_({ ok: true, total: 0, leads: [] });
  const dados = sh.getRange(2, 1, fim - 1, HEADERS_LEADS.length).getValues();
  const leads = [];
  dados.forEach(function (linha, i) {
    const lead = {};
    HEADERS_LEADS.forEach(function (h, j) { lead[h] = linha[j]; });
    lead._linha = i + 2;
    leads.push(lead);
  });
  return json_({ ok: true, total: leads.length, leads: leads });
}
