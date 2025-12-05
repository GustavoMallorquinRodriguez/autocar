const stockData = [
            { name: 'Flanela de Microfibra', category: 'Acessórios', quantity: 15, unit: 'un', minStock: 20 },
            { name: 'Shampoo Automotivo', category: 'Limpeza', quantity: 8, unit: 'lt', minStock: 5 },
            { name: 'Vitrificador Cerâmico', category: 'Vitrificação', quantity: 12, unit: 'un', minStock: 10 }
        ];

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
            tbody.innerHTML = stockData.map(item => `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.category}</td>
                    <td>${item.quantity} ${item.unit}</td>
                    <td>${getStatusBadge(item.quantity, item.minStock)}</td>
                    <td><button class="action-btn" onclick="editItem('${item.name}')">Editar</button></td>
                </tr>
            `).join('');
        }

        document.getElementById('stockForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const newItem = {
                name: document.getElementById('productName').value,
                category: document.getElementById('category').options[document.getElementById('category').selectedIndex].text,
                quantity: parseInt(document.getElementById('quantity').value),
                unit: document.getElementById('unit').value,
                minStock: parseInt(document.getElementById('minStock').value)
            };

            stockData.push(newItem);
            renderTable();
            this.reset();
            
            alert('✅ Produto cadastrado com sucesso!');
        });

        function editItem(name) {
            alert(`Editando: ${name}`);
        }

        renderTable();