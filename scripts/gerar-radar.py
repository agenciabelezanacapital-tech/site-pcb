#!/usr/bin/env python3
# Gera radar/dados.json ao vivo a partir dos eventos da planilha (Apps Script).
# Endpoint e token sao lidos de js/radar.js (ja publicos no site). Rode da raiz do repo.
import json, statistics, collections, urllib.request, os, re
from datetime import datetime, timezone, timedelta

HERE=os.path.dirname(os.path.abspath(__file__))
RJS=open(os.path.join(HERE,'..','js','radar.js'),encoding='utf-8').read()
EP=re.search(r"RADAR_ENDPOINT\s*=\s*'([^']+)'",RJS).group(1)
TOKEN=re.search(r"RADAR_TOKEN\s*=\s*'([^']+)'",RJS).group(1)
def fetch(url):
    with urllib.request.urlopen(url, timeout=60) as r: return json.load(r)
EV=fetch(f'{EP}?token={TOKEN}&action=funil&dias=0')['eventos']
try: leads_total=fetch(f'{EP}?token={TOKEN}').get('total',0) or 0
except Exception: leads_total=0

def parse(dt): return datetime.fromisoformat(str(dt).replace('Z','+00:00'))
def is_test(x):
    v=str(x.get('Visita ID','')).lower(); p=str(x.get('Pagina','')).lower(); r=str(x.get('Referrer','')).lower()
    return 'teste' in v or '/teste' in p or r=='teste'
def norm_path(p):
    p=str(p)
    if 'site-pcb/' in p: p='/'+p.split('site-pcb/',1)[1]
    if not p.startswith('/'): p='/'+p
    if p.endswith('index.html'): p=p[:-len('index.html')]
    if p=='': p='/'
    if not p.endswith('/') and '.' not in p.split('/')[-1]: p=p+'/'
    return p
EV=[x for x in EV if not is_test(x)]
for x in EV:
    x['_dt']=parse(x['Data/Hora']); x['Pagina']=norm_path(x.get('Pagina',''))

def band10(v):
    v=float(v)
    if v>=100: return '100%'
    lo=int(v//10)*10; return f"{lo} a {lo+9}%"
def band25(v):
    v=float(v)
    if v>=100: return '100%'
    if v>=75: return '75 a 99%'
    if v>=50: return '50 a 74%'
    if v>=25: return '25 a 49%'
    return '0 a 24%'
def srt(d, byband=False):
    items=list(d.items())
    if byband:
        def key(kv):
            k=kv[0]; return 1000 if k=='100%' else int(k.split(' ')[0])
        items.sort(key=key)
    else: items.sort(key=lambda kv:(-kv[1], str(kv[0])))
    return items

def agg(evs):
    T=lambda t:[x for x in evs if x['Evento']==t]
    pv,clk,ext,stp,aba,wac=T('pageview'),T('click'),T('exit'),T('step'),T('abandon'),T('wa_click')
    visitas=set(x['Visita ID'] for x in pv)
    dev=collections.Counter(str(x['Dispositivo']) for x in pv)
    aparelhos=[{'nome':n,'valor':v} for n,v in sorted(dev.items(), key=lambda kv:-kv[1])]
    pg=collections.Counter(str(x['Pagina']) for x in pv)
    paginas=[{'nome':n,'valor':v} for n,v in srt(pg)]
    seqs=collections.defaultdict(list)
    for x in sorted(pv, key=lambda x:x['_dt']): seqs[x['Visita ID']].append(str(x['Pagina']))
    cam=collections.Counter(tuple(s) for s in seqs.values())
    caminhos=[{'n':n,'passos':list(p)} for p,n in sorted(cam.items(), key=lambda kv:-kv[1])[:10]]
    el=collections.Counter(str(x.get('Texto do botao',''))[:60] for x in clk if str(x.get('Texto do botao','')).strip())
    se=collections.Counter(str(x.get('Secao','')) for x in clk if str(x.get('Secao','')).strip())
    cpg=collections.Counter(str(x['Pagina']) for x in clk)
    fa=collections.Counter()
    for x in clk:
        pos=str(x.get('Posicao na pagina',''))
        if ',' in pos:
            try: fa[band10(float(pos.split(',')[1]))]+=1
            except: pass
    mapa={'pagina':'','pontos':[],'total':0}
    if cpg:
        top=cpg.most_common(1)[0][0]; pts=collections.Counter()
        for x in clk:
            if str(x['Pagina'])!=top: continue
            pos=str(x.get('Posicao na pagina',''))
            if ',' in pos:
                try:
                    xx,yy=pos.split(','); pts[(round(float(xx)),round(float(yy),1))]+=1
                except: pass
        mapa={'pagina':top,'pontos':[{'n':n,'x':k[0],'y':k[1]} for k,n in sorted(pts.items(),key=lambda kv:-kv[1])],'total':sum(pts.values())}
    cliques={'elementos':[{'nome':n,'valor':v} for n,v in srt(el)][:9],
             'faixas':[{'nome':n,'valor':v} for n,v in srt(fa,byband=True)],'mapa':mapa,
             'paginas':[{'nome':n,'valor':v} for n,v in srt(cpg)],
             'secoes':[{'nome':n,'valor':v} for n,v in srt(se)],'total':len(clk)}
    ro=collections.Counter()
    for x in ext:
        r=x.get('Rolagem','')
        if r!='' and r is not None:
            try: ro[band25(float(r)*100)]+=1
            except: pass
    rolagem=[{'nome':n,'valor':v} for n,v in srt(ro,byband=True)]
    secs=[float(x['Segundos']) for x in ext if str(x.get('Segundos','')).strip() not in ('','0')]
    tempos={'media':round(statistics.mean(secs)),'mediana':round(statistics.median(secs)),'n':len(secs)} if secs else {'media':0,'mediana':0,'n':0}
    nomes={1:'Nome',2:'Contato',3:'Assunto',4:'Descricao do caso'}; funil=[]
    for et in [1,2,3,4]:
        vis=set(x['Visita ID'] for x in stp if str(x.get('Etapa',''))==str(et)); nm=nomes[et]
        for x in stp:
            if str(x.get('Etapa',''))==str(et) and str(x.get('Nome da Etapa','')).strip(): nm=str(x['Nome da Etapa']); break
        funil.append({'etapa':et,'nome':nm,'q':len(vis)})
    tv=collections.Counter(str(x.get('Campo travado','')) for x in aba if str(x.get('Campo travado','')).strip())
    return {'aparelhos':aparelhos,'caminhos':caminhos,'cliques':cliques,'funil':funil,'leads':0,
            'pageviews':len(pv),'paginas':paginas,'portas':[],'rolagem':rolagem,'tempos':tempos,
            'travas':[{'nome':n,'valor':v} for n,v in srt(tv)],'visitas':len(visitas),'waCliques':len(wac)}

now=datetime.now(timezone.utc)
def window(evs,dias):
    if dias==0: return evs
    lim=now-timedelta(days=dias); return [x for x in evs if x['_dt']>=lim]
per={}
for k,dias in [('0',0),('1',1),('7',7),('30',30)]:
    a=agg(window(EV,dias))
    if k=='0': a['leads']=leads_total
    per[k]=a
br=now.astimezone(timezone(timedelta(hours=-3)))
out={'atualizadoEm':br.isoformat(timespec='seconds'),
     'fonte':'Planilha PCB Advogados Radar do Site, aba Funil','periodos':per}
json.dump(out, open(os.path.join(HERE,'..','radar','dados.json'),'w'), ensure_ascii=False)
p=per['0']
print(f"OK pageviews={p['pageviews']} visitas={p['visitas']} wa={p['waCliques']} cliques={p['cliques']['total']} leads={p['leads']}")
