
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

    
    document.getElementById("invoice-form").addEventListener("submit", function (e) {
        e.preventDefault();
    
        const workOrderID = document.getElementById("workOrderID").value;
        const clientID = document.getElementById("clientID").value;
        const amountDue = document.getElementById("amountDue").value;
        const discount = document.getElementById("discount").value || 0;
    
        const xhr = new XMLHttpRequest();
        const url = `http://127.0.0.1:5050/invoices/generate?workOrderID=${workOrderID}&clientID=${clientID}&amountDue=${amountDue}&discount=${discount}`;
        
        xhr.open("GET", url, true);
    
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    const data = JSON.parse(xhr.responseText);
                    console.log("Response Data:", data);
                    document.getElementById("response-message").innerText = data.message;
                    document.getElementById("response-message").style.color = "green";
                } else {
                    console.error("Error Generating Invoice:", xhr.statusText);
                    document.getElementById("response-message").innerText = "An unexpected error occurred.";
                    document.getElementById("response-message").style.color = "red";
                }
            }
        };
    
        xhr.send();
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

                    // Add class based on the status
                    if (item.status === "Accepted") {
                        row.classList.add("row-accepted"); // Add the "Accepted" class
                    } else if (item.status === "Rejected") {
                        row.classList.add("row-rejected"); // Add the "Rejected" class
                    }

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

// Function to handle response
function respondToQuote(responseID) {
    alert(`Responding to Quote with Response ID: ${responseID}`);
    // Add logic for responding to quotes
}


function fetchRevenueReport() {
    const startDate = document.getElementById("start-date").value;
    const endDate = document.getElementById("end-date").value;

    if (!startDate || !endDate) {
        alert("Please select both start and end dates.");
        return;
    }

    fetch(`http://localhost:5050/revenueReport?startDate=${startDate}&endDate=${endDate}`)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            // Generate a pop-up with the fetched revenue data
            alert(`
                Revenue Report:
                -------------------------------
                Start Date: ${data.startDate}
                End Date: ${data.endDate}
                Total Revenue: $${data.totalRevenue.toFixed(2)}
            `);
        })
        .catch((error) => {
            console.error("Error fetching revenue report:", error);
            alert("Failed to generate revenue report. Please try again.");
        });
}



document.addEventListener('DOMContentLoaded', () => {
    fetchAllQueryResults(); // Call the function to fetch all query results
});

function fetchAllQueryResults() {
    const ordersDiv = document.getElementById('Orders-details');
    ordersDiv.innerHTML = ''; // Clear existing content

    // Fetch and display Big Clients
    fetch('http://localhost:5050/big-clients')
        .then(response => response.json())
        .then(data => {
            let content = '<h2>Big Clients</h2>';
            if (data.length === 0) {
                content += '<p>No big clients found.</p>';
            } else {
                content += '<ul>';
                data.forEach(order => {
                    content += `<li><strong>Client ID:</strong> ${order.clientID} - <strong>Completed Orders:</strong> ${order.completedOrders}</li>`;
                });
                content += '</ul>';
            }
            ordersDiv.innerHTML += content;
        })
        .catch(error => {
            console.error('Error fetching big clients:', error);
            ordersDiv.innerHTML += '<p>Error loading big clients.</p>';
        });

    // Fetch and display Difficult Clients
    fetch('http://localhost:5050/difficult-clients')
        .then(response => response.json())
        .then(data => {
            let content = '<h2>Difficult Clients</h2>';
            if (data.length === 0) {
                content += '<p>No difficult clients found.</p>';
            } else {
                content += '<ul>';
                data.forEach(client => {
                    content += `<li><strong>Client ID:</strong> ${client.clientID}</li>`;
                });
                content += '</ul>';
            }
            ordersDiv.innerHTML += content;
        })
        .catch(error => {
            console.error('Error fetching difficult clients:', error);
            ordersDiv.innerHTML += '<p>Error loading difficult clients.</p>';
        });

    // Fetch and display This Month's Quotes
    fetch('http://localhost:5050/this-month-quotes')
        .then(response => response.json())
        .then(data => {
            let content = '<h2>This Month’s Quotes</h2>';
            if (data.length === 0) {
                content += '<p>No quotes found for this month.</p>';
            } else {
                content += '<ul>';
                data.forEach(quote => {
                    content += `<li><strong>Quote ID:</strong> ${quote.quoteID} - <strong>Proposed Price:</strong> $${quote.proposedPrice}</li>`;
                });
                content += '</ul>';
            }
            ordersDiv.innerHTML += content;
        })
        .catch(error => {
            console.error('Error fetching this month’s quotes:', error);
            ordersDiv.innerHTML += '<p>Error loading this month’s quotes.</p>';
        });

    // Fetch and display Prospective Clients
    fetch('http://localhost:5050/prospective-clients')
        .then(response => response.json())
        .then(data => {
            let content = '<h2>Prospective Clients</h2>';
            if (data.length === 0) {
                content += '<p>No prospective clients found.</p>';
            } else {
                content += '<ul>';
                data.forEach(client => {
                    content += `<li><strong>Client ID:</strong> ${client.clientID} - <strong>Name:</strong> ${client.firstName} ${client.lastName}</li>`;
                });
                content += '</ul>';
            }
            ordersDiv.innerHTML += content;
        })
        .catch(error => {
            console.error('Error fetching prospective clients:', error);
            ordersDiv.innerHTML += '<p>Error loading prospective clients.</p>';
        });

    // Fetch and display Largest Driveway
    fetch('http://localhost:5050/largest-driveway')
        .then(response => response.json())
        .then(data => {
            let content = '<h2>Largest Driveway</h2>';
            if (data.length === 0) {
                content += '<p>No largest driveway found.</p>';
            } else {
                content += '<ul>';
                data.forEach(driveway => {
                    content += `<li><strong>Address:</strong> ${driveway.propertyAddress} - <strong>Size:</strong> ${driveway.drivewaySqft} sqft</li>`;
                });
                content += '</ul>';
            }
            ordersDiv.innerHTML += content;
        })
        .catch(error => {
            console.error('Error fetching largest driveway:', error);
            ordersDiv.innerHTML += '<p>Error loading largest driveway.</p>';
        });

    // Fetch and display Overdue Bills
    fetch('http://localhost:5050/overdue-bills')
        .then(response => response.json())
        .then(data => {
            let content = '<h2>Overdue Bills</h2>';
            if (data.length === 0) {
                content += '<p>No overdue bills found.</p>';
            } else {
                content += '<ul>';
                data.forEach(bill => {
                    content += `<li><strong>Invoice ID:</strong> ${bill.invoiceID} - <strong>Amount Due:</strong> $${bill.amountDue} - <strong>Date Created:</strong> ${bill.dateCreated}</li>`;
                });
                content += '</ul>';
            }
            ordersDiv.innerHTML += content;
        })
        .catch(error => {
            console.error('Error fetching overdue bills:', error);
            ordersDiv.innerHTML += '<p>Error loading overdue bills.</p>';
        });

    // Fetch and display Bad Clients
    fetch('http://localhost:5050/bad-clients')
        .then(response => response.json())
        .then(data => {
            let content = '<h2>Bad Clients</h2>';
            if (data.length === 0) {
                content += '<p>No bad clients found.</p>';
            } else {
                content += '<ul>';
                data.forEach(client => {
                    content += `<li><strong>Client ID:</strong> ${client.clientID} - <strong>Name:</strong> ${client.firstName} ${client.lastName}</li>`;
                });
                content += '</ul>';
            }
            ordersDiv.innerHTML += content;
        })
        .catch(error => {
            console.error('Error fetching bad clients:', error);
            ordersDiv.innerHTML += '<p>Error loading bad clients.</p>';
        });

    // Fetch and display Good Clients
    fetch('http://localhost:5050/good-clients')
        .then(response => response.json())
        .then(data => {
            let content = '<h2>Good Clients</h2>';
            if (data.length === 0) {
                content += '<p>No good clients found.</p>';
            } else {
                content += '<ul>';
                data.forEach(client => {
                    content += `<li><strong>Client ID:</strong> ${client.clientID} - <strong>Name:</strong> ${client.firstName} ${client.lastName}</li>`;
                });
                content += '</ul>';
            }
            ordersDiv.innerHTML += content;
        })
        .catch(error => {
            console.error('Error fetching good clients:', error);
            ordersDiv.innerHTML += '<p>Error loading good clients.</p>';
        });
        
}
// Function to handle response
function respondToQuote(responseID) {
    alert(`Responding to Quote with Response ID: ${responseID}`);
    // Add logic for responding to quotes
}


function fetchRevenueReport() {
    const startDate = document.getElementById("start-date").value;
    const endDate = document.getElementById("end-date").value;

    if (!startDate || !endDate) {
        alert("Please select both start and end dates.");
        return;
    }

    fetch(`http://localhost:5050/revenueReport?startDate=${startDate}&endDate=${endDate}`)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            // Generate a pop-up with the fetched revenue data
            alert(`
                Revenue Report:
                -------------------------------
                Start Date: ${data.startDate}
                End Date: ${data.endDate}
                Total Revenue: $${data.totalRevenue.toFixed(2)}
            `);
        })
        .catch((error) => {
            console.error("Error fetching revenue report:", error);
            alert("Failed to generate revenue report. Please try again.");
        });
}


