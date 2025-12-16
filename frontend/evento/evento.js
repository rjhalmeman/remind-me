const API_URL = 'http://localhost:3003/api/eventos';
const API_PESSOAS = 'http://localhost:3003/api/pessoas';
const API_STATUS = 'http://localhost:3003/api/status';

let currentId = null;
let operacao = null;
let audioBase64 = null;

// Elementos
const form = document.getElementById('eventoForm');
const searchId = document.getElementById('searchId');
const messageContainer = document.getElementById('messageContainer');

// Campos de Input
const inpNome = document.getElementById('nome_evento');
const inpData = document.getElementById('data_evento');
const inpHora = document.getElementById('hora_evento');
const selPessoa = document.getElementById('id_pessoa');
const selStatus = document.getElementById('status');

// Áudio
const audioPreview = document.getElementById('audioPreview');
const inputAudio = document.getElementById('inputAudio');
const btnLimparAudio = document.getElementById('btnLimparAudio');

// Botões
const btnBuscar = document.getElementById('btnBuscar');
const btnIncluir = document.getElementById('btnIncluir');
const btnAlterar = document.getElementById('btnAlterar');
const btnExcluir = document.getElementById('btnExcluir');
const btnSalvar = document.getElementById('btnSalvar');
const btnCancelar = document.getElementById('btnCancelar');

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    // Carrega os dropdowns ANTES de tudo
    await carregarDropdownPessoas();
    await carregarDropdownStatus();
    
    carregarEventos();
    mostrarBotoes(true, false, false, false, false, false);
    bloquearCampos(false);
});

// Event Listeners
btnBuscar.addEventListener('click', buscarEvento);
btnIncluir.addEventListener('click', iniciarInclusao);
btnAlterar.addEventListener('click', iniciarAlteracao);
btnExcluir.addEventListener('click', iniciarExclusao);
btnSalvar.addEventListener('click', salvarOperacao);
btnCancelar.addEventListener('click', cancelarOperacao);

inputAudio.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(evt) {
            audioBase64 = evt.target.result;
            audioPreview.src = audioBase64;
        };
        reader.readAsDataURL(file);
    }
});

// --- Carregamento de Dropdowns (FKs) ---
async function carregarDropdownPessoas() {
    try {
        const res = await fetch(API_PESSOAS);
        const pessoas = await res.json();
        selPessoa.innerHTML = '<option value="">Selecione uma Pessoa...</option>';
        pessoas.forEach(p => {
            selPessoa.innerHTML += `<option value="${p.id_pessoa}">${p.nome_pessoa}</option>`;
        });
    } catch (e) { console.error('Erro ao carregar pessoas', e); }
}

async function carregarDropdownStatus() {
    try {
        const res = await fetch(API_STATUS);
        const lista = await res.json();
        selStatus.innerHTML = '<option value="">Selecione um Status...</option>';
        lista.forEach(s => {
            selStatus.innerHTML += `<option value="${s.id_status}">${s.descricao_status}</option>`;
        });
    } catch (e) { console.error('Erro ao carregar status', e); }
}

// --- Funções CRUD ---

async function buscarEvento() {
    const id = searchId.value.trim();
    if (!id) return mostrarMensagem('Digite um ID.', 'warning');
    
    try {
        const res = await fetch(`${API_URL}/${id}`);
        if (res.ok) {
            const evento = await res.json();
            preencherFormulario(evento);
            mostrarMensagem('Encontrado!', 'success');
            mostrarBotoes(true, false, true, true, false, false);
            bloquearCampos(false);
        } else {
            tratarNaoEncontrado();
        }
    } catch (e) { mostrarMensagem('Erro de conexão.', 'error'); }
}

function tratarNaoEncontrado() {
    mostrarMensagem('Evento não encontrado. Pode incluir um novo.', 'info');
    const idTemp = searchId.value;
    limparFormulario();
    searchId.value = idTemp;
    mostrarBotoes(true, true, false, false, false, false);
    bloquearCampos(false);
}

async function salvarOperacao() {
    const dados = {
        nome: inpNome.value,
        data: inpData.value,
        hora: inpHora.value,
        id_pessoa: selPessoa.value,
        status: selStatus.value,
        som: audioBase64
    };

    let url = API_URL;
    let method = 'POST';

    if (operacao === 'alterar') {
        url += `/${currentId}`;
        method = 'PUT';
    } else if (operacao === 'excluir') {
        url += `/${currentId}`;
        method = 'DELETE';
    }

    try {
        const res = await fetch(url, {
            method: method,
            headers: {'Content-Type': 'application/json'},
            body: (operacao === 'excluir') ? null : JSON.stringify(dados)
        });

        if (res.ok) {
            mostrarMensagem('Operação realizada!', 'success');
            limparFormulario();
            bloquearCampos(false);
            mostrarBotoes(true, false, false, false, false, false);
            carregarEventos();
        } else {
            const erro = await res.json();
            mostrarMensagem('Erro: ' + erro.erro, 'error');
        }
    } catch (e) { console.error(e); }
}

async function carregarEventos() {
    try {
        const res = await fetch(API_URL);
        const lista = await res.json();
        const tbody = document.getElementById('eventosTableBody');
        tbody.innerHTML = '';
        
        lista.forEach(e => {
            const dataF = new Date(e.data_evento).toLocaleDateString('pt-BR');
            const somIcon = e.som_evento ? '🔊' : '-';
            
            // Note que aqui usamos e.nome_pessoa e e.descricao_status que vêm do JOIN no backend
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><button class="btn-id" onclick="selecionar(${e.id_evento})">${e.id_evento}</button></td>
                <td>${dataF} ${e.hora_evento}</td>
                <td>${e.nome_evento}</td>
                <td>${e.nome_pessoa || 'N/A'}</td>
                <td>${e.descricao_status || 'N/A'}</td>
                <td style="text-align:center;">${somIcon}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (e) { console.error(e); }
}

// --- Auxiliares ---

function selecionar(id) {
    searchId.value = id;
    buscarEvento();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function preencherFormulario(e) {
    currentId = e.id_evento;
    searchId.value = e.id_evento;
    inpNome.value = e.nome_evento;
    // Formata Data (yyyy-MM-dd)
    if (e.data_evento) inpData.value = e.data_evento.split('T')[0];
    inpHora.value = e.hora_evento;
    selPessoa.value = e.id_pessoa;
    selStatus.value = e.status; // fk chama-se 'status' na tabela

    if (e.som_evento) {
        audioBase64 = e.som_evento;
        audioPreview.src = audioBase64;
    } else {
        limparAudio();
    }
}

function limparAudio() {
    audioBase64 = null;
    audioPreview.src = '';
    inputAudio.value = '';
}

function limparFormulario() {
    form.reset();
    limparAudio();
    currentId = null;
}

// Estados dos botões
function iniciarInclusao() {
    operacao = 'incluir';
    const idTemp = searchId.value;
    limparFormulario();
    // searchId.value = idTemp;
    bloquearCampos(true);
    searchId.disabled = true;
    mostrarBotoes(false, false, false, false, true, true);
}

function iniciarAlteracao() {
    operacao = 'alterar';
    bloquearCampos(true);
    mostrarBotoes(false, false, false, false, true, true);
}

function iniciarExclusao() {
    operacao = 'excluir';
    mostrarMensagem('Confirme exclusão clicando em Salvar.', 'warning');
    bloquearCampos(false);
    searchId.disabled = true;
    mostrarBotoes(false, false, false, false, true, true);
}

function cancelarOperacao() {
    limparFormulario();
    bloquearCampos(false);
    mostrarBotoes(true, false, false, false, false, false);
}

function bloquearCampos(modoEdicao) {
    searchId.disabled = modoEdicao;
    inpNome.disabled = !modoEdicao;
    inpData.disabled = !modoEdicao;
    inpHora.disabled = !modoEdicao;
    selPessoa.disabled = !modoEdicao;
    selStatus.disabled = !modoEdicao;
    inputAudio.disabled = !modoEdicao;
    btnLimparAudio.disabled = !modoEdicao;
}

function mostrarBotoes(bBus, bInc, bAlt, bExc, bSal, bCan) {
    btnBuscar.style.display = bBus ? 'inline-block' : 'none';
    btnIncluir.style.display = bInc ? 'inline-block' : 'none';
    btnAlterar.style.display = bAlt ? 'inline-block' : 'none';
    btnExcluir.style.display = bExc ? 'inline-block' : 'none';
    btnSalvar.style.display = bSal ? 'inline-block' : 'none';
    btnCancelar.style.display = bCan ? 'inline-block' : 'none';
}

function mostrarMensagem(msg, tipo) {
    messageContainer.innerHTML = `<div class="message ${tipo}">${msg}</div>`;
    setTimeout(() => { messageContainer.innerHTML = ''; }, 3000);
}