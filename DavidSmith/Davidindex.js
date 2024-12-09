document.addEventListener("DOMContentLoaded", () => {
    // Fetch and display work orders
    //works*****
    async function fetchWorkOrders() {
        try {
            console.log("Fetching work orders..."); // Debugging

            const response = await fetch("http://localhost:5050/workorders");
            if (!response.ok) {
                throw new Error(`Error fetching work orders: ${response.statusText}`);
            }

            const workOrders = await response.json();
            console.log("Work Orders Fetched:", workOrders); // Debugging

            const ordersList = document.getElementById("orders-list");
            if (!ordersList) {
                console.error("The element #orders-list does not exist in the DOM.");
                return;
            }

            // Clear existing content
            ordersList.innerHTML = "";

            // Populate work orders
            workOrders.forEach((order) => {
                const orderDiv = document.createElement("div");
                orderDiv.classList.add("work-order");

                orderDiv.innerHTML = `
                <p><strong>Order ID:</strong> #${order.workOrderID}</p>
                <p><strong>Client ID:</strong> ${order.clientID}</p>
                <p><strong>Date:</strong> ${order.dateRange}</p>
                <p><strong>Status:</strong> ${order.status}</p>
            `;


                ordersList.appendChild(orderDiv);
            });

            console.log("Work orders rendered successfully."); // Debugging
        } catch (error) {
            console.error("Error fetching work orders:", error);
        }
    }

    
    // Fetch and display quotes
    function loadQuotes() {
        fetch("http://localhost:5050/quotes")
            .then((response) => response.json())
            .then((quotes) => {
                const quoteList = document.getElementById("quote-list");
                if (!quoteList) {
                    console.error('Element with id "quote-list" not found.');
                    return;
                }

                quotes.forEach((quote) => {
                    const listItem = document.createElement("li");
                    listItem.innerHTML = `
                        <p><strong>Client Name:</strong> ${quote.clientID}</p>
                        <p><strong>Address:</strong> ${quote.propertyAddress}</p>
                        <p><strong>Square Feet:</strong> ${quote.drivewaySqft}</p>
                        <p><strong>Proposed Price:</strong> $${quote.proposedPrice}</p>
                        <p><strong>Note:</strong> ${quote.addNote || "No notes"}</p>
                        <div>
                            <img src="${quote.image1}" alt="Driveway Image 1" style="width: 200px; height: 200px; margin-right: 20px;">
                            <img src="${quote.image2}" alt="Driveway Image 2" style="width: 200px; height: 200px; margin-right: 20px;">
                            <img src="${quote.image3}" alt="Driveway Image 3" style="width: 200px; height: 200px; margin-right: 20px;">
                            <img src="${quote.image4}" alt="Driveway Image 4" style="width: 200px; height: 200px; margin-right: 20px;">
                            <img src="${quote.image5}" alt="Driveway Image 5" style="width: 200px; height: 200px; margin-right: 20px;">
                        </div>
                        <input type="number" id="counter-price-${quote.quoteID}" placeholder="Enter Counter Price">
                        <input type="date" id="start-date-${quote.quoteID}" placeholder="Start Date">
                        <input type="date" id="end-date-${quote.quoteID}" placeholder="End Date">
                        <textarea id="rejection-note-${quote.quoteID}" placeholder="Enter Rejection Note"></textarea>
                        <button onclick="respondWithCounter(${quote.quoteID})">Submit Counter Proposal</button>
                        <button onclick="rejectRequest(${quote.quoteID})">Reject Request</button>
                    `;
                    quoteList.appendChild(listItem);
                });
            })
            .catch((error) => console.error("Error fetching quotes:", error));
    }

    // Call both functions to fetch and display data
    fetchWorkOrders();
    loadQuotes();
});


// // Load quotes on page load
// document.addEventListener('DOMContentLoaded', loadQuotes);
function respondWithCounter(quoteID) {
    console.log('respondWithCounter called for Quote ID:', quoteID);

    const counterPrice = document.getElementById(`counter-price-${quoteID}`).value;
    const startDate = document.getElementById(`start-date-${quoteID}`).value;
    const endDate = document.getElementById(`end-date-${quoteID}`).value;
    const addNote = document.getElementById(`note-${quoteID}`).value;

    if (!counterPrice || !startDate || !endDate) {
        alert('Please provide all details for the counter proposal.');
        return;
    }

    // Send counter proposal to the server
    fetch(`http://127.0.0.1:5050/quotes/counter/${quoteID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ counterPrice, startDate, endDate, addNote, clientID}),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => alert(data.message))
        .catch(error => console.error('Error:', error));
    
}

// Reject Quote Request
function rejectRequest(quoteID) {
    console.log('rejectRequest called for Quote ID:', quoteID);

    const rejectionNote = document.getElementById(`note-${quoteID}`).value;

    if (!rejectionNote) {
        alert('Please provide a rejection note.');
        return;
    }

    // Send rejection to the server
    fetch(`/quotes/reject/${quoteID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rejectionNote }),
    })
        .then(response => response.json())
        .then(data => {
            console.log('Server response:', data);
            alert(data.message);
        })
        .catch(error => console.error('Error:', error));
}
    
    document.getElementById('invoice-form').addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent default form submission

        const workOrderID = document.getElementById('workOrderID').value;
        const clientID = document.getElementById('clientID').value;
        const amountDue = document.getElementById('amountDue').value;

        console.log('Collected data:', { workOrderID, clientID, amountDue }); // Debug log

        fetch('http://localhost:5050/invoices', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ workOrderID, clientID, amountDue }),
        })
            .then(response => {
                console.log('Response received:', response); // Log raw response
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Response data:', data); // Log parsed response
                const messageDiv = document.getElementById('response-message');
                if (data.success) {
                    messageDiv.style.color = 'green';
                    messageDiv.innerText = 'Invoice created successfully!';
                } else {
                    messageDiv.style.color = 'red';
                    messageDiv.innerText = `Error: ${data.error || 'Failed to create invoice.'}`;
                }
            })
            .catch(error => {
                console.error('Error caught in frontend:', error); // Log error for debugging
                const messageDiv = document.getElementById('response-message');
                messageDiv.style.color = 'red';
                messageDiv.innerText = 'Failed to create invoice due to a server error.';
            });
        
    });

//fetching quotes history and bills
async function fetchQuoteHistory() {
    try {
        const response = await fetch("http://localhost:5050/quotehistory");
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const quoteHistory = await response.json();

        const billList = document.getElementById("bill-list");
        if (!billList) {
            console.error("The element #bill-list does not exist in the DOM.");
            return;
        }

        // Clear existing content
        billList.innerHTML = "";

        // Populate the list
        quoteHistory.forEach((quote) => {
            const listItem = document.createElement("li");

            listItem.innerHTML = `
                <p><strong>Quote ID:</strong> #${quote.quoteID}</p>
                <p><strong>Status:</strong> ${quote.status}</p>
                <p><strong>Proposed Price:</strong> $${quote.proposedPrice.toFixed(2)}</p>
                <p><strong>Start Date:</strong> ${quote.startDate}</p>
                <p><strong>End Date:</strong> ${quote.endDate}</p>
                <p><strong>Additional Note:</strong> ${quote.addNote || "N/A"}</p>
                <p><strong>Response Date:</strong> ${quote.responseDATE}</p>
                ${
                    quote.status === "Pending"
                        ? `<button class="respond-bill-btn" onclick="respondToQuote(${quote.responseID})">Respond</button>`
                        : ""
                }
            `;

            billList.appendChild(listItem);
        });
    } catch (error) {
        console.error("Error fetching quote history:", error);
    }
}


// Function to handle response
function respondToQuote(responseID) {
    alert(`Responding to Quote with Response ID: ${responseID}`);
    // Add logic for responding to quotes
}

// Fetch and display the data on page load
document.addEventListener("DOMContentLoaded", fetchQuoteHistory);

// async function fetchWorkOrders() {
//     try {
//         const response = await fetch("http://localhost:5050/workorders");
//         if (!response.ok) {
//             throw new Error(`Error fetching work orders: ${response.statusText}`);
//         }

//         const workOrders = await response.json();

//         const ordersList = document.getElementById("orders-list");
//         if (!ordersList) {
//             console.error("The element #orders-list does not exist in the DOM.");
//             return;
//         }

//         // Clear existing content
//         ordersList.innerHTML = "";

//         // Populate work orders with buttons
//         workOrders.forEach((order) => {
//             const orderDiv = document.createElement("div");
//             orderDiv.classList.add("work-order");

//             orderDiv.innerHTML = `
//                 <p><strong>Order ID:</strong> #${order.workOrderID}</p>
//                 <p><strong>Client ID:</strong> ${order.clientID}</p>
//                 <p><strong>Date:</strong> ${order.dateRange}</p>
//                 <p><strong>Status:</strong> <span id="status-${order.workOrderID}">${order.status}</span></p>
//                 <button onclick="updateWorkOrderStatus(${order.workOrderID}, 'Scheduled')">Scheduled</button>
//                 <button onclick="updateWorkOrderStatus(${order.workOrderID}, 'Completed')">Completed</button>
//                 <button onclick="updateWorkOrderStatus(${order.workOrderID}, 'Cancelled')">Cancelled</button>
//             `;

//             ordersList.appendChild(orderDiv);
//         });
//     } catch (error) {
//         console.error("Error fetching work orders:", error);
//     }
// }

// // Function to update the status of a work order
// async function updateWorkOrderStatus(workOrderID, newStatus) {
//     try {
//         const response = await fetch(`http://localhost:5050/workorders/${workOrderID}`, {
//             method: "PUT",
//             headers: {
//                 "Content-Type": "application/json",
//             },
//             body: JSON.stringify({ status: newStatus }),
//         });

//         if (!response.ok) {
//             throw new Error(`Error updating work order status: ${response.statusText}`);
//         }

//         // Update the status displayed on the page
//         const statusElement = document.getElementById(`status-${workOrderID}`);
//         statusElement.textContent = newStatus;

//         alert(`Work order #${workOrderID} status updated to ${newStatus}`);
//     } catch (error) {
//         console.error("Error updating work order status:", error);
//         alert("Failed to update work order status.");
//     }
// }

// document.addEventListener("DOMContentLoaded", fetchWorkOrders);

async function fetchWorkOrders() {
    try {
        const response = await fetch("http://localhost:5050/workorders");
        if (!response.ok) {
            throw new Error(`Error fetching work orders: ${response.statusText}`);
        }

        const workOrders = await response.json();

        const ordersList = document.getElementById("orders-list");
        if (!ordersList) {
            console.error("The element #orders-list does not exist in the DOM.");
            return;
        }

        // Clear existing content
        ordersList.innerHTML = "";

        // Populate work orders with buttons
        workOrders.forEach((order) => {
            const orderDiv = document.createElement("div");
            orderDiv.classList.add("work-order");
            orderDiv.setAttribute("id", `work-order-${order.workOrderID}`); // Add unique ID

            orderDiv.innerHTML = `
                <p><strong>Order ID:</strong> #${order.workOrderID}</p>
                <p><strong>Client ID:</strong> ${order.clientID}</p>
                <p><strong>Date:</strong> ${order.dateRange}</p>
                <p><strong>Status:</strong> <span id="status-${order.workOrderID}">${order.status}</span></p>
                <div id="buttons-${order.workOrderID}">
                    <button onclick="updateWorkOrderStatus(${order.workOrderID}, 'Scheduled')">Scheduled</button>
                    <button onclick="updateWorkOrderStatus(${order.workOrderID}, 'Completed')">Completed</button>
                    <button onclick="updateWorkOrderStatus(${order.workOrderID}, 'Cancelled')">Cancelled</button>
                </div>
            `;

            ordersList.appendChild(orderDiv);
        });
    } catch (error) {
        console.error("Error fetching work orders:", error);
    }
}

async function updateWorkOrderStatus(workOrderID, newStatus) {
    try {
        const response = await fetch(`http://localhost:5050/workorders/${workOrderID}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: newStatus }),
        });

        if (!response.ok) {
            const errorResponse = await response.json();
            console.error("Error response from server:", errorResponse);
            throw new Error(`Error updating work order status: ${errorResponse.error}`);
        }

        // Update the DOM
        const statusElement = document.getElementById(`status-${workOrderID}`);
        const buttonsContainer = document.getElementById(`buttons-${workOrderID}`);

        // Update status text
        statusElement.textContent = newStatus;

        // Remove buttons
        buttonsContainer.innerHTML = `<p>Status updated to <strong>${newStatus}</strong>.</p>`;

        alert(`Work order #${workOrderID} status updated to ${newStatus}`);
    } catch (error) {
        console.error("Error updating work order status:", error);
        alert("Failed to update work order status.");
    }
}

document.addEventListener("DOMContentLoaded", fetchWorkOrders);
