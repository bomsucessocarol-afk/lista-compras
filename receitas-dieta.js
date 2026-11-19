'use strict';
/* Pacote "Receitas de dieta": 50 receitas com menos calorias (plano Dieta).
   meal: cafe | almoco | lanche  (almoco também serve para o jantar) */
const RECEITAS_DIETA = [
  /* ---------------- CAFÉ DA MANHÃ (12) ---------------- */
  { meal: 'cafe', texto: `Omelete de claras com espinafre
Rende 1 porção
Ingredientes:
4 claras de ovo
30 g de espinafre
20 g de queijo minas frescal
1 colher de chá de azeite
1 pitada de sal
Modo de preparo:
Bata as claras com o sal, junte o espinafre picado e o queijo e cozinhe na frigideira com o azeite, dos dois lados.` },
  { meal: 'cafe', texto: `Crepioca simples
Rende 1 porção
Ingredientes:
1 ovo
2 colheres de sopa de fécula de mandioca (goma de tapioca)
30 g de queijo minas frescal
1 pitada de sal
Modo de preparo:
Misture o ovo com a goma e o sal, despeje na frigideira antiaderente, vire e recheie com o queijo.` },
  { meal: 'cafe', texto: `Panqueca de banana e aveia
Rende 1 porção
Ingredientes:
1 banana
1 ovo
2 colheres de sopa de aveia
Modo de preparo:
Amasse a banana, misture o ovo e a aveia e doure na frigideira antiaderente dos dois lados.` },
  { meal: 'cafe', texto: `Mingau de aveia com canela
Rende 1 porção
Ingredientes:
200 ml de leite desnatado
3 colheres de sopa de aveia
1 colher de chá de canela em pó
1 colher de chá de adoçante culinário
Modo de preparo:
Cozinhe o leite com a aveia mexendo até engrossar. Finalize com canela e adoçante.` },
  { meal: 'cafe', texto: `Pão integral com ovo mexido
Rende 1 porção
Ingredientes:
50 g de pão de forma integral
2 ovos
1 tomate
1 pitada de sal
Modo de preparo:
Mexa os ovos na frigideira antiaderente com sal e sirva no pão com rodelas de tomate.` },
  { meal: 'cafe', texto: `Tapioca de frango com ricota
Rende 1 porção
Ingredientes:
3 colheres de sopa de fécula de mandioca (goma de tapioca)
50 g de peito de frango
30 g de ricota
Modo de preparo:
Espalhe a goma na frigideira, quando firmar vire e recheie com o frango e a ricota.` },
  { meal: 'cafe', texto: `Iogurte com morango e chia
Rende 1 porção
Ingredientes:
170 g de iogurte natural desnatado
100 g de morango
1 colher de sopa de chia
Modo de preparo:
Coloque o iogurte no pote, junte os morangos picados e a chia por cima.` },
  { meal: 'cafe', texto: `Overnight oats de maçã
Rende 1 porção
Ingredientes:
3 colheres de sopa de aveia
150 ml de leite desnatado
1 maçã fuji
1 colher de chá de canela em pó
Modo de preparo:
Misture aveia, leite e canela no pote, cubra com a maçã picada e deixe na geladeira de um dia para o outro.` },
  { meal: 'cafe', texto: `Cuscuz com ovo e tomate
Rende 1 porção
Ingredientes:
50 g de flocos de milho (flocão)
1 ovo
1 tomate
1 pitada de sal
Modo de preparo:
Hidrate o flocão com água e sal, cozinhe no vapor por 10 minutos e sirva com ovo cozido e tomate.` },
  { meal: 'cafe', texto: `Vitamina de mamão com aveia
Rende 1 porção
Ingredientes:
150 g de mamão papaia
200 ml de leite desnatado
1 colher de sopa de aveia
Modo de preparo:
Bata tudo no liquidificador e sirva gelado.` },
  { meal: 'cafe', texto: `Pão integral com ricota e peito de peru
Rende 1 porção
Ingredientes:
50 g de pão de forma integral
40 g de ricota
40 g de peru (peito de peru)
Modo de preparo:
Passe a ricota no pão e recheie com o peito de peru.` },
  { meal: 'cafe', texto: `Ovos cozidos com mamão
Rende 1 porção
Ingredientes:
2 ovos
150 g de mamão papaia
Modo de preparo:
Cozinhe os ovos por 10 minutos e sirva com o mamão em pedaços.` },

  /* ---------------- ALMOÇO E JANTAR (24) ---------------- */
  { meal: 'almoco', texto: `Frango grelhado com limão e ervas
Rende 2 porções
Ingredientes:
300 g de peito de frango
1 limão
1 dente de alho
1 colher de chá de azeite
1 colher de chá de sal
Modo de preparo:
Tempere os filés com limão, alho, sal e ervas. Grelhe na frigideira com o azeite até dourar.` },
  { meal: 'almoco', texto: `Frango desfiado com abobrinha
Rende 2 porções
Ingredientes:
250 g de peito de frango
1 abobrinha
1 tomate
1/2 cebola
1 colher de chá de azeite
1 colher de chá de sal
Modo de preparo:
Cozinhe e desfie o frango. Refogue a cebola no azeite, junte o frango, a abobrinha em cubos, o tomate e o sal.` },
  { meal: 'almoco', texto: `Escondidinho de frango com abóbora
Rende 4 porções
Ingredientes:
500 g de abóbora cabotiã
400 g de peito de frango
1 tomate
1/2 cebola
30 g de queijo parmesão
1 colher de chá de sal
Modo de preparo:
Cozinhe e amasse a abóbora com sal. Refogue o frango desfiado com cebola e tomate. Monte em camadas, cubra com parmesão e leve ao forno por 15 minutos.` },
  { meal: 'almoco', texto: `Peixe assado com legumes
Rende 2 porções
Ingredientes:
300 g de pescada em filé
1 abobrinha
1 cenoura
1 tomate
1 colher de chá de azeite
1 colher de chá de sal
Modo de preparo:
Arrume os legumes em rodelas na assadeira, coloque o peixe temperado com sal e limão por cima, regue com azeite e asse por 25 minutos.` },
  { meal: 'almoco', texto: `Salmão grelhado
Rende 2 porções
Ingredientes:
250 g de salmão sem pele
1 limão
1 colher de chá de sal
Modo de preparo:
Tempere com limão e sal e grelhe 4 minutos de cada lado.` },
  { meal: 'almoco', texto: `Carne moída com chuchu
Rende 3 porções
Ingredientes:
300 g de carne moída
2 chuchus
1 tomate
1/2 cebola
1 colher de chá de azeite
1 colher de chá de sal
Modo de preparo:
Refogue a cebola no azeite, doure a carne, junte o chuchu em cubos, o tomate e o sal e cozinhe tampado até amaciar.` },
  { meal: 'almoco', texto: `Bife acebolado magro
Rende 2 porções
Ingredientes:
250 g de patinho em bife
1 cebola
1 colher de chá de azeite
1 colher de chá de sal
Modo de preparo:
Grelhe os bifes temperados com sal. Na mesma frigideira, doure a cebola em rodelas e sirva por cima.` },
  { meal: 'almoco', texto: `Strogonoff fit de frango
Rende 3 porções
Ingredientes:
400 g de peito de frango
170 g de iogurte natural desnatado
3 colheres de sopa de molho de tomate
1/2 cebola
1 colher de chá de azeite
1 colher de chá de sal
Modo de preparo:
Doure o frango em cubos com a cebola no azeite, junte o molho de tomate e o sal. Desligue o fogo e misture o iogurte.` },
  { meal: 'almoco', texto: `Omelete de forno com legumes
Rende 3 porções
Ingredientes:
6 ovos
1 cenoura
1 abobrinha
1 tomate
30 g de queijo minas frescal
1 colher de chá de sal
Modo de preparo:
Bata os ovos com sal, misture os legumes ralados e o queijo, coloque numa forma untada e asse por 25 minutos.` },
  { meal: 'almoco', texto: `Lentilha refogada
Rende 4 porções
Ingredientes:
200 g de lentilha crua
1 cenoura
1/2 cebola
1 dente de alho
1 colher de chá de azeite
1 colher de chá de sal
Modo de preparo:
Cozinhe a lentilha por 20 minutos. Refogue cebola e alho no azeite, junte a lentilha, a cenoura em cubos e o sal.` },
  { meal: 'almoco', texto: `Grão-de-bico com espinafre
Rende 3 porções
Ingredientes:
150 g de grão-de-bico cru
60 g de espinafre
1 tomate
1/2 cebola
1 colher de chá de azeite
1 colher de chá de sal
Modo de preparo:
Deixe o grão-de-bico de molho e cozinhe na pressão por 20 minutos. Refogue cebola e tomate no azeite, junte o grão e o espinafre.` },
  { meal: 'almoco', texto: `Arroz integral
Rende 4 porções
Ingredientes:
1 xícara de arroz integral
1/2 cebola
1 colher de chá de azeite
1 colher de chá de sal
Modo de preparo:
Refogue a cebola no azeite, junte o arroz e o sal, cubra com 3 xícaras de água quente e cozinhe por 35 minutos.` },
  { meal: 'almoco', texto: `Feijão preto sem gordura
Rende 6 porções
Ingredientes:
300 g de feijão preto cru
1/2 cebola
2 dentes de alho
1 colher de chá de sal
Modo de preparo:
Cozinhe o feijão na pressão por 30 minutos e tempere com cebola, alho e sal, sem bacon nem óleo.` },
  { meal: 'almoco', texto: `Purê de abóbora
Rende 3 porções
Ingredientes:
400 g de abóbora cabotiã
1 colher de chá de azeite
1 colher de chá de sal
Modo de preparo:
Cozinhe a abóbora, amasse ainda quente e misture o azeite e o sal.` },
  { meal: 'almoco', texto: `Batata-doce assada
Rende 2 porções
Ingredientes:
300 g de batata doce
1 colher de chá de azeite
1 colher de chá de sal
Modo de preparo:
Corte em palitos, tempere com azeite e sal e asse a 200 °C por 30 minutos.` },
  { meal: 'almoco', texto: `Brócolis e couve-flor no vapor
Rende 2 porções
Ingredientes:
150 g de brócolis
150 g de couve-flor
1 colher de chá de azeite
1 pitada de sal
Modo de preparo:
Cozinhe no vapor por 8 minutos e tempere com azeite e sal.` },
  { meal: 'almoco', texto: `Salada de folhas com tomate e pepino
Rende 2 porções
Ingredientes:
100 g de alface crespa
50 g de rúcula
1 tomate
1 pepino
1 colher de chá de azeite
1 pitada de sal
Modo de preparo:
Lave as folhas, corte os legumes e tempere com limão, azeite e sal na hora de servir.` },
  { meal: 'almoco', texto: `Salada de atum com grão-de-bico
Rende 2 porções
Ingredientes:
120 g de atum em conserva
70 g de grão-de-bico cru (já cozido)
1 tomate
1/2 cebola
1 colher de chá de azeite
Modo de preparo:
Escorra o óleo do atum e misture tudo com cebola picada, tomate e azeite.` },
  { meal: 'almoco', texto: `Sopa de abóbora com frango
Rende 4 porções
Ingredientes:
500 g de abóbora cabotiã
250 g de peito de frango
1 cebola
1 dente de alho
1 colher de chá de sal
Modo de preparo:
Cozinhe a abóbora com cebola e alho, bata no liquidificador e volte ao fogo com o frango desfiado e o sal.` },
  { meal: 'almoco', texto: `Sopa de legumes detox
Rende 4 porções
Ingredientes:
1 abobrinha
1 cenoura
1 chuchu
100 g de couve manteiga
1 cebola
1 colher de chá de sal
Modo de preparo:
Cozinhe os legumes picados em 1 litro de água por 20 minutos. Junte a couve no final e tempere com sal.` },
  { meal: 'almoco', texto: `Abobrinha recheada com carne
Rende 2 porções
Ingredientes:
2 abobrinhas
200 g de carne moída
1 tomate
20 g de queijo parmesão
1 colher de chá de sal
Modo de preparo:
Corte as abobrinhas ao meio, retire o miolo, recheie com a carne refogada com tomate e o miolo, polvilhe parmesão e asse por 20 minutos.` },
  { meal: 'almoco', texto: `Berinjela à parmegiana fit
Rende 3 porções
Ingredientes:
2 berinjelas
1 xícara de molho de tomate
80 g de queijo mussarela
1 colher de chá de sal
Modo de preparo:
Grelhe as fatias de berinjela, monte camadas com molho e queijo e leve ao forno até derreter.` },
  { meal: 'almoco', texto: `Frango ao curry com legumes
Rende 3 porções
Ingredientes:
400 g de peito de frango
1 cenoura
100 g de brócolis
1/2 cebola
1 colher de chá de azeite
1 colher de chá de sal
Modo de preparo:
Doure o frango em cubos com a cebola no azeite, tempere com curry e sal, junte a cenoura e o brócolis e cozinhe tampado por 10 minutos.` },
  { meal: 'almoco', texto: `Wrap de alface com frango
Rende 2 porções
Ingredientes:
200 g de peito de frango
100 g de alface americana
1 tomate
1 cenoura
Modo de preparo:
Use as folhas de alface no lugar do pão e recheie com frango desfiado, tomate e cenoura ralada.` },

  /* ---------------- LANCHES (14) ---------------- */
  { meal: 'lanche', texto: `Iogurte com banana e canela
Rende 1 porção
Ingredientes:
170 g de iogurte natural desnatado
1 banana
1 colher de chá de canela em pó
Modo de preparo:
Corte a banana sobre o iogurte e polvilhe canela.` },
  { meal: 'lanche', texto: `Maçã com pasta de amendoim
Rende 1 porção
Ingredientes:
1 maçã fuji
1 colher de sopa de pasta de amendoim
Modo de preparo:
Corte a maçã em fatias e passe um pouco da pasta em cada uma.` },
  { meal: 'lanche', texto: `Mix de castanhas
Rende 1 porção
Ingredientes:
15 g de castanha do brasil
15 g de castanha de caju
Modo de preparo:
Separe a porção num potinho para não exagerar.` },
  { meal: 'lanche', texto: `Pipoca de panela sem óleo
Rende 1 porção
Ingredientes:
25 g de pipoca
1 pitada de sal
Modo de preparo:
Estoure o milho em panela antiaderente tampada, sem óleo, e tempere com sal.` },
  { meal: 'lanche', texto: `Chips de batata-doce no forno
Rende 2 porções
Ingredientes:
200 g de batata doce
1 colher de chá de azeite
1 pitada de sal
Modo de preparo:
Corte em fatias bem finas, pincele azeite e asse a 180 °C até ficarem crocantes.` },
  { meal: 'lanche', texto: `Bolo de caneca de banana
Rende 1 porção
Ingredientes:
1 banana
1 ovo
2 colheres de sopa de aveia
1 colher de chá de cacau
1 colher de chá de fermento em pó
Modo de preparo:
Amasse a banana na caneca, misture o resto e leve ao micro-ondas por 2 minutos.` },
  { meal: 'lanche', texto: `Muffin de frango com legumes
Rende 6 porções
Ingredientes:
4 ovos
200 g de peito de frango
1 cenoura
1 tomate
1 colher de chá de sal
Modo de preparo:
Misture tudo, distribua em forminhas de muffin e asse por 20 minutos.` },
  { meal: 'lanche', texto: `Palitos de cenoura com pasta de ricota
Rende 1 porção
Ingredientes:
1 cenoura
50 g de ricota
1 pitada de sal
Modo de preparo:
Amasse a ricota com sal e ervas e sirva com a cenoura em palitos.` },
  { meal: 'lanche', texto: `Smoothie de morango
Rende 1 porção
Ingredientes:
150 g de morango
170 g de iogurte natural desnatado
1 colher de chá de adoçante culinário
Modo de preparo:
Bata tudo no liquidificador com gelo.` },
  { meal: 'lanche', texto: `Salada de frutas
Rende 2 porções
Ingredientes:
1 banana
1 maçã fuji
100 g de mamão papaia
100 g de melancia
1 laranja
Modo de preparo:
Pique as frutas e regue com o suco da laranja.` },
  { meal: 'lanche', texto: `Torrada integral com queijo branco
Rende 1 porção
Ingredientes:
50 g de pão de forma integral
40 g de queijo minas frescal
1 tomate
Modo de preparo:
Toste o pão e cubra com queijo e rodelas de tomate.` },
  { meal: 'lanche', texto: `Gelatina com iogurte
Rende 2 porções
Ingredientes:
10 g de gelatina em pó sem sabor
170 g de iogurte natural desnatado
100 g de morango
1 colher de chá de adoçante culinário
Modo de preparo:
Dissolva a gelatina em água quente, bata com o iogurte, os morangos e o adoçante e leve à geladeira.` },
  { meal: 'lanche', texto: `Ovo cozido com tomate
Rende 1 porção
Ingredientes:
2 ovos
1 tomate
1 pitada de sal
Modo de preparo:
Cozinhe os ovos por 10 minutos e sirva com tomate e sal.` },
  { meal: 'lanche', texto: `Banana assada com canela
Rende 1 porção
Ingredientes:
1 banana
1 colher de chá de canela em pó
Modo de preparo:
Asse a banana com casca por 15 minutos, abra e polvilhe canela.` },
];
