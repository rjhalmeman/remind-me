// Configuração da API
const API_BASE_URL = 'http://localhost:3003/api/pessoas';
let currentPersonId = null;
let operacao = null; 

// Referências
const form = document.getElementById('pessoaForm');
const searchId = document.getElementById('searchId');
const btnBuscar = document.getElementById('btnBuscar');
const btnIncluir = document.getElementById('btnIncluir');
const btnAlterar = document.getElementById('btnAlterar');
const btnExcluir = document.getElementById('btnExcluir');
const btnSalvar = document.getElementById('btnSalvar');
const btnCancelar = document.getElementById('btnCancelar');
const pessoasTableBody = document.getElementById('pessoasTableBody');
const messageContainer = document.getElementById('messageContainer');

// Inputs
const inpNome = document.getElementById('nome_pessoa');
const inpEmail = document.getElementById('email_pessoa');
const inpSenha = document.getElementById('senha_pessoa');
const inpNasc = document.getElementById('data_nascimento_pessoa');

// Referências da Foto
const imgPreview = document.getElementById('imgPreview');
const inputArquivo = document.getElementById('inputArquivo');
const btnColar = document.getElementById('btnColar');
const btnLimparFoto = document.getElementById('btnLimparFoto');

// Variável global para guardar a string da imagem
let imagemBase64 = null; 

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    carregarPessoas();
    mostrarBotoes(true, false, false, false, false, false); 
    bloquearCampos(false); 
});

// Event Listeners (Botoes Principais)
btnBuscar.addEventListener('click', buscarPessoa);
btnIncluir.addEventListener('click', iniciarInclusao);
btnAlterar.addEventListener('click', iniciarAlteracao);
btnExcluir.addEventListener('click', iniciarExclusao);
btnSalvar.addEventListener('click', salvarOperacao);
btnCancelar.addEventListener('click', cancelarOperacao);

// Event Listener (Arquivo de Foto)
inputArquivo.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        lerArquivoEExibir(file);
    }
});

// --- Funções de Imagem ---

// 1. Ler arquivo do input ou do colar
function lerArquivoEExibir(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        imagemBase64 = e.target.result; // Salva na variavel global
        imgPreview.src = imagemBase64;  // Mostra na tela
    };
    reader.readAsDataURL(file); // Converte para Base64
}

// 2. Colar da Área de Transferência
async function colarImagem() {
    try {
        const clipboardItems = await navigator.clipboard.read();
        for (const item of clipboardItems) {
            // Procura por tipos de imagem (png, jpeg)
            const type = item.types.find(t => t.startsWith('image/'));
            if (type) {
                const blob = await item.getType(type);
                lerArquivoEExibir(blob);
                mostrarMensagem('Imagem colada com sucesso!', 'success');
                return;
            }
        }
        mostrarMensagem('Nenhuma imagem encontrada na área de transferência.', 'warning');
    } catch (err) {
        console.error(err);
        mostrarMensagem('Erro ao colar (permissão negada ou navegador incompatível).', 'error');
    }
}

function limparFoto() {
    imagemBase64 = null;
    imgPreview.src = ''; // Limpa preview
    inputArquivo.value = ''; // Limpa input file
}

// --- Funções de Interface ---

function mostrarMensagem(texto, tipo = 'info') {
    messageContainer.innerHTML = `<div class="message ${tipo}">${texto}</div>`;
    setTimeout(() => { messageContainer.innerHTML = ''; }, 4000);
}

function mostrarBotoes(bBuscar, bIncluir, bAlterar, bExcluir, bSalvar, bCancelar) {
    btnBuscar.style.display = bBuscar ? 'inline-block' : 'none';
    btnIncluir.style.display = bIncluir ? 'inline-block' : 'none';
    btnAlterar.style.display = bAlterar ? 'inline-block' : 'none';
    btnExcluir.style.display = bExcluir ? 'inline-block' : 'none';
    btnSalvar.style.display = bSalvar ? 'inline-block' : 'none';
    btnCancelar.style.display = bCancelar ? 'inline-block' : 'none';
}

function bloquearCampos(modoEdicao) {
    searchId.disabled = modoEdicao;
    inpNome.disabled = !modoEdicao;
    inpEmail.disabled = !modoEdicao;
    inpSenha.disabled = !modoEdicao;
    inpNasc.disabled = !modoEdicao;
    
    // Controles de Foto
    inputArquivo.disabled = !modoEdicao;
    btnColar.disabled = !modoEdicao;
    btnLimparFoto.disabled = !modoEdicao;
}

function limparFormulario() {
    form.reset();
    limparFoto(); // Limpa a foto também
    currentPersonId = null;
}

// --- Funções CRUD ---

async function buscarPessoa() {
    const id = searchId.value.trim();
    if (!id) return mostrarMensagem('Digite um ID.', 'warning');

    try {
        const response = await fetch(`${API_BASE_URL}/${id}`);
        if (response.ok) {
            const pessoa = await response.json();
            preencherFormulario(pessoa);
            mostrarMensagem('Pessoa encontrada!', 'success');
            mostrarBotoes(true, false, true, true, false, false);
            bloquearCampos(false); 
        } else {
            tratarNaoEncontrado();
        }
    } catch (error) { mostrarMensagem('Erro ao conectar.', 'error'); }
}

function tratarNaoEncontrado() {
    mostrarMensagem('ID não encontrado. Inclua um novo.', 'info');
    const idPesquisado = searchId.value;
    limparFormulario();
    searchId.value = idPesquisado;
    mostrarBotoes(true, true, false, false, false, false);
    bloquearCampos(false);
}

function preencherFormulario(p) {
    currentPersonId = p.id_pessoa;
    searchId.value = p.id_pessoa;
    inpNome.value = p.nome_pessoa;
    inpEmail.value = p.email_pessoa;
    inpSenha.value = p.senha_pessoa;
    if (p.data_nascimento_pessoa) inpNasc.value = p.data_nascimento_pessoa.split('T')[0];
    
    // Foto
    if (p.foto_pessoa) {
        imagemBase64 = p.foto_pessoa; // Já vem formatado do back
        imgPreview.src = imagemBase64;
    } else {
        limparFoto();
    }
}

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
    mostrarMensagem('Confirme a exclusão clicando em Salvar.', 'warning');
    bloquearCampos(false);
    searchId.disabled = true;
    mostrarBotoes(false, false, false, false, true, true);
}

function cancelarOperacao() {
    operacao = null;
    limparFormulario();
    bloquearCampos(false);
    mostrarBotoes(true, false, false, false, false, false);
}

async function salvarOperacao() {
    const dados = {
        nome: inpNome.value,
        email: inpEmail.value,
        senha: inpSenha.value,
        nascimento: inpNasc.value,
        foto: imagemBase64 // Enviamos a string base64 aqui
    };

    let url = API_BASE_URL;
    let method = 'POST';

    if (operacao === 'alterar') {
        url += `/${currentPersonId}`;
        method = 'PUT';
    } else if (operacao === 'excluir') {
        url += `/${currentPersonId}`;
        method = 'DELETE';
    }

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: (operacao === 'excluir') ? null : JSON.stringify(dados)
        });

        if (response.ok) {
            mostrarMensagem(`Sucesso!`, 'success');
            limparFormulario();
            bloquearCampos(false);
            mostrarBotoes(true, false, false, false, false, false);
            carregarPessoas();
        } else {
            const erro = await response.json();
            mostrarMensagem('Erro: ' + (erro.erro || erro.mensagem), 'error');
        }
    } catch (error) { mostrarMensagem('Erro na comunicação.', 'error'); }
}

async function carregarPessoas() {
    try {
        const response = await fetch(API_BASE_URL);
        const lista = await response.json();
        
        pessoasTableBody.innerHTML = '';
        lista.forEach(p => {
            // Miniatura na tabela
            let imgHtml = p.foto_pessoa 
                ? `<img src="${p.foto_pessoa}" style="width:30px; height:30px; object-fit:cover; border-radius:50%;">` 
                : '🚫';

            const nasc = p.data_nascimento_pessoa ? new Date(p.data_nascimento_pessoa).toLocaleDateString('pt-BR') : '-';
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><button class="btn-id" onclick="selecionarPessoa(${p.id_pessoa})">${p.id_pessoa}</button></td>
                <td style="text-align:center;">${imgHtml}</td>
                <td>${p.nome_pessoa}</td>
                <td>${p.email_pessoa}</td>
            `;
            pessoasTableBody.appendChild(tr);
        });
    } catch (e) { console.error(e); }
}

function selecionarPessoa(id) {
    searchId.value = id;
    buscarPessoa();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}