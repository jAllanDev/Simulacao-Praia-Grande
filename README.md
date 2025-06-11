🏖️ Simulação Roubos Praia Grande Pro Edition
Uma simulação baseada em agentes que modela a dinâmica entre cidadãos, ladrões e guardas civis municipais (GCM) em um ambiente urbano inspirado em Praia Grande/SP.

📋 Visão Geral
Este projeto implementa uma simulação baseada em agentes onde diferentes tipos de entidades interagem em um ambiente 2D, criando comportamentos emergentes realistas através de regras simples de interação.

🎯 Objetivo do Jogo
Vitória: Prender todos os ladrões antes que roubem todos os cidadãos
Derrota: Todos os cidadãos com celular são roubados
🎮 Como Jogar
Configure os parâmetros no menu lateral (população, ladrões, GCMs, eficiência)
Pressione qualquer tecla ou clique na tela para iniciar
Observe a simulação em tempo real
Use os controles para pausar ou ajustar a velocidade
🤖 Tipos de Agentes
🟢 Cidadão com Celular
Comportamento: Foge de ladrões próximos
Objetivo: Sobreviver sem ser roubado
Velocidade: 1.1x quando em fuga
🟡 Cidadão sem Celular
Resultado de roubo: Não é mais alvo dos ladrões
Comportamento: Movimento aleatório
🔴 Ladrão
Comportamento: Persegue cidadãos com celular, foge de GCMs
Velocidades:
Perseguição: 1.3x velocidade base
Fuga: 1.8x velocidade base
Alcance de detecção: 100 pixels
🔵 Guarda Civil Municipal (GCM)
Comportamento: Persegue ladrões com eficiência variável
Capacidades especiais:
≥80% eficiência: Modo teleporte (aparece próximo ao ladrão)
Velocidade: 1x a 2.2x baseada na eficiência
Raio de detecção: Aumenta com eficiência
⚙️ Sistema de Eficiência
O parâmetro mais importante que determina as capacidades dos GCMs:

Eficiência	Chance de Prisão	Velocidade	Características
90%	95%	2.2x	Modo teleporte ativo
70%	35%	1.8x	Alta performance
50%	15%	1.6x	Performance média
10%	5%	1.1x	Performance baixa
🎲 Eventos Dinâmicos
Sistema de eventos aleatórios que modificam o jogo (cada um só ocorre 1x por partida):

🚴‍♂️ GCM de Bike
Efeito: Velocidade dos GCMs reduzida em 50%
Mensagem: "O governo ficou sem verba, a GCM está de bike"
🛴 Noias de Patinete
Efeito: Velocidade dos ladrões aumentada em 50%
Mensagem: "Os noias alugaram patinetes elétricos"
😡 Revolta Popular
Efeito: Velocidade dos ladrões reduzida em 50%
Mensagem: "A população se revoltou e linchou o nóia"
🚗 Farofeiros Chegando
Efeito: +20 cidadãos com celular adicionados
Mensagem: "Os farofeiros estão descendo para Praia Grande"
🏃‍♂️ Saidinha de Presos
Efeito: +5 ladrões adicionados
Mensagem: "O governo decretou saidinha para os presos relaxarem"

Sistema de Prisão
Não é automático: Baseado em chance calculada pela eficiência
Falha na prisão: Ladrão ganha boost de velocidade temporário
Cooldown: Impede tentativas consecutivas

🎛️ Controles Disponíveis
Parâmetro	Faixa	Padrão	Descrição
População	10-50	40	Número de cidadãos
Ladrões	1-15	5	Número de ladrões
GCMs	1-10	2	Número de guardas
Eficiência	10-90%	10%	Capacidade dos GCMs
Velocidade	25-200%	60%	Velocidade da simulação
Eventos	ON/OFF	ON	Eventos dinâmicos
🏁 Condições de Fim de Jogo existentes

🛠️ Estrutura Técnica
Classes Principais
Agent: Entidade individual com comportamentos específicos
Simulation: Gerencia ambiente, regras e interações
Sistemas Implementados
Detecção de colisão: Interações entre agentes
Pathfinding básico: Perseguição e fuga
Sistema de eventos: Modificadores dinâmicos
Interface responsiva: Controles em tempo real
Efeitos visuais: Feedback visual das ações

🎨 Características Visuais
Formas diferenciadas para cada tipo de agente
Cores dinâmicas baseadas no estado (perseguindo/fugindo)
Alertas visuais para cidadãos em perigo
Raios de detecção visíveis para GCMs
Linhas de perseguição entre agentes
Efeitos de roubo/prisão com animações

🚀 Como Executar
Clone o repositório
Abra index.html em um navegador moderno
Configure os parâmetros desejados
Pressione qualquer tecla para iniciar a simulação

📁 Estrutura de Arquivos
AgentBased/
├── Frontend/
│   ├── index.html          # Interface principal
│   ├── simulation.js       # Lógica da simulação
│   └── Images/            # Imagens dos eventos
│       ├── bike.png
│       ├── noia.png
│       ├── revolta.png
│       ├── transito.png
│       └── saidinha.png
└── README.md              # Este arquivo




