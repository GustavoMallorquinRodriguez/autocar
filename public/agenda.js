let currentDate = new Date();
let currentView = 'calendar';
let events = [];
let editingEventId = null;

const serviceMap = {
    'polimento': 'Polimento Técnico',
    'higienizacao': 'Higienização Interna',
    'vitrificacao': 'Vitrificação',
    'lavagem': 'Lavagem Completa',
    'cristalizacao': 'Cristalização de Vidros',
    'enceramento': 'Enceramento'
};

const responsibleMap = {
    'joao': 'João Silva',
    'maria': 'Maria Santos',
    'pedro': 'Pedro Costa'
};

function getEvents() {
    const data = localStorage.getItem('agendamentos');
    return data ? JSON.parse(data) : [];
}

function saveEvents() {
    localStorage.setItem('agendamentos', JSON.stringify(events));
}

function loadEvents() {
    events = getEvents();
    if (events.length === 0) {
        events = [
            {
                id: 1,
                date: getTodayString(),
                time: '10:00',
                client: 'Carlos Santos',
                vehicle: 'Corolla 2020',
                plate: 'ABC-1234',
                service: 'polimento',
                serviceName: 'Polimento Técnico',
                responsible: 'joao',
                responsibleName: 'João Silva',
                status: 'agendado',
                notes: 'Cliente solicitou atenção especial no capô'
            },
            {
                id: 2,
                date: getTodayString(),
                time: '14:00',
                client: 'Ana Paula',
                vehicle: 'HR-V 2019',
                plate: 'XYZ-9876',
                service: 'higienizacao',
                serviceName: 'Higienização Interna',
                responsible: 'maria',
                responsibleName: 'Maria Santos',
                status: 'em-andamento',
                notes: ''
            },
            {
                id: 3,
                date: getTomorrowString(),
                time: '09:00',
                client: 'Roberto Lima',
                vehicle: 'Civic 2021',
                plate: 'DEF-5555',
                service: 'vitrificacao',
                serviceName: 'Vitrificação',
                responsible: 'pedro',
                responsibleName: 'Pedro Costa',
                status: 'agendado',
                notes: 'Primeira vitrificação do veículo'
            }
        ];
        saveEvents();
    }
}

function getTodayString() {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

function getTomorrowString() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
}

function getFilteredEvents() {
    const filterService = document.getElementById('filterService').value;
    const filterStatus = document.getElementById('filterStatus').value;
    
    return events.filter(event => {
        if (filterService && event.service !== filterService) return false;
        if (filterStatus && event.status !== filterStatus) return false;
        return true;
    });
}

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
    const filteredEvents = getFilteredEvents();
    
    for (let i = 1; i <= totalDays; i++) {
        const day = document.createElement('div');
        day.className = 'calendar-day';
        
        const currentDayDate = new Date(year, month, i);
        if (currentDayDate.toDateString() === today.toDateString()) {
            day.classList.add('today');
        }

        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const dayEvents = filteredEvents.filter(e => e.date === dateString);

        let content = `<div class="day-number">${i}</div>`;
        dayEvents.forEach(event => {
            const statusClass = event.status === 'concluido' ? 'completed' : (event.status === 'em-andamento' ? 'in-progress' : '');
            content += `<div class="day-event ${statusClass}" onclick="event.stopPropagation(); editEvent(${event.id})">${event.time} - ${event.serviceName}</div>`;
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

    const filteredEvents = getFilteredEvents();
    const sortedEvents = [...filteredEvents].sort((a, b) => {
        const dateA = new Date(a.date + 'T' + a.time);
        const dateB = new Date(b.date + 'T' + b.time);
        return dateA - dateB;
    });

    if (sortedEvents.length === 0) {
        listView.innerHTML = `
            <div class="empty-list">
                <p>Nenhum agendamento encontrado.</p>
            </div>
        `;
        return;
    }

    sortedEvents.forEach(event => {
        const card = document.createElement('div');
        card.className = 'event-card';
        
        const date = new Date(event.date + 'T00:00:00');
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
            ${event.responsibleName ? `<div class="event-info"><strong>Responsável:</strong> ${event.responsibleName}</div>` : ''}
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
    const buttons = document.querySelectorAll('.view-toggle .toggle-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    if (view === 'calendar') {
        buttons[0].classList.add('active');
        document.querySelector('.calendar-view').style.display = 'block';
        document.querySelector('.list-view').classList.remove('active');
        renderCalendar();
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
    editingEventId = null;
    document.getElementById('modalTitle').textContent = '📅 Novo Agendamento';
    const modal = document.getElementById('eventModal');
    modal.classList.add('active');
    
    document.getElementById('eventForm').reset();
    
    if (date) {
        document.getElementById('eventDate').value = date;
    } else {
        document.getElementById('eventDate').value = getTodayString();
    }
}

function closeModal() {
    const modal = document.getElementById('eventModal');
    modal.classList.remove('active');
    document.getElementById('eventForm').reset();
    editingEventId = null;
}

function editEvent(id) {
    const event = events.find(e => e.id === id);
    if (!event) return;

    editingEventId = id;
    document.getElementById('modalTitle').textContent = '📅 Editar Agendamento';

    document.getElementById('eventDate').value = event.date;
    document.getElementById('eventTime').value = event.time;
    document.getElementById('eventClient').value = event.client;
    document.getElementById('eventVehicle').value = event.vehicle;
    document.getElementById('eventPlate').value = event.plate || '';
    document.getElementById('eventService').value = event.service;
    document.getElementById('eventResponsible').value = event.responsible || '';
    document.getElementById('eventStatus').value = event.status;
    document.getElementById('eventNotes').value = event.notes || '';

    const modal = document.getElementById('eventModal');
    modal.classList.add('active');
}

function deleteEvent(id) {
    if (confirm('Deseja realmente excluir este agendamento?')) {
        events = events.filter(e => e.id !== id);
        saveEvents();
        renderCalendar();
        if (currentView === 'list') {
            renderListView();
        }
    }
}

function completeEvent(id) {
    const event = events.find(e => e.id === id);
    if (event) {
        event.status = 'concluido';
        saveEvents();
        renderCalendar();
        if (currentView === 'list') {
            renderListView();
        }
    }
}

function filterEvents() {
    renderCalendar();
    if (currentView === 'list') {
        renderListView();
    }
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const eventData = {
        date: document.getElementById('eventDate').value,
        time: document.getElementById('eventTime').value,
        client: document.getElementById('eventClient').value,
        vehicle: document.getElementById('eventVehicle').value,
        plate: document.getElementById('eventPlate').value,
        service: document.getElementById('eventService').value,
        serviceName: serviceMap[document.getElementById('eventService').value],
        responsible: document.getElementById('eventResponsible').value,
        responsibleName: responsibleMap[document.getElementById('eventResponsible').value] || '',
        status: document.getElementById('eventStatus').value,
        notes: document.getElementById('eventNotes').value
    };

    if (editingEventId) {
        const index = events.findIndex(e => e.id === editingEventId);
        if (index !== -1) {
            events[index] = { ...events[index], ...eventData };
        }
        alert('✅ Agendamento atualizado com sucesso!');
    } else {
        const newId = events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1;
        events.push({ id: newId, ...eventData });
        alert('✅ Agendamento criado com sucesso!');
    }

    saveEvents();
    closeModal();
    renderCalendar();
    if (currentView === 'list') {
        renderListView();
    }
}

function formatPlate(input) {
    let value = input.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    if (value.length > 3) {
        value = value.slice(0, 3) + '-' + value.slice(3, 7);
    }
    input.value = value;
}

document.addEventListener('DOMContentLoaded', function() {
    loadEvents();
    renderCalendar();
    
    document.getElementById('eventForm').addEventListener('submit', handleFormSubmit);
    document.getElementById('eventPlate').addEventListener('input', function(e) {
        formatPlate(e.target);
    });
    
    document.getElementById('eventModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });
});
