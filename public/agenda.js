let currentDate = new Date();
            let currentView = 'calendar';
            let events = [
                {
                    id: 1,
                    date: '2025-12-06',
                    time: '10:00',
                    client: 'Carlos Santos',
                    vehicle: 'Corolla 2020',
                    plate: 'ABC-1234',
                    service: 'polimento',
                    serviceName: 'Polimento Técnico',
                    responsible: 'João Silva',
                    status: 'agendado',
                    notes: 'Cliente solicitou atenção especial no capô'
                },
                {
                    id: 2,
                    date: '2025-12-06',
                    time: '14:00',
                    client: 'Ana Paula',
                    vehicle: 'HR-V 2019',
                    plate: 'XYZ-9876',
                    service: 'higienizacao',
                    serviceName: 'Higienização Interna',
                    responsible: 'Maria Santos',
                    status: 'em-andamento',
                    notes: ''
                },
                {
                    id: 3,
                    date: '2025-12-07',
                    time: '09:00',
                    client: 'Roberto Lima',
                    vehicle: 'Civic 2021',
                    plate: 'DEF-5555',
                    service: 'vitrificacao',
                    serviceName: 'Vitrificação',
                    responsible: 'Pedro Costa',
                    status: 'agendado',
                    notes: 'Primeira vitrificação do veículo'
                }
            ];

            function renderCalendar() {
                const year = currentDate.getFullYear();
                const month = currentDate.getMonth();
                
                document.getElementById('currentMonth').textContent = 
                    currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
                        .replace(/^\w/, c => c.toUpperCase());

                const firstDay = new Date(year, month, 1);
                const lastDay = new Date(year, month + 1, 0);
                const startDay = firstDay.getDay();
                const totalDays = lastDay.getDate();

                const grid = document.getElementById('calendarGrid');
                grid.innerHTML = '';

                const dayHeaders = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
                dayHeaders.forEach(day => {
                    const header = document.createElement('div');
                    header.className = 'calendar-day-header';
                    header.textContent = day;
                    grid.appendChild(header);
                });

                const prevMonthDays = new Date(year, month, 0).getDate();
                for (let i = startDay - 1; i >= 0; i--) {
                    const day = document.createElement('div');
                    day.className = 'calendar-day other-month';
                    day.innerHTML = `<div class="day-number">${prevMonthDays - i}</div>`;
                    grid.appendChild(day);
                }

                const today = new Date();
                for (let i = 1; i <= totalDays; i++) {
                    const day = document.createElement('div');
                    day.className = 'calendar-day';
                    
                    const currentDayDate = new Date(year, month, i);
                    if (currentDayDate.toDateString() === today.toDateString()) {
                        day.classList.add('today');
                    }

                    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
                    const dayEvents = events.filter(e => e.date === dateString);

                    let content = `<div class="day-number">${i}</div>`;
                    dayEvents.forEach(event => {
                        content += `<div class="day-event" onclick="editEvent(${event.id})">${event.time} - ${event.serviceName}</div>`;
                    });

                    day.innerHTML = content;
                    day.onclick = (e) => {
                        if (!e.target.classList.contains('day-event')) {
                            openModal(dateString);
                        }
                    };
                    grid.appendChild(day);
                }

                const remainingDays = 42 - (startDay + totalDays);
                for (let i = 1; i <= remainingDays; i++) {
                    const day = document.createElement('div');
                    day.className = 'calendar-day other-month';
                    day.innerHTML = `<div class="day-number">${i}</div>`;
                    grid.appendChild(day);
                }
            }

            function renderListView() {
                const listView = document.getElementById('listView');
                listView.innerHTML = '';

                const sortedEvents = [...events].sort((a, b) => {
                    const dateA = new Date(a.date + ' ' + a.time);
                    const dateB = new Date(b.date + ' ' + b.time);
                    return dateA - dateB;
                });

                sortedEvents.forEach(event => {
                    const card = document.createElement('div');
                    card.className = 'event-card';
                    
                    const date = new Date(event.date);
                    const formattedDate = date.toLocaleDateString('pt-BR');
                    
                    const statusText = {
                        'agendado': 'Agendado',
                        'em-andamento': 'Em Andamento',
                        'concluido': 'Concluído'
                    };

                    card.innerHTML = `
                        <div class="event-header">
                            <div>
                                <div class="event-time">${event.time}</div>
                                <div>${formattedDate}</div>
                            </div>
                            <div class="event-status ${event.status}">${statusText[event.status]}</div>
                        </div>
                        <div class="event-info">
                            <strong>Cliente:</strong> ${event.client}
                        </div>
                        <div class="event-info">
                            <strong>Veículo:</strong> ${event.vehicle} ${event.plate ? '(' + event.plate + ')' : ''}
                        </div>
                        <div class="event-info">
                            <strong>Serviço:</strong> ${event.serviceName}
                        </div>
                        ${event.responsible ? `<div class="event-info"><strong>Responsável:</strong> ${event.responsible}</div>` : ''}
                        ${event.notes ? `<div class="event-info"><strong>Obs:</strong> ${event.notes}</div>` : ''}
                        <div class="event-actions">
                            <button class="btn-action btn-edit" onclick="editEvent(${event.id})">Editar</button>
                            <button class="btn-action btn-complete" onclick="completeEvent(${event.id})">Concluir</button>
                            <button class="btn-action btn-delete" onclick="deleteEvent(${event.id})">Excluir</button>
                        </div>
                    `;
                    
                    listView.appendChild(card);
                });
            }

            function switchView(view) {
                currentView = view;
                const buttons = document.querySelectorAll('.toggle-btn');
                buttons.forEach(btn => btn.classList.remove('active'));
                
                if (view === 'calendar') {
                    buttons[0].classList.add('active');
                    document.querySelector('.calendar-view').style.display = 'block';
                    document.querySelector('.list-view').classList.remove('active');
                } else {
                    buttons[1].classList.add('active');
                    document.querySelector('.calendar-view').style.display = 'none';
                    document.querySelector('.list-view').classList.add('active');
                    renderListView();
                }
            }

            function previousMonth() {
                currentDate.setMonth(currentDate.getMonth() - 1);
                renderCalendar();
            }

            function nextMonth() {
                currentDate.setMonth(currentDate.getMonth() + 1);
                renderCalendar();
            }

            function goToToday() {
                currentDate = new Date();
                renderCalendar();
            }

            function openModal(date = '') {
                const modal = document.getElementById('eventModal');
                modal.classList.add('active');
                
                if (date) {
                    document.getElementById('eventDate').value = date;
                } else {
                    document.getElementById('eventDate').value = new Date().toISOString().split('T')[0];
                }
            }

            function closeModal() {
                const modal = document.getElementById('eventModal');
                modal.classList.remove('active');
                document.getElementById('eventForm').reset();
            }

            function editEvent(id) {
                const event = events.find(e => e.id === id);
                if (!event) return;

                document.getElementById('eventDate').value = event.date;
                document.getElementById('eventTime').value = event.time;
                document.getElementById('eventClient').value = event.client;
                document.getElementById('eventVehicle').value = event.vehicle;
                document.getElementById('eventPlate').value = event.plate;
                document.getElementById('eventService').value = event.service;
                document.getElementById('eventResponsible').value = event.responsible;
                document.getElementById('eventStatus').value = event.status;
                document.getElementById('eventNotes').value = event.notes;

                openModal();
            }

            function deleteEvent(id) {
                if (confirm('Deseja realmente excluir este agendamento?')) {
                    events = events.filter(e => e.id !== id);
                    renderCalendar();
                    renderListView();
                }
            }

            function completeEvent(id) {
                const event = events.find(e => e.id === id);
                if (event) {
                    event.status = 'concluido';
                    renderCalendar();
                    renderListView();
                }
            }

            function filterEvents() {
                renderCalendar();
                if (currentView === 'list') {
                    renderListView();
                }
            }

            document.getElementById('eventPlate').addEventListener('input', function(e) {
                let value = e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
                if (value.length > 3) {
                    value = value.slice(0, 3) + '-' + value.slice(3, 7);
                }
                e.target.value = value;
            });

            document.getElementById('eventForm').addEventListener('submit', function(e) {
                e.preventDefault();
                
                const serviceMap = {
                    'polimento': 'Polimento Técnico',
                    'higienizacao': 'Higienização Interna',
                    'vitrificacao': 'Vitrificação',
                    'lavagem': 'Lavagem Completa',
                    'cristalizacao': 'Cristalização de Vidros',
                    'enceramento': 'Enceramento'
                };

                const newEvent = {
                    id: events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1,
                    date: document.getElementById('eventDate').value,
                    time: document.getElementById('eventTime').value,
                    client: document.getElementById('eventClient').value,
                    vehicle: document.getElementById('eventVehicle').value,
                    plate: document.getElementById('eventPlate').value,
                    service: document.getElementById('eventService').value,
                    serviceName: serviceMap[document.getElementById('eventService').value],
                    responsible: document.getElementById('eventResponsible').value,
                    status: document.getElementById('eventStatus').value,
                    notes: document.getElementById('eventNotes').value
                };

                events.push(newEvent);
                closeModal();
                renderCalendar();
                if (currentView === 'list') {
                    renderListView();
                }

                alert('✅ Agendamento criado com sucesso!');
            });

            renderCalendar();