function mudarTipoPessoa() {
    const tipoPessoa = document.querySelector('input[name="tipoPessoa"]:checked').value;
    const labelNome = document.getElementById('labelNome');
    const labelDocumento = document.getElementById('labelDocumento');
    const labelData = document.getElementById('labelData');
    const rgGroup = document.getElementById('rgGroup');
    const documento = document.getElementById('documento');
    
    if (tipoPessoa === 'juridica') {
        labelNome.textContent = 'Razão Social *';
        labelDocumento.textContent = 'CNPJ *';
        labelData.textContent = 'Data de Fundação';
        rgGroup.style.display = 'none';
        documento.placeholder = '00.000.000/0000-00';
    } else {
        labelNome.textContent = 'Nome Completo *';
        labelDocumento.textContent = 'CPF *';
        labelData.textContent = 'Data de Nascimento';
        rgGroup.style.display = 'block';
        documento.placeholder = '000.000.000-00';
    }
}

function buscarCep() {
    const cep = document.getElementById('cep').value.replace(/\D/g, '');
    
    if (cep.length === 8) {
        fetch(`https://viacep.com.br/ws/${cep}/json/`)
            .then(response => response.json())
            .then(data => {
                if (!data.erro) {
                    document.getElementById('logradouro').value = data.logradouro || '';
                    document.getElementById('bairro').value = data.bairro || '';
                    document.getElementById('cidade').value = data.localidade || '';
                    document.getElementById('estado').value = data.uf || '';
                    document.getElementById('numero').focus();
                }
            })
            .catch(error => console.log('Erro ao buscar CEP:', error));
    }
}

function cadastrarCliente(event) {
    event.preventDefault();
    
    const cliente = {
        tipoPessoa: document.querySelector('input[name="tipoPessoa"]:checked').value,
        nome: document.getElementById('nome').value,
        documento: document.getElementById('documento').value,
        rg: document.getElementById('rg').value,
        dataNascimento: document.getElementById('dataNascimento').value,
        sexo: document.getElementById('sexo').value,
        telefone: document.getElementById('telefone').value,
        telefone2: document.getElementById('telefone2').value,
        email: document.getElementById('email').value,
        cep: document.getElementById('cep').value,
        logradouro: document.getElementById('logradouro').value,
        numero: document.getElementById('numero').value,
        complemento: document.getElementById('complemento').value,
        bairro: document.getElementById('bairro').value,
        cidade: document.getElementById('cidade').value,
        estado: document.getElementById('estado').value,
        observacoes: document.getElementById('observacoes').value,
        dataCadastro: new Date().toISOString()
    };

    console.log('Cliente cadastrado:', cliente);
    
    const successMessage = document.getElementById('successMessage');
    successMessage.classList.add('show');
    
    setTimeout(() => {
        successMessage.classList.remove('show');
        limparFormulario();
    }, 3000);
}

function limparFormulario() {
    document.getElementById('clientForm').reset();
}

function voltarPagina() {
    if (confirm('Deseja realmente voltar? Dados não salvos serão perdidos.')) {
        window.history.back();
    }
}