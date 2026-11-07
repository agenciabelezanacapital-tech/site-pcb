// Função serverless: entrega o Radar do Site do PCB ao vivo.
// Busca os eventos na planilha (Apps Script), agrega nos períodos 0/1/7/30 e
// devolve o mesmo formato que o antigo dados.json. Assim o radar nunca congela.
// O endpoint e o token são lidos do próprio js/radar.js já publicado, então
// nenhum segredo fica escrito aqui.

async function texto(url) {
  const r = await fetch(url, { redirect: 'follow' });
  return r.text();
}
async function json(url) {
  const r = await fetch(url, { redirect: 'follow' });
  return r.json();
}

function parseDt(s) {
  return new Date(String(s).replace('Z', '+00:00'));
}
function isTeste(x) {
  const v = String(x['Visita ID'] || '').toLowerCase();
  const p = String(x['Pagina'] || '').toLowerCase();
  const r = String(x['Referrer'] || '').toLowerCase();
  return v.includes('teste') || p.includes('/teste') || r === 'teste';
}
function normPath(p) {
  p = String(p == null ? '' : p);
  if (p.includes('site-pcb/')) p = '/' + p.split('site-pcb/')[1];
  if (!p.startsWith('/')) p = '/' + p;
  if (p.endsWith('index.html')) p = p.slice(0, -('index.html'.length));
  if (p === '') p = '/';
  const ult = p.split('/').pop();
  if (!p.endsWith('/') && !ult.includes('.')) p = p + '/';
  return p;
}
function band10(v) {
  v = Number(v);
  if (v >= 100) return '100%';
  const lo = Math.floor(v / 10) * 10;
  return lo + ' a ' + (lo + 9) + '%';
}
function band25(v) {
  v = Number(v);
  if (v >= 100) return '100%';
  if (v >= 75) return '75 a 99%';
  if (v >= 50) return '50 a 74%';
  if (v >= 25) return '25 a 49%';
  return '0 a 24%';
}
function sortDesc(obj) {
  return Object.entries(obj).sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])));
}
function sortBand(obj) {
  return Object.entries(obj).sort((a, b) => {
    const k = (s) => (s === '100%' ? 1000 : parseInt(String(s).split(' ')[0], 10));
    return k(a[0]) - k(b[0]);
  });
}
function count(arr, fn) {
  const m = {};
  for (const x of arr) {
    const k = fn(x);
    if (k === null || k === undefined) continue;
    m[k] = (m[k] || 0) + 1;
  }
  return m;
}
function median(nums) {
  const s = [...nums].sort((a, b) => a - b);
  const n = s.length;
  if (n === 0) return 0;
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
}

function agg(evs, leadsTotal) {
  const T = (t) => evs.filter((x) => x['Evento'] === t);
  const pv = T('pageview'), clk = T('click'), ext = T('exit'),
    stp = T('step'), aba = T('abandon'), wac = T('wa_click');

  const visitas = new Set(pv.map((x) => x['Visita ID']));
  const dev = count(pv, (x) => String(x['Dispositivo']));
  const aparelhos = Object.entries(dev).sort((a, b) => b[1] - a[1]).map(([n, v]) => ({ nome: n, valor: v }));
  const pg = count(pv, (x) => String(x['Pagina']));
  const paginas = sortDesc(pg).map(([n, v]) => ({ nome: n, valor: v }));

  const seqs = {};
  for (const x of [...pv].sort((a, b) => a._dt - b._dt)) {
    (seqs[x['Visita ID']] = seqs[x['Visita ID']] || []).push(String(x['Pagina']));
  }
  const cam = {};
  for (const s of Object.values(seqs)) { const k = s.join('\u0001'); cam[k] = (cam[k] || 0) + 1; }
  const caminhos = Object.entries(cam).sort((a, b) => b[1] - a[1]).slice(0, 10)
    .map(([p, n]) => ({ n, passos: p.split('\u0001') }));

  const el = count(clk.filter((x) => String(x['Texto do botao'] || '').trim()), (x) => String(x['Texto do botao']).slice(0, 60));
  const se = count(clk.filter((x) => String(x['Secao'] || '').trim()), (x) => String(x['Secao']));
  const cpg = count(clk, (x) => String(x['Pagina']));
  const fa = {};
  for (const x of clk) {
    const pos = String(x['Posicao na pagina'] || '');
    if (pos.includes(',')) { const y = parseFloat(pos.split(',')[1]); if (!isNaN(y)) fa[band10(y)] = (fa[band10(y)] || 0) + 1; }
  }
  let mapa = { pagina: '', pontos: [], total: 0 };
  if (Object.keys(cpg).length) {
    const top = sortDesc(cpg)[0][0];
    const pts = {};
    for (const x of clk) {
      if (String(x['Pagina']) !== top) continue;
      const pos = String(x['Posicao na pagina'] || '');
      if (pos.includes(',')) {
        const [xx, yy] = pos.split(',');
        const kx = Math.round(parseFloat(xx)), ky = Math.round(parseFloat(yy) * 10) / 10;
        if (!isNaN(kx) && !isNaN(ky)) { const k = kx + '|' + ky; pts[k] = (pts[k] || 0) + 1; }
      }
    }
    const pontos = Object.entries(pts).sort((a, b) => b[1] - a[1])
      .map(([k, n]) => ({ n, x: Number(k.split('|')[0]), y: Number(k.split('|')[1]) }));
    mapa = { pagina: top, pontos, total: pontos.reduce((s, p) => s + p.n, 0) };
  }
  const cliques = {
    elementos: sortDesc(el).slice(0, 9).map(([n, v]) => ({ nome: n, valor: v })),
    faixas: sortBand(fa).map(([n, v]) => ({ nome: n, valor: v })),
    mapa,
    paginas: sortDesc(cpg).map(([n, v]) => ({ nome: n, valor: v })),
    secoes: sortDesc(se).map(([n, v]) => ({ nome: n, valor: v })),
    total: clk.length,
  };

  const ro = {};
  for (const x of ext) {
    const r = x['Rolagem'];
    if (r !== '' && r != null) { const b = band25(parseFloat(r) * 100); if (b) ro[b] = (ro[b] || 0) + 1; }
  }
  const rolagem = sortBand(ro).map(([n, v]) => ({ nome: n, valor: v }));

  const secs = ext.map((x) => parseFloat(x['Segundos'])).filter((n) => !isNaN(n) && n > 0);
  const tempos = secs.length
    ? { media: Math.round(secs.reduce((a, b) => a + b, 0) / secs.length), mediana: Math.round(median(secs)), n: secs.length }
    : { media: 0, mediana: 0, n: 0 };

  const nomes = { 1: 'Nome', 2: 'Contato', 3: 'Assunto', 4: 'Descricao do caso' };
  const funil = [1, 2, 3, 4].map((et) => {
    const vis = new Set(stp.filter((x) => String(x['Etapa']) === String(et)).map((x) => x['Visita ID']));
    let nm = nomes[et];
    for (const x of stp) { if (String(x['Etapa']) === String(et) && String(x['Nome da Etapa'] || '').trim()) { nm = String(x['Nome da Etapa']); break; } }
    return { etapa: et, nome: nm, q: vis.size };
  });

  const tv = count(aba.filter((x) => String(x['Campo travado'] || '').trim()), (x) => String(x['Campo travado']));
  const travas = sortDesc(tv).map(([n, v]) => ({ nome: n, valor: v }));

  return {
    aparelhos, caminhos, cliques, funil, leads: 0,
    pageviews: pv.length, paginas, portas: [], rolagem, tempos, travas,
    visitas: visitas.size, waCliques: wac.length,
  };
}

module.exports = async function handler(req, res) {
  try {
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const base = 'https://' + host;
    const rjs = await texto(base + '/js/radar.js');
    const EP = (rjs.match(/RADAR_ENDPOINT\s*=\s*'([^']+)'/) || [])[1];
    const TOKEN = (rjs.match(/RADAR_TOKEN\s*=\s*'([^']+)'/) || [])[1];
    if (!EP || !TOKEN) throw new Error('endpoint/token não encontrados');

    const fun = await json(EP + '?token=' + encodeURIComponent(TOKEN) + '&action=funil&dias=0');
    let leadsTotal = 0;
    try { const ld = await json(EP + '?token=' + encodeURIComponent(TOKEN)); leadsTotal = (ld && ld.total) || 0; } catch (e) {}

    let EV = (fun.eventos || []).filter((x) => !isTeste(x));
    for (const x of EV) { x._dt = parseDt(x['Data/Hora']); x['Pagina'] = normPath(x['Pagina']); }

    const now = Date.now();
    const windows = { '0': 0, '1': 1, '7': 7, '30': 30 };
    const per = {};
    for (const [k, dias] of Object.entries(windows)) {
      const evs = dias === 0 ? EV : EV.filter((x) => x._dt >= now - dias * 86400000);
      const a = agg(evs);
      if (k === '0') a.leads = leadsTotal;
      per[k] = a;
    }
    const br = new Date(now - 3 * 3600000).toISOString().replace('Z', '-03:00');
    const out = {
      atualizadoEm: br,
      fonte: 'Planilha PCB Advogados Radar do Site, aba Funil (ao vivo)',
      periodos: per,
    };
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.status(200).send(JSON.stringify(out));
  } catch (e) {
    res.status(500).json({ erro: String(e && e.message || e) });
  }
}
