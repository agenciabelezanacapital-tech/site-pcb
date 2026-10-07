# -*- coding: utf-8 -*-
import json, os, sys, html, re, datetime, pathlib
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from posts import POSTS

ROOT = pathlib.Path(sys.argv[1]).resolve()   # raiz do repo site-pcb
BASE = "https://www.pcbadvogadosassociados.com.br"
WA = "https://wa.me/5561991193026"

AREA_ANCHOR = {
 "Divórcio e partilha":"area-divorcio",
 "Inventário e herança":"area-inventario",
 "Guarda e convivência":"area-guarda",
 "Pensão alimentícia":"area-pensao",
}

def wa(txt):
    import urllib.parse
    return WA + "?text=" + urllib.parse.quote(txt)

def br_date(iso):
    d = datetime.date.fromisoformat(iso)
    meses = ["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"]
    return f"{d.day} de {meses[d.month-1]} de {d.year}"

HEAD_COMMON = """<meta charset="UTF-8">
<script>document.documentElement.className+=" js";</script>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="dark">
<meta name="robots" content="index, follow, max-image-preview:large">
<link rel="icon" href="{up}images/selo-navy.png" type="image/png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Outfit:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{up}css/style.css">
<link rel="stylesheet" href="{up}css/blog.css">
<link rel="alternate" type="application/rss+xml" title="Blog PCB Advogados" href="{base}/blog/feed.xml">"""

GTAG = """<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-18382324624"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'AW-18382324624');
  var GA4_ID = 'G-9NR1V3DK4W';
  if (GA4_ID.indexOf('XXXX') === -1) { gtag('config', GA4_ID); }
</script>
<script>
function gtag_report_conversion(url) {
  gtag('event', 'conversion', {'send_to':'AW-18382324624/JFHuCMzKqeEcEJCHsL1E','value':1.0,'currency':'BRL','transport_type':'beacon'});
  return true;
}
</script>"""

WA_SVG = """<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <symbol id="ico-whatsapp" viewBox="0 0 24 24"><path d="M17.5 14.4c-.3-.2-1.7-.9-2-1-.3-.1-.5-.1-.6.2-.2.3-.7 1-.9 1.1-.2.2-.3.2-.6.1-.3-.2-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.6-1.5-.8-2.1-.2-.5-.4-.5-.6-.5h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2 0 1.3.9 2.5 1.1 2.7.1.2 1.8 2.8 4.4 3.9.6.3 1.1.4 1.5.5.6.2 1.2.2 1.6.1.5-.1 1.7-.7 1.9-1.3.2-.7.2-1.2.2-1.3-.1-.2-.3-.2-.6-.4z"/><path d="M12 2a10 10 0 00-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1012 2zm0 18a8 8 0 01-4.1-1.1l-.3-.2-2.9.8.8-2.8-.2-.3A8 8 0 1112 20z"/></symbol>
</svg>"""

def header(up):
    return f"""<header class="bar">
  <a href="{up}index.html" class="logo" aria-label="PCB Advogados — página inicial">
    <img src="{up}images/logo-white.png" alt="Pimentel e Castello Branco Advogados Associados" class="logo-img">
  </a>
  <nav class="nav" id="site-nav" aria-label="Navegação principal">
    <a href="{up}index.html#areas">Áreas de atuação</a>
    <a href="{up}index.html#socios">Sócios</a>
    <a href="{up}blog/">Blog</a>
    <a href="{up}index.html#duvidas">Dúvidas</a>
    <a href="{up}index.html#locais">Localização</a>
    <a href="{up}index.html#falar">Contato</a>
  </nav>
  <div class="bar-actions">
    <a href="tel:+5561991193026" class="bar-tel" data-evt="telefone" aria-label="Ligar para o escritório">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1.9.4 1.8.7 2.7a2 2 0 01-.5 2.1L8.1 9.9a16 16 0 006 6l1.4-1.2a2 2 0 012.1-.5c.9.3 1.8.6 2.7.7a2 2 0 011.7 2z"/></svg>
      <span>(61) 99119-3026</span>
    </a>
    <a href="{wa('Olá, vim pelo blog e gostaria de entender melhor o meu caso')}" onclick="return gtag_report_conversion();" class="bar-cta" target="_blank" rel="noopener">Falar com um advogado</a>
    <button type="button" class="nav-toggle" id="navToggle" aria-expanded="false" aria-controls="site-nav" aria-label="Abrir menu de navegação"><span></span><span></span><span></span></button>
  </div>
</header>
<div class="nav-backdrop" id="navBackdrop"></div>"""

def footer(up):
    return f"""<footer>
  <div class="foot-top">
    <div class="logo"><img src="{up}images/logo-white.png" alt="Pimentel e Castello Branco Advogados Associados" class="logo-img footer-logo-img"></div>
    <a href="{wa('Olá, vim pelo blog do PCB')}" onclick="return gtag_report_conversion();" class="btn-wa" target="_blank" rel="noopener">
      <svg class="ico-wa" width="18" height="18" fill="currentColor" aria-hidden="true"><use href="#ico-whatsapp"></use></svg>(61) 99119-3026
    </a>
  </div>
  <div class="foot-legal">
    Pimentel e Castello Branco Advogados Associados · Brasília/DF<br>
    <span class="brand">© 2026 · Todos os direitos reservados</span>
    <p class="oab-note">Em conformidade com o Código de Ética e Disciplina da OAB, este conteúdo tem caráter meramente informativo, não constituindo oferta, promessa de resultado ou captação de clientela.</p>
  </div>
</footer>
<a href="{wa('Olá, vim pelo blog')}" onclick="return gtag_report_conversion();" class="wa-float" target="_blank" rel="noopener" aria-label="Conversar no WhatsApp">
  <svg class="ico-wa" width="30" height="30" fill="#fff" aria-hidden="true"><use href="#ico-whatsapp"></use></svg>
</a>
<script src="{up}js/radar.js" defer></script>
<script src="{up}js/script.js" defer></script>"""

def faq_html(faq):
    its = "".join(f'<div class="faq-item"><button class="faq-q">{q} <span class="plus">+</span></button><div class="faq-a"><p>{a}</p></div></div>' for q,a in faq)
    return f'<h2>Perguntas frequentes</h2><div class="faq-grid post-faq">{its}</div>'

def build_post(p, prev_next):
    up = "../../"
    url = f"{BASE}/blog/{p['slug']}/"
    ld = {
      "@context":"https://schema.org",
      "@graph":[
        {"@type":"Article","@id":url+"#article","headline":p["titulo"],"description":p["description"],
         "datePublished":p["data"],"dateModified":p["data"],"inLanguage":"pt-BR",
         "mainEntityOfPage":{"@type":"WebPage","@id":url},
         "author":{"@type":"Organization","name":"PCB Advogados","url":BASE+"/"},
         "publisher":{"@type":"Organization","name":"Pimentel e Castello Branco Advogados Associados","url":BASE+"/","logo":{"@type":"ImageObject","url":BASE+"/images/logo-navy.png"}},
         "about":p["area"],"keywords":p["keyword"]},
        {"@type":"BreadcrumbList","itemListElement":[
          {"@type":"ListItem","position":1,"name":"Início","item":BASE+"/"},
          {"@type":"ListItem","position":2,"name":"Blog","item":BASE+"/blog/"},
          {"@type":"ListItem","position":3,"name":p["titulo"],"item":url}]},
        {"@type":"FAQPage","@id":url+"#faq","mainEntity":[
          {"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":a}} for q,a in p["faq"]]}
      ]
    }
    outros = "".join(
      f'<a class="rel-card" href="../{o["slug"]}/"><span class="rel-area">{o["area"]}</span><b>{o["titulo"]}</b></a>'
      for o in prev_next)
    anchor = AREA_ANCHOR.get(p["area"],"areas")
    cta_msg = f'Olá, li o artigo sobre {p["titulo"].split(":")[0].lower()} e gostaria de entender o meu caso'
    return f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
{GTAG}
{HEAD_COMMON.format(up=up, base=BASE)}
<title>{p['title_tag']}</title>
<meta name="description" content="{p['description']}">
<link rel="canonical" href="{url}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="PCB Advogados">
<meta property="og:locale" content="pt_BR">
<meta property="og:url" content="{url}">
<meta property="og:title" content="{p['title_tag']}">
<meta property="og:description" content="{p['description']}">
<meta property="og:image" content="{BASE}/images/socios-leonardo-rinaldo.jpg">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>
</head>
<body class="blog">
{WA_SVG}
{header(up)}

<article class="post">
  <div class="post-wrap">
    <nav class="crumb" aria-label="Você está em"><a href="{up}index.html">Início</a><span>/</span><a href="{up}blog/">Blog</a><span>/</span><span class="cur">{p['area']}</span></nav>
    <span class="post-area">{p['area']}</span>
    <h1>{p['titulo']}</h1>
    <p class="post-meta"><time datetime="{p['data']}">{br_date(p['data'])}</time> · PCB Advogados · Brasília/DF</p>

    <div class="post-body">
{p['corpo']}
    </div>

    <aside class="post-cta">
      <p class="eyebrow mono">Seu caso é diferente de qualquer artigo</p>
      <h3>Conte o que está acontecendo. A primeira conversa não tem custo.</h3>
      <p>Este texto é informativo e não substitui a análise individual. Se a sua situação se parece com alguma das descritas aqui, o escritório consegue dizer, em uma conversa, qual caminho se aplica.</p>
      <div class="post-cta-acts">
        <a class="btn-wa" href="{wa(cta_msg)}" target="_blank" rel="noopener" onclick="return gtag_report_conversion();">
          <svg class="ico-wa" width="19" height="19" fill="currentColor" aria-hidden="true"><use href="#ico-whatsapp"></use></svg>Falar sobre o meu caso
        </a>
        <a class="btn-ghost" href="{up}index.html#falar">Prefiro escrever</a>
      </div>
    </aside>

    <div class="post-body">
{faq_html(p['faq'])}
    </div>

    <div class="post-area-link">
      <p>Veja como o escritório atua nessa frente: <a href="{up}index.html#{anchor}">{p['area']}</a></p>
    </div>

    <section class="relacionados">
      <p class="eyebrow mono">Continue lendo</p>
      <div class="rel-grid">{outros}</div>
    </section>
  </div>
</article>

{footer(up)}
</body>
</html>"""

def build_index(posts):
    up = "../"
    cards = "".join(
      f'<a class="post-card" href="{p["slug"]}/"><span class="rel-area">{p["area"]}</span><h2>{p["titulo"]}</h2><p>{p["description"]}</p><span class="ler">Ler o artigo</span></a>'
      for p in posts)
    ld = {"@context":"https://schema.org","@type":"Blog","@id":BASE+"/blog/#blog","name":"Blog PCB Advogados",
      "description":"Direito de Família e Sucessões explicado em linguagem clara. Divórcio, inventário, guarda, pensão e partilha de bens em Brasília.",
      "inLanguage":"pt-BR","publisher":{"@type":"Organization","name":"Pimentel e Castello Branco Advogados Associados","url":BASE+"/"},
      "blogPost":[{"@type":"BlogPosting","headline":p["titulo"],"url":f"{BASE}/blog/{p['slug']}/","datePublished":p["data"]} for p in posts]}
    return f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
{GTAG}
{HEAD_COMMON.format(up=up, base=BASE)}
<title>Blog | Direito de Família e Sucessões explicado · PCB Advogados</title>
<meta name="description" content="Artigos sobre divórcio, inventário, guarda, pensão alimentícia e partilha de bens, escritos em linguagem clara por um escritório de Brasília.">
<link rel="canonical" href="{BASE}/blog/">
<meta property="og:type" content="website">
<meta property="og:url" content="{BASE}/blog/">
<meta property="og:title" content="Blog | Direito de Família e Sucessões · PCB Advogados">
<meta property="og:description" content="Divórcio, inventário, guarda, pensão e partilha de bens explicados sem juridiquês.">
<meta property="og:image" content="{BASE}/images/socios-leonardo-rinaldo.jpg">
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>
</head>
<body class="blog">
{WA_SVG}
{header(up)}

<section class="blog-hero">
  <div class="post-wrap">
    <p class="eyebrow mono">Blog do escritório</p>
    <h1>Direito de Família e Sucessões, <em>explicado em português comum</em></h1>
    <p class="lead">Divórcio, inventário, guarda, pensão e partilha de bens. Os textos abaixo partem das dúvidas que mais chegam ao escritório e explicam o critério por trás de cada resposta, sem prometer resultado e sem juridiquês.</p>
  </div>
</section>

<section class="blog-lista"><div class="post-wrap">
  <div class="post-grid">{cards}</div>
</div></section>

<section class="blog-cta"><div class="post-wrap">
  <h2>Nenhum artigo substitui a análise do seu caso</h2>
  <p>Se o que você leu se parece com a sua situação, conte o que está acontecendo. A primeira conversa não tem custo.</p>
  <a class="btn-wa" href="{wa('Olá, vim pelo blog e gostaria de entender o meu caso')}" target="_blank" rel="noopener" onclick="return gtag_report_conversion();">
    <svg class="ico-wa" width="20" height="20" fill="currentColor" aria-hidden="true"><use href="#ico-whatsapp"></use></svg>Falar com o escritório
  </a>
</div></section>

{footer(up)}
</body>
</html>"""

def build_feed(posts):
    its = ""
    for p in posts:
        d = datetime.datetime.fromisoformat(p["data"]).strftime("%a, %d %b %Y 09:00:00 -0300")
        its += f"""  <item>
    <title>{html.escape(p['titulo'])}</title>
    <link>{BASE}/blog/{p['slug']}/</link>
    <guid isPermaLink="true">{BASE}/blog/{p['slug']}/</guid>
    <description>{html.escape(p['description'])}</description>
    <pubDate>{d}</pubDate>
  </item>
"""
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
  <title>Blog PCB Advogados</title>
  <link>{BASE}/blog/</link>
  <description>Direito de Família e Sucessões em Brasília, explicado em linguagem clara.</description>
  <language>pt-BR</language>
{its}</channel></rss>
"""

LPS = ["advogado-divorcio-brasilia","advogado-inventario-brasilia",
       "advogado-guarda-brasilia","advogado-pensao-alimenticia-brasilia"]

def build_sitemap(posts):
    urls = [(BASE+"/", "monthly", "1.0", None), (BASE+"/blog/", "weekly", "0.8", None)]
    urls += [(f"{BASE}/{sl}/", "monthly", "0.9", None) for sl in LPS]
    urls += [(f"{BASE}/blog/{p['slug']}/", "monthly", "0.7", p["data"]) for p in posts]
    body = ""
    for loc, cf, pr, lm in urls:
        body += "  <url>\n    <loc>%s</loc>\n" % loc
        if lm: body += "    <lastmod>%s</lastmod>\n" % lm
        body += "    <changefreq>%s</changefreq>\n    <priority>%s</priority>\n  </url>\n" % (cf, pr)
    return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n%s</urlset>\n' % body

def main():
    posts = sorted(POSTS, key=lambda x: x["data"], reverse=True)
    blog = ROOT / "blog"
    blog.mkdir(exist_ok=True)
    for i, p in enumerate(posts):
        rel = [posts[(i+1) % len(posts)], posts[(i+2) % len(posts)]]
        d = blog / p["slug"]; d.mkdir(exist_ok=True)
        (d / "index.html").write_text(build_post(p, rel), encoding="utf-8")
    (blog / "index.html").write_text(build_index(posts), encoding="utf-8")
    (blog / "feed.xml").write_text(build_feed(posts), encoding="utf-8")
    (ROOT / "sitemap.xml").write_text(build_sitemap(posts), encoding="utf-8")
    print("posts:", len(posts))

main()
