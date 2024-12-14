// document.addEventListener("DOMContentLoaded", () => {
//     // Fetch and display work orders
//     //works*****
//     async function fetchWorkOrders() {
//         try {
//             console.log("Fetching work orders..."); // Debugging

//             const response = await fetch("http://localhost:5050/workorders");
//             if (!response.ok) {
//                 throw new Error(`Error fetching work orders: ${response.statusText}`);
//             }

//             const workOrders = await response.json();
//             console.log("Work Orders Fetched:", workOrders); // Debugging

//             const ordersList = document.getElementById("orders-list");
//             if (!ordersList) {
//                 console.error("The element #orders-list does not exist in the DOM.");
//                 return;
//             }

//             // Clear existing content
//             ordersList.innerHTML = "";

//             // Populate work orders
//             workOrders.forEach((order) => {
//                 const orderDiv = document.createElement("div");
//                 orderDiv.classList.add("work-order");

//                 orderDiv.innerHTML = `
//                 <p><strong>Order ID:</strong> #${order.workOrderID}</p>
//                 <p><strong>Client ID:</strong> ${order.clientID}</p>
//                 <p><strong>Date:</strong> ${order.dateRange}</p>
//                 <p><strong>Status:</strong> ${order.status}</p>
//             `;


//                 ordersList.appendChild(orderDiv);
//             });

//             console.log("Work orders rendered successfully."); // Debugging
//         } catch (error) {
//             console.error("Error fetching work orders:", error);
//         }
//     }

    
    ////////works 
    // Fetch and display quotes
    document.addEventListener("DOMContentLoaded", () => {
        // Load quotes once the DOM is fully loaded
        loadQuotes();
        loadWorkOrders();
        respondWithCounter();
        rejectRequest();
    });
    
    // Function to load quotes
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
                        <div id="quote-${quote.quoteID}">
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
                            <input type="date" id="start-date-${quote.quoteID}">
                            <input type="date" id="end-date-${quote.quoteID}">
                            <textarea id="accept-note-${quote.quoteID}" placeholder="Enter Acceptance Note"></textarea>
                            <textarea id="rejection-note-${quote.quoteID}" placeholder="Enter Rejection Note"></textarea>
                            <div id="quote-buttons-${quote.quoteID}">
                                <button onclick="respondWithCounter(${quote.quoteID}, '${quote.clientID}')">Accept</button>
                                <button onclick="rejectRequest(${quote.quoteID}, '${quote.clientID}')">Reject</button>
                            </div>
                        </div>
                    `;
                    quoteList.appendChild(listItem);
                });
                const acceptedQuotes = data.accepted;
            acceptedQuotes.forEach((quote) => {
                const listItem = document.createElement("li");
                listItem.innerHTML = `
                    <div class="quote-accepted-box" id="quote-${quote.quoteID}">
                        <p style="color: green; font-weight: bold;">Quote Accepted</p>
                        <p><strong>Timeline:</strong> ${quote.startDate} to ${quote.endDate}</p>
                        <p><strong>Proposed Price:</strong> $${quote.proposedPrice}</p>
                        <p><strong>Note:</strong> ${quote.addNote || "No notes"}</p>
                        <p><strong>Client Name:</strong> ${quote.clientID}</p>
                        <p><strong>Address:</strong> ${quote.propertyAddress}</p>
                        <p><strong>Square Feet:</strong> ${quote.drivewaySqft}</p>
                        <p><strong>Original Proposed Price:</strong> $${quote.originalProposedPrice}</p>
                        <p><strong>Original Note:</strong> ${quote.addNote || "No notes"}</p>
                    </div>
                `;
                quoteList.appendChild(listItem);
            });
        })
        .catch((error) => console.error("Error fetching quotes:", error));
    }
    
    // Function to handle accepting a quote
    function respondWithCounter(quoteID, clientID) {
        const proposedPrice = document.getElementById(`counter-price-${quoteID}`).value;
        const startDate = document.getElementById(`start-date-${quoteID}`).value;
        const endDate = document.getElementById(`end-date-${quoteID}`).value;
        const addNote = document.getElementById(`accept-note-${quoteID}`).value;
    
        if (!proposedPrice || !startDate || !endDate || !addNote) {
            alert("Please fill out all fields to accept the quote.");
            return;
        }
    
        fetch("http://localhost:5050/quotes/accept", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ clientID, quoteID, proposedPrice, startDate, endDate, addNote }),
        })
            .then((response) => response.json())
            .then((data) => {
                alert(data.message);
    
                const quoteDiv = document.getElementById(`quote-${quoteID}`);
                quoteDiv.innerHTML = `
                    <div class="quote-accepted-box">
                        <p style="color: green; font-weight: bold;">Quote Accepted</p>
                        <p><strong>Timeline:</strong> ${startDate} to ${endDate}</p>
                        <p><strong>Proposed Price:</strong> $${proposedPrice}</p>
                        <p><strong>Note:</strong> ${addNote}</p>
                        <p><strong>Client Name:</strong> ${data.clientID}</p>
                        <p><strong>Address:</strong> ${data.propertyAddress}</p>
                        <p><strong>Square Feet:</strong> ${data.drivewaySqft}</p>
                        <p><strong>Original Proposed Price:</strong> $${data.originalProposedPrice}</p>
                        <p><strong>Original Note:</strong> ${data.originalNote || "No notes"}</p>
                    </div>
                `;
            })
            .catch((error) => console.error("Error accepting quote:", error));
    }
    
    // Function to handle rejecting a quote
    function rejectRequest(quoteID, clientID) {
        const addNote = document.getElementById(`rejection-note-${quoteID}`).value;
    
        if (!addNote) {
            alert("Please enter a rejection note.");
            return;
        }
    
        fetch("http://localhost:5050/quotes/reject", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ clientID, quoteID, addNote }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Error: ${response.statusText}`);
                }
                return response.json();
            })
            .then((data) => {
                alert(data.message);
    
                // Remove the quote from the UI
                const quoteDiv = document.getElementById(`quote-${quoteID}`);
                quoteDiv.remove();
            })
            .catch((error) => {
                console.error("Error rejecting quote:", error);
                alert("Failed to reject the quote.");
            });
    }

    
document.getElementById("invoice-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const workOrderID = document.getElementById("workOrderID").value;
    const clientID = document.getElementById("clientID").value;
    const amountDue = document.getElementById("amountDue").value;
    const discount = document.getElementById("discount").value || 0;

    try {
        const response = await fetch(`http://127.0.0.1:5050/invoices/generate?workOrderID=${workOrderID}&clientID=${clientID}&amountDue=${amountDue}&discount=${discount}`, {
            method: "GET"
        });

        const data = await response.json();
        console.log("Response Data:", data);
        document.getElementById("response-message").innerText = data.message;
        document.getElementById("response-message").style.color = "green";
    } catch (error) {
        console.error("Error Generating Invoice:", error);
        document.getElementById("response-message").innerText = "An unexpected error occurred.";
        document.getElementById("response-message").style.color = "red";
    }
});

function fetchAndRenderResponses() {
    fetch("http://localhost:5050/invoiceresponses")
        .then((response) => response.json())
        .then((data) => {
            const tableBody = document.getElementById("invoice-responses");
            tableBody.innerHTML = ""; // Clear existing rows

            if (data.length > 0) {
                data.forEach((item) => {
                    const row = document.createElement("tr");

                    let actionsHTML = "";
                    if (item.status === "Accepted") {
                        actionsHTML = `<span style="color: green; font-weight: bold;">Accepted</span>`;
                    } else if (item.status === "Rejected") {
                        actionsHTML = `<span style="color: red; font-weight: bold;">Rejected</span>`;
                    } else {
                        actionsHTML = `
                            <textarea id="note-${item.responseID}" placeholder="Add a note (required for reject)"></textarea><br>
                            <button onclick="respondToInvoice(${item.responseID}, 'accept', ${item.quoteID}, '${item.clientID}')">Accept</button>
                            <button onclick="respondToInvoice(${item.responseID}, 'reject', ${item.quoteID}, '${item.clientID}')">Reject</button>
                            <button onclick="respondToInvoice(${item.responseID}, 'suggest', ${item.quoteID}, '${item.clientID}')">Suggest</button>
                        `;
                    }

                    row.innerHTML = `
                        <td>${item.responseID}</td>
                        <td>${item.invoiceID}</td>
                        <td>${item.clientID || "N/A"}</td>
                        <td>${item.amountDue ? `$${item.amountDue.toFixed(2)}` : "N/A"}</td>
                        <td>${item.responseNote || "No Note"}</td>
                        <td>${new Date(item.responseDate).toLocaleString()}</td>
                        <td>${actionsHTML}</td>
                    `;
                    tableBody.appendChild(row);
                });
            } else {
                const row = document.createElement("tr");
                row.innerHTML = `<td colspan="7" style="text-align: center;">No invoice responses found.</td>`;
                tableBody.appendChild(row);
            }
        })
        .catch((error) => {
            console.error("Error fetching invoice responses:", error);
        });
}

// Call the function to fetch and render data when the page loads
document.addEventListener("DOMContentLoaded", fetchAndRenderResponses);


// Call fetchAndRenderResponses on page load
//document.addEventListener("DOMContentLoaded", fetchAndRenderResponses);



function respondToInvoice(responseID, action, quoteID, clientID) {
    const note = document.getElementById(`note-${responseID}`)?.value || "";

    if (action === "reject" && !note) {
        alert("Please add a note for rejection.");
        return;
    }

    const body = { responseID, action, note, quoteID, clientID };

    fetch("http://localhost:5050/invoiceresponses/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    })
        .then((response) => response.json())
        .then((data) => {
            alert(data.message);
            fetchAndRenderResponses(); // Re-fetch and re-render the table
        })
        .catch((error) => {
            console.error("Error responding to invoice:", error);
        });
}


function editInvoice(responseID, quoteID, clientID) {
const row = document.getElementById(`row-${responseID}`);
if (row) {
    const actionCell = row.querySelector(".actions");
    actionCell.innerHTML = `<span style="color: blue; font-weight: bold;">Create a new invoice for this client.</span>`;
}
alert(`Please create a new invoice for Quote ID: ${quoteID} and Client ID: ${clientID}.`);
}

function loadWorkOrders() {
    fetch("http://localhost:5050/workorders")
        .then((response) => response.json())
        .then(({ workOrders }) => {
            const workOrderList = document.getElementById("work-order");
            workOrderList.innerHTML = ""; // Clear the list before rendering

            workOrders.forEach((workOrder) => {
                const listItem = document.createElement("li");

                listItem.innerHTML = `
                    <div id="work-order-${workOrder.workOrderID}" class="${workOrders}">
                        <p><strong>Work Order ID:</strong> ${workOrder.workOrderID}</p>
                        <p><strong>Client ID:</strong> ${workOrder.clientID}</p>
                        <p><strong>Date Range:</strong> ${workOrder.dateRange}</p>
                        <p><strong>Status:</strong> ${workOrder.status}</p>
                        <p><strong>Date Created:</strong> ${new Date(workOrder.dateCreated).toLocaleString()}</p>
                        <p><strong>Date Paid:</strong> ${
                            workOrder.datePaid
                                ? new Date(workOrder.datePaid).toLocaleString()
                                : "Not Paid"
                        }</p>
                        ${
                            workOrder.status === "Scheduled"
                                ? `<button onclick="markWorkOrderComplete(${workOrder.workOrderID})">Complete</button>`
                                : "<p style='color: green; font-weight: bold;'>Completed</p>"
                        }
                    </div>
                `;

                workOrderList.appendChild(listItem);
            });
        })
        .catch((error) => console.error("Error fetching work orders:", error));
}

function markWorkOrderComplete(workOrderID) {
    fetch("http://localhost:5050/workorders/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workOrderID }),
    })
        .then((response) => response.json())
        .then((data) => {
            alert(data.message);
            loadWorkOrders(); // Reload the work orders to update the UI
        })
        .catch((error) => console.error("Error completing work order:", error));
}

    
    
    





//fetching quotes history and bills
// async function fetchQuoteHistory() {
//     try {
//         const response = await fetch("http://localhost:5050/quotehistory");
//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         const quoteHistory = await response.json();

//         const billList = document.getElementById("bill-list");
//         if (!billList) {
//             console.error("The element #bill-list does not exist in the DOM.");
//             return;
//         }

//         // Clear existing content
//         billList.innerHTML = "";

//         // Populate the list
//         quoteHistory.forEach((quote) => {
//             const listItem = document.createElement("li");

//             listItem.innerHTML = `
//                 <p><strong>Quote ID:</strong> #${quote.quoteID}</p>
//                 <p><strong>Status:</strong> ${quote.status}</p>
//                 <p><strong>Proposed Price:</strong> $${quote.proposedPrice.toFixed(2)}</p>
//                 <p><strong>Start Date:</strong> ${quote.startDate}</p>
//                 <p><strong>End Date:</strong> ${quote.endDate}</p>
//                 <p><strong>Additional Note:</strong> ${quote.addNote || "N/A"}</p>
//                 <p><strong>Response Date:</strong> ${quote.responseDATE}</p>
//                 ${
//                     quote.status === "Pending"
//                         ? `<button class="respond-bill-btn" onclick="respondToQuote(${quote.responseID})">Respond</button>`
//                         : ""
//                 }
//             `;

//             billList.appendChild(listItem);
//         });
//     } catch (error) {
//         console.error("Error fetching quote history:", error);
//     }
// }


// Function to handle response
function respondToQuote(responseID) {
    alert(`Responding to Quote with Response ID: ${responseID}`);
    // Add logic for responding to quotes
}

// Fetch and display the data on page load
//document.addEventListener("DOMContentLoaded", fetchQuoteHistory);


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

//         // Populate work orders with buttons conditionally
//         workOrders.forEach((order) => {
//             const orderDiv = document.createElement("div");
//             orderDiv.classList.add("work-order");
//             orderDiv.setAttribute("id", `work-order-${order.workOrderID}`); // Add unique ID

//             // Add status-specific buttons or disable options
//             let buttonsHTML = "";
//             if (order.status === "Scheduled") {
//                 buttonsHTML = `
//                     <button onclick="updateWorkOrderStatus(${order.workOrderID}, 'Completed')">Completed</button>
//                     <button onclick="updateWorkOrderStatus(${order.workOrderID}, 'Cancelled')">Cancelled</button>
//                 `;
//             } else {
//                 buttonsHTML = `<p>No further actions available. Status is <strong>${order.status}</strong>.</p>`;
//             }

//             orderDiv.innerHTML = `
//                 <p><strong>Order ID:</strong> #${order.workOrderID}</p>
//                 <p><strong>Client ID:</strong> ${order.clientID}</p>
//                 <p><strong>Date:</strong> ${order.dateRange}</p>
//                 <p><strong>Status:</strong> <span id="status-${order.workOrderID}">${order.status}</span></p>
//                 <div id="buttons-${order.workOrderID}">
//                     ${buttonsHTML}
//                 </div>
//             `;

//             ordersList.appendChild(orderDiv);
//         });
//     } catch (error) {
//         console.error("Error fetching work orders:", error);
//     }
// }

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
//             const errorResponse = await response.json();
//             console.error("Error response from server:", errorResponse);
//             throw new Error(`Error updating work order status: ${errorResponse.error}`);
//         }

//         // Update the DOM
//         const statusElement = document.getElementById(`status-${workOrderID}`);
//         const buttonsContainer = document.getElementById(`buttons-${workOrderID}`);

//         // Update status text
//         statusElement.textContent = newStatus;

//         // Replace buttons with a message
//         buttonsContainer.innerHTML = `<p>No further actions available. Status is <strong>${newStatus}</strong>.</p>`;

//         alert(`Work order #${workOrderID} status updated to ${newStatus}`);
//     } catch (error) {
//         console.error("Error updating work order status:", error);
//         alert("Failed to update work order status.");
//     }
// }

// document.addEventListener("DOMContentLoaded", fetchWorkOrders);

//revenue function
// function fetchRevenueReport() {
//     const startDate = document.getElementById("start-date").value;
//     const endDate = document.getElementById("end-date").value;

//     if (!startDate || !endDate) {
//         alert("Please select both start and end dates.");
//         return;
//     }

//     const isValidDate = (date) => !isNaN(new Date(date).getTime());
//     if (!isValidDate(startDate) || !isValidDate(endDate)) {
//         alert("Please enter valid dates.");
//         return;
//     }

//     const url = `http://localhost:5050/revenue?startDate=${startDate}&endDate=${endDate}`;
//     console.log("Fetching URL:", url);

//     const revenueResult = document.getElementById("revenue-result");
//     if (!revenueResult) {
//         console.error("Element with ID 'revenue-result' not found.");
//         return;
//     }

//     revenueResult.innerHTML = "<p>Loading...</p>";

//     fetch(url)
//         .then(response => {
//             console.log("Fetch response:", response);
//             if (!response.ok) {
//                 if (response.status === 404) {
//                     throw new Error("The server endpoint could not be found.");
//                 } else if (response.status === 500) {
//                     throw new Error("An error occurred on the server.");
//                 } else {
//                     throw new Error(`HTTP error! status: ${response.status}`);
//                 }
//             }
//             return response.json();
//         })
//         .then(data => {
//             console.log("Fetched data:", data);

//             // Update the DOM with the fetched revenue data
//             revenueResult.innerHTML = `
//                 <h2>Revenue Report</h2>
//                 <p><strong>Total Revenue:</strong> $${data.totalRevenue.toFixed(2)}</p>
//                 <p><strong>Date Range:</strong> ${startDate} to ${endDate}</p>
//             `;
//         })
//         .catch(error => {
//             console.error("Error fetching revenue report:", error);
//             revenueResult.innerHTML = `
//                 <p style="color: red;">Failed to fetch revenue report: ${error.message}</p>
//             `;
//         });
// }
