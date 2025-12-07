let employeesData = [];

async function loadEmployees() {
    try {
        const response = await fetch('/api/funcionarios');
        employeesData = await response.json();
        renderEmployeesTable();
    } catch (error) {
        console.error('Erro ao carregar funcionários:', error);
        employeesData = [];
        renderEmployeesTable();
    }
}

function renderEmployeesTable() {
    const tbody = document.getElementById('employeesTableBody');
    if (!tbody) return;
    
    if (employeesData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px; color: #666;">Nenhum funcionário cadastrado</td></tr>';
        return;
    }
    
    tbody.innerHTML = employeesData.map((emp, index) => `
        <tr>
            <td>${emp.matricula}</td>
            <td>${emp.nome}</td>
            <td>${emp.cargo}</td>
            <td>${emp.departamento}</td>
            <td>${emp.turno}</td>
            <td>
                <button class="action-btn" onclick="viewEmployee('${emp.id}')">Ver</button>
                <button class="action-btn delete-btn" onclick="deleteEmployee('${emp.id}')">Excluir</button>
            </td>
        </tr>
    `).join('');
}

async function cadastrarFuncionario() {
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

    const matriculaExists = employeesData.some(emp => emp.matricula === matricula);
    if (matriculaExists) {
        alert('Já existe um funcionário com esta matrícula!');
        return;
    }

    const cpfExists = employeesData.some(emp => emp.cpf === cpf);
    if (cpfExists) {
        alert('Já existe um funcionário com este CPF!');
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
        observacoes: document.getElementById('observacoes').value
    };

    try {
        const response = await fetch('/api/funcionarios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(funcionario)
        });
        
        if (response.ok) {
            const savedFuncionario = await response.json();
            employeesData.push(savedFuncionario);
            renderEmployeesTable();

            document.getElementById('mensagemSucesso').classList.add('show');
            document.getElementById('formulario').style.display = 'none';
            
            setTimeout(() => {
                limparFormulario();
                document.getElementById('mensagemSucesso').classList.remove('show');
                document.getElementById('formulario').style.display = 'grid';
            }, 3000);
        } else {
            const error = await response.json();
            alert('Erro ao cadastrar funcionário: ' + (error.error || 'Erro desconhecido'));
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao cadastrar funcionário');
    }
}

function viewEmployee(id) {
    const emp = employeesData.find(e => e.id === id);
    if (!emp) return;
    
    const info = `
DADOS DO FUNCIONÁRIO

Nome: ${emp.nome}
CPF: ${emp.cpf}
RG: ${emp.rg || 'Não informado'}
Data de Nascimento: ${emp.dataNascimento}
Telefone: ${emp.telefone}
E-mail: ${emp.email || 'Não informado'}
Endereço: ${emp.endereco || 'Não informado'}

INFORMAÇÕES PROFISSIONAIS
Matrícula: ${emp.matricula}
Cargo: ${emp.cargo}
Departamento: ${emp.departamento}
Data de Admissão: ${emp.dataAdmissao}
Supervisor: ${emp.supervisor || 'Não informado'}
Turno: ${emp.turno}
Especializações: ${emp.especializacoes && emp.especializacoes.length > 0 ? emp.especializacoes.join(', ') : 'Nenhuma'}

REMUNERAÇÃO
Salário: R$ ${emp.salario || '0,00'}
Comissão: ${emp.comissao || '0'}%
Meta de Serviços: ${emp.metaServicos || 'Não definida'}
Meta de Faturamento: R$ ${emp.metaFaturamento || 'Não definida'}

ACESSO AO SISTEMA
Usuário: ${emp.usuario}
Nível de Acesso: ${emp.nivelAcesso}
Permissões: ${emp.permissoes && emp.permissoes.length > 0 ? emp.permissoes.join(', ') : 'Nenhuma'}

Observações: ${emp.observacoes || 'Nenhuma'}
    `;
    alert(info);
}

async function deleteEmployee(id) {
    const emp = employeesData.find(e => e.id === id);
    if (!emp) return;
    
    if (confirm(`Deseja realmente excluir o funcionário "${emp.nome}"?`)) {
        try {
            const response = await fetch(`/api/funcionarios/${id}`, { method: 'DELETE' });
            
            if (response.ok) {
                employeesData = employeesData.filter(e => e.id !== id);
                renderEmployeesTable();
                alert('Funcionário excluído com sucesso!');
            } else {
                alert('Erro ao excluir funcionário');
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao excluir funcionário');
        }
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

document.addEventListener('DOMContentLoaded', loadEmployees);
