const API_EVENTOS_MENU = 'http://localhost:3003/api/eventos/menu';
const API_EVENTOS_UPDATE = 'http://localhost:3003/api/eventos/status'; 
const API_STATUS = 'http://localhost:3003/api/status';
const API_LOGOUT = 'http://localhost:3003/api/logout'; 

const listaDiv = document.getElementById('listaEventos');
let listaDeStatus = [];
let usuarioId = null; // Variável para guardar o ID do usuário logado

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    verificarLogin(); // Pega o ID aqui dentro
    
    // Se passou do login, carrega o restante
    await carregarStatusDisponiveis();
    carregarEventosPendentes();
});

// --- FUNÇÕES DE LOGIN / LOGOUT ---

function verificarLogin() {
    var cookies = document.cookie.split('; ');
    var nome = "Usuário";
    var logado = false;
    usuarioId = null;

    for (var i = 0; i < cookies.length; i++) {
        var c = cookies[i].trim();
        
        if (c.indexOf('nome_usuario=') === 0) {
            nome = decodeURIComponent(c.split('=')[1]);
        }
        if (c.indexOf('id_usuario=') === 0) {
            usuarioId = c.split('=')[1]; // Pega o ID salvo no login
        }
        if (c.indexOf('usuario_logado=') === 0) {
            logado = true;
        }
    }

    if (!logado || !usuarioId) {
        // Se não estiver logado ou não tiver ID, chuta para o login
        window.location.href = '../login/login.html';
    } else {
        const saudacaoEl = document.getElementById('saudacao');
        if(saudacaoEl) saudacaoEl.innerText = 'Olá, ' + nome;
    }
}

function sair() {
    fetch(API_LOGOUT, { method: 'POST' })
    .then(function() { 
        // Limpa todos os cookies
        document.cookie = "usuario_logado=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "nome_usuario=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "id_usuario=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.href = '../login/login.html'; 
    })
    .catch(function() {
        window.location.href = '../login/login.html';
    });
}

// --- FUNÇÕES DE EVENTOS ---

async function carregarStatusDisponiveis() {
    try {
        const res = await fetch(API_STATUS);
        listaDeStatus = await res.json();
    } catch (error) {
        console.error("Erro ao carregar status", error);
    }
}

async function carregarEventosPendentes() {
    if (!usuarioId) return; // Segurança extra

    try {
        // --- AQUI ESTÁ A MUDANÇA: Enviamos o ID na URL ---
        const response = await fetch(`${API_EVENTOS_MENU}?id_pessoa=${usuarioId}`);
        const eventos = await response.json();

        listaDiv.innerHTML = ''; 

        if (eventos.length === 0) {
            listaDiv.innerHTML = '<p style="text-align:center; padding: 20px;">Você não tem eventos pendentes! 🎉</p>';
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

function criarCardEvento(e) {
    const div = document.createElement('div');
    div.className = `event-card status-border-${e.status}`;
    
    const dataFormatada = new Date(e.data_evento).toLocaleDateString('pt-BR');
    const horaFormatada = e.hora_evento ? e.hora_evento.substring(0, 5) : '--:--';

    let optionsHtml = '';
    listaDeStatus.forEach(s => {
        const selected = (s.id_status === e.status) ? 'selected' : '';
        optionsHtml += `<option value="${s.id_status}" ${selected}>${s.descricao_status}</option>`;
    });

    // Removemos a exibição do ID da Pessoa, pois agora sabemos que é do usuário logado
    div.innerHTML = `
        <div class="event-info">
            <div class="event-header">
                ${e.nome_evento}
            </div>
            <div class="event-details">
                <span>📅 ${dataFormatada} às ${horaFormatada}</span>
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
            carregarEventosPendentes(); 
        } else {
            alert('Erro ao atualizar status.');
        }
    } catch (error) {
        alert('Erro de conexão.');
    }
}