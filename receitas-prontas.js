'use strict';
/* Receitas prontas do dia a dia (a pessoa escolhe quais quer no app).
   meal: cafe | almoco | lanche  (almoco também serve para o jantar) */
const RECEITAS_PRONTAS = [
  { meal: 'almoco', texto: `Arroz branco
Rende 6 porções
Ingredientes:
2 xícaras de arroz tipo 1
1 colher de sopa de óleo
1/2 cebola
1 dente de alho
1 colher de chá de sal
Modo de preparo:
Refogue a cebola e o alho no óleo, junte o arroz e o sal, cubra com 4 xícaras de água quente e cozinhe em fogo baixo até secar.` },
  { meal: 'almoco', texto: `Feijão carioca
Rende 8 porções
Ingredientes:
500 g de feijão carioca
1 cebola
2 dentes de alho
1 colher de sopa de óleo
1 colher de chá de sal
Modo de preparo:
Cozinhe o feijão na pressão por 30 minutos. Refogue cebola e alho no óleo, junte ao feijão com o sal e deixe engrossar.` },
  { meal: 'almoco', texto: `Frango grelhado
Rende 4 porções
Ingredientes:
600 g de peito de frango
1 limão
2 dentes de alho
1 colher de sopa de azeite
1 colher de chá de sal
Modo de preparo:
Tempere os filés com limão, alho e sal. Grelhe na frigideira com o azeite, 5 minutos de cada lado.` },
  { meal: 'almoco', texto: `Carne moída refogada com legumes
Rende 4 porções
Ingredientes:
500 g de carne moída
1 cenoura
1 tomate
1 cebola
1 colher de sopa de óleo
1 colher de chá de sal
Modo de preparo:
Refogue a cebola no óleo, junte a carne e deixe dourar. Acrescente a cenoura ralada, o tomate picado e o sal.` },
  { meal: 'almoco', texto: `Strogonoff de frango
Rende 4 porções
Ingredientes:
500 g de peito de frango
1 caixinha de creme de leite
3 colheres de sopa de molho de tomate
1 cebola
1 colher de sopa de óleo
1 colher de chá de sal
Modo de preparo:
Doure o frango em cubos com a cebola no óleo. Junte o molho de tomate e o sal, desligue o fogo e misture o creme de leite.` },
  { meal: 'almoco', texto: `Macarrão à bolonhesa
Rende 4 porções
Ingredientes:
250 g de macarrão
300 g de carne moída
1 xícara de molho de tomate
1 cebola
1 colher de sopa de óleo
Modo de preparo:
Cozinhe o macarrão. Refogue a cebola e a carne no óleo, junte o molho e misture com o macarrão.` },
  { meal: 'almoco', texto: `Peixe assado com batatas
Rende 4 porções
Ingredientes:
600 g de filé de tilápia
3 batatas inglesas
1 tomate
1 cebola
2 colheres de sopa de azeite
1 colher de chá de sal
Modo de preparo:
Arrume as batatas em rodelas na assadeira, coloque o peixe temperado, tomate e cebola por cima, regue com azeite e asse por 30 minutos.` },
  { meal: 'almoco', texto: `Sopa de legumes com frango
Rende 6 porções
Ingredientes:
300 g de peito de frango
2 batatas inglesas
2 cenouras
1 abobrinha
1 cebola
1 colher de sopa de óleo
1 colher de chá de sal
Modo de preparo:
Refogue a cebola e o frango, junte os legumes picados, cubra com água e cozinhe até ficarem macios.` },
  { meal: 'almoco', texto: `Salada simples
Rende 2 porções
Ingredientes:
200 g de alface crespa
2 tomates
1 pepino
1 colher de sopa de azeite
1 colher de chá de sal
Modo de preparo:
Lave, corte e tempere na hora de servir.` },
  { meal: 'almoco', texto: `Purê de batata
Rende 4 porções
Ingredientes:
4 batatas inglesas
1/2 xícara de leite
1 colher de sopa de manteiga
1 colher de chá de sal
Modo de preparo:
Cozinhe as batatas, amasse ainda quentes e misture leite, manteiga e sal.` },
  { meal: 'cafe', texto: `Omelete de queijo
Rende 1 porção
Ingredientes:
2 ovos
1 fatia de queijo mussarela
1 colher de chá de óleo
1 pitada de sal
Modo de preparo:
Bata os ovos com o sal, despeje na frigideira untada, coloque o queijo e dobre.` },
  { meal: 'cafe', texto: `Tapioca com queijo
Rende 1 porção
Ingredientes:
3 colheres de sopa de fécula de mandioca (goma de tapioca)
1 fatia de queijo mussarela
Modo de preparo:
Espalhe a goma na frigideira quente, quando grudar vire, recheie com o queijo e dobre.` },
  { meal: 'cafe', texto: `Cuscuz nordestino com ovo
Rende 2 porções
Ingredientes:
120 g de flocos de milho (flocão)
2 ovos
1 colher de chá de sal
Modo de preparo:
Hidrate o flocão com água e sal por 10 minutos e cozinhe no vapor por 10 minutos. Sirva com os ovos mexidos.` },
  { meal: 'cafe', texto: `Pão com ovo
Rende 1 porção
Ingredientes:
1 pão francês
1 ovo
1 colher de chá de manteiga
Modo de preparo:
Frite o ovo na manteiga e coloque dentro do pão.` },
  { meal: 'lanche', texto: `Vitamina de banana com aveia
Rende 1 porção
Ingredientes:
1 banana
200 ml de leite
2 colheres de sopa de aveia
Modo de preparo:
Bata tudo no liquidificador.` },
  { meal: 'lanche', texto: `Iogurte com frutas
Rende 1 porção
Ingredientes:
1 pote de iogurte natural
1 banana
1 colher de sopa de mel
Modo de preparo:
Corte a banana por cima do iogurte e regue com mel.` },
  { meal: 'lanche', texto: `Bolo simples de liquidificador
Rende 12 porções
Ingredientes:
3 ovos
2 xícaras de açúcar
3 xícaras de farinha de trigo
1 xícara de leite
1/2 xícara de óleo
1 colher de sopa de fermento em pó
Modo de preparo:
Bata ovos, açúcar, leite e óleo no liquidificador. Misture a farinha e o fermento e asse a 180 °C por 40 minutos.` },
];
