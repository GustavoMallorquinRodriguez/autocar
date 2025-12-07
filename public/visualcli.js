let clientes = [];

function getClientes() {
    const data = localStorage.getItem('clientes');
    return data ? JSON.parse(data) : [];
}

function salvarClientes(data) {
    localStorage.setItem('clientes', JSON.stringify(data));
}

function carregarClientes() {
    clientes = getClientes();
    atualizarEstatisticas();
    renderizarClientes(clientes);
}

function atualizarEstatisticas() {
    const total = clientes.length;
    const fisicas = clientes.filter(c => c.tipoPessoa === 'fisica').length;
    const juridicas = clientes.filter(c => c.tipoPessoa === 'juridica').length;
    
    document.getElementById('totalClientes').textContent = total;
    document.getElementById('pessoasFisicas').textContent = fisicas;
    document.getElementById('pessoasJuridicas').textContent = juridicas;
}

function renderizarClientes(lista) {
    const container = document.getElementById('clientsList');
    const emptyState = document.getElementById('emptyState');
    
    if (lista.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    container.style.display = 'grid';
    emptyState.style.display = 'none';
    
    container.innerHTML = lista.map(cliente => `
        <div class="client-card">
            <div class="client-header">
                <span class="client-name">${cliente.nome}</span>
                <span class="client-type ${cliente.tipoPessoa}">
                    ${cliente.tipoPessoa === 'fisica' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                </span>
            </div>
            <div class="client-info">
                <div class="client-info-item">
                    <strong>${cliente.tipoPessoa === 'fisica' ? 'CPF:' : 'CNPJ:'}</strong> ${cliente.documento || '-'}
                </div>
                <div class="client-info-item">
                    <strong>Telefone:</strong> ${cliente.telefone || '-'}
                </div>
                <div class="client-info-item">
                    <strong>Email:</strong> ${cliente.email || '-'}
                </div>
                <div class="client-info-item">
                    <strong>Cidade:</strong> ${cliente.cidade || '-'}${cliente.estado ? '/' + cliente.estado : ''}
                </div>
            </div>
            <div class="client-actions">
                <button class="btn-action btn-view" onclick="verDetalhes('${cliente.id}')">Ver Detalhes</button>
                <button class="btn-action btn-delete" onclick="excluirCliente('${cliente.id}')">Excluir</button>
            </div>
        </div>
    `).join('');
}

function filtrarClientes() {
    const termo = document.getElementById('searchInput').value.toLowerCase();
    
    if (!termo) {
        renderizarClientes(clientes);
        return;
    }
    
    const filtrados = clientes.filter(cliente => 
        cliente.nome.toLowerCase().includes(termo) ||
        (cliente.documento && cliente.documento.includes(termo)) ||
        (cliente.telefone && cliente.telefone.includes(termo)) ||
        (cliente.email && cliente.email.toLowerCase().includes(termo))
    );
    
    renderizarClientes(filtrados);
}

function verDetalhes(id) {
    const cliente = clientes.find(c => c.id === id);
    if (!cliente) return;
    
    const dataCadastro = cliente.dataCadastro ? 
        new Date(cliente.dataCadastro).toLocaleDateString('pt-BR') : '-';
    
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h3 class="modal-title">${cliente.nome}</h3>
        
        <div class="modal-section">
            <h4>Dados Pessoais</h4>
            <div class="modal-info">
                <div class="modal-info-item">
                    <strong>Tipo:</strong>
                    <span>${cliente.tipoPessoa === 'fisica' ? 'Pessoa Física' : 'Pessoa Jurídica'}</span>
                </div>
                <div class="modal-info-item">
                    <strong>${cliente.tipoPessoa === 'fisica' ? 'CPF:' : 'CNPJ:'}</strong>
                    <span>${cliente.documento || '-'}</span>
                </div>
                ${cliente.tipoPessoa === 'fisica' ? `
                <div class="modal-info-item">
                    <strong>RG:</strong>
                    <span>${cliente.rg || '-'}</span>
                </div>
                <div class="modal-info-item">
                    <strong>Data Nasc.:</strong>
                    <span>${cliente.dataNascimento || '-'}</span>
                </div>
                <div class="modal-info-item">
                    <strong>Sexo:</strong>
                    <span>${cliente.sexo || '-'}</span>
                </div>
                ` : `
                <div class="modal-info-item">
                    <strong>Data Fund.:</strong>
                    <span>${cliente.dataNascimento || '-'}</span>
                </div>
                `}
            </div>
        </div>
        
        <div class="modal-section">
            <h4>Contato</h4>
            <div class="modal-info">
                <div class="modal-info-item">
                    <strong>Telefone:</strong>
                    <span>${cliente.telefone || '-'}</span>
                </div>
                <div class="modal-info-item">
                    <strong>Tel. Alt.:</strong>
                    <span>${cliente.telefone2 || '-'}</span>
                </div>
                <div class="modal-info-item">
                    <strong>Email:</strong>
                    <span>${cliente.email || '-'}</span>
                </div>
            </div>
        </div>
        
        <div class="modal-section">
            <h4>Endereço</h4>
            <div class="modal-info">
                <div class="modal-info-item">
                    <strong>CEP:</strong>
                    <span>${cliente.cep || '-'}</span>
                </div>
                <div class="modal-info-item">
                    <strong>Logradouro:</strong>
                    <span>${cliente.logradouro || '-'}${cliente.numero ? ', ' + cliente.numero : ''}</span>
                </div>
                <div class="modal-info-item">
                    <strong>Complemento:</strong>
                    <span>${cliente.complemento || '-'}</span>
                </div>
                <div class="modal-info-item">
                    <strong>Bairro:</strong>
                    <span>${cliente.bairro || '-'}</span>
                </div>
                <div class="modal-info-item">
                    <strong>Cidade/UF:</strong>
                    <span>${cliente.cidade || '-'}${cliente.estado ? '/' + cliente.estado : ''}</span>
                </div>
            </div>
        </div>
        
        ${cliente.observacoes ? `
        <div class="modal-section">
            <h4>Observações</h4>
            <p>${cliente.observacoes}</p>
        </div>
        ` : ''}
        
        <div class="modal-section">
            <p style="color: #999; font-size: 0.9em;">Cadastrado em: ${dataCadastro}</p>
        </div>
    `;
    
    document.getElementById('clientModal').classList.add('active');
}

function fecharModal() {
    document.getElementById('clientModal').classList.remove('active');
}

function excluirCliente(id) {
    if (!confirm('Deseja realmente excluir este cliente?')) return;
    
    clientes = clientes.filter(c => c.id !== id);
    salvarClientes(clientes);
    atualizarEstatisticas();
    renderizarClientes(clientes);
}

document.addEventListener('DOMContentLoaded', carregarClientes);

window.onclick = function(event) {
    const modal = document.getElementById('clientModal');
    if (event.target === modal) {
        fecharModal();
    }
}
