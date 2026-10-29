# Pautas do blog PCB — fila de publicação

Fontes: termos de busca reais que acionaram os anúncios da campanha de Google Ads
do escritório, e a lista de dúvidas frequentes levantada com os sócios no onboarding.

Ritmo: **um artigo por dia**, na ordem abaixo. Ao publicar, mover a linha para
"Publicados" no fim deste arquivo.

> **Quando a fila ficar com menos de 10 linhas**, antes de publicar o artigo do dia,
> acrescente 10 pautas novas no fim da tabela. Tire-as dos termos de busca recentes
> da campanha (`get_search_terms` da conta 5436546086) e das perguntas que aparecem
> no "Também se perguntam" do Google para os temas do escritório. Nunca repetir tema
> já publicado: cada pauta precisa responder uma pergunta diferente.

## Fila

| # | Título | Palavra-chave alvo | Área |
|---|---|---|---|
| 22 | Separação de fato: a partir de quando os bens deixam de se comunicar | separação de fato partilha de bens | Divórcio e partilha |
| 23 | Contrato de convivência: como blindar o patrimônio na união estável | contrato de união estável | Divórcio e partilha |
| 24 | Quem são os herdeiros necessários e qual a parte que não se pode tirar | herdeiros necessários legítima | Inventário e herança |
| 25 | O cônjuge herda? Como funciona a concorrência com os filhos | cônjuge tem direito a herança | Inventário e herança |
| 26 | Companheiro em união estável tem direito à herança? | união estável direito a herança | Inventário e herança |
| 27 | Meação e herança não são a mesma coisa | diferença meação e herança | Inventário e herança |
| 28 | ITCMD no Distrito Federal: como funciona o imposto do inventário | itcmd inventário df | Inventário e herança |
| 29 | Documentos necessários para abrir o inventário | documentos para inventário | Inventário e herança |
| 30 | O que acontece com as dívidas de quem faleceu | dívidas do falecido herdeiros | Inventário e herança |
| 31 | Como o inventário trata conta bancária, FGTS e seguro de vida | como sacar conta de falecido | Inventário e herança |
| 32 | Inventário com um só herdeiro: como fica o procedimento | inventário de herdeiro único | Inventário e herança |
| 33 | Doação em vida: quando ela antecipa a herança e quando não | doação em vida herança | Inventário e herança |
| 34 | Holding familiar: o que é e para quem realmente faz sentido | holding familiar | Inventário e herança |
| 35 | Sobrepartilha: quando aparece um bem depois do inventário encerrado | sobrepartilha bem esquecido | Inventário e herança |
| 36 | Posso impedir as visitas do outro genitor? | impedir visita do pai | Guarda e convivência |
| 37 | Mudar de cidade com o filho: o que a lei exige | mudar de cidade com filho guarda | Guarda e convivência |
| 38 | Como regularizar a guarda quando nunca houve processo | regularizar guarda de filho | Guarda e convivência |
| 39 | Guarda do pet: como a Justiça trata os animais na separação | guarda de cachorro separação | Guarda e convivência |
| 40 | Visita dos avós: o direito de convivência da família extensa | direito de visita dos avós | Guarda e convivência |
| 41 | Convivência de bebês e crianças pequenas: por que o calendário é diferente | convivência filho recém nascido | Guarda e convivência |
| 42 | Reconhecimento de paternidade e exame de DNA | reconhecimento de paternidade | Guarda e convivência |
| 43 | Guarda compartilhada quando os pais moram longe um do outro | guarda compartilhada pais em cidades diferentes | Guarda e convivência |
| 44 | Viagem internacional com o filho: autorização e documentos | autorização de viagem para menor | Guarda e convivência |
| 45 | Quem paga as despesas extras do filho além da pensão | despesas extras além da pensão | Pensão alimentícia |
| 46 | Pensão para filho maior que está na faculdade | pensão para filho universitário | Pensão alimentícia |
| 47 | Exoneração de pensão: como pedir o fim da obrigação | exoneração de pensão alimentícia | Pensão alimentícia |
| 48 | Pensão alimentícia quando quem paga é autônomo ou informal | pensão de pai autônomo | Pensão alimentícia |
| 49 | Alimentos gravídicos: pensão durante a gravidez | alimentos gravídicos | Pensão alimentícia |
| 50 | Desconto em folha e bloqueio de conta na cobrança da pensão | desconto em folha pensão alimentícia | Pensão alimentícia |
| 51 | Pensão entre ex-cônjuges: quando ela é devida e por quanto tempo | pensão para ex-esposa | Pensão alimentícia |
| 52 | Acordo de pensão feito por fora tem valor? | acordo de pensão sem advogado | Pensão alimentícia |
| 53 | Pensão e nascimento de outro filho: o que muda no valor | novo filho reduz pensão | Pensão alimentícia |
| 54 | Prescrição da pensão atrasada: até quando dá para cobrar | prazo para cobrar pensão atrasada | Pensão alimentícia |

## Regras editoriais

- 900 a 1.400 palavras, português claro, sem juridiquês desnecessário.
- Nunca prometer resultado, não citar valores de honorários, não oferecer gratuidade,
  desconto ou consulta sem custo em lugar nenhum do texto (art. 3º, I do
  Provimento 205). Também não publicar depoimento de cliente. Conformidade com o Código de Ética da OAB e com o
  Provimento 205.
- Estrutura: `<p class="chamada">` de abertura, 4 a 6 `<h2>`, listas em
  `<ul class="lista">` ou `<ol class="passos">`, 3 perguntas de FAQ.
- Citar institutos e critérios legais sem inventar números, percentuais ou prazos
  que variem por estado sem dizer que variam.
- Áreas válidas (definem o link para a home): Divórcio e partilha, Inventário e
  herança, Guarda e convivência, Pensão alimentícia.

## Como publicar

```bash
cd ~/pcbsite                     # ou clonar de novo, ver README abaixo
# 1. acrescentar o novo dicionário em tools/blog/posts.py
python3 tools/blog/build.py .    # regenera /blog, feed.xml e sitemap.xml
git add -A && git commit -m "Blog: <título>" && git push origin main
```

O build é idempotente: ele regenera todas as páginas a partir de `posts.py`.
Nunca editar o HTML dentro de `/blog` à mão.

## Publicados

- 2026-10-09 · Quais bens entram na partilha segundo o regime de bens
- 2026-10-08 · Quanto custa um divórcio no Distrito Federal
- 2026-10-07 · Divórcio em cartório: quando é possível e quanto tempo leva
- 2026-10-06 · Divórcio consensual ou litigioso: qual caminho serve para o seu caso
- 2026-10-06 · Inventário extrajudicial: as três condições que decidem se o seu caso pode ir ao cartório
- 2026-10-06 · Guarda compartilhada não é dividir o tempo meio a meio
- 2026-10-06 · Como é calculada a pensão alimentícia (e por que não existe percentual fixo)
- 2026-10-06 · Pai não paga pensão: os caminhos de cobrança e como funciona a prisão civil
- 2026-10-06 · Dissolução de união estável: prova da relação, partilha e pensão
- 2026-10-10 · Prazo para abrir inventário e o que acontece se passar
- 2026-10-11 · Quanto tempo demora um inventário em Brasília
- 2026-10-12 · Herdeiro menor de idade: por que o inventário muda de via
- 2026-10-13 · Como conseguir a guarda do filho: o que o juiz analisa
- 2026-10-14 · Guarda unilateral: requisitos e quando ela é concedida
- 2026-10-15 · Alienação parental: como identificar e o que fazer
- 2026-10-16 · Revisão de pensão alimentícia: quando pedir aumento ou redução
- 2026-10-17 · Até que idade o filho tem direito a pensão
- 2026-10-18 · Testamento e planejamento sucessório: organizar em vida o que a família herda
- 2026-10-19 · Preciso da autorização do meu cônjuge para me divorciar?
- 2026-10-20 · Divórcio judicial e extrajudicial: a diferença que muda prazo e custo
- 2026-10-21 · Divórcio com os cônjuges em cidades ou países diferentes
- 2026-10-22 · As dívidas do casal também são divididas no divórcio?
- 2026-10-23 · Dá para vender um bem antes de concluir a partilha?
- 2026-10-24 · Imóvel financiado no divórcio: quem fica com o bem e com a dívida
- 2026-10-25 · Comunhão parcial, universal e separação total: o que muda na prática
- 2026-10-27 · FGTS, previdência e participação nos lucros entram na partilha?
- 2026-10-28 · Empresa no divórcio: o que acontece com as cotas da sociedade
- 2026-10-29 · Voltar a usar o nome de solteiro depois do divórcio
