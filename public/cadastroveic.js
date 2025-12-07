function getVeiculos() {
    const data = localStorage.getItem('veiculos');
    return data ? JSON.parse(data) : [];
}

function salvarVeiculos(veiculos) {
    localStorage.setItem('veiculos', JSON.stringify(veiculos));
}

function gerarId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatarPlaca(input) {
    let value = input.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    if (value.length > 3) {
        value = value.slice(0, 3) + '-' + value.slice(3, 7);
    }
    input.value = value;
}

function formatarCPF(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length <= 11) {
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    input.value = value;
}

function formatarTelefone(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length <= 11) {
        value = value.replace(/(\d{2})(\d)/, '($1) $2');
        value = value.replace(/(\d{5})(\d)/, '$1-$2');
    }
    input.value = value;
}

function cadastrarVeiculo(event) {
    event.preventDefault();
    
    const veiculo = {
        id: gerarId(),
        placa: document.getElementById('placa').value,
        marca: document.getElementById('marca').value,
        modelo: document.getElementById('modelo').value,
        ano: document.getElementById('ano').value,
        cor: document.getElementById('cor').value,
        tipo: document.getElementById('tipo').value,
        cpfProprietario: document.getElementById('cpfProprietario').value,
        nomeProprietario: document.getElementById('nomeProprietario').value,
        telefoneProprietario: document.getElementById('telefoneProprietario').value,
        emailProprietario: document.getElementById('emailProprietario').value,
        kilometragem: document.getElementById('kilometragem').value,
        combustivel: document.getElementById('combustivel').value,
        observacoes: document.getElementById('observacoes').value,
        dataCadastro: new Date().toISOString()
    };

    const veiculos = getVeiculos();
    veiculos.push(veiculo);
    salvarVeiculos(veiculos);
    
    const successMessage = document.getElementById('successMessage');
    successMessage.classList.add('show');
    
    setTimeout(() => {
        successMessage.classList.remove('show');
        document.getElementById('vehicleForm').reset();
    }, 3000);

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('vehicleForm');
    
    document.getElementById('placa').addEventListener('input', function(e) {
        formatarPlaca(e.target);
    });

    document.getElementById('cpfProprietario').addEventListener('input', function(e) {
        formatarCPF(e.target);
    });

    document.getElementById('telefoneProprietario').addEventListener('input', function(e) {
        formatarTelefone(e.target);
    });

    form.addEventListener('submit', cadastrarVeiculo);
});
