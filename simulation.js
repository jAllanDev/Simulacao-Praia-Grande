// simulation.js
class Agent {
    constructor(x, y, type, canvas) {
        this.x = x;
        this.y = y;
        this.type = type; // 'cidadao_com_celular', 'cidadao_sem_celular', 'ladrao', 'gcm'
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

// Definir velocidade baseada no tipo
          if (type === 'ladrao') {
            this.speed = Math.random() * 1.5 + 0.8;
        } else if (type === 'gcm') {
            this.speed = Math.random() * 2 + 1.2; // GCM pode ser um pouco mais rápido
        } else {
            this.speed = Math.random() * 1.8 + 0.9; // Cidadãos com velocidade normal
        }

       this.direction = Math.random() * 2 * Math.PI;
        this.radius = 8;
        this.state = 'normal';
        this.alertRadius = 60;
        this.detectionRadius = 40;
        this.target = null;
        this.cooldown = 0;
        this.maxSpeed = this.speed;
        this.alertTimer = 0;
        this.speedModifier = 1;
    }
    
     move() {
        // Reduzir cooldown
        if (this.cooldown > 0) this.cooldown--;
        if (this.alertTimer > 0) this.alertTimer--;
        
        // Comportamento específico por tipo
        if (this.type === 'ladrao') {
            this.ladraoBehavior();
        } else if (this.type === 'gcm') {
            this.gcmBehavior();
        } else {
            this.cidadaoBehavior();
        }
        
        // Aplicar movimento com modificador de velocidade e velocidade do jogo
        const gameSpeedMultiplier = window.simulation ? window.simulation.gameSpeed : 1;
        const finalSpeed = this.speed * this.speedModifier * gameSpeedMultiplier;
        this.x += Math.cos(this.direction) * finalSpeed;
        this.y += Math.sin(this.direction) * finalSpeed;
        
        // Verificar limites com bounce (reflexão)
        const margin = this.radius;
        
        if (this.x <= margin) {
            this.x = margin;
            this.direction = Math.PI - this.direction; // Refletir horizontalmente
        }
        if (this.x >= this.canvas.width - margin) {
            this.x = this.canvas.width - margin;
            this.direction = Math.PI - this.direction; // Refletir horizontalmente
        }
        if (this.y <= margin) {
            this.y = margin;
            this.direction = -this.direction; // Refletir verticalmente
        }
        if (this.y >= this.canvas.height - margin) {
            this.y = this.canvas.height - margin;
            this.direction = -this.direction; // Refletir verticalmente
        }
        
        // Mudança ocasional de direção (apenas se não tem alvo)
        if (Math.random() < 0.05 && !this.target && this.state === 'normal') {
            this.direction += (Math.random() - 0.5) * 0.8;
        }
    }
    
    ladraoBehavior() {
    if (this.state === 'fleeing') {
        // Fugir do GCM mais próximo com mais velocidade
        this.speed = this.maxSpeed * 1.8; // Aumentado de 1.5 para 1.8
        // Direção oposta ao GCM mais próximo
        const nearestGCM = this.findNearestAgent('gcm');
        if (nearestGCM) {
            const dx = this.x - nearestGCM.x;
            const dy = this.y - nearestGCM.y;
            this.direction = Math.atan2(dy, dx);
        }
    } else {
        // Procurar cidadãos com celular
        const target = this.findNearestAgent('cidadao_com_celular');
        if (target && this.getDistance(target) < 100) { // Aumentado de 80 para 100 (mais agressivos)
            // Perseguir cidadão
            const dx = target.x - this.x;
            const dy = target.y - this.y;
            this.direction = Math.atan2(dy, dx);
            this.speed = this.maxSpeed * 1.3; // Aumentado de 1.2 para 1.3
            this.target = target;
        } else {
            this.speed = this.maxSpeed;
            this.target = null;
        }
    }
}
    
 gcmBehavior() {
    const eficiencia = parseInt(document.getElementById('eficiencia').value) / 100;
    
    // Procurar ladrões próximos
    const ladrao = this.findNearestAgent('ladrao');
    if (ladrao && this.getDistance(ladrao) < this.detectionRadius * (1 + eficiencia)) { // Raio aumenta com eficiência
        // Perseguir ladrão
        const dx = ladrao.x - this.x;
        const dy = ladrao.y - this.y;
        this.direction = Math.atan2(dy, dx);
        
        // Velocidade baseada na eficiência
        const speedMultiplier = 1 + (eficiencia * 0.8); // De 1x a 1.8x velocidade
        this.speed = this.maxSpeed * speedMultiplier;
        
        // MODO TELEPORTE: Se eficiência >= 80%, GCM pode "teleportar" para próximo do ladrão
        if (eficiencia >= 0.8 && this.getDistance(ladrao) > 30) {
            const teleportDistance = 25; // Teleportar para 25 pixels do ladrão
            const angle = Math.atan2(dy, dx);
            this.x = ladrao.x - Math.cos(angle) * teleportDistance;
            this.y = ladrao.y - Math.sin(angle) * teleportDistance;
        }
        
        this.target = ladrao;
        this.state = 'pursuing';
    } else {
        this.speed = this.maxSpeed;
        this.target = null;
        this.state = 'normal';
    }
}
    
    cidadaoBehavior() {
        // Cidadãos fogem de ladrões próximos
        const nearestLadrao = this.findNearestAgent('ladrao');
        if (nearestLadrao && this.getDistance(nearestLadrao) < 50) {
            // Fugir do ladrão
            const dx = this.x - nearestLadrao.x;
            const dy = this.y - nearestLadrao.y;
            this.direction = Math.atan2(dy, dx);
            this.speed = this.maxSpeed * 1.1;
            this.alertTimer = 60; // Ativar alerta visual
        } else {
            this.speed = this.maxSpeed;
        }
    }
    
    findNearestAgent(type) {
        let nearest = null;
        let minDistance = Infinity;
        
        // Acessar a lista de agentes da simulação
        if (window.simulation && window.simulation.agents) {
            window.simulation.agents.forEach(agent => {
                if (agent.type === type && agent !== this) {
                    const distance = this.getDistance(agent);
                    if (distance < minDistance) {
                        minDistance = distance;
                        nearest = agent;
                    }
                }
            });
        }
        
        return nearest;
    }
    
    draw() {
        const colors = {
            'cidadao_com_celular': '#4CAF50',
            'cidadao_sem_celular': '#FFEB3B',
            'ladrao': this.state === 'fleeing' ? '#FF6B6B' : '#F44336',
            'gcm': this.state === 'pursuing' ? '#1976D2' : '#2196F3'
        };
        
        this.ctx.fillStyle = colors[this.type];
        this.ctx.beginPath();
        
        if (this.type === 'gcm') {
            // Triângulo para GCM
            this.ctx.moveTo(this.x, this.y - 8);
            this.ctx.lineTo(this.x - 6, this.y + 6);
            this.ctx.lineTo(this.x + 6, this.y + 6);
            this.ctx.closePath();
        } else if (this.type === 'ladrao') {
            // Quadrado para ladrão
            this.ctx.rect(this.x - 6, this.y - 6, 12, 12);
        } else {
            // Círculo para cidadãos
            this.ctx.arc(this.x, this.y, 5, 0, 2 * Math.PI);
        }
        
        this.ctx.fill();
        
        // Desenhar alerta visual para cidadãos em perigo
        if (this.alertTimer > 0 && (this.type === 'cidadao_com_celular' || this.type === 'cidadao_sem_celular')) {
            this.ctx.strokeStyle = 'rgba(244, 67, 54, 0.8)';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, 15, 0, 2 * Math.PI);
            this.ctx.stroke();
        }
        
        // Desenhar raio de detecção para GCM em perseguição
        if (this.type === 'gcm' && this.state === 'pursuing') {
            this.ctx.strokeStyle = 'rgba(33, 150, 243, 0.3)';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, this.detectionRadius, 0, 2 * Math.PI);
            this.ctx.stroke();
        }
        
        // Desenhar linha de perseguição
        if (this.target) {
            this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(this.x, this.y);
            this.ctx.lineTo(this.target.x, this.target.y);
            this.ctx.stroke();
        }
    }
    
    getDistance(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}
class Simulation {
constructor() {
        this.canvas = document.getElementById('simulation-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.agents = [];
        this.roubos = 0;
        this.prisoes = 0;
        this.eventoDinamico = false;
        this.eventTimer = 0;
        this.gameOver = false;
        this.totalCidadaosIniciais = 0;
        this.showingEvent = false;
        this.currentEvent = null;
        this.eventImages = {};
        this.activeEvents = {
            gcmSlow: false,
            ladroesRapidos: false,
            ladroesLentos: false
        };
        this.usedEvents = []; // Novo: controla eventos já usados
        this.isPaused = false;
        this.gameSpeed = 1;
        this.gameStarted = false;
        
        // Tornar a simulação acessível globalmente para os agentes
        window.simulation = this;
        
        this.loadEventImages();
        this.setupCanvas();
        this.setupControls();
        this.setupStartScreen();
        this.animate();
    }

    setupStartScreen() {
        // Adicionar listener para iniciar o jogo
        const startGame = () => {
            if (!this.gameStarted) {
                this.gameStarted = true;
                this.initializeAgents();
                // Remover listeners após iniciar
                document.removeEventListener('keydown', startGame);
                this.canvas.removeEventListener('click', startGame);
            }
        };

        // Escutar qualquer tecla pressionada
        document.addEventListener('keydown', startGame);
        
        // Também permitir clique no canvas para iniciar
        this.canvas.addEventListener('click', startGame);
    }
    
      drawStartScreen() {
        // Limpar o canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Fundo preto
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Título principal
        this.ctx.fillStyle = '#74b9ff';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Simulação Roubos', this.canvas.width / 2, this.canvas.height / 2 - 100);
        
        this.ctx.fillStyle = '#e91e63';
        this.ctx.font = 'bold 36px Arial';
        this.ctx.fillText('Praia Grande Pro Edition', this.canvas.width / 2, this.canvas.height / 2 - 50);
        
        // Instruções
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.fillText('Pressione qualquer tecla ou clique para iniciar', this.canvas.width / 2, this.canvas.height / 2 + 20);
        
        // Texto piscante para chamar atenção
        const time = Date.now();
        const opacity = Math.sin(time * 0.005) * 0.5 + 0.5; // Criar efeito piscante
        
        this.ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        this.ctx.font = 'italic 18px Arial';
        this.ctx.fillText('Configure os parâmetros no menu à esquerda', this.canvas.width / 2, this.canvas.height / 2 + 60);
        
        // Adicionar algumas instruções sobre o jogo
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.font = '16px Arial';
        
        const instructions = [
            '🟢 Verde: Cidadão com celular',
            '🟡 Amarelo: Cidadão sem celular', 
            '🔴 Vermelho: Ladrão',
            '🔵 Azul: Guarda Civil (GCM)',
            '⚙️ Configure população, ladrões e eficiência'
        ];
        
        instructions.forEach((instruction, index) => {
            this.ctx.fillText(instruction, this.canvas.width / 2, this.canvas.height / 2 + 120 + (index * 25));
        });
    }

   loadEventImages() {
        const imageFiles = [
            { name: 'bike', src: './Images/bike.png' },
            { name: 'noia', src: './Images/noia.png' },
            { name: 'revolta', src: './Images/revolta.png' },
            { name: 'transito', src: './Images/transito.png' }, 
            { name: 'saidinha', src: './Images/saidinha.png' }  
        ];
        
        imageFiles.forEach(imgData => {
            const img = new Image();
            img.onload = () => {
                this.eventImages[imgData.name] = img;
            };
            img.onerror = () => {
                console.log(`Imagem não encontrada: ${imgData.src}`);
                this.eventImages[imgData.name] = null;
            };
            img.src = imgData.src;
        });
    }
    
    setupCanvas() {
        // Definir tamanho fixo do canvas
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
    }
    
  setupControls() {
        const sliders = ['populacao', 'ladroes', 'gcm', 'eficiencia', 'velocidade'];
        sliders.forEach(id => {
            const slider = document.getElementById(id);
            const valueSpan = document.getElementById(id + '-value');
            
            slider.addEventListener('input', () => {
                if (id === 'velocidade') {
                    valueSpan.textContent = slider.value;
                    this.gameSpeed = parseInt(slider.value) / 100; // Converter para multiplicador
                } else {
                    valueSpan.textContent = slider.value;
                    if (id !== 'eficiencia') {
                        this.reinitializeAgents();
                    }
                }
            });
        });
        
        // Evento dinâmico
        const eventCheckbox = document.getElementById('evento-dinamico');
        if (eventCheckbox) {
            eventCheckbox.addEventListener('change', () => {
                this.eventoDinamico = eventCheckbox.checked;
                if (!this.eventoDinamico) {
                    this.resetAllEvents();
                }
            });
        }
        
        // Botão de pausa
        const pauseBtn = document.getElementById('pause-btn');
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                this.togglePause();
            });
        }
    }
    
    togglePause() {
        this.isPaused = !this.isPaused;
        const pauseBtn = document.getElementById('pause-btn');
        
        if (this.isPaused) {
            pauseBtn.textContent = '▶️ Retomar';
            pauseBtn.classList.remove('pause');
            pauseBtn.classList.add('paused');
        } else {
            pauseBtn.textContent = '⏸️ Pausar';
            pauseBtn.classList.remove('paused');
            pauseBtn.classList.add('pause');
        }
    }
    
   resetAllEvents() {
        this.activeEvents = {
            gcmSlow: false,
            ladroesRapidos: false,
            ladroesLentos: false
        };
        this.usedEvents = []; // Reset eventos usados
        this.applyEventEffects();
    }
    
    applyEventEffects() {
        this.agents.forEach(agent => {
            agent.speedModifier = 1; // Reset base
            
            if (agent.type === 'gcm' && this.activeEvents.gcmSlow) {
                agent.speedModifier *= 0.5; // 50% mais lento
            }
            
            if (agent.type === 'ladrao') {
                if (this.activeEvents.ladroesRapidos) {
                    agent.speedModifier *= 1.5; // 50% mais rápido
                }
                if (this.activeEvents.ladroesLentos) {
                    agent.speedModifier *= 0.5; // 50% mais lento
                }
            }
        });
    }
    
    initializeAgents() {
        this.agents = [];
        this.gameOver = false;
        const pop = parseInt(document.getElementById('populacao').value);
        const ladroes = parseInt(document.getElementById('ladroes').value);
        const gcm = parseInt(document.getElementById('gcm').value);
        
        this.totalCidadaosIniciais = pop;
        
        // Margem para spawnar agentes (evitar spawnar nas bordas)
        const margin = 20;
        
        // Criar cidadãos
        for (let i = 0; i < pop; i++) {
            const type = Math.random() < 0.7 ? 'cidadao_com_celular' : 'cidadao_sem_celular';
            this.agents.push(new Agent(
                margin + Math.random() * (this.canvas.width - 2 * margin),
                margin + Math.random() * (this.canvas.height - 2 * margin),
                type,
                this.canvas
            ));
        }
        
        // Criar ladrões
        for (let i = 0; i < ladroes; i++) {
            this.agents.push(new Agent(
                margin + Math.random() * (this.canvas.width - 2 * margin),
                margin + Math.random() * (this.canvas.height - 2 * margin),
                'ladrao',
                this.canvas
            ));
        }
        
        // Criar GCM
        for (let i = 0; i < gcm; i++) {
            this.agents.push(new Agent(
                margin + Math.random() * (this.canvas.width - 2 * margin),
                margin + Math.random() * (this.canvas.height - 2 * margin),
                'gcm',
                this.canvas
            ));
        }
        
        // Aplicar efeitos de eventos ativos
        this.applyEventEffects();
    }
    
    reinitializeAgents() {
        this.roubos = 0;
        this.prisoes = 0;
        this.updateCounters();
        this.initializeAgents();
    }
    
  resetAllEvents() {
        this.activeEvents = {
            gcmSlow: false,
            ladroesRapidos: false,
            ladroesLentos: false
        };
        this.usedEvents = []; // Reset eventos usados
        this.applyEventEffects();
    }

    // ...existing code...

    triggerRandomEvent() {
        if (this.showingEvent || this.gameOver) return;
        
        const allEvents = [
            {
                type: 'gcm_bike',
                title: 'O governo ficou sem verba, a GCM está de bike',
                description: 'Velocidade dos GCMs reduzida em 50%',
                image: 'bike',
                effect: () => {
                    this.activeEvents.gcmSlow = true;
                    this.applyEventEffects();
                }
            },
            {
                type: 'noias_patinetes',
                title: 'Os noias alugaram patinetes elétricos',
                description: 'Velocidade dos ladrões aumentada em 50%',
                image: 'noia',
                effect: () => {
                    this.activeEvents.ladroesRapidos = true;
                    this.activeEvents.ladroesLentos = false;
                    this.applyEventEffects();
                }
            },
            {
                type: 'revolta_populacao',
                title: 'A população se revoltou e linchou o nóia',
                description: 'Velocidade dos ladrões reduzida em 50%',
                image: 'revolta',
                effect: () => {
                    this.activeEvents.ladroesLentos = true;
                    this.activeEvents.ladroesRapidos = false;
                    this.applyEventEffects();
                }
            },
            {
                type: 'farofeiros_chegando',
                title: 'Os farofeiros estão descendo para Praia Grande',
                description: 'Adicionado +20 pessoas com celular à população',
                image: 'transito',
                effect: () => {
                    this.addCidadaosComCelular(20);
                }
            },
            {
                type: 'saidinha_presos',
                title: 'O governo decretou saidinha para os presos relaxarem',
                description: 'Adicionado +5 ladrões',
                image: 'saidinha',
                effect: () => {
                    this.addLadroes(5);
                }
            }
        ];
        
        // Filtrar eventos que ainda não foram usados
        const availableEvents = allEvents.filter(event => !this.usedEvents.includes(event.type));
        
        // Se não há eventos disponíveis, não fazer nada
        if (availableEvents.length === 0) {
            return;
        }
        
        const randomEvent = availableEvents[Math.floor(Math.random() * availableEvents.length)];
        
        // Marcar evento como usado
        this.usedEvents.push(randomEvent.type);
        
        this.showEvent(randomEvent);
    }
    
    showEvent(eventData) {
    this.showingEvent = true;
    this.currentEvent = eventData; // Armazenar o evento atual
    
    // Aplicar efeito do evento imediatamente
    eventData.effect();
    
    // Voltar ao jogo após 3 segundos
    setTimeout(() => {
        this.showingEvent = false;
        this.currentEvent = null;
    }, 3000);
}

 addCidadaosComCelular(quantidade) {
        const margin = 20;
        
        for (let i = 0; i < quantidade; i++) {
            const newAgent = new Agent(
                margin + Math.random() * (this.canvas.width - 2 * margin),
                margin + Math.random() * (this.canvas.height - 2 * margin),
                'cidadao_com_celular',
                this.canvas
            );
            
            // Aplicar modificadores de velocidade se houver eventos ativos
            newAgent.speedModifier = 1;
            this.agents.push(newAgent);
        }
        
        // Aplicar efeitos de eventos aos novos agentes
        this.applyEventEffects();
    }

    // Novo método: adicionar ladrões
    addLadroes(quantidade) {
        const margin = 20;
        
        for (let i = 0; i < quantidade; i++) {
            const newAgent = new Agent(
                margin + Math.random() * (this.canvas.width - 2 * margin),
                margin + Math.random() * (this.canvas.height - 2 * margin),
                'ladrao',
                this.canvas
            );
            
            // Aplicar modificadores de velocidade se houver eventos ativos
            newAgent.speedModifier = 1;
            this.agents.push(newAgent);
        }
        
        // Aplicar efeitos de eventos aos novos agentes
        this.applyEventEffects();
    }


drawEventScreen(eventData) {
    // Salvar estado atual do canvas
    this.ctx.save();
    
    // Fundo semi-transparente
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Título
    this.ctx.fillStyle = '#FFD700';
    this.ctx.font = 'bold 24px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(eventData.title, this.canvas.width / 2, this.canvas.height / 2 - 280);
    
    // Imagem (se disponível) com tamanho ajustado
    const img = this.eventImages[eventData.image];
    if (img) {
        // Definir tamanhos específicos para cada imagem
        let imgWidth, imgHeight;
        
        switch(eventData.image) {
            case 'saidinha':
                // Saidinha precisa ser menor e mais vertical
                imgWidth = 650;
                imgHeight = 500;
                break;
            case 'transito':
                // Trânsito pode ser mais horizontal
                imgWidth = 550;
                imgHeight = 400;
                break;
            case 'bike':
                // Bike mantém proporção quadrada mas menor
                imgWidth = 500;
                imgHeight = 500;
                break;
            case 'noia':
                // Noia mantém tamanho médio
                imgWidth = 500;
                imgHeight = 500;
                break;
            case 'revolta':
                // Revolta pode ser maior para impacto
                imgWidth = 500;
                imgHeight = 500;
                break;
            default:
                // Tamanho padrão
                imgWidth = 400;
                imgHeight = 400;
        }
        
        const imgX = this.canvas.width / 2 - imgWidth / 2;
        const imgY = this.canvas.height / 2 - imgHeight / 2;
        
        this.ctx.drawImage(img, imgX, imgY, imgWidth, imgHeight);
    } else {
        // Placeholder se imagem não carregou
        this.ctx.fillStyle = '#666';
        this.ctx.fillRect(this.canvas.width / 2 - 200, this.canvas.height / 2 - 200, 400, 400);
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '24px Arial';
        this.ctx.fillText('Imagem não', this.canvas.width / 2, this.canvas.height / 2 - 20);
        this.ctx.fillText('encontrada', this.canvas.width / 2, this.canvas.height / 2 + 20);
    }
    
    // Descrição
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = 'bold 18px Arial';
    this.ctx.fillText(eventData.description, this.canvas.width / 2, this.canvas.height / 2 + 280);
    
    // Indicador de tempo
    this.ctx.fillStyle = '#CCCCCC';
    this.ctx.font = 'italic 14px Arial';
    this.ctx.fillText('Evento ativo! Efeito aplicado...', this.canvas.width / 2, this.canvas.height / 2 + 310);
    
    this.ctx.restore();
}
    
    checkGameOver() {
        if (this.gameOver) return;
        
        const cidadaosComCelular = this.agents.filter(a => a.type === 'cidadao_com_celular').length;
        const ladroes = this.agents.filter(a => a.type === 'ladrao').length;
        
        // Caso 1: Todos os cidadãos foram roubados (nenhum cidadão com celular restante)
        if (cidadaosComCelular === 0 && this.totalCidadaosIniciais > 0) {
            this.gameOver = true;
            this.showGameOverScreen('todos_roubados');
            return;
        }
        
        // Caso 2: Todos os ladrões foram presos
        if (ladroes === 0 && this.prisoes > 0) {
            this.gameOver = true;
            this.showGameOverScreen('todos_presos');
            return;
        }
    }
    
    showGameOverScreen(tipo) {
        // Pausar a animação
        this.gameOver = true;
        
        // Limpar o canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Fundo semi-transparente
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (tipo === 'todos_roubados') {
            this.drawTodosRoubadosScreen();
        } else if (tipo === 'todos_presos') {
            this.drawTodosPressosScreen();
        }
        
        // Botão de reiniciar
        this.drawRestartButton();
    }
    
    drawTodosRoubadosScreen() {
        // Título principal
        this.ctx.fillStyle = '#FF4444';
        this.ctx.font = 'bold 42px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Mas o Estado é eficiente?', this.canvas.width / 2, this.canvas.height / 2 - 120);
        
        // Subtítulo
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 28px Arial';
        this.ctx.fillText('Todos foram roubados! 😱', this.canvas.width / 2, this.canvas.height / 2 - 70);
        
        // Estatísticas
        const ladroesRestantes = this.agents.filter(a => a.type === 'ladrao').length;
        
        this.ctx.font = '20px Arial';
        this.ctx.fillStyle = '#FFAAAA';
        
        const stats = [
            `🚨 Total de Roubos: ${this.roubos}`,
            `🚔 Prisões Realizadas: ${this.prisoes}`,
            `👥 Cidadãos Roubados: ${this.totalCidadaosIniciais}`,
            `🔴 Ladrões Ainda Soltos: ${ladroesRestantes}`
        ];
        
        stats.forEach((stat, index) => {
            this.ctx.fillText(stat, this.canvas.width / 2, this.canvas.height / 2 + (index * 30) - 10);
        });
        
        // Mensagem irônica
        this.ctx.font = 'italic 16px Arial';
        this.ctx.fillStyle = '#CCCCCC';
        this.ctx.fillText('A criminalidade venceu desta vez...', this.canvas.width / 2, this.canvas.height / 2 + 140);
    }
    
    drawTodosPressosScreen() {
        // Título principal
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.font = 'bold 42px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Se lascaram! 🎉', this.canvas.width / 2, this.canvas.height / 2 - 120);
        
        // Subtítulo
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 28px Arial';
        this.ctx.fillText('Todos os ladrões foram presos!', this.canvas.width / 2, this.canvas.height / 2 - 70);
        
        // Estatísticas
        this.ctx.font = '20px Arial';
        this.ctx.fillStyle = '#AAFFAA';
        
        const stats = [
            `🚔 Prisões Realizadas: ${this.prisoes}`,
            `🚨 Roubos Ocorridos: ${this.roubos}`,
            `📱 Celulares Recuperados: ${this.roubos}`,
            `✅ Taxa de Sucesso: 100%`
        ];
        
        stats.forEach((stat, index) => {
            this.ctx.fillText(stat, this.canvas.width / 2, this.canvas.height / 2 + (index * 30) - 10);
        });
        
        // Mensagem de vitória
        this.ctx.font = 'italic 16px Arial';
        this.ctx.fillStyle = '#CCCCCC';
        this.ctx.fillText('A ordem foi restaurada na Praia Grande!', this.canvas.width / 2, this.canvas.height / 2 + 140);
    }
    
    drawRestartButton() {
        // Botão de reiniciar
        const buttonX = this.canvas.width / 2 - 100;
        const buttonY = this.canvas.height / 2 + 180;
        const buttonWidth = 200;
        const buttonHeight = 40;
        
        this.ctx.fillStyle = '#e91e63';
        this.ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
        
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Jogar Novamente', this.canvas.width / 2, buttonY + 25);
        
        // Adicionar event listener para o clique
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            if (x >= buttonX && x <= buttonX + buttonWidth &&
                y >= buttonY && y <= buttonY + buttonHeight) {
                location.reload();
            }
        });
    }
    
checkInteractions() {
    if (this.gameOver) return;
    
    const eficiencia = parseInt(document.getElementById('eficiencia').value) / 100;
    const rouboDistance = 20;
    const prisaoDistance = 20; // Aumentado de 15 para 20
    
    // Chance de prisão baseada na eficiência (muito mais impactante)
    let chanceBasePrisao;
    if (eficiencia >= 0.9) {
        chanceBasePrisao = 0.95; // 95% de chance com 90% eficiência
    } else if (eficiencia >= 0.7) {
        chanceBasePrisao = 0.15 + (eficiencia - 0.7) * 2.0; // De 15% a 55%
    } else if (eficiencia >= 0.5) {
        chanceBasePrisao = 0.08 + (eficiencia - 0.5) * 0.35; // De 8% a 15%
    } else {
        chanceBasePrisao = 0.02 + (eficiencia * 0.12); // De 2% a 8%
    }
    
    // Verificar tentativas de roubo
    for (let i = 0; i < this.agents.length; i++) {
        const ladrao = this.agents[i];
        
        if (ladrao.type === 'ladrao') {
            // Resetar estado de fuga
            ladrao.state = 'normal';
            
            // Verificar se há GCM próximo (ladrão fica em estado de fuga)
            for (let j = 0; j < this.agents.length; j++) {
                const gcm = this.agents[j];
                if (gcm.type === 'gcm' && ladrao.getDistance(gcm) < gcm.detectionRadius * (1 + eficiencia * 0.5)) {
                    ladrao.state = 'fleeing';
                    
                    // Se GCM está próximo o suficiente, TENTAR prender ladrão (não automático)
                    if (ladrao.getDistance(gcm) < prisaoDistance) {
                        // Aplicar a chance de prisão (agora funciona de verdade)
                        if (Math.random() < chanceBasePrisao) {
                            this.agents.splice(i, 1);
                            this.prisoes++;
                            this.updateCounters();
                            this.createPrisaoEffect(ladrao.x, ladrao.y);
                            i--; // Ajustar índice após remoção
                            break;
                        } else {
                            // Falhou na prisão - ladrão escapa temporariamente
                            ladrao.speed = ladrao.maxSpeed * 2; // Boost de velocidade por falhar
                            ladrao.cooldown = 60; // Cooldown para não tentar prender imediatamente
                        }
                    }
                }
            }
            
            // Se não foi preso, verificar roubos
            if (i >= 0 && i < this.agents.length && ladrao.state !== 'fleeing' && ladrao.cooldown === 0) {
                for (let k = 0; k < this.agents.length; k++) {
                    const cidadao = this.agents[k];
                    
                    if (cidadao.type === 'cidadao_com_celular' && 
                        ladrao.getDistance(cidadao) < rouboDistance) {
                        
                        // Verificar se há GCM próximo o suficiente para impedir o roubo
                        let rouboImpeditoPorGCM = false;
                        
                        for (let l = 0; l < this.agents.length; l++) {
                            const gcm = this.agents[l];
                            // Raio de impedimento baseado na eficiência
                            const raioImpedimento = gcm.detectionRadius * (0.6 + eficiencia * 0.6); // De 60% a 120% do raio
                            if (gcm.type === 'gcm' && ladrao.getDistance(gcm) < raioImpedimento) {
                                rouboImpeditoPorGCM = true;
                                break;
                            }
                        }
                        
                        if (!rouboImpeditoPorGCM) {
                            // Executar roubo
                            cidadao.type = 'cidadao_sem_celular';
                            this.roubos++;
                            this.updateCounters();
                            this.createRouboEffect(cidadao.x, cidadao.y);
                            
                            // Alertar GCMs próximos se houver cidadãos com celular na área
                            this.alertarGCMProximo(cidadao.x, cidadao.y);
                            break;
                        }
                    }
                }
            }
        }
    }
}
    
    alertarGCMProximo(x, y) {
        // Encontrar cidadãos com celular próximos para alertar GCM
        for (let i = 0; i < this.agents.length; i++) {
            const cidadao = this.agents[i];
            if (cidadao.type === 'cidadao_com_celular') {
                const dx = cidadao.x - x;
                const dy = cidadao.y - y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < cidadao.alertRadius) {
                    // Encontrar GCM mais próximo deste cidadão
                    let nearestGCM = null;
                    let minDistance = Infinity;
                    
                    for (let j = 0; j < this.agents.length; j++) {
                        const gcm = this.agents[j];
                        if (gcm.type === 'gcm') {
                            const gcmDistance = cidadao.getDistance(gcm);
                            if (gcmDistance < minDistance) {
                                minDistance = gcmDistance;
                                nearestGCM = gcm;
                            }
                        }
                    }
                    
                    // Direcionar GCM para o local do roubo
                    if (nearestGCM && minDistance < 150) {
                        const dx = x - nearestGCM.x;
                        const dy = y - nearestGCM.y;
                        nearestGCM.direction = Math.atan2(dy, dx);
                        nearestGCM.speed = nearestGCM.maxSpeed * 1.5;
                    }
                    break;
                }
            }
        }
    }
    
    createRouboEffect(x, y) {
        // Efeito visual de roubo
        this.ctx.fillStyle = 'rgba(244, 67, 54, 0.6)';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 20, 0, 2 * Math.PI);
        this.ctx.fill();
    }
    
    createPrisaoEffect(x, y) {
        // Efeito visual de prisão
        this.ctx.fillStyle = 'rgba(33, 150, 243, 0.6)';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 25, 0, 2 * Math.PI);
        this.ctx.fill();
    }
    
    handleEventoDinamico() {
        if (!this.eventoDinamico || this.gameOver || this.showingEvent) return;
        
        this.eventTimer++;
        
        // Chance muito baixa de evento a cada frame (aproximadamente 1 evento a cada 10-15 segundos)
        if (Math.random() < 0.0005) { // 0.05% de chance por frame
            this.triggerRandomEvent();
        }
    }
    
 updateCounters() {
    document.getElementById('roubos-count').textContent = this.roubos;
    document.getElementById('prisoes-count').textContent = this.prisoes;
    // Removido o cálculo e exibição da taxa
}

   animate() {
        // Se o jogo não começou, mostrar tela inicial
        if (!this.gameStarted) {
            this.drawStartScreen();
            requestAnimationFrame(() => this.animate());
            return;
        }
        
        if (this.gameOver) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Se está mostrando evento, desenhar a tela do evento
        if (this.showingEvent && this.currentEvent) {
            this.drawEventScreen(this.currentEvent);
        } else {
            // Desenhar fundo preto
            this.ctx.fillStyle = '#000000';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Desenhar bordas visuais mais claras para contrastar
            this.ctx.strokeStyle = '#444444';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(1, 1, this.canvas.width - 2, this.canvas.height - 2);
            
            // Só atualizar e desenhar agentes se não estiver pausado
            if (!this.isPaused) {
                this.agents.forEach(agent => {
                    agent.move();
                    agent.draw();
                });
                
                this.checkInteractions();
                this.checkGameOver();
                this.handleEventoDinamico();
            } else {
                // Se pausado, apenas desenhar os agentes na posição atual
                this.agents.forEach(agent => {
                    agent.draw();
                });
                
                // Desenhar indicador de pausa
                this.drawPauseIndicator();
            }
        }
        
        requestAnimationFrame(() => this.animate());
    }
    
    drawPauseIndicator() {
        // Desenhar indicador de pausa no centro da tela
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(this.canvas.width / 2 - 80, this.canvas.height / 2 - 30, 160, 60);
        
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('⏸️ PAUSADO', this.canvas.width / 2, this.canvas.height / 2 + 8);
        this.ctx.restore();
    }
}

// Inicializar simulação quando a página carregar
window.addEventListener('load', () => {
    new Simulation();
});