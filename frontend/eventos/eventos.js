window.onload = function() { listar(); };

function listar() {
    fetch('/api/eventos')
    .then(function(r) { return r.json(); })
    .then(function(dados) {
        var ul = document.getElementById('lista');
        ul.innerHTML = '';
        for(var i=0; i<dados.length; i++){
            var e = dados[i];
            ul.innerHTML += '<li>' + e.nome_evento + 
                ' <button class="btn-danger" onclick="deletar('+e.id_evento+')">X</button></li>';
        }
    });
}

function salvar(event) {
    event.preventDefault();
    var body = {
        nome: document.getElementById('nome').value,
        data: document.getElementById('data').value,
        hora: document.getElementById('hora').value,
        descricao: document.getElementById('desc').value,
        id_pessoa: document.getElementById('id_pessoa').value,
        status: document.getElementById('status').value
    };

    fetch('/api/eventos', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body)
    }).then(function() {
        alert('Salvo!');
        listar();
    });
}

function deletar(id) {
    if(confirm('Excluir?')) {
        fetch('/api/eventos/'+id, { method: 'DELETE' })
        .then(function() { listar(); });
    }
}