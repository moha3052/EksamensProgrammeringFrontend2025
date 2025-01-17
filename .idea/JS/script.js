const deliveriesUrl = "http://localhost:8080/levering";
const dronesUrl = "http://localhost:8080/drones";

// Initialiser funktioner
document.addEventListener("DOMContentLoaded", () => {
    fetchDeliveries();
    document.getElementById("add-drone").addEventListener("click", addDrone);
    document.getElementById("create-delivery-form").addEventListener("submit", createDelivery);
});

// Henter og viser alle leveringer
async function fetchDeliveries() {
    try {
        const response = await fetch(`${deliveriesUrl}/unfinished`);
        const deliveries = await response.json();

        const deliveriesTable = document.getElementById("deliveries-table");
        deliveriesTable.innerHTML = ""; // Ryd tabelens indhold før opdatering

        deliveries.forEach(delivery => {
            const row = document.createElement("tr");

            const expectedDelivery = delivery.forventet_levering
                ? new Date(delivery.forventet_levering).toLocaleString()
                : "Ikke angivet";

            const droneStatus = delivery.drone
                ? `<span class="status-assigned">Drone: ${delivery.drone.serial_uuid}</span>`
                : '<span class="status-missing">Mangler drone</span>';

            row.innerHTML = `
                <td>${delivery.id}</td>
                <td>${delivery.pizza.name}</td>
                <td>${delivery.adresse}</td>
                <td>${expectedDelivery}</td>
                <td class="${delivery.drone ? 'status-assigned' : 'status-missing'}">
                    ${droneStatus}
                </td>
                <td>
                    <button onclick="assignDrone(${delivery.id})">Tildel Drone</button>
                </td>
            `;
            deliveriesTable.appendChild(row);
        });
    } catch (error) {
        console.error("Fejl ved hentning af leveringer:", error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const dialog = document.getElementById("create-delivery-dialog");
    const openDialogButton = document.getElementById("open-dialog");
    const closeDialogButton = document.getElementById("close-dialog");

    // Åbn dialogen
    openDialogButton.addEventListener("click", () => {
        dialog.showModal();
    });

    // Luk dialogen
    closeDialogButton.addEventListener("click", () => {
        dialog.close();
    });

    // Håndter form-indsendelse
    const form = document.getElementById("create-delivery-form");
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const adresse = document.getElementById("adresse").value;
        console.log(`Levering oprettet til: ${adresse}`);
        dialog.close();
    });
});


// Tildeler en drone til en levering
async function assignDrone(deliveryId) {
    const droneId = prompt("Indtast Drone ID:");
    if (!droneId) {
        alert("Du skal indtaste et gyldigt Drone ID.");
        return;
    }

    try {
        const response = await fetch(`${deliveriesUrl}/schedule/${deliveryId}/${droneId}`, { method: "PUT" });
        if (response.ok) {
            alert("Drone tildelt!");
            fetchDeliveries(); // Opdater listen
        } else {
            const error = await response.text();
            alert(`Kunne ikke tildele drone: ${error}`);
        }
    } catch (error) {
        console.error("Fejl under tildeling af drone:", error);
        alert("En fejl opstod. Prøv igen.");
    }
}

// Opretter en ny levering
async function createDelivery(event) {
    event.preventDefault(); // Forhindrer siden i at genindlæses

    const adresse = document.getElementById("adresse").value;

    const newDelivery = {
        adresse,
        pizza: { id: 1 } // Forudsætter en pizza med ID 1 findes i databasen
    };

    try {
        const response = await fetch(`${deliveriesUrl}/add`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newDelivery)
        });

        if (response.ok) {
            alert("Levering oprettet!");
            fetchDeliveries(); // Opdater listen
            document.getElementById("create-delivery-form").reset(); // Nulstil formular
        } else {
            const error = await response.text();
            alert(`Kunne ikke oprette levering: ${error}`);
        }
    } catch (error) {
        console.error("Fejl ved oprettelse af levering:", error);
    }
}

// Tilføjer en ny drone
async function addDrone() {
    try {
        const response = await fetch(`${dronesUrl}/add`, { method: "POST" });
        if (response.ok) {
            alert("Drone oprettet!");
        } else {
            const error = await response.text();
            alert(`Kunne ikke oprette drone: ${error}`);
        }
    } catch (error) {
        console.error("Fejl ved oprettelse af drone:", error);
    }
}
