# -*- coding: utf-8 -*-
import json, os, sys, pathlib, urllib.parse, html
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from areas import AREAS

ROOT = pathlib.Path(sys.argv[1]).resolve()
BASE = "https://www.pcbadvogadosassociados.com.br"
GA4 = "G-9NR1V3DK4W"

def wa(t): return "https://wa.me/5561991193026?text=" + urllib.parse.quote(t)

GTAG = f"""<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-18382324624"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){{dataLayer.push(arguments);}}
  gtag('js', new Date());
  gtag('config', 'AW-18382324624');
  var GA4_ID = '{GA4}';
  if (GA4_ID.indexOf('XXXX') === -1) {{ gtag('config', GA4_ID); }}
</script>
<script>
function gtag_report_conversion(url) {{
  gtag('event', 'conversion', {{'send_to':'AW-18382324624/JFHuCMzKqeEcEJCHsL1E','value':1.0,'currency':'BRL','transport_type':'beacon'}});
  return true;
}}
</script>"""

WA_SVG = """<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <symbol id="ico-whatsapp" viewBox="0 0 24 24"><path d="M17.5 14.4c-.3-.2-1.7-.9-2-1-.3-.1-.5-.1-.6.2-.2.3-.7 1-.9 1.1-.2.2-.3.2-.6.1-.3-.2-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.6-1.5-.8-2.1-.2-.5-.4-.5-.6-.5h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2 0 1.3.9 2.5 1.1 2.7.1.2 1.8 2.8 4.4 3.9.6.3 1.1.4 1.5.5.6.2 1.2.2 1.6.1.5-.1 1.7-.7 1.9-1.3.2-.7.2-1.2.2-1.3-.1-.2-.3-.2-.6-.4z"/><path d="M12 2a10 10 0 00-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1012 2zm0 18a8 8 0 01-4.1-1.1l-.3-.2-2.9.8.8-2.8-.2-.3A8 8 0 1112 20z"/></symbol>
</svg>"""

ICO_TEL = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1.9.4 1.8.7 2.7a2 2 0 01-.5 2.1L8.1 9.9a16 16 0 006 6l1.4-1.2a2 2 0 012.1-.5c.9.3 1.8.6 2.7.7a2 2 0 011.7 2z"/></svg>'
STAR = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.2 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z"/></svg>'

def btn_wa(texto, label, cls="btn-wa"):
    return (f'<a class="{cls}" href="{wa(texto)}" target="_blank" rel="noopener" '
            f'onclick="return gtag_report_conversion();">'
            f'<svg class="ico-wa" width="19" height="19" fill="currentColor" aria-hidden="true"><use href="#ico-whatsapp"></use></svg>{label}</a>')

def page(a):
    url = f"{BASE}/{a['slug']}/"
    sits = "".join(f'<div class="sit"><h3>{t}</h3><p>{d}</p></div>' for t, d in a["situacoes"])
    objs = "".join(f'<div class="obj"><h3>{q}</h3><p>{r}</p></div>' for q, r in a["objecoes"])
    faqs = "".join(f'<div class="faq-item"><button class="faq-q">{q} <span class="plus">+</span></button><div class="faq-a"><p>{r}</p></div></div>' for q, r in a["faq"])
    opts = "".join(f'<option value="{x}"{" selected" if x == a["assunto"] else ""}>{x}</option>'
                   for x in ["Divórcio e partilha","Inventário e herança","Guarda e convivência","Pensão alimentícia","Outro assunto"])
    ld = {"@context":"https://schema.org","@graph":[
      {"@type":"LegalService","@id":url+"#servico","name":f"PCB Advogados — {a['nome']} em Brasília",
       "description":a["description"],"url":url,"telephone":"+5561991193026",
       "areaServed":{"@type":"City","name":"Brasília"},
       "parentOrganization":{"@type":"Organization","name":"Pimentel e Castello Branco Advogados Associados","url":BASE+"/"},
       "aggregateRating":{"@type":"AggregateRating","ratingValue":"5.0","reviewCount":"51"}},
      {"@type":"BreadcrumbList","itemListElement":[
        {"@type":"ListItem","position":1,"name":"Início","item":BASE+"/"},
        {"@type":"ListItem","position":2,"name":a["nome"],"item":url}]},
      {"@type":"FAQPage","@id":url+"#faq","mainEntity":[
        {"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":r}} for q, r in a["faq"]]}]}
    return f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
{GTAG}
<meta charset="UTF-8">
<script>document.documentElement.className+=" js";</script>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="dark">
<meta name="robots" content="index, follow, max-image-preview:large">
<title>{a['title_tag']}</title>
<meta name="description" content="{a['description']}">
<link rel="canonical" href="{url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="PCB Advogados">
<meta property="og:locale" content="pt_BR">
<meta property="og:url" content="{url}">
<meta property="og:title" content="{a['title_tag']}">
<meta property="og:description" content="{a['description']}">
<meta property="og:image" content="{BASE}/images/socios-leonardo-rinaldo.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="../images/selo-navy.png" type="image/png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Outfit:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../css/style.css">
<link rel="stylesheet" href="../css/lp.css">
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>
</head>
<body class="lp">
{WA_SVG}

<header class="lp-bar">
  <a href="../index.html" class="logo" aria-label="PCB Advogados">
    <img src="../images/logo-white.png" alt="Pimentel e Castello Branco Advogados Associados" class="logo-img">
  </a>
  <div class="lp-bar-acts">
    <a href="tel:+5561991193026" class="bar-tel" data-evt="telefone">{ICO_TEL}<span>(61) 99119-3026</span></a>
    {btn_wa(a['wa'], 'Falar agora', 'bar-cta-wa')}
  </div>
</header>

<!-- HERO -->
<section class="lp-hero">
  <div class="lp-wrap">
    <p class="eyebrow mono">{a['kicker']}</p>
    <h1>{a['h1']}, <em>{a['h1_em']}</em></h1>
    <p class="lp-lead">{a['lead']}</p>
    <div class="lp-kicker">
      <span>Resposta em até 1 hora no horário comercial</span><span>Presencial ou online</span>
    </div>
    <div class="lp-acts">
      {btn_wa(a['wa'], 'Falar com um advogado agora')}
      <a href="#formulario" class="btn-ghost">Prefiro escrever meu caso</a>
    </div>
    <div class="lp-nota">12 anos de atuação em Direito de Família e Sucessões · OAB/DF 46809 e 84596</div>
  </div>
</section>

<!-- PROVA -->
<section class="lp-prova"><div class="lp-wrap">
  <div class="lp-prova-in">
    <div class="estrelas" aria-hidden="true">{STAR*5}</div>
    <div><b>5,0 de 5</b><span>51 avaliações de clientes no Google</span></div>
    <a href="https://maps.google.com/maps?cid=1482512693113634362" target="_blank" rel="noopener" data-evt="perfil-google">Ver no Google</a>
  </div>
</div></section>

<!-- SITUACOES -->
<section class="lp-sits"><div class="lp-wrap">
  <h2>{a['situacoes_tit']}</h2>
  <div class="sit-grid">{sits}</div>
  <div class="lp-cta-mid">
    <p>Não sabe em qual dessas situações o seu caso se encaixa? A gente ajuda a identificar.</p>
    {btn_wa('Olá, não sei em qual situação o meu caso se encaixa, pode me ajudar?', 'Contar minha situação')}
  </div>
</div></section>

<!-- OBJECOES -->
<section class="lp-objs"><div class="lp-wrap">
  <h2>As dúvidas que mais travam o primeiro contato</h2>
  <div class="obj-grid">{objs}</div>
</div></section>

<!-- COMO FUNCIONA -->
<section class="lp-passos"><div class="lp-wrap">
  <h2>Como funciona o atendimento</h2>
  <div class="passo-grid">
    <div class="passo"><span>01</span><h3>Você conta o que está acontecendo</h3><p>Sem precisar saber o nome jurídico do problema nem chegar com documento nenhum.</p></div>
    <div class="passo"><span>02</span><h3>O escritório organiza o cenário</h3><p>Identificamos o assunto, a urgência e o que precisa ser analisado.</p></div>
    <div class="passo"><span>03</span><h3>Você entende os caminhos</h3><p>Alternativas, pontos de atenção, prazos e custos conforme o seu caso.</p></div>
    <div class="passo"><span>04</span><h3>Você decide o próximo passo</h3><p>Só então, sabendo o que está em jogo e quais são os caminhos possíveis.</p></div>
  </div>
</div></section>

<!-- SOCIOS -->
<section class="lp-socios"><div class="lp-wrap">
  <h2>Quem vai cuidar do seu caso</h2>
  <div class="socios-min">
    <div class="socio-min">
      <img src="../images/leonardo.jpg" alt="Leonardo Cidade Castello Branco" width="480" height="640" style="object-position:center 24%" loading="lazy">
      <div><h3>Leonardo Cidade Castello Branco</h3><p class="oab">OAB/DF 46809</p><p>Especialista em Direito de Família e Sucessões pelo IBMEC. Formado também em Comunicação Social.</p></div>
    </div>
    <div class="socio-min">
      <img src="../images/rinaldo.jpg" alt="Rinaldo Pimentel" width="480" height="640" style="object-position:center 17%" loading="lazy">
      <div><h3>Rinaldo Pimentel</h3><p class="oab">OAB/DF 84596</p><p>Mestre em Direito Constitucional pelo IDP, membro das Comissões de Direito Civil, Militar e do Consumidor da OAB/DF.</p></div>
    </div>
  </div>
</div></section>

<!-- FORMULARIO -->
<section class="lp-form" id="formulario"><div class="lp-wrap">
  <div class="form-grid">
    <div class="form-txt">
      <p class="eyebrow mono">Três formas de começar</p>
      <h2>Conte o que está acontecendo. <em>Entenda os caminhos antes de decidir.</em></h2>
      <p>No horário comercial a resposta costuma sair em até uma hora. Nada do que você escrever aqui é compartilhado fora do escritório.</p>
      <div class="falar-vias">
        <a class="via via-wa" href="{wa(a['wa'])}" target="_blank" rel="noopener" onclick="return gtag_report_conversion();">
          <svg class="ico-wa" width="20" height="20" fill="currentColor" aria-hidden="true"><use href="#ico-whatsapp"></use></svg>
          <span><b>WhatsApp</b>Conversa direta com o escritório</span>
        </a>
        <a class="via" href="tel:+5561991193026" data-evt="telefone">{ICO_TEL}<span><b>(61) 99119-3026</b>Ligação de segunda a sexta</span></a>
      </div>
      <div class="lp-locais">
        <div><b>Águas Claras</b>DF Plaza Shopping · Rua Copaíba nº 01, Bloco A, Salas 2010 a 2014</div>
        <div><b>Asa Sul</b>Complexo Brasil 21 · SHS Q06, Conj. A, Bloco A, Sala 501</div>
      </div>
    </div>

    <form class="falar-form" id="formCaso" novalidate>
      <p class="form-tit">Prefere escrever? Responda em um minuto</p>
      <label for="f-nome">Seu nome</label>
      <input id="f-nome" name="nome" type="text" autocomplete="name" required placeholder="Como podemos te chamar">
      <label for="f-contato">WhatsApp ou telefone</label>
      <input id="f-contato" name="contato" type="tel" inputmode="tel" autocomplete="tel" required placeholder="(61) 90000-0000">
      <label for="f-assunto">Qual é o assunto</label>
      <select id="f-assunto" name="assunto">{opts}</select>
      <label for="f-caso">Em poucas palavras, o que está acontecendo</label>
      <textarea id="f-caso" name="caso" rows="3" placeholder="Não precisa saber o nome jurídico do problema"></textarea>
      <input type="text" name="empresa" id="f-empresa" tabindex="-1" autocomplete="off" aria-hidden="true">
      <button type="submit" class="form-btn">Enviar para o escritório</button>
      <p class="form-nota" id="formNota">Ao enviar, você recebe o retorno pelo contato informado. Conteúdo informativo, sem promessa de resultado.</p>
    </form>
  </div>
</div></section>

<!-- FAQ -->
<section class="lp-faq"><div class="lp-wrap">
  <h2>Perguntas frequentes sobre {a['nome'].lower()}</h2>
  <div class="faq-grid">{faqs}</div>
</div></section>

<footer class="lp-footer">
  <div class="lp-wrap">
    <img src="../images/logo-white.png" alt="Pimentel e Castello Branco Advogados Associados" class="logo-img footer-logo-img">
    <p>Pimentel e Castello Branco Advogados Associados · Brasília/DF<br>Direito de Família e Sucessões · <a href="../index.html">Página inicial</a> · <a href="../blog/">Blog</a></p>
    <p class="oab-note">Em conformidade com o Código de Ética e Disciplina da OAB, este conteúdo tem caráter meramente informativo, não constituindo oferta, promessa de resultado ou captação de clientela.</p>
  </div>
</footer>

<a href="{wa(a['wa'])}" onclick="return gtag_report_conversion();" class="wa-float" target="_blank" rel="noopener" aria-label="Conversar no WhatsApp">
  <svg class="ico-wa" width="30" height="30" fill="#fff" aria-hidden="true"><use href="#ico-whatsapp"></use></svg>
</a>

<div class="lp-sticky">
  <a href="tel:+5561991193026" data-evt="telefone">{ICO_TEL}Ligar</a>
  <a href="{wa(a['wa'])}" target="_blank" rel="noopener" onclick="return gtag_report_conversion();" class="st-wa">
    <svg class="ico-wa" width="18" height="18" fill="currentColor" aria-hidden="true"><use href="#ico-whatsapp"></use></svg>Falar no WhatsApp
  </a>
</div>

<script src="../js/radar.js" defer></script>
<script src="../js/script.js" defer></script>
</body>
</html>"""

for a in AREAS:
    d = ROOT / a["slug"]; d.mkdir(exist_ok=True)
    (d / "index.html").write_text(page(a), encoding="utf-8")
    print("ok", a["slug"])
