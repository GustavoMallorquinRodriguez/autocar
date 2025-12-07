function getOrdensServico() {
    const data = localStorage.getItem('ordensServico');
    return data ? JSON.parse(data) : [];
}

function getClientes() {
    const data = localStorage.getItem('clientes');
    return data ? JSON.parse(data) : [];
}

function getVeiculos() {
    const data = localStorage.getItem('veiculos');
    return data ? JSON.parse(data) : [];
}

function getAgendamentos() {
    const data = localStorage.getItem('agendamentos');
    return data ? JSON.parse(data) : [];
}

function getEstoque() {
    const data = localStorage.getItem('estoque');
    return data ? JSON.parse(data) : [];
}

function getFuncionarios() {
    const data = localStorage.getItem('funcionarios');
    return data ? JSON.parse(data) : [];
}

function parseTotal(totalStr) {
    if (!totalStr) return 0;
    const cleaned = totalStr.replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
    return parseFloat(cleaned) || 0;
}

function formatCurrency(value) {
    return 'R$ ' + value.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    const parts = dateStr.split(' ')[0];
    if (parts.includes('-')) {
        const [year, month, day] = parts.split('-');
        return `${day}/${month}/${year}`;
    }
    return dateStr;
}

function getDateFilter() {
    const periodo = document.getElementById('periodo').value;
    const today = new Date();
    let startDate = new Date();
    let endDate = new Date();
    
    switch(periodo) {
        case 'Hoje':
            startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
            break;
        case 'Esta Semana':
            const dayOfWeek = today.getDay();
            startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - dayOfWeek, 0, 0, 0);
            endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - dayOfWeek + 6, 23, 59, 59);
            break;
        case 'Este Mês':
            startDate = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0);
            endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
            break;
        case 'Último Trimestre':
            startDate = new Date(today.getFullYear(), today.getMonth() - 3, 1, 0, 0, 0);
            endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
            break;
        case 'Este Ano':
            startDate = new Date(today.getFullYear(), 0, 1, 0, 0, 0);
            endDate = new Date(today.getFullYear(), 11, 31, 23, 59, 59);
            break;
        default:
            startDate = new Date(document.getElementById('dataInicial').value);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(document.getElementById('dataFinal').value);
            endDate.setHours(23, 59, 59, 999);
    }
    
    return { startDate, endDate };
}

function filterOSByDate(ordens, startDate, endDate) {
    return ordens.filter(os => {
        if (!os.dates || !os.dates.entry) return false;
        const osDate = new Date(os.dates.entry.split(' ')[0]);
        return osDate >= startDate && osDate <= endDate;
    });
}

function calcularEstatisticas() {
    const ordens = getOrdensServico();
    const clientes = getClientes();
    const veiculos = getVeiculos();
    const agendamentos = getAgendamentos();
    const estoque = getEstoque();
    const funcionarios = getFuncionarios();
    
    const { startDate, endDate } = getDateFilter();
    const ordensFiltradas = filterOSByDate(ordens, startDate, endDate);
    
    const faturamentoTotal = ordensFiltradas.reduce((sum, os) => sum + parseTotal(os.total), 0);
    const diasPeriodo = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
    const mediaDiaria = faturamentoTotal / diasPeriodo;
    
    document.getElementById('faturamentoTotal').textContent = formatCurrency(faturamentoTotal);
    document.getElementById('mediaDiaria').textContent = formatCurrency(mediaDiaria);
    document.getElementById('metaMes').textContent = 'R$ 50.000,00';
    const metaPercent = Math.min(100, (faturamentoTotal / 50000) * 100);
    document.getElementById('metaPercent').textContent = metaPercent.toFixed(1) + '%';
    
    document.getElementById('totalServicos').textContent = ordensFiltradas.length;
    
    const servicosContagem = {};
    ordensFiltradas.forEach(os => {
        if (os.services) {
            os.services.forEach(s => {
                const nome = s.name || 'Outros';
                servicosContagem[nome] = (servicosContagem[nome] || 0) + 1;
            });
        }
    });
    
    const servicosOrdenados = Object.entries(servicosContagem)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);
    
    const servicosContainer = document.getElementById('servicosDetalhes');
    servicosContainer.innerHTML = '';
    servicosOrdenados.forEach(([nome, qtd]) => {
        servicosContainer.innerHTML += `
            <div class="stat-row">
                <span class="stat-label">${nome}</span>
                <span class="stat-value">${qtd}</span>
            </div>
        `;
    });
    
    document.getElementById('funcionariosAtivos').textContent = funcionarios.length || '0';
    document.getElementById('horasTrabalhadas').textContent = (ordensFiltradas.length * 3) + 'h';
    
    const concluidas = ordensFiltradas.filter(os => os.status === 'concluido').length;
    const produtividade = ordensFiltradas.length > 0 ? Math.round((concluidas / ordensFiltradas.length) * 100) : 0;
    document.getElementById('produtividade').textContent = produtividade + '%';
    document.getElementById('satisfacao').textContent = '4.8/5.0';
    
    document.getElementById('itensEstoque').textContent = estoque.length || '0';
    const itensBaixos = estoque.filter(item => (item.quantidade || 0) < 10).length;
    document.getElementById('itensBaixos').textContent = itensBaixos;
    document.getElementById('itensFalta').textContent = estoque.filter(item => (item.quantidade || 0) === 0).length;
    const valorEstoque = estoque.reduce((sum, item) => sum + ((item.preco || 0) * (item.quantidade || 0)), 0);
    document.getElementById('valorEstoque').textContent = formatCurrency(valorEstoque);
    
    renderTabelaOS(ordensFiltradas.slice(0, 10));
    renderRankingFuncionarios(ordensFiltradas, funcionarios);
}

function renderTabelaOS(ordens) {
    const tbody = document.getElementById('tabelaOS');
    tbody.innerHTML = '';
    
    if (ordens.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 30px;">Nenhuma OS encontrada no período selecionado</td></tr>';
        return;
    }
    
    ordens.forEach(os => {
        const statusClass = {
            'aguardando': 'status-pendente',
            'em-andamento': 'status-andamento',
            'concluido': 'status-concluido',
            'cancelado': 'status-pendente'
        };
        
        const statusText = {
            'aguardando': 'Pendente',
            'em-andamento': 'Em Andamento',
            'concluido': 'Concluído',
            'cancelado': 'Cancelado'
        };
        
        const servicos = os.services ? os.services.map(s => s.name).join(', ') : '-';
        
        tbody.innerHTML += `
            <tr>
                <td>${os.osNumber}</td>
                <td>${formatDate(os.dates?.entry)}</td>
                <td>${os.client?.name || '-'}</td>
                <td>${os.vehicle?.model || '-'}</td>
                <td>${servicos}</td>
                <td>${os.total || 'R$ 0,00'}</td>
                <td><span class="status-badge ${statusClass[os.status] || 'status-pendente'}">${statusText[os.status] || 'Pendente'}</span></td>
            </tr>
        `;
    });
}

function renderRankingFuncionarios(ordens, funcionarios) {
    const tbody = document.getElementById('rankingFuncionarios');
    tbody.innerHTML = '';
    
    const ranking = {};
    
    ordens.forEach(os => {
        if (os.services) {
            os.services.forEach(s => {
                if (s.responsible) {
                    if (!ranking[s.responsible]) {
                        ranking[s.responsible] = {
                            nome: s.responsible,
                            servicos: 0,
                            faturamento: 0
                        };
                    }
                    ranking[s.responsible].servicos++;
                    ranking[s.responsible].faturamento += parseFloat(s.price) || 0;
                }
            });
        }
    });
    
    funcionarios.forEach(f => {
        const nome = f.nome || f.name;
        if (nome && !ranking[nome]) {
            ranking[nome] = {
                nome: nome,
                servicos: 0,
                faturamento: 0
            };
        }
    });
    
    const rankingOrdenado = Object.values(ranking)
        .sort((a, b) => b.faturamento - a.faturamento)
        .slice(0, 5);
    
    if (rankingOrdenado.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 30px;">Nenhum funcionário com serviços no período</td></tr>';
        return;
    }
    
    const medalhas = ['🥇 1º', '🥈 2º', '🥉 3º', '4º', '5º'];
    
    rankingOrdenado.forEach((func, index) => {
        const horas = func.servicos * 2;
        tbody.innerHTML += `
            <tr>
                <td>${medalhas[index] || (index + 1) + 'º'}</td>
                <td>${func.nome}</td>
                <td>${func.servicos}</td>
                <td>${horas}h</td>
                <td>${formatCurrency(func.faturamento)}</td>
                <td>4.${Math.floor(Math.random() * 3) + 7}/5.0</td>
            </tr>
        `;
    });
}

function gerarRelatorio() {
    calcularEstatisticas();
    alert('Relatório gerado com sucesso!');
}

function limparFiltros() {
    document.getElementById('tipoRelatorio').selectedIndex = 0;
    document.getElementById('periodo').selectedIndex = 2;
    const today = new Date();
    document.getElementById('dataInicial').value = today.toISOString().slice(0, 8) + '01';
    document.getElementById('dataFinal').value = today.toISOString().slice(0, 10);
    calcularEstatisticas();
}

function atualizarPeriodo() {
    const { startDate, endDate } = getDateFilter();
    document.getElementById('dataInicial').value = startDate.toISOString().slice(0, 10);
    document.getElementById('dataFinal').value = endDate.toISOString().slice(0, 10);
}

document.addEventListener('DOMContentLoaded', function() {
    const today = new Date();
    document.getElementById('dataInicial').value = today.toISOString().slice(0, 8) + '01';
    document.getElementById('dataFinal').value = today.toISOString().slice(0, 10);
    
    document.getElementById('periodo').addEventListener('change', function() {
        atualizarPeriodo();
        calcularEstatisticas();
    });
    
    calcularEstatisticas();
});
