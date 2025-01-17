const deliveriesUrl = "http://localhost:8080/levering";
const dronesUrl = "http://localhost:8080/drones";

// Initialiser funktioner
document.addEventListener("DOMContentLoaded", () => {
    fetchDeliveries();
    document.getElementById("add-drone").addEventListener("click", addDrone);
    document.getElementById("create-delivery-form").addEventListener("submit", createDelivery);
});

// Hent og vis alle leveringer
async function fetchDeliveries() {
    try {
        const response = await fetch(`${deliveriesUrl}/unfinished`);
        const deliveries = await response.json();

        const deliveriesTable = document.getElementById("deliveries-table");
        deliveriesTable.innerHTML = ""; // Ryd tabellen før opdatering

        deliveries.forEach(delivery => {
            const row = document.createElement("tr");

            // Formatér datoer, hvis de findes
            const expectedDelivery = delivery.forventet_levering
                ? new Date(delivery.forventet_levering).toLocaleString()
                : "Ikke angivet";

            const actualDelivery = delivery.faktisk_levering
                ? new Date(delivery.faktisk_levering).toLocaleString()
                : "Ikke leveret";

            const droneStatus = delivery.drone
                ? `<span class="status-assigned">Drone: ${delivery.drone.serial_uuid}</span>`
                : '<span class="status-missing">Mangler drone</span>';

            // Tilføj rækker til tabellen
            row.innerHTML = `
                <td>${delivery.id}</td>
                <td>${delivery.pizza.name}</td>
                <td>${delivery.adresse}</td>
                <td>${expectedDelivery}</td>
                <td>${actualDelivery}</td>
                <td class="${delivery.drone ? 'status-assigned' : 'status-missing'}">
                    ${droneStatus}
                </td>
                <td>
                    <button onclick="assignDrone(${delivery.id})">Tildel Drone</button>
                    <button onclick="markAsDelivered(${delivery.id})">Markér som Leveret</button>
                </td>
            `;
            deliveriesTable.appendChild(row);
        });
    } catch (error) {
        console.error("Fejl ved hentning af leveringer:", error);
    }
}

// Tildel en drone til en levering
async function assignDrone(deliveryId) {
    try {
        const drones = await (await fetch(dronesUrl)).json();
        const availableDrone = drones.find(drone => drone.driftsstatus === "I_DRIFT");
        if (!availableDrone) return alert("Ingen droner er tilgængelige i drift.");

        const response = await fetch(`${deliveriesUrl}/schedule/${deliveryId}/${availableDrone.id}`, { method: "PUT" });
        response.ok
            ? (alert(`Drone ${availableDrone.serial_uuid} er tildelt til levering ${deliveryId}!`), fetchDeliveries())
            : alert(`Kunne ikke tildele drone: ${await response.text()}`);
    } catch (error) {
        console.error("Fejl:", error);
        alert("En fejl opstod. Prøv igen.");
    }
}




// Markér en levering som færdig
async function markAsDelivered(deliveryId) {
    try {
        const response = await fetch(`${deliveriesUrl}/finish/${deliveryId}`, { method: "PUT" });
        if (response.ok) {
            alert("Levering markeret som fuldført!");
            fetchDeliveries(); // Opdater listen
        } else {
            const error = await response.text();
            alert(`Kunne ikke markere levering som fuldført: ${error}`);
        }
    } catch (error) {
        console.error("Fejl under markering af levering:", error);
        alert("En fejl opstod. Prøv igen.");
    }
}

// // Opret en ny levering
// async function createDelivery(event) {
//     event.preventDefault(); // Forhindrer siden i at genindlæses
//
//     const adresse = document.getElementById("adresse").value;
//
//     const newDelivery = {
//         adresse,
//         pizza: { id: 1 } // Forudsætter en pizza med ID 1 findes i databasen
//     };
//
//     try {
//         const response = await fetch(`${deliveriesUrl}/add`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify(newDelivery)
//         });
//
//         if (response.ok) {
//             alert("Levering oprettet!");
//             fetchDeliveries(); // Opdater listen
//             document.getElementById("create-delivery-form").reset(); // Nulstil formular
//         } else {
//             const error = await response.text();
//             alert(`Kunne ikke oprette levering: ${error}`);
//         }
//     } catch (error) {
//         console.error("Fejl ved oprettelse af levering:", error);
//     }
// }

// Tilføj en ny drone
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
