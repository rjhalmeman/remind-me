window.onload = function() {
    verificarLogin();
    carregarEventos();
};

function verificarLogin() {
    // Pega o nome do cookie de forma simples
    var cookies = document.cookie.split('; ');
    var nome = "Usuário";
    var logado = false;

    for (var i = 0; i < cookies.length; i++) {
        if (cookies[i].indexOf('nome_usuario=') === 0) {
            nome = decodeURIComponent(cookies[i].split('=')[1]);
        }
        if (cookies[i].indexOf('usuario_logado=') === 0) logado = true;
    }

    if (!logado) window.location.href = '../login/login.html';
    document.getElementById('saudacao').innerText = 'Olá, ' + nome;
}

function sair() {
    fetch('/api/logout', { method: 'POST' })
    .then(function() { window.location.href = '../login/login.html'; });
}

function carregarEventos() {
    fetch('/api/evento/menu')
    .then(function(res) { return res.json(); })
    .then(function(eventos) {
        var div = document.getElementById('listaEventos');
        div.innerHTML = '';
        
        if (eventos.length === 0) {
            div.innerHTML = '<p>Nenhum evento pendente.</p>';
            return;
        }

        for (var i = 0; i < eventos.length; i++) {
            var e = eventos[i];
            var corClass = '';
            
            // Define cor
            if (e.status === 1) corClass = 'status-agendado';
            else if (e.status === 2) corClass = 'status-andamento';
            else if (e.status === 3) corClass = 'status-cancelado';

            var html = '<div class="card ' + corClass + '">';
            html += '<h4>' + e.nome_evento + ' (' + e.descricao_status + ')</h4>';
            html += '<p>Data: ' + e.data_evento.split('T')[0] + ' às ' + e.hora_evento + '</p>';
            if(e.descricao_evento) html += '<p>Desc: ' + e.descricao_evento + '</p>';
            
            // Botões de ação
            html += '<div>';
            if (e.status === 1) { // Agendado
                html += '<button onclick="mudarStatus('+e.id_evento+', 2)">Iniciar</button>';
                html += '<button class="btn-danger" onclick="mudarStatus('+e.id_evento+', 3)">Cancelar</button>';
            } else if (e.status === 2) { // Em andamento
                html += '<button onclick="mudarStatus('+e.id_evento+', 4)">Concluir</button>';
            }
            html += '</div></div>';
            
            div.innerHTML += html;
        }
    });
}

function mudarStatus(id, novoStatus) {
    fetch('/api/evento/status/' + id, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ novoStatus: novoStatus })
    }).then(function() { carregarEventos(); });
}