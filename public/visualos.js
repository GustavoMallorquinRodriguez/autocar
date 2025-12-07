function getOrdensServico() {
    const data = localStorage.getItem('ordensServico');
    return data ? JSON.parse(data) : [];
}

function saveOrdensServico(ordens) {
    localStorage.setItem('ordensServico', JSON.stringify(ordens));
}

let allOS = [];
let currentOS = null;

function loadOS() {
    allOS = getOrdensServico();
    renderOSList();
}

function renderOSList() {
    const container = document.getElementById('osList');
    container.innerHTML = '';

    if (allOS.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <h3>Nenhuma OS encontrada</h3>
                <p>Não há ordens de serviço cadastradas no momento.</p>
                <a href="os.html" style="display: inline-block; margin-top: 15px; padding: 10px 20px; background: #27ae60; color: white; text-decoration: none; border-radius: 8px;">+ Criar Nova OS</a>
            </div>
        `;
        updateStats();
        return;
    }

    allOS.forEach(os => {
        const statusText = {
            'aguardando': 'Aguardando',
            'em-andamento': 'Em Andamento',
            'concluido': 'Concluído',
            'cancelado': 'Cancelado'
        };

        const card = document.createElement('div');
        card.className = 'os-card';
        card.innerHTML = `
            <div class="os-header">
                <div>
                    <div class="os-number">OS #${os.osNumber}</div>
                    <div class="os-date">Entrada: ${formatDate(os.dates.entry)}</div>
                </div>
                <div class="os-status status-${os.status || 'aguardando'}">${statusText[os.status || 'aguardando']}</div>
            </div>

            <div class="os-content">
                <div class="os-info">
                    <div class="info-label">Cliente</div>
                    <div class="info-value">${os.client.name}</div>
                </div>
                <div class="os-info">
                    <div class="info-label">Veículo</div>
                    <div class="info-value">${os.vehicle.model}</div>
                </div>
                <div class="os-info">
                    <div class="info-label">Placa</div>
                    <div class="info-value">${os.vehicle.plate}</div>
                </div>
                <div class="os-info">
                    <div class="info-label">Previsão Entrega</div>
                    <div class="info-value">${formatDate(os.dates.delivery)}</div>
                </div>
            </div>

            ${os.status === 'em-andamento' ? `
                <div class="progress-container">
                    <div class="progress-label">Progresso do Serviço:</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${os.progress || 0}%;">${os.progress || 0}%</div>
                    </div>
                </div>
            ` : ''}

            <div class="os-services">
                <div class="services-title">Serviços:</div>
                ${os.services.map(service => `<span class="service-tag">${service.name}</span>`).join('')}
            </div>

            <div class="os-footer">
                <div class="os-total">Total: ${os.total}</div>
                <div class="os-actions">
                    <button class="btn-action btn-view" onclick="viewOSDetail(${os.osNumber})">Ver Detalhes</button>
                    <button class="btn-action btn-status" onclick="changeStatus(${os.osNumber})">Alterar Status</button>
                    <button class="btn-action btn-delete" onclick="deleteOS(${os.osNumber})">Excluir</button>
                </div>
            </div>
        `;

        container.appendChild(card);
    });

    updateStats();
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    const parts = dateStr.split(' ');
    if (parts.length >= 1) {
        const datePart = parts[0];
        if (datePart.includes('-')) {
            const [year, month, day] = datePart.split('-');
            return `${day}/${month}/${year}${parts[1] ? ' ' + parts[1] : ''}`;
        }
    }
    return dateStr;
}

function updateStats() {
    document.getElementById('totalOS').textContent = allOS.length;
    document.getElementById('inProgressOS').textContent = 
        allOS.filter(os => os.status === 'em-andamento').length;
    
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('completedTodayOS').textContent = 
        allOS.filter(os => os.status === 'concluido' && os.dates.entry && os.dates.entry.startsWith(today)).length;
    
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthlyTotal = allOS
        .filter(os => os.dates.entry && os.dates.entry.startsWith(currentMonth.slice(0, 4)))
        .reduce((sum, os) => {
            const totalStr = os.total.replace('R$', '').replace('.', '').replace(',', '.').trim();
            return sum + (parseFloat(totalStr) || 0);
        }, 0);
    document.getElementById('monthlyRevenue').textContent = 
        'R$ ' + monthlyTotal.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function viewOSDetail(osNumber) {
    const os = allOS.find(o => o.osNumber === osNumber);
    if (!os) return;

    currentOS = os;

    document.getElementById('modalOsNumber').textContent = 'OS #' + os.osNumber;
    document.getElementById('detailModel').textContent = os.vehicle.model || '-';
    document.getElementById('detailPlate').textContent = os.vehicle.plate || '-';
    document.getElementById('detailYear').textContent = os.vehicle.year || '-';
    document.getElementById('detailColor').textContent = os.vehicle.color || '-';
    document.getElementById('detailClient').textContent = os.client.name || '-';
    document.getElementById('detailPhone').textContent = os.client.phone || '-';
    document.getElementById('detailTotal').textContent = os.total || 'R$ 0,00';

    const servicesDiv = document.getElementById('detailServices');
    servicesDiv.innerHTML = os.services.map(service => 
        `<span class="service-tag">${service.name} - R$ ${parseFloat(service.price).toFixed(2).replace('.', ',')}</span>`
    ).join('');

    const timelineDiv = document.getElementById('detailTimeline');
    const timeline = os.timeline || [
        { event: 'OS Criada', date: formatDate(os.dates.entry), by: 'Sistema' }
    ];
    timelineDiv.innerHTML = timeline.map(item => `
        <div class="timeline-item">
            <div class="timeline-dot">✓</div>
            <div class="timeline-content">
                <h4>${item.event}</h4>
                <p>${item.date} por ${item.by}</p>
            </div>
        </div>
    `).join('');

    document.getElementById('detailModal').classList.add('active');
}

function closeModal() {
    document.getElementById('detailModal').classList.remove('active');
    currentOS = null;
}

function changeStatus(osNumber) {
    const os = allOS.find(o => o.osNumber === osNumber);
    if (!os) return;
    
    const statusOptions = ['aguardando', 'em-andamento', 'concluido', 'cancelado'];
    const statusText = {
        'aguardando': 'Aguardando',
        'em-andamento': 'Em Andamento',
        'concluido': 'Concluído',
        'cancelado': 'Cancelado'
    };
    
    const currentIndex = statusOptions.indexOf(os.status || 'aguardando');
    const nextIndex = (currentIndex + 1) % statusOptions.length;
    const newStatus = statusOptions[nextIndex];
    
    if (confirm(`Alterar status da OS #${osNumber} para "${statusText[newStatus]}"?`)) {
        os.status = newStatus;
        
        if (!os.timeline) os.timeline = [];
        os.timeline.push({
            event: `Status alterado para ${statusText[newStatus]}`,
            date: new Date().toLocaleString('pt-BR'),
            by: 'Sistema'
        });
        
        if (newStatus === 'em-andamento') {
            os.progress = os.progress || 10;
        } else if (newStatus === 'concluido') {
            os.progress = 100;
        }
        
        saveOrdensServico(allOS);
        renderOSList();
    }
}

function deleteOS(osNumber) {
    if (confirm('Deseja realmente excluir a OS #' + osNumber + '?')) {
        allOS = allOS.filter(os => os.osNumber !== osNumber);
        saveOrdensServico(allOS);
        renderOSList();
        alert('OS #' + osNumber + ' excluída com sucesso!');
    }
}

function filterOS() {
    const searchTerm = document.getElementById('searchOs').value.toLowerCase();
    const statusFilter = document.getElementById('filterStatus').value;
    const dateStart = document.getElementById('filterDateStart').value;
    const dateEnd = document.getElementById('filterDateEnd').value;

    const allData = getOrdensServico();
    
    let filtered = allData.filter(os => {
        const matchSearch = !searchTerm || 
            os.osNumber.toString().includes(searchTerm) || 
            (os.vehicle.plate && os.vehicle.plate.toLowerCase().includes(searchTerm)) ||
            (os.client.name && os.client.name.toLowerCase().includes(searchTerm));
        
        const matchStatus = !statusFilter || (os.status || 'aguardando') === statusFilter;
        
        const osDate = os.dates.entry ? os.dates.entry.split(' ')[0] : '';
        const matchDateStart = !dateStart || osDate >= dateStart;
        const matchDateEnd = !dateEnd || osDate <= dateEnd;

        return matchSearch && matchStatus && matchDateStart && matchDateEnd;
    });

    allOS = filtered;
    renderOSList();
    
    if (filtered.length === 0 && (searchTerm || statusFilter || dateStart || dateEnd)) {
        const container = document.getElementById('osList');
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔍</div>
                <h3>Nenhuma OS encontrada</h3>
                <p>Tente ajustar os filtros de busca.</p>
                <button onclick="clearFilters()" style="margin-top: 15px; padding: 10px 20px; background: #27ae60; color: white; border: none; border-radius: 8px; cursor: pointer;">Limpar Filtros</button>
            </div>
        `;
    }
}

function clearFilters() {
    document.getElementById('searchOs').value = '';
    document.getElementById('filterStatus').value = '';
    document.getElementById('filterDateStart').value = '';
    document.getElementById('filterDateEnd').value = '';
    loadOS();
}

document.getElementById('searchOs').addEventListener('keyup', function(e) {
    if (e.key === 'Enter') {
        filterOS();
    }
});

document.addEventListener('click', function(e) {
    const modal = document.getElementById('detailModal');
    if (e.target === modal) {
        closeModal();
    }
});

loadOS();
