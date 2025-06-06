// simulation.js
class Agent {
    constructor(x, y, type, canvas) {
        this.x = x;
        this.y = y;
        this.type = type; // 'cidadao_com_celular', 'cidadao_sem_celular', 'ladrao', 'gcm'
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.speed = Math.random() * 2 + 1;
        this.direction = Math.random() * 2 * Math.PI;
        this.radius = 8;
        this.state = 'normal'; // 'normal', 'robbing', 'fleeing', 'pursuing'
        this.alertRadius = 60; // Raio de alerta
        this.detectionRadius = 40; // Raio de detecção
        this.target = null; // Alvo para perseguição
        this.cooldown = 0; // Cooldown para ações
        this.maxSpeed = this.speed;
        this.alertTimer = 0; // Timer para alerta visual
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
        
        // Aplicar movimento
        this.x += Math.cos(this.direction) * this.speed;
        this.y += Math.sin(this.direction) * this.speed;
        
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
            // Fugir do GCM mais próximo
            this.speed = this.maxSpeed * 1.5;
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
            if (target && this.getDistance(target) < 80) {
                // Perseguir cidadão
                const dx = target.x - this.x;
                const dy = target.y - this.y;
                this.direction = Math.atan2(dy, dx);
                this.speed = this.maxSpeed * 1.2;
                this.target = target;
            } else {
                this.speed = this.maxSpeed;
                this.target = null;
            }
        }
    }
    
    gcmBehavior() {
        // Procurar ladrões próximos
        const ladrao = this.findNearestAgent('ladrao');
        if (ladrao && this.getDistance(ladrao) < this.detectionRadius * 2) {
            // Perseguir ladrão
            const dx = ladrao.x - this.x;
            const dy = ladrao.y - this.y;
            this.direction = Math.atan2(dy, dx);
            this.speed = this.maxSpeed * 1.3;
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
        
        // Tornar a simulação acessível globalmente para os agentes
        window.simulation = this;
        
        this.setupCanvas();
        this.setupControls();
        this.initializeAgents();
        this.animate();
    }
    
    setupCanvas() {
        // Definir tamanho fixo do canvas
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
    }
    
    setupControls() {
        const sliders = ['populacao', 'ladroes', 'gcm', 'eficiencia'];
        sliders.forEach(id => {
            const slider = document.getElementById(id);
            const valueSpan = document.getElementById(id + '-value');
            
            slider.addEventListener('input', () => {
                valueSpan.textContent = slider.value;
                if (id !== 'eficiencia') {
                    this.reinitializeAgents();
                }
            });
        });
        
        // Evento dinâmico
        const eventCheckbox = document.getElementById('evento-dinamico');
        if (eventCheckbox) {
            eventCheckbox.addEventListener('change', () => {
                this.eventoDinamico = eventCheckbox.checked;
            });
        }
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
    }
    
    reinitializeAgents() {
        this.roubos = 0;
        this.prisoes = 0;
        this.updateCounters();
        this.initializeAgents();
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
        const prisaoDistance = 25;
        
        // Verificar tentativas de roubo
        for (let i = 0; i < this.agents.length; i++) {
            const ladrao = this.agents[i];
            
            if (ladrao.type === 'ladrao') {
                // Resetar estado de fuga
                ladrao.state = 'normal';
                
                // Verificar se há GCM próximo (ladrão fica em estado de fuga)
                for (let j = 0; j < this.agents.length; j++) {
                    const gcm = this.agents[j];
                    if (gcm.type === 'gcm' && ladrao.getDistance(gcm) < gcm.detectionRadius) {
                        ladrao.state = 'fleeing';
                        
                        // Se GCM está muito próximo, prender ladrão
                        if (ladrao.getDistance(gcm) < prisaoDistance && Math.random() < eficiencia) {
                            this.agents.splice(i, 1);
                            this.prisoes++;
                            this.updateCounters();
                            this.createPrisaoEffect(ladrao.x, ladrao.y);
                            i--; // Ajustar índice após remoção
                            break;
                        }
                    }
                }
                
                // Se não foi preso, verificar roubos
                if (i >= 0 && i < this.agents.length && ladrao.state !== 'fleeing') {
                    for (let k = 0; k < this.agents.length; k++) {
                        const cidadao = this.agents[k];
                        
                        if (cidadao.type === 'cidadao_com_celular' && 
                            ladrao.getDistance(cidadao) < rouboDistance) {
                            
                            // Verificar se há GCM próximo o suficiente para impedir o roubo
                            let rouboImpeditoPorGCM = false;
                            
                            for (let l = 0; l < this.agents.length; l++) {
                                const gcm = this.agents[l];
                                if (gcm.type === 'gcm' && 
                                    ladrao.getDistance(gcm) < gcm.detectionRadius * 1.2) {
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
        if (!this.eventoDinamico || this.gameOver) return;
        
        this.eventTimer++;
        
        // A cada 400 frames (aproximadamente 6-7 segundos)
        if (this.eventTimer % 400 === 0) {
            const eventType = Math.random();
            const margin = 20;
            
            if (eventType < 0.4 && this.agents.filter(a => a.type === 'ladrao').length < 10) {
                // Adicionar ladrão
                this.agents.push(new Agent(
                    margin + Math.random() * (this.canvas.width - 2 * margin),
                    margin + Math.random() * (this.canvas.height - 2 * margin),
                    'ladrao',
                    this.canvas
                ));
            } else if (eventType < 0.7 && this.agents.filter(a => a.type === 'gcm').length < 8) {
                // Adicionar GCM
                this.agents.push(new Agent(
                    margin + Math.random() * (this.canvas.width - 2 * margin),
                    margin + Math.random() * (this.canvas.height - 2 * margin),
                    'gcm',
                    this.canvas
                ));
            } else if (eventType < 0.9) {
                // Adicionar cidadãos
                for (let i = 0; i < 2; i++) {
                    const type = Math.random() < 0.8 ? 'cidadao_com_celular' : 'cidadao_sem_celular';
                    this.agents.push(new Agent(
                        margin + Math.random() * (this.canvas.width - 2 * margin),
                        margin + Math.random() * (this.canvas.height - 2 * margin),
                        type,
                        this.canvas
                    ));
                }
            }
        }
    }
    
    updateCounters() {
        document.getElementById('roubos-count').textContent = this.roubos;
        document.getElementById('prisoes-count').textContent = this.prisoes;
        
        // Calcular taxa de sucesso
        const taxa = this.roubos > 0 ? Math.round((this.prisoes / (this.roubos + this.prisoes)) * 100) : 0;
        document.getElementById('taxa-prisao').textContent = taxa + '%';
    }
    
    animate() {
        if (this.gameOver) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Desenhar fundo com bordas
        this.ctx.fillStyle = '#f8f9fa';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Desenhar bordas visuais
        this.ctx.strokeStyle = '#e0e0e0';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(1, 1, this.canvas.width - 2, this.canvas.height - 2);
        
        // Atualizar e desenhar agentes
        this.agents.forEach(agent => {
            agent.move();
            agent.draw();
        });
        
        this.checkInteractions();
        this.checkGameOver();
        this.handleEventoDinamico();
        
        requestAnimationFrame(() => this.animate());
    }
}

// Inicializar simulação quando a página carregar
window.addEventListener('load', () => {
    new Simulation();
});