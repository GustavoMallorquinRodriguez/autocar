let stockData = [];

async function loadStockData() {
    try {
        const response = await fetch('/api/estoque');
        stockData = await response.json();
        renderTable();
    } catch (error) {
        console.error('Erro ao carregar estoque:', error);
        stockData = [];
        renderTable();
    }
}

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
                <button class="action-btn" onclick="editItem('${item.id}')">Editar</button>
                <button class="action-btn delete-btn" onclick="deleteItem('${item.id}')">Excluir</button>
            </td>
        </tr>
    `).join('');
}

document.getElementById('stockForm').addEventListener('submit', async function(e) {
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

    try {
        const response = await fetch('/api/estoque', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newItem)
        });
        
        if (response.ok) {
            const savedItem = await response.json();
            stockData.push(savedItem);
            renderTable();
            this.reset();
            alert('Produto cadastrado com sucesso!');
        } else {
            alert('Erro ao cadastrar produto');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao cadastrar produto');
    }
});

async function editItem(id) {
    const item = stockData.find(i => i.id === id);
    if (!item) return;
    
    const newQuantity = prompt(`Editar quantidade de "${item.name}":`, item.quantity);
    
    if (newQuantity !== null && !isNaN(parseInt(newQuantity))) {
        try {
            const updatedItem = { ...item, quantity: parseInt(newQuantity) };
            const response = await fetch(`/api/estoque/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedItem)
            });
            
            if (response.ok) {
                const index = stockData.findIndex(i => i.id === id);
                stockData[index].quantity = parseInt(newQuantity);
                renderTable();
                alert('Produto atualizado com sucesso!');
            } else {
                alert('Erro ao atualizar produto');
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao atualizar produto');
        }
    }
}

async function deleteItem(id) {
    const item = stockData.find(i => i.id === id);
    if (!item) return;
    
    if (confirm(`Deseja realmente excluir "${item.name}"?`)) {
        try {
            const response = await fetch(`/api/estoque/${id}`, { method: 'DELETE' });
            
            if (response.ok) {
                stockData = stockData.filter(i => i.id !== id);
                renderTable();
                alert('Produto excluído com sucesso!');
            } else {
                alert('Erro ao excluir produto');
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao excluir produto');
        }
    }
}

document.addEventListener('DOMContentLoaded', loadStockData);
