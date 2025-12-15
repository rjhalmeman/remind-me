function entrar() {
    var email = document.getElementById('email').value;
    var senha = document.getElementById('senha').value;

    fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, senha: senha })
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
        if (data.sucesso) {
            window.location.href = '../menu/menu.html';
        } else {
            alert('Erro: ' + data.mensagem);
        }
    })
    .catch(function(err) { console.error(err); });
}