const defaultData = [
    { name: 'Flanela de Microfibra', category: 'Acessórios', quantity: 15, unit: 'un', minStock: 20, supplier: '', location: '', price: 0, notes: '' },
    { name: 'Shampoo Automotivo', category: 'Limpeza', quantity: 8, unit: 'lt', minStock: 5, supplier: '', location: '', price: 0, notes: '' },
    { name: 'Vitrificador Cerâmico', category: 'Vitrificação', quantity: 12, unit: 'un', minStock: 10, supplier: '', location: '', price: 0, notes: '' }
];

function loadStockData() {
    const saved = localStorage.getItem('stockData');
    if (saved) {
        return JSON.parse(saved);
    }
    localStorage.setItem('stockData', JSON.stringify(defaultData));
    return defaultData;
}

function saveStockData(data) {
    localStorage.setItem('stockData', JSON.stringify(data));
}

let stockData = loadStockData();

function getCategoryName(value) {
    const categories = {
        'limpeza': 'Produtos de Limpeza',
        'polimento': 'Polimento',
        'vitrificacao': 'Vitrificação',
        'higienizacao': 'Higienização',
        'acessorios': 'Acessórios',
        'ferramentas': 'Ferramentas'
    };
    return categories[value] || value;
}

function getStatusBadge(quantity, minStock) {
    if (quantity === 0) {
        return '<span class="status-badge status-out">Esgotado</span>';
    } else if (quantity < minStock) {
        return '<span class="status-badge status-low">Estoque Baixo</span>';
    } else {
        return '<span class="status-badge status-ok">OK</span>';
    }
}

function renderTable() {
    const tbody = document.getElementById('stockTableBody');
    if (stockData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">Nenhum produto cadastrado</td></tr>';
        return;
    }
    tbody.innerHTML = stockData.map((item, index) => `
        <tr>
            <td>${item.name}</td>
            <td>${item.category}</td>
            <td>${item.quantity} ${item.unit}</td>
            <td>${getStatusBadge(item.quantity, item.minStock)}</td>
            <td>
                <button class="action-btn" onclick="editItem(${index})">Editar</button>
                <button class="action-btn delete-btn" onclick="deleteItem(${index})">Excluir</button>
            </td>
        </tr>
    `).join('');
}

document.getElementById('stockForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const newItem = {
        name: document.getElementById('productName').value,
        category: getCategoryName(document.getElementById('category').value),
        quantity: parseInt(document.getElementById('quantity').value),
        unit: document.getElementById('unit').value,
        minStock: parseInt(document.getElementById('minStock').value),
        supplier: document.getElementById('supplier').value,
        location: document.getElementById('location').value,
        price: parseFloat(document.getElementById('price').value) || 0,
        notes: document.getElementById('notes').value
    };

    stockData.push(newItem);
    saveStockData(stockData);
    renderTable();
    this.reset();
    
    alert('✅ Produto cadastrado com sucesso!');
});

function editItem(index) {
    const item = stockData[index];
    const newQuantity = prompt(`Editar quantidade de "${item.name}":`, item.quantity);
    
    if (newQuantity !== null && !isNaN(parseInt(newQuantity))) {
        stockData[index].quantity = parseInt(newQuantity);
        saveStockData(stockData);
        renderTable();
        alert('✅ Produto atualizado com sucesso!');
    }
}

function deleteItem(index) {
    const item = stockData[index];
    if (confirm(`Deseja realmente excluir "${item.name}"?`)) {
        stockData.splice(index, 1);
        saveStockData(stockData);
        renderTable();
        alert('✅ Produto excluído com sucesso!');
    }
}

renderTable();
