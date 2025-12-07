let materiais = [];

function adicionarMaterial() {
    const material = document.getElementById('material').value;
    const quantidade = document.getElementById('quantidade').value;

    if (!material || !quantidade) {
        alert('Preencha o material e a quantidade');
        return;
    }

    materiais.push({ material, quantidade });
    atualizarListaMateriais();

    document.getElementById('material').value = '';
    document.getElementById('quantidade').value = '';
}

function atualizarListaMateriais() {
    const lista = document.getElementById('listaMateriais');
    
    if (materiais.length === 0) {
        lista.style.display = 'none';
        return;
    }

    lista.style.display = 'block';
    lista.innerHTML = materiais.map((item, index) => `
        <div class="material-item">
            <span>${item.material} - ${item.quantidade}</span>
            <button class="remove-material" onclick="removerMaterial(${index})">Remover</button>
        </div>
    `).join('');
}

function removerMaterial(index) {
    materiais.splice(index, 1);
    atualizarListaMateriais();
}

async function cadastrarTarefa() {
    const tituloTarefa = document.getElementById('tituloTarefa').value;
    const tipoServico = document.getElementById('tipoServico').value;
    const prioridade = document.getElementById('prioridade').value;
    const tempoEstimado = document.getElementById('tempoEstimado').value;
    const descricao = document.getElementById('descricao').value;
    const funcionario = document.getElementById('funcionario').value;
    const dataAgendamento = document.getElementById('dataAgendamento').value;
    const horario = document.getElementById('horario').value;
    const cliente = document.getElementById('cliente').value;
    const veiculo = document.getElementById('veiculo').value;

    if (!tituloTarefa || !tipoServico || !prioridade || !tempoEstimado || !descricao || !funcionario || !dataAgendamento || !horario || !cliente || !veiculo) {
        alert('Por favor, preencha todos os campos obrigatórios (*)');
        return;
    }

    const equipeAdicional = [];
    document.querySelectorAll('.checkbox-group input[type="checkbox"]:checked').forEach(checkbox => {
        if (checkbox.id.startsWith('equipe')) {
            equipeAdicional.push(checkbox.value);
        }
    });

    const checklist = [];
    document.querySelectorAll('.checkbox-group input[type="checkbox"]:checked').forEach(checkbox => {
        if (checkbox.id.startsWith('check')) {
            checklist.push(checkbox.value);
        }
    });

    const notificacoes = [];
    document.querySelectorAll('.checkbox-group input[type="checkbox"]:checked').forEach(checkbox => {
        if (checkbox.id.startsWith('notif')) {
            notificacoes.push(checkbox.value);
        }
    });

    const tarefa = {
        tituloTarefa,
        tipoServico,
        prioridade,
        tempoEstimado,
        descricao,
        funcionario,
        dataAgendamento,
        horario,
        supervisor: document.getElementById('supervisor').value,
        equipeAdicional,
        cliente,
        veiculo,
        placa: document.getElementById('placa').value,
        cor: document.getElementById('cor').value,
        numeroOS: document.getElementById('numeroOS').value,
        observacoesVeiculo: document.getElementById('observacoesVeiculo').value,
        materiais,
        checklist,
        valorServico: document.getElementById('valorServico').value,
        comissaoFuncionario: document.getElementById('comissaoFuncionario').value,
        formaPagamento: document.getElementById('formaPagamento').value,
        statusPagamento: document.getElementById('statusPagamento').value,
        instrucoes: document.getElementById('instrucoes').value,
        observacoesGerais: document.getElementById('observacoesGerais').value,
        notificacoes
    };

    try {
        const response = await fetch('/api/tarefas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tarefa)
        });
        
        if (response.ok) {
            document.getElementById('mensagemSucesso').classList.add('show');
            window.scrollTo(0, 0);

            setTimeout(() => {
                limparFormulario();
                document.getElementById('mensagemSucesso').classList.remove('show');
            }, 3000);
        } else {
            alert('Erro ao cadastrar tarefa');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao cadastrar tarefa');
    }
}

function limparFormulario() {
    document.querySelectorAll('input, select, textarea').forEach(field => {
        if (field.type === 'checkbox') {
            field.checked = false;
        } else {
            field.value = '';
        }
    });
    
    materiais = [];
    atualizarListaMateriais();

    document.getElementById('notif1').checked = true;
    document.getElementById('notif2').checked = true;
}

document.getElementById('dataAgendamento').valueAsDate = new Date();
