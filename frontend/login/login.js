document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Impede recarregar a página

    const emailValor = document.getElementById('email').value;
    const senhaValor = document.getElementById('senha').value;
    const msgDiv = document.getElementById('mensagem');

    msgDiv.innerText = 'Verificando...';
    msgDiv.style.color = 'blue';

    try {
        const response = await fetch('http://localhost:3003/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            // Envia 'email' e 'senha' para o backend ler no req.body
            body: JSON.stringify({ email: emailValor, senha: senhaValor })
        });

        const dados = await response.json();

        if (response.ok && dados.sucesso) {
            msgDiv.innerText = 'Sucesso! Entrando...';
            msgDiv.style.color = 'green';
            
            // Pequeno delay para garantir que o cookie foi salvo
            setTimeout(() => {
                window.location.href = '../menu/menu.html';
            }, 500);
        } else {
            msgDiv.innerText = dados.erro || 'Dados incorretos.';
            msgDiv.style.color = 'red';
        }

    } catch (error) {
        console.error('Erro:', error);
        msgDiv.innerText = 'Erro de conexão com o servidor.';
        msgDiv.style.color = 'red';
    }
});