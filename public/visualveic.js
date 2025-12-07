let veiculos = [];

async function carregarVeiculos() {
    try {
        const response = await fetch('/api/veiculos');
        veiculos = await response.json();
        atualizarEstatisticas();
        renderizarVeiculos(veiculos);
    } catch (error) {
        console.error('Erro ao carregar veículos:', error);
        veiculos = [];
        atualizarEstatisticas();
        renderizarVeiculos([]);
    }
}

function atualizarEstatisticas() {
    const total = veiculos.length;
    document.getElementById('totalVeiculos').textContent = total;
    
    if (total > 0) {
        const marcas = veiculos.reduce((acc, v) => {
            acc[v.marca] = (acc[v.marca] || 0) + 1;
            return acc;
        }, {});
        const marcaMaisComum = Object.entries(marcas).sort((a, b) => b[1] - a[1])[0][0];
        document.getElementById('marcaMaisComum').textContent = marcaMaisComum;
    } else {
        document.getElementById('marcaMaisComum').textContent = '-';
    }
}

function renderizarVeiculos(lista) {
    const container = document.getElementById('vehiclesList');
    const emptyState = document.getElementById('emptyState');
    
    if (lista.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    container.style.display = 'grid';
    emptyState.style.display = 'none';
    
    container.innerHTML = lista.map(veiculo => `
        <div class="vehicle-card">
            <div class="vehicle-header">
                <span class="vehicle-plate">${veiculo.placa}</span>
                <span class="vehicle-type">${veiculo.tipo}</span>
            </div>
            <div class="vehicle-name">${veiculo.marca} ${veiculo.modelo} ${veiculo.ano}</div>
            <div class="vehicle-info">
                <div class="vehicle-info-item">
                    <strong>Cor:</strong> ${veiculo.cor}
                </div>
                <div class="vehicle-info-item">
                    <strong>Proprietário:</strong> ${veiculo.nomeProprietario}
                </div>
                <div class="vehicle-info-item">
                    <strong>Telefone:</strong> ${veiculo.telefoneProprietario || '-'}
                </div>
            </div>
            <div class="vehicle-actions">
                <button class="btn-action btn-view" onclick="verDetalhes('${veiculo.id}')">Ver Detalhes</button>
                <button class="btn-action btn-delete" onclick="excluirVeiculo('${veiculo.id}')">Excluir</button>
            </div>
        </div>
    `).join('');
}

function filtrarVeiculos() {
    const termo = document.getElementById('searchInput').value.toLowerCase();
    
    if (!termo) {
        renderizarVeiculos(veiculos);
        return;
    }
    
    const filtrados = veiculos.filter(veiculo => 
        veiculo.placa.toLowerCase().includes(termo) ||
        veiculo.modelo.toLowerCase().includes(termo) ||
        veiculo.marca.toLowerCase().includes(termo) ||
        veiculo.nomeProprietario.toLowerCase().includes(termo)
    );
    
    renderizarVeiculos(filtrados);
}

function verDetalhes(id) {
    const veiculo = veiculos.find(v => v.id === id);
    if (!veiculo) return;
    
    const dataCadastro = veiculo.dataCadastro ? 
        new Date(veiculo.dataCadastro).toLocaleDateString('pt-BR') : '-';
    
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h3 class="modal-title">${veiculo.marca} ${veiculo.modelo} ${veiculo.ano}</h3>
        
        <div class="modal-section">
            <h4>Dados do Veículo</h4>
            <div class="modal-info">
                <div class="modal-info-item">
                    <strong>Placa:</strong>
                    <span>${veiculo.placa}</span>
                </div>
                <div class="modal-info-item">
                    <strong>Marca:</strong>
                    <span>${veiculo.marca}</span>
                </div>
                <div class="modal-info-item">
                    <strong>Modelo:</strong>
                    <span>${veiculo.modelo}</span>
                </div>
                <div class="modal-info-item">
                    <strong>Ano:</strong>
                    <span>${veiculo.ano}</span>
                </div>
                <div class="modal-info-item">
                    <strong>Cor:</strong>
                    <span>${veiculo.cor}</span>
                </div>
                <div class="modal-info-item">
                    <strong>Tipo:</strong>
                    <span>${veiculo.tipo}</span>
                </div>
                <div class="modal-info-item">
                    <strong>Combustível:</strong>
                    <span>${veiculo.combustivel || '-'}</span>
                </div>
                <div class="modal-info-item">
                    <strong>Km:</strong>
                    <span>${veiculo.kilometragem ? veiculo.kilometragem + ' km' : '-'}</span>
                </div>
            </div>
        </div>
        
        <div class="modal-section">
            <h4>Proprietário</h4>
            <div class="modal-info">
                <div class="modal-info-item">
                    <strong>Nome:</strong>
                    <span>${veiculo.nomeProprietario}</span>
                </div>
                <div class="modal-info-item">
                    <strong>CPF:</strong>
                    <span>${veiculo.cpfProprietario}</span>
                </div>
                <div class="modal-info-item">
                    <strong>Telefone:</strong>
                    <span>${veiculo.telefoneProprietario || '-'}</span>
                </div>
                <div class="modal-info-item">
                    <strong>Email:</strong>
                    <span>${veiculo.emailProprietario || '-'}</span>
                </div>
            </div>
        </div>
        
        ${veiculo.observacoes ? `
        <div class="modal-section">
            <h4>Observações</h4>
            <p>${veiculo.observacoes}</p>
        </div>
        ` : ''}
        
        <div class="modal-section">
            <p style="color: #999; font-size: 0.9em;">Cadastrado em: ${dataCadastro}</p>
        </div>
    `;
    
    document.getElementById('vehicleModal').classList.add('active');
}

function fecharModal() {
    document.getElementById('vehicleModal').classList.remove('active');
}

async function excluirVeiculo(id) {
    if (!confirm('Deseja realmente excluir este veículo?')) return;
    
    try {
        const response = await fetch(`/api/veiculos/${id}`, { method: 'DELETE' });
        if (response.ok) {
            veiculos = veiculos.filter(v => v.id !== id);
            atualizarEstatisticas();
            renderizarVeiculos(veiculos);
        } else {
            alert('Erro ao excluir veículo');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao excluir veículo');
    }
}

document.addEventListener('DOMContentLoaded', carregarVeiculos);

window.onclick = function(event) {
    const modal = document.getElementById('vehicleModal');
    if (event.target === modal) {
        fecharModal();
    }
}
