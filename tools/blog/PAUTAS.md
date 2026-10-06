# Pautas do blog PCB — fila de publicação

Fonte: termos de busca reais que acionaram os anúncios da campanha de Google Ads
do escritório. Publicar **um artigo por semana**, na ordem abaixo. Ao publicar,
mover a linha para "Publicados" no fim deste arquivo.

## Fila

| # | Título | Palavra-chave alvo | Área |
|---|---|---|---|
| 1 | Divórcio em cartório: quando é possível e quanto tempo leva | divórcio em cartório | Divórcio e partilha |
| 2 | Quanto custa um divórcio no Distrito Federal | quanto custa advogado para divórcio | Divórcio e partilha |
| 3 | Quais bens entram na partilha segundo o regime de bens | partilha de bens divórcio | Divórcio e partilha |
| 4 | Prazo para abrir inventário e o que acontece se passar | prazo abertura inventário | Inventário e herança |
| 5 | Quanto tempo demora um inventário em Brasília | quanto tempo demora um inventário | Inventário e herança |
| 6 | Herdeiro menor de idade: por que o inventário muda de via | inventário com herdeiro menor | Inventário e herança |
| 7 | Como conseguir a guarda do filho: o que o juiz analisa | como conseguir a guarda do filho | Guarda e convivência |
| 8 | Guarda unilateral: requisitos e quando ela é concedida | guarda unilateral requisitos | Guarda e convivência |
| 9 | Alienação parental: como identificar e o que fazer | alienação parental advogado | Guarda e convivência |
| 10 | Revisão de pensão alimentícia: quando pedir aumento ou redução | revisão de pensão alimentícia | Pensão alimentícia |
| 11 | Até que idade o filho tem direito a pensão | até quando pagar pensão | Pensão alimentícia |
| 12 | Testamento e planejamento sucessório: organizar em vida o que a família herda | como fazer testamento | Inventário e herança |

## Regras editoriais

- 900 a 1.400 palavras, português claro, sem juridiquês desnecessário.
- Nunca prometer resultado, não citar valores de honorários, não usar a consulta
  sem custo como chamariz. Conformidade com o Código de Ética da OAB e com o
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

- 2026-10-06 · Divórcio consensual ou litigioso: qual caminho serve para o seu caso
- 2026-10-06 · Inventário extrajudicial: as três condições que decidem se o seu caso pode ir ao cartório
- 2026-10-06 · Guarda compartilhada não é dividir o tempo meio a meio
- 2026-10-06 · Como é calculada a pensão alimentícia (e por que não existe percentual fixo)
- 2026-10-06 · Pai não paga pensão: os caminhos de cobrança e como funciona a prisão civil
- 2026-10-06 · Dissolução de união estável: prova da relação, partilha e pensão
