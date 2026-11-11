
const A='assets/';
const groups=[
 {slug:'01-conheca-o-pcb',title:'Conheça o PCB',short:'O escritório',slides:[
  {kind:'cover cover-1',html:`<div class="body"><p class="eyebrow">O escritório</p><h1>Conheça<br><em>o PCB.</em></h1><div class="cover-rule"></div><p class="subtitle">Clareza antes de decidir.</p></div><div class="bottom-note"><span>Brasília · Presencial e online</span><span>Conheça os sócios →</span></div>`},
  {kind:'overview',html:`<div class="body"><div class="split-title"><h2>Escuta.<br>Análise.<br><em>Clareza.</em></h2><p class="intro">Entender o contexto, organizar as informações e explicar os caminhos possíveis.<br><br>É assim que começa o atendimento no PCB.</p></div><figure class="photo"><img src="${A}reuniao.png" alt="Os dois sócios analisando um documento"></figure></div>`},
  {kind:'profile',html:`<div class="body"><h2>Leonardo Cidade<br><em>Castello Branco</em></h2><div class="profile-grid"><figure class="photo"><img src="${A}leonardo-atual.webp" alt="Retrato de Leonardo Castello Branco"></figure><div><p class="oab">OAB/DF 46.809</p><h3>Família<br>e Sucessões</h3><p class="bio">Divórcio, união estável, guarda, pensão, inventário e partilha.</p><div class="bio-rule"><p class="qual">Especialista em Direito de Família e Sucessões pelo IBMEC.</p><p class="qual" style="margin-top:18px">Foi membro do IBDFAM (Instituto Brasileiro de Direito das Famílias e Sucessões) e da Comissão de Direito de Família da OAB/DF.</p></div></div></div></div>`},
  {kind:'profile',html:`<div class="body"><h2>Rinaldo<br><em>Pimentel</em></h2><div class="profile-grid"><figure class="photo"><img src="${A}pimentel.png" alt="Retrato de Rinaldo Pimentel"></figure><div><p class="oab">OAB/DF 84.596</p><h3>Civil, Consumidor<br>e Saúde</h3><p class="bio">Atuação também em contratos e Direito Militar.</p><div class="bio-rule"><p class="qual">Mestre em Direito Constitucional pelo IDP.</p><p class="qual" style="margin-top:18px">Membro das Comissões da OAB/DF de Direito Civil, Direito do Consumidor, Direito das Famílias, Direito Médico, Direito Militar e Direito de Execução Cível e Recuperação de Crédito.</p></div></div></div></div>`},
  {kind:'closing',html:`<div class="body"><img class="seal" src="${A}selo-white.png" alt=""><h2>Direito com clareza.<br><em>Atendimento<br>próximo.</em></h2><p>Conheça as áreas de atuação e os canais de contato do escritório.</p>${contact()}</div>`}
 ]},

];
function contact(){return '<div class="contact-box"><div class="eyebrow">WhatsApp do escritório</div><div class="phone">(61) 99119-3026</div><div class="url">pcbadvogadosassociados.com.br</div><div class="mode">Brasília · Presencial e online</div></div>'}
function rows(items){return items.map((x,i)=>'<div class="row"><div class="num">0'+(i+1)+'</div><div><h3>'+x[0]+'</h3><p>'+x[1]+'</p></div></div>').join('')}
function slide(group,s,index){return '<article class="slide '+s.kind+'" data-group="'+group.slug+'" data-index="'+(index+1)+'"><div class="top"><img class="brand" src="'+A+'logo-white.png" alt="Pimentel e Castello Branco Advogados Associados"><div class="top-label">'+group.short+'</div></div>'+s.html+'<div class="footer"><span>PCB · Pimentel e Castello Branco</span><b>'+String(index+1).padStart(2,'0')+' / 05'+(index<4?' &nbsp; →':'')+'</b></div></article>'}
window.pcbGroups=groups;
const params=new URLSearchParams(location.search), group=groups.find(g=>g.slug===params.get('grupo'))||groups[0], index=Math.max(0,Math.min(4,Number(params.get('pagina')||1)-1));
document.querySelector('#app').innerHTML=slide(group,group.slides[index],index);
document.title=group.title+' · '+(index+1)+'/5 · PCB';

