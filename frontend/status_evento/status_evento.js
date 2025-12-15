const API_BASE_URL = 'http://localhost:3003/api/status';
let currentId = null;
let operacao = null; 

// Elementos DOM
const searchId = document.getElementById('searchId');
const inpDescricao = document.getElementById('descricao_status');
const statusTableBody = document.getElementById('statusTableBody');
const messageContainer = document.getElementById('messageContainer');

// Botões
const btnBuscar = document.getElementById('btnBuscar');
const btnIncluir = document.getElementById('btnIncluir');
const btnAlterar = document.getElementById('btnAlterar');
const btnExcluir = document.getElementById('btnExcluir');
const btnSalvar = document.getElementById('btnSalvar');
const btnCancelar = document.getElementById('btnCancelar');

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    carregarLista();
    mostrarBotoes(true, false, false, false, false, false);
    bloquearCampos(false);
});

// Event Listeners
btnBuscar.addEventListener('click', buscarRegistro);
btnIncluir.addEventListener('click', iniciarInclusao);
btnAlterar.addEventListener('click', iniciarAlteracao);
btnExcluir.addEventListener('click', iniciarExclusao);
btnSalvar.addEventListener('click', salvarOperacao);
btnCancelar.addEventListener('click', cancelarOperacao);

// --- Funções CRUD ---

async function buscarRegistro() {
    const id = searchId.value.trim();
    if (!id) return mostrarMensagem('Digite um ID.', 'warning');

    try {
        const response = await fetch(`${API_BASE_URL}/${id}`);
        if (response.ok) {
            const dados = await response.json();
            preencherFormulario(dados);
            mostrarMensagem('Encontrado!', 'success');
            mostrarBotoes(true, false, true, true, false, false);
        } else {
            mostrarMensagem('ID não encontrado. Pode incluir um novo.', 'info');
            limparFormulario(true); // Mantém o ID pesquisado
            mostrarBotoes(true, true, false, false, false, false);
        }
    } catch (e) { console.error(e); }
}

async function salvarOperacao() {
    const dados = { descricao: inpDescricao.value };
    let url = API_BASE_URL;
    let method = 'POST';

    if (operacao === 'alterar') {
        url += `/${currentId}`;
        method = 'PUT';
    } else if (operacao === 'excluir') {
        url += `/${currentId}`;
        method = 'DELETE';
    }

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: (operacao === 'excluir') ? null : JSON.stringify(dados)
        });

        if (response.ok) {
            mostrarMensagem('Sucesso!', 'success');
            limparFormulario();
            bloquearCampos(false);
            mostrarBotoes(true, false, false, false, false, false);
            carregarLista();
        } else {
            mostrarMensagem('Erro ao salvar.', 'error');
        }
    } catch (e) { console.error(e); }
}

async function carregarLista() {
    try {
        const response = await fetch(API_BASE_URL);
        const lista = await response.json();
        statusTableBody.innerHTML = '';
        lista.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><button class="btn-id" onclick="selecionar(${item.id_status})">${item.id_status}</button></td>
                <td>${item.descricao_status}</td>
            `;
            statusTableBody.appendChild(tr);
        });
    } catch (e) { console.error(e); }
}

function selecionar(id) {
    searchId.value = id;
    buscarRegistro();
}

// --- Funções de Controle ---

function iniciarInclusao() {
    operacao = 'incluir';
    limparFormulario(true);
    bloquearCampos(true);
    searchId.disabled = true;
    mostrarBotoes(false, false, false, false, true, true);
    inpDescricao.focus();
}

function iniciarAlteracao() {
    operacao = 'alterar';
    bloquearCampos(true);
    mostrarBotoes(false, false, false, false, true, true);
    inpDescricao.focus();
}

function iniciarExclusao() {
    operacao = 'excluir';
    mostrarMensagem('Confirme a exclusão no botão Salvar.', 'warning');
    mostrarBotoes(false, false, false, false, true, true);
}

function cancelarOperacao() {
    limparFormulario();
    bloquearCampos(false);
    mostrarBotoes(true, false, false, false, false, false);
}

function preencherFormulario(d) {
    currentId = d.id_status;
    searchId.value = d.id_status;
    inpDescricao.value = d.descricao_status;
}

function limparFormulario(manterId = false) {
    if (!manterId) {
        searchId.value = '';
        currentId = null;
    }
    inpDescricao.value = '';
    operacao = null;
}

function bloquearCampos(editando) {
    searchId.disabled = editando;
    inpDescricao.disabled = !editando;
}

function mostrarBotoes(bBuscar, bIncluir, bAlterar, bExcluir, bSalvar, bCancelar) {
    btnBuscar.style.display = bBuscar ? 'inline-block' : 'none';
    btnIncluir.style.display = bIncluir ? 'inline-block' : 'none';
    btnAlterar.style.display = bAlterar ? 'inline-block' : 'none';
    btnExcluir.style.display = bExcluir ? 'inline-block' : 'none';
    btnSalvar.style.display = bSalvar ? 'inline-block' : 'none';
    btnCancelar.style.display = bCancelar ? 'inline-block' : 'none';
}

function mostrarMensagem(msg, tipo) {
    messageContainer.innerHTML = `<div class="message ${tipo}">${msg}</div>`;
    setTimeout(() => { messageContainer.innerHTML = ''; }, 3000);
}