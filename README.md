# Simulacao-Praia-Grande


LÓGICA CENTRAL

O cidadão com celular (verde) é a presa do Ladrão (vermelho), ou seja, o agente Ladrão precisa contaminar os verdes, que se tornarão Cidadão sem celular (amarelo) caso sejam roubados. Para ser roubado, basta estarem pertos um do outro, adicionando um roubo ao contador.

O GCM (azul) é a polícia que impede os roubos, para isso acontecer, ela precisa estar perto do ladrão na hora que ele tenta roubar, caso o GCM esteja perto, ele cancela o roubo e prende o ladrão, deletando-o e adicionando uma prisão ao contador.


EVENTO DINÂMICO

Quando o botão Eventos Dinâmicos estiver ativo, devem ocorrer eventos de forma aleatória mas com uma chance baixa:

Evento 1: GCM bike
Neste evento, deve aparecer a imagem que está em C:\Users\allan\Desktop\AgentBased\Images\bike.png no meio da tela, com o título em cima "O governo ficou sem verba, a GCM está de bike" e outro texto em baixo da imagem dizendo "Velocidade dos GCMs reduzida em 50%"
O resultado é que o agente GCM deve ficar 50% mais lento

Evento 2: Noias de patinetes elétricos
Neste evento, deve aparecer a imagem que está em C:\Users\allan\Desktop\AgentBased\Images\noia.png no meio da tela, com o título em cima "Os noias alugaram patinetes elétricos" e outro texto em baixo da imagem dizendo "Velocidade dos ladrões aumentada em 50%"
O resultado é que o agente ladrão deve ficar 50% mais rápido

Evento 3: Revolta da população
Neste evento, deve aparecer a imagem que está em C:\Users\allan\Desktop\AgentBased\Images\revolta.png no meio da tela, com o título em cima "A população se revoltou e linchou o nóia" e outro texto em baixo da imagem dizendo "Velocidade dos ladrões reduzida em 50%"
O resultado é que o agente ladrão deve ficar 50% mais lento

FINALIZAÇÃO

Caso 1:
Todos os cidadãos foram roubados

Apresentar na tela o título "Mas o Estado é eficiente?" e abaixo "Todos foram roubados" e incluir estatísticas de roubos, prisões, quantidade de ladrões que sobraram e quantos cidadãos foram roubados no total.

Caso 2:
Todos os ladrões foram presos

Apresentar na tela o título "Se lascaram" e abaixo "Todos os ladrões foram presos", incuir estatísticas de roubos, prisões e quantos cidadãos foram roubados no total mas apresentar como "celulares recuperados".
