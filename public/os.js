let osCounter = 1025;

function loadClientData() {
    const select = document.getElementById("clientSelect");
    const selectedOption = select.options[select.selectedIndex];

    if (select.value === "1") {
        document.getElementById("clientPhone").value = "(45) 99999-8888";
        document.getElementById("clientCpf").value = "123.456.789-00";
        document.getElementById("clientEmail").value = "joao.silva@email.com";
    } else if (select.value === "2") {
        document.getElementById("clientPhone").value = "(45) 99888-7777";
        document.getElementById("clientCpf").value = "987.654.321-00";
        document.getElementById("clientEmail").value = "maria.santos@email.com";
    } else if (select.value === "3") {
        document.getElementById("clientPhone").value = "(45) 99777-6666";
        document.getElementById("clientCpf").value = "456.789.123-00";
        document.getElementById("clientEmail").value = "pedro.costa@email.com";
    }
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

document.getElementById("vehiclePlate").addEventListener("input", function (e) {
    let value = e.target.value.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
    if (value.length > 3) {
        value = value.slice(0, 3) + "-" + value.slice(3, 7);
    }
    e.target.value = value;
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

function resetForm() {
    if (confirm("Deseja realmente limpar todos os campos?")) {
        document.getElementById("osForm").reset();
        document.querySelectorAll(".payment-option").forEach((opt) => {
            opt.classList.remove("selected");
        });
        updateSummary();
    }
}

function saveDraft() {
    alert(
        "Rascunho salvo com sucesso!\n\nVocê poderá continuar editando esta OS posteriormente.",
    );
}

document.getElementById("osForm").addEventListener("submit", function (e) {
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
        osNumber: osCounter,
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

    console.log("Dados da OS:", formData);

    document.getElementById("successOsNumber").textContent = osCounter;
    document.getElementById("successMessage").classList.add("show");

    setTimeout(() => {
        document.getElementById("successMessage").classList.remove("show");
    }, 5000);

    resetForm();

    osCounter++;
    document.getElementById("osNumber").textContent = "OS #" + osCounter;

    window.scrollTo({ top: 0, behavior: "smooth" });
});

const today = new Date();
document.getElementById("dateEntry").valueAsDate = today;
document.getElementById("timeEntry").value = new Date()
    .toTimeString()
    .slice(0, 5);

const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
document.getElementById("dateDelivery").valueAsDate = tomorrow;
