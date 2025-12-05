function cadastrarFuncionario() {
    const nome = document.getElementById('nome').value;
    const cpf = document.getElementById('cpf').value;
    const dataNascimento = document.getElementById('dataNascimento').value;
    const telefone = document.getElementById('telefone').value;
    const matricula = document.getElementById('matricula').value;
    const cargo = document.getElementById('cargo').value;
    const departamento = document.getElementById('departamento').value;
    const dataAdmissao = document.getElementById('dataAdmissao').value;
    const turno = document.getElementById('turno').value;
    const usuario = document.getElementById('usuario').value;
    const senha = document.getElementById('senha').value;
    const nivelAcesso = document.getElementById('nivelAcesso').value;

    if (!nome || !cpf || !dataNascimento || !telefone || !matricula || !cargo || !departamento || !dataAdmissao || !turno || !usuario || !senha || !nivelAcesso) {
        alert('Por favor, preencha todos os campos obrigatórios (*)');
        return;
    }

    if (senha.length < 6) {
        alert('A senha deve ter no mínimo 6 caracteres');
        return;
    }

    const especializacoes = [];
    document.querySelectorAll('.checkbox-group input[type="checkbox"]:checked').forEach(checkbox => {
        if (checkbox.id.startsWith('esp-')) {
            especializacoes.push(checkbox.value);
        }
    });

    const permissoes = [];
    document.querySelectorAll('.checkbox-group input[type="checkbox"]:checked').forEach(checkbox => {
        if (checkbox.id.startsWith('perm-')) {
            permissoes.push(checkbox.value);
        }
    });

    const funcionario = {
        nome,
        cpf,
        rg: document.getElementById('rg').value,
        dataNascimento,
        telefone,
        email: document.getElementById('email').value,
        endereco: document.getElementById('endereco').value,
        matricula,
        cargo,
        departamento,
        dataAdmissao,
        supervisor: document.getElementById('supervisor').value,
        turno,
        especializacoes,
        salario: document.getElementById('salario').value,
        comissao: document.getElementById('comissao').value,
        metaServicos: document.getElementById('metaServicos').value,
        metaFaturamento: document.getElementById('metaFaturamento').value,
        banco: document.getElementById('banco').value,
        agencia: document.getElementById('agencia').value,
        conta: document.getElementById('conta').value,
        usuario,
        nivelAcesso,
        permissoes,
        observacoes: document.getElementById('observacoes').value,
        dataCadastro: new Date().toISOString()
    };

    console.log('Funcionário cadastrado:', funcionario);

    document.getElementById('mensagemSucesso').classList.add('show');
    document.getElementById('formulario').style.display = 'none';
    
    setTimeout(() => {
        limparFormulario();
        document.getElementById('mensagemSucesso').classList.remove('show');
        document.getElementById('formulario').style.display = 'grid';
    }, 3000);
}

function limparFormulario() {
    document.querySelectorAll('input, select, textarea').forEach(field => {
        if (field.type === 'checkbox') {
            field.checked = false;
        } else {
            field.value = '';
        }
    });
}

document.getElementById('cpf').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
        value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        e.target.value = value;
    }
});

document.getElementById('telefone').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
        value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        e.target.value = value;
    }
});