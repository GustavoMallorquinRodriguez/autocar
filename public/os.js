let osCounter = 1025;

async function getClientes() {
    try {
        const response = await fetch('/api/clientes');
        return await response.json();
    } catch (error) {
        console.error('Erro ao carregar clientes:', error);
        return [];
    }
}

async function getVeiculos() {
    try {
        const response = await fetch('/api/veiculos');
        return await response.json();
    } catch (error) {
        console.error('Erro ao carregar veículos:', error);
        return [];
    }
}

async function carregarClientes() {
    const select = document.getElementById("clientSelect");
    const clientes = await getClientes();
    
    select.innerHTML = '<option value="">Selecione o cliente</option>';
    
    clientes.forEach(cliente => {
        const option = document.createElement('option');
        option.value = cliente.id;
        option.textContent = `${cliente.nome} - ${cliente.telefone}`;
        option.dataset.cliente = JSON.stringify(cliente);
        select.appendChild(option);
    });
    
    if (clientes.length === 0) {
        const option = document.createElement('option');
        option.value = "";
        option.textContent = "Nenhum cliente cadastrado";
        option.disabled = true;
        select.appendChild(option);
    }
}

function loadClientData() {
    const select = document.getElementById("clientSelect");
    const selectedOption = select.options[select.selectedIndex];
    
    if (selectedOption && selectedOption.dataset.cliente) {
        const cliente = JSON.parse(selectedOption.dataset.cliente);
        
        document.getElementById("clientPhone").value = cliente.telefone || "";
        document.getElementById("clientCpf").value = cliente.documento || "";
        document.getElementById("clientEmail").value = cliente.email || "";
    } else {
        document.getElementById("clientPhone").value = "";
        document.getElementById("clientCpf").value = "";
        document.getElementById("clientEmail").value = "";
    }
}

async function buscarVeiculoPorPlaca() {
    const placaInput = document.getElementById("vehiclePlate");
    const placa = placaInput.value.toUpperCase();
    
    if (placa.length >= 7) {
        const veiculos = await getVeiculos();
        const veiculo = veiculos.find(v => v.placa.toUpperCase() === placa);
        
        if (veiculo) {
            document.getElementById("vehicleModel").value = veiculo.modelo || "";
            document.getElementById("vehicleYear").value = veiculo.ano || "";
            
            const corSelect = document.getElementById("vehicleColor");
            for (let i = 0; i < corSelect.options.length; i++) {
                if (corSelect.options[i].value.toLowerCase() === (veiculo.cor || "").toLowerCase()) {
                    corSelect.selectedIndex = i;
                    break;
                }
            }
            
            document.getElementById("vehicleKm").value = veiculo.kilometragem || "";
            
            const fuelSelect = document.getElementById("vehicleFuel");
            for (let i = 0; i < fuelSelect.options.length; i++) {
                if (fuelSelect.options[i].value.toLowerCase() === (veiculo.combustivel || "").toLowerCase()) {
                    fuelSelect.selectedIndex = i;
                    break;
                }
            }
            
            mostrarMensagemVeiculoEncontrado(veiculo);
        }
    }
}

function mostrarMensagemVeiculoEncontrado(veiculo) {
    let mensagem = document.getElementById("veiculoEncontradoMsg");
    
    if (!mensagem) {
        mensagem = document.createElement("div");
        mensagem.id = "veiculoEncontradoMsg";
        mensagem.style.cssText = "background: #27ae60; color: white; padding: 10px 15px; border-radius: 8px; margin-top: 10px; font-size: 0.9em;";
        
        const vehicleCard = document.getElementById("vehiclePlate").closest(".card");
        const formGrid = vehicleCard.querySelector(".form-grid");
        formGrid.parentNode.insertBefore(mensagem, formGrid.nextSibling);
    }
    
    mensagem.innerHTML = `Veículo encontrado: ${veiculo.marca || ""} ${veiculo.modelo} - Proprietário: ${veiculo.nomeProprietario || "Não informado"}`;
    
    setTimeout(() => {
        if (mensagem && mensagem.parentNode) {
            mensagem.parentNode.removeChild(mensagem);
        }
    }, 5000);
}

function updateSummary() {
    const checkboxes = document.querySelectorAll(".service-check:checked");
    let subtotal = 0;

    checkboxes.forEach((checkbox) => {
        subtotal += parseFloat(checkbox.dataset.price);
    });

    const discount = parseFloat(document.getElementById("discount").value) || 0;
    const discountAmount = (subtotal * discount) / 100;
    const total = subtotal - discountAmount;

    document.getElementById("subtotal").textContent =
        "R$ " + subtotal.toFixed(2).replace(".", ",");
    document.getElementById("totalAmount").textContent =
        "R$ " + total.toFixed(2).replace(".", ",");
}

function selectPayment(element) {
    document.querySelectorAll(".payment-option").forEach((opt) => {
        opt.classList.remove("selected");
    });
    element.classList.add("selected");
    element.querySelector('input[type="radio"]').checked = true;
}

function resetForm() {
    if (confirm("Deseja realmente limpar todos os campos?")) {
        document.getElementById("osForm").reset();
        document.querySelectorAll(".payment-option").forEach((opt) => {
            opt.classList.remove("selected");
        });
        updateSummary();
        carregarClientes();
    }
}

function saveDraft() {
    alert(
        "Rascunho salvo com sucesso!\n\nVocê poderá continuar editando esta OS posteriormente.",
    );
}

async function criarAgendamentoParaOS(os) {
    const [dataEntrada, horaEntrada] = os.dates.entry.split(' ');
    const servicosNomes = os.services.map(s => s.name).join(', ');
    
    const novoAgendamento = {
        date: dataEntrada,
        time: horaEntrada || '08:00',
        client: os.client.name,
        vehicle: os.vehicle.model,
        plate: os.vehicle.plate,
        service: 'os',
        serviceName: servicosNomes || 'Serviços da OS #' + os.osNumber,
        responsible: os.services[0]?.responsible || '',
        responsibleName: '',
        status: 'agendado',
        notes: 'OS #' + os.osNumber + ' - ' + (os.observations || ''),
        osNumber: os.osNumber
    };
    
    try {
        await fetch('/api/agendamentos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novoAgendamento)
        });
    } catch (error) {
        console.error('Erro ao criar agendamento:', error);
    }
}

document.addEventListener("DOMContentLoaded", function() {
    carregarClientes();
    
    document.getElementById("vehiclePlate").addEventListener("input", function (e) {
        let value = e.target.value.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
        if (value.length > 3) {
            value = value.slice(0, 3) + "-" + value.slice(3, 7);
        }
        e.target.value = value;
        
        buscarVeiculoPorPlaca();
    });

    document.getElementById("clientPhone").addEventListener("input", function (e) {
        let value = e.target.value.replace(/\D/g, "");
        if (value.length <= 11) {
            value = value.replace(/(\d{2})(\d)/, "($1) $2");
            value = value.replace(/(\d{5})(\d)/, "$1-$2");
        }
        e.target.value = value;
    });

    document.getElementById("clientCpf").addEventListener("input", function (e) {
        let value = e.target.value.replace(/\D/g, "");
        if (value.length <= 11) {
            value = value.replace(/(\d{3})(\d)/, "$1.$2");
            value = value.replace(/(\d{3})(\d)/, "$1.$2");
            value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
        }
        e.target.value = value;
    });

    document.getElementById("osForm").addEventListener("submit", async function (e) {
        e.preventDefault();

        const checkboxes = document.querySelectorAll(".service-check:checked");
        if (checkboxes.length === 0) {
            alert("Por favor, selecione pelo menos um serviço!");
            return;
        }

        const paymentSelected = document.querySelector(
            'input[name="payment"]:checked',
        );
        if (!paymentSelected) {
            alert("Por favor, selecione uma forma de pagamento!");
            return;
        }

        const formData = {
            client: {
                name: document.getElementById("clientSelect").options[
                    document.getElementById("clientSelect").selectedIndex
                ].text,
                phone: document.getElementById("clientPhone").value,
                cpf: document.getElementById("clientCpf").value,
                email: document.getElementById("clientEmail").value,
            },
            vehicle: {
                plate: document.getElementById("vehiclePlate").value,
                model: document.getElementById("vehicleModel").value,
                year: document.getElementById("vehicleYear").value,
                color: document.getElementById("vehicleColor").value,
                km: document.getElementById("vehicleKm").value,
                fuel: document.getElementById("vehicleFuel").value,
            },
            dates: {
                entry:
                    document.getElementById("dateEntry").value +
                    " " +
                    document.getElementById("timeEntry").value,
                delivery:
                    document.getElementById("dateDelivery").value +
                    " " +
                    document.getElementById("timeDelivery").value,
            },
            services: [],
            payment: paymentSelected.value,
            observations: document.getElementById("observations").value,
            total: document.getElementById("totalAmount").textContent,
            status: 'aguardando',
            progress: 0
        };

        checkboxes.forEach((checkbox) => {
            const serviceItem = checkbox.closest(".service-item");
            const serviceName =
                serviceItem.querySelector(".service-name").textContent;
            const responsible = serviceItem.querySelector(
                ".responsible-select",
            ).value;
            formData.services.push({
                name: serviceName,
                price: checkbox.dataset.price,
                time: checkbox.dataset.time,
                responsible: responsible,
            });
        });

        try {
            const response = await fetch('/api/ordens', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            if (response.ok) {
                const savedOS = await response.json();
                osCounter = savedOS.osNumber;
                
                await criarAgendamentoParaOS(savedOS);
                
                document.getElementById("successOsNumber").textContent = osCounter;
                document.getElementById("successMessage").classList.add("show");

                setTimeout(() => {
                    document.getElementById("successMessage").classList.remove("show");
                }, 5000);

                resetForm();
                osCounter++;
                document.getElementById("osNumber").textContent = "OS #" + osCounter;
                window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
                alert('Erro ao criar OS');
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao criar OS');
        }
    });

    const today = new Date();
    document.getElementById("dateEntry").valueAsDate = today;
    document.getElementById("timeEntry").value = new Date()
        .toTimeString()
        .slice(0, 5);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById("dateDelivery").valueAsDate = tomorrow;
});
