const API_EVENTOS_MENU = 'http://localhost:3003/api/eventos/menu';
const API_EVENTOS_UPDATE = 'http://localhost:3003/api/eventos/status'; 
const API_STATUS = 'http://localhost:3003/api/status';
const API_LOGOUT = 'http://localhost:3003/api/logout'; // Ajuste conforme sua rota de auth

const listaDiv = document.getElementById('listaEventos');
let listaDeStatus = [];

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    verificarLogin(); // Verifica login PRIMEIRO
    
    // Se não redirecionou, carrega os dados
    await carregarStatusDisponiveis();
    carregarEventosPendentes();
});

// --- FUNÇÕES DE LOGIN / LOGOUT (SEU CÓDIGO RESTAURADO) ---

function verificarLogin() {
    // Pega o nome do cookie de forma simples
    var cookies = document.cookie.split('; ');
    var nome = "Usuário";
    var logado = false;

    for (var i = 0; i < cookies.length; i++) {
        // Remove espaços extras no início, se houver
        var c = cookies[i].trim();
        
        if (c.indexOf('nome_usuario=') === 0) {
            nome = decodeURIComponent(c.split('=')[1]);
        }
        if (c.indexOf('usuario_logado=') === 0) {
            logado = true;
        }
    }

    if (!logado) {
        window.location.href = '../login/login.html';
    } else {
        const saudacaoEl = document.getElementById('saudacao');
        if(saudacaoEl) saudacaoEl.innerText = 'Olá, ' + nome;
    }
}

function sair() {
    // Tenta chamar a API de logout, depois redireciona
    fetch(API_LOGOUT, { method: 'POST' })
    .then(function() { 
        // Limpa cookies no frontend também para garantir
        document.cookie = "usuario_logado=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "nome_usuario=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.href = '../login/login.html'; 
    })
    .catch(function() {
        // Mesmo se der erro na API, força o redirecionamento
        window.location.href = '../login/login.html';
    });
}

// --- FUNÇÕES DE EVENTOS (NOVA LÓGICA) ---

// 1. Busca status para o dropdown
async function carregarStatusDisponiveis() {
    try {
        const res = await fetch(API_STATUS);
        listaDeStatus = await res.json();
    } catch (error) {
        console.error("Erro ao carregar status", error);
    }
}

// 2. Busca eventos pendentes
async function carregarEventosPendentes() {
    try {
        const response = await fetch(API_EVENTOS_MENU);
        const eventos = await response.json();

        listaDiv.innerHTML = ''; 

        if (eventos.length === 0) {
            listaDiv.innerHTML = '<p style="text-align:center; padding: 20px;">Nenhum evento pendente! 🎉</p>';
            return;
        }

        eventos.forEach(evento => {
            const card = criarCardEvento(evento);
            listaDiv.appendChild(card);
        });

    } catch (error) {
        console.error("Erro ao carregar eventos:", error);
        listaDiv.innerHTML = '<p style="color:red; text-align:center">Erro ao conectar com o servidor.</p>';
    }
}

// 3. Renderiza o Card
function criarCardEvento(e) {
    const div = document.createElement('div');
    // Adiciona classe de cor baseada no ID do status
    div.className = `event-card status-border-${e.status}`;
    
    // Data e Hora
    const dataFormatada = new Date(e.data_evento).toLocaleDateString('pt-BR');
    const horaFormatada = e.hora_evento ? e.hora_evento.substring(0, 5) : '--:--';

    // Monta opções do Select
    let optionsHtml = '';
    listaDeStatus.forEach(s => {
        const selected = (s.id_status === e.status) ? 'selected' : '';
        optionsHtml += `<option value="${s.id_status}" ${selected}>${s.descricao_status}</option>`;
    });

    div.innerHTML = `
        <div class="event-info">
            <div class="event-header">
                #${e.id_evento} - ${e.nome_evento}
            </div>
            <div class="event-details">
                <span>📅 ${dataFormatada} às ${horaFormatada}</span>
                <span>👤 Pessoa ID: ${e.id_pessoa}</span>
            </div>
        </div>

        <div class="event-actions">
            <select id="select-status-${e.id_evento}" class="status-select">
                ${optionsHtml}
            </select>
            <button class="btn-update" onclick="atualizarStatus(${e.id_evento})">💾</button>
        </div>
    `;

    return div;
}

// 4. Salva alteração de status
async function atualizarStatus(idEvento) {
    const select = document.getElementById(`select-status-${idEvento}`);
    const novoStatusId = select.value;

    if(!confirm("Deseja alterar o status deste evento?")) return;

    try {
        const response = await fetch(`${API_EVENTOS_UPDATE}/${idEvento}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ novoStatus: novoStatusId })
        });

        if (response.ok) {
            // Recarrega a lista para atualizar filtros e cores
            carregarEventosPendentes(); 
        } else {
            alert('Erro ao atualizar status.');
        }
    } catch (error) {
        console.error(error);
        alert('Erro de conexão.');
    }
}