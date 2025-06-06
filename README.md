# Simulacao-Praia-Grande


Lógica

O cidadão com celular (verde) é a presa do Ladrão (vermelho), ou seja, o agente Ladrão precisa contaminar os verdes, que se tornarão Cidadão sem celular (amarelo) caso sejam roubados. Para ser roubado, basta estarem pertos um do outro, adicionando um roubo ao contador.

O GCM (azul) é a polícia que impede os roubos, para isso acontecer, ela precisa estar perto do ladrão na hora que ele tenta roubar, caso o GCM esteja perto, ele cancela o roubo e prende o ladrão, deletando-o e adicionando uma prisão ao contador.