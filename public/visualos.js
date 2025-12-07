let allOS = [
            {
                id: 1022,
                client: 'João Silva',
                phone: '(45) 99999-8888',
                vehicle: 'Honda HR-V',
                plate: 'ABC-1234',
                year: 2019,
                color: 'Prata',
                dateEntry: '2025-12-05',
                timeEntry: '08:30',
                dateDelivery: '2025-12-05',
                timeDelivery: '18:00',
                status: 'em-andamento',
                progress: 60,
                services: ['Polimento Técnico', 'Higienização Interna', 'Vitrificação'],
                total: 1750.00,
                timeline: [
                    { event: 'OS Criada', date: '05/12/2025 - 08:30', by: 'Recepção' },
                    { event: 'Inspeção Inicial', date: '05/12/2025 - 09:00', by: 'Carlos Santos' },
                    { event: 'Polimento Iniciado', date: '05/12/2025 - 09:30', by: 'Carlos Santos' }
                ]
            },
            {
                id: 1021,
                client: 'Maria Santos',
                phone: '(45) 99888-7777',
                vehicle: 'Toyota Corolla',
                plate: 'XYZ-5678',
                year: 2020,
                color: 'Preto',
                dateEntry: '2025-12-04',
                timeEntry: '10:00',
                dateDelivery: '2025-12-04',
                timeDelivery: '17:00',
                status: 'concluido',
                progress: 100,
                services: ['Higienização Interna', 'Cristalização de Vidros'],
                total: 430.00,
                timeline: [
                    { event: 'OS Criada', date: '04/12/2025 - 10:00', by: 'Recepção' },
                    { event: 'Serviço Concluído', date: '04/12/2025 - 16:30', by: 'Maria Oliveira' },
                    { event: 'Veículo Entregue', date: '04/12/2025 - 17:00', by: 'Recepção' }
                ]
            },
            {
                id: 1023,
                client: 'Pedro Costa',
                phone: '(45) 99777-6666',
                vehicle: 'Volkswagen Gol',
                plate: 'DEF-9999',
                year: 2018,
                color: 'Branco',
                dateEntry: '2025-12-06',
                timeEntry: '14:00',
                dateDelivery: '2025-12-07',
                timeDelivery: '12:00',
                status: 'aguardando',
                progress: 0,
                services: ['Polimento Técnico', 'Limpeza de Motor'],
                total: 570.00,
                timeline: [
                    { event: 'OS Criada', date: '06/12/2025 - 14:00', by: 'Recepção' }
                ]
            },
            {
                id: 1024,
                client: 'Ana Paula',
                phone: '(45) 99666-5555',
                vehicle: 'Jeep Compass',
                plate: 'GHI-3333',
                year: 2021,
                color: 'Azul',
                dateEntry: '2025-12-06',
                timeEntry: '09:00',
                dateDelivery: '2025-12-06',
                timeDelivery: '16:00',
                status: 'em-andamento',
                progress: 30,
                services: ['Vitrificação', 'Hidratação de Couro'],
                total: 980.00,
                timeline: [
                    { event: 'OS Criada', date: '06/12/2025 - 09:00', by: 'Recepção' },
                    { event: 'Vitrificação Iniciada', date: '06/12/2025 - 09:30', by: 'Pedro Costa' }
                ]
            }
        ];

        let currentOS = null;

        function renderOSList() {
            const container = document.getElementById('osList');
            container.innerHTML = '';

            if (allOS.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">📋</div>
                        <h3>Nenhuma OS encontrada</h3>
                        <p>Não há ordens de serviço cadastradas no momento.</p>
                    </div>
                `;
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
                            <div class="os-number">OS #${os.id}</div>
                            <div class="os-date">Entrada: ${os.dateEntry.split('-').reverse().join('/')} às ${os.timeEntry}</div>
                        </div>
                        <div class="os-status status-${os.status}">${statusText[os.status]}</div>
                    </div>

                    <div class="os-content">
                        <div class="os-info">
                            <div class="info-label">Cliente</div>
                            <div class="info-value">${os.client}</div>
                        </div>
                        <div class="os-info">
                            <div class="info-label">Veículo</div>
                            <div class="info-value">${os.vehicle}</div>
                        </div>
                        <div class="os-info">
                            <div class="info-label">Placa</div>
                            <div class="info-value">${os.plate}</div>
                        </div>
                        <div class="os-info">
                            <div class="info-label">Previsão Entrega</div>
                            <div class="info-value">${os.dateDelivery.split('-').reverse().join('/')} ${os.timeDelivery}</div>
                        </div>
                    </div>

                    ${os.status === 'em-andamento' ? `
                        <div class="progress-container">
                            <div class="progress-label">Progresso do Serviço:</div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${os.progress}%;">${os.progress}%</div>
                            </div>
                        </div>
                    ` : ''}

                    <div class="os-services">
                        <div class="services-title">Serviços:</div>
                        ${os.services.map(service => `<span class="service-tag">${service}</span>`).join('')}
                    </div>

                    <div class="os-footer">
                        <div class="os-total">Total: R$ ${os.total.toFixed(2).replace('.', ',')}</div>
                        <div class="os-actions">
                            <button class="btn-action btn-view" onclick="viewOSDetail(${os.id})">Ver Detalhes</button>
                            <button class="btn-action btn-edit" onclick="editOS(${os.id})">Editar</button>
                            <button class="btn-action btn-delete" onclick="deleteOS(${os.id})">Excluir</button>
                        </div>
                    </div>
                `;

                container.appendChild(card);
            });

            updateStats();
        }

        function updateStats() {
            document.getElementById('totalOS').textContent = allOS.length;
            document.getElementById('inProgressOS').textContent = 
                allOS.filter(os => os.status === 'em-andamento').length;
            document.getElementById('completedTodayOS').textContent = 
                allOS.filter(os => os.status === 'concluido' && os.dateEntry === '2025-12-06').length;
            
            const monthlyTotal = allOS
                .filter(os => os.dateEntry.startsWith('2025-12'))
                .reduce((sum, os) => sum + os.total, 0);
            document.getElementById('monthlyRevenue').textContent = 
                'R$ ' + monthlyTotal.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        }

        function viewOSDetail(id) {
            const os = allOS.find(o => o.id === id);
            if (!os) return;

            currentOS = os;

            document.getElementById('modalOsNumber').textContent = 'OS #' + os.id;
            document.getElementById('detailModel').textContent = os.vehicle;
            document.getElementById('detailPlate').textContent = os.plate;
            document.getElementById('detailYear').textContent = os.year;
            document.getElementById('detailColor').textContent = os.color;
            document.getElementById('detailClient').textContent = os.client;
            document.getElementById('detailPhone').textContent = os.phone;
            document.getElementById('detailTotal').textContent = 
                'R$ ' + os.total.toFixed(2).replace('.', ',');

            const servicesDiv = document.getElementById('detailServices');
            servicesDiv.innerHTML = os.services.map(service => 
                `<span class="service-tag">${service}</span>`
            ).join('');

            const timelineDiv = document.getElementById('detailTimeline');
            timelineDiv.innerHTML = os.timeline.map(item => `
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

        function editOS(id) {
            alert('Redirecionando para edição da OS #' + id);
        }

        function deleteOS(id) {
            if (confirm('Deseja realmente excluir a OS #' + id + '?')) {
                allOS = allOS.filter(os => os.id !== id);
                renderOSList();
                alert('OS #' + id + ' excluída com sucesso!');
            }
        }

        function filterOS() {
            const searchTerm = document.getElementById('searchOs').value.toLowerCase();
            const statusFilter = document.getElementById('filterStatus').value;
            const dateStart = document.getElementById('filterDateStart').value;
            const dateEnd = document.getElementById('filterDateEnd').value;

            let filtered = allOS.filter(os => {
                const matchSearch = !searchTerm || 
                    os.id.toString().includes(searchTerm) || 
                    os.plate.toLowerCase().includes(searchTerm);
                
                const matchStatus = !statusFilter || os.status === statusFilter;
                
                const matchDateStart = !dateStart || os.dateEntry >= dateStart;
                const matchDateEnd = !dateEnd || os.dateEntry <= dateEnd;

                return matchSearch && matchStatus && matchDateStart && matchDateEnd;
            });

            const container = document.getElementById('osList');
            container.innerHTML = '';

            if (filtered.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">🔍</div>
                        <h3>Nenhuma OS encontrada</h3>
                        <p>Tente ajustar os filtros de busca.</p>
                    </div>
                `;
                return;
            }

            filtered.forEach(os => {
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
                            <div class="os-number">OS #${os.id}</div>
                            <div class="os-date">Entrada: ${os.dateEntry.split('-').reverse().join('/')} às ${os.timeEntry}</div>
                        </div>
                        <div class="os-status status-${os.status}">${statusText[os.status]}</div>
                    </div>

                    <div class="os-content">
                        <div class="os-info">
                            <div class="info-label">Cliente</div>
                            <div class="info-value">${os.client}</div>
                        </div>
                        <div class="os-info">
                            <div class="info-label">Veículo</div>
                            <div class="info-value">${os.vehicle}</div>
                        </div>
                        <div class="os-info">
                            <div class="info-label">Placa</div>
                            <div class="info-value">${os.plate}</div>
                        </div>
                        <div class="os-info">
                            <div class="info-label">Previsão Entrega</div>
                            <div class="info-value">${os.dateDelivery.split('-').reverse().join('/')} ${os.timeDelivery}</div>
                        </div>
                    </div>

                    ${os.status === 'em-andamento' ? `
                        <div class="progress-container">
                            <div class="progress-label">Progresso do Serviço:</div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${os.progress}%;">${os.progress}%</div>
                            </div>
                        </div>
                    ` : ''}

                    <div class="os-services">
                        <div class="services-title">Serviços:</div>
                        ${os.services.map(service => `<span class="service-tag">${service}</span>`).join('')}
                    </div>

                    <div class="os-footer">
                        <div class="os-total">Total: R$ ${os.total.toFixed(2).replace('.', ',')}</div>
                        <div class="os-actions">
                            <button class="btn-action btn-view" onclick="viewOSDetail(${os.id})">Ver Detalhes</button>
                            <button class="btn-action btn-edit" onclick="editOS(${os.id})">Editar</button>
                            <button class="btn-action btn-delete" onclick="deleteOS(${os.id})">Excluir</button>
                        </div>
                    </div>
                `;

                container.appendChild(card);
            });
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

        renderOSList();