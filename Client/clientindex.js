

let activeClient;

document.addEventListener('DOMContentLoaded', function () {
    console.log("Client DOM loaded.");

    const urlParams = new URLSearchParams(window.location.search);
    let clientID = urlParams.get('clientID');

    // If no clientID in the URL, try to retrieve it from sessionStorage
    if (!clientID) {
        console.log("No clientID found in URL. Checking sessionStorage...");
        clientID = sessionStorage.getItem('clientID');
    }

    // Save clientID in sessionStorage if it exists
    if (clientID) {
        sessionStorage.setItem('clientID', clientID);
        activeClient = clientID;
        console.log("Active Client ID:", activeClient);
    } else {
        console.error("No active client found! Redirecting to login...");
        window.location.href = '/Client/LoginPage.html'; // Redirect to login if no active client
    }

    const currentPage = document.body.getAttribute('data-page');  // Identify the current page
    console.log(`Current page: ${currentPage}`);
    
    if (currentPage === 'ClientDashboardPage') {
        fetch(`http://localhost:5050/ClientDB/${clientID}`)
            .then(response => response.json())
            .then(data => loadClientHTMLTable(data['data']))
            .catch(error => console.error("Error fetching client data: ", error));
    }
    else if (currentPage === "QuoteHistoryPage") {
        fetch(`http://localhost:5050/Client/QuoteHistory/${clientID}`)
            .then(response => response.json())
            .then(data => {
                loadQuoteHistoryTable(data['data']);
                quoteResponse();
                quoteAccept();
            })
            .catch(error => console.error("Error fetching quote history: ", error));

    }
    else if (currentPage === 'ClientWorkOrderPage') {
        fetch(`http://localhost:5050/Client/WorkOrderHistory/${clientID}`)
            .then(response => response.json())
            .then(data => loadWorkOrderHistoryTable(data['data']))
            .catch(error => console.error("Error fetching quote history: ", error));
    }
    else if (currentPage === 'ClientBillsPage') {
        fetch(`http://localhost:5050/Client/Invoices/${clientID}`)
            .then(response => response.json())
            .then(data => {
                loadInvoiceTable(data['data']);
                invoiceResponse();
                invoiceAccept();
            })
            .catch(error => console.error("Error fetching quote history: ", error));
    }
    else if (currentPage === 'ClientNewQuotePage') {
        console.log('Setting up new quote request page');
        const newQuoteForm = document.getElementById('newQuoteForm');
        newQuoteForm.addEventListener('submit', submitNewQuoteRequest); 
    }
    else {
        console.error("No page-specific setup function found.");
    }
});


/* ----------------------------------------------- */
/* -------------- ALL PAGE FUNCTIONS ------------- */
/* ----------------------------------------------- */

// logout button
const logoutBtn = document.querySelector('#logout-btn');
logoutBtn.onclick = function () {

    console.log('Logging ' + activeClient + ' out...');
    fetch(`http://localhost:5050/logout/${activeClient}/`, {
        headers: {
            'Content-type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({ clientID: activeClient, activeStatus: 'offline' })
    })
    .then(response => response.json())
    .then(data => {
        alert(activeClient + " successfully logged out!");
        console.log(activeClient + "successfully logged out.");  // debugging
        activeClient = null;

        const newUrl = new URL(window.location.href);
        newUrl.pathname = '/Client/LoginPage.html';
        newUrl.protocol = 'http:';
        window.location.href = newUrl.toString(); // Redirect after successfully logging off
    })
    .catch(error => console.error("Error: ", error));
}


/* ----------------------------------------------- */
/* ------------ CLIENT PAGE FUNCTIONS ------------ */
/* ----------------------------------------------- */

// function setupClientPage() {
//     console.log('Setting up ClientPage');
//     // Hide and show tabs dynamically
//     setupTabNavigation();
//     // Handle initial page load
//     const tabName = window.location.hash.replace('#', '') || 'Home';
//     // Show the initial tab
//     showTab(tabName);
//     // Call the corresponding tab function on page load
//     callTabHandler(tabName);
//     // Listen for back/forward navigation
//     window.addEventListener('popstate', function (event) {
//         const stateTab = event.state ? event.state.tab : 'Home';
//         showTab(stateTab);
//     });
//     defineTabActions();
// }


function setClientDashboard(event) {
    //event.preventDefault();
    //event.stopEventPropagation();
    const target = event.target;

    if (document.querySelector("#new-quote-page") === target) {
        submitNewQuoteRequest(event);
    }
}


function submitNewQuoteRequest(event) {
    event.preventDefault();
    //event.stopPropagation();
    const clientID = activeClient;

    // Get the address fields and concatenate them into a single string
    const streetAddress = document.querySelector("#streetAddress-input").value.trim();
    const city = document.querySelector("#city-input").value.trim();
    const state = document.querySelector("#state-input").value.trim();
    const zipCode = document.querySelector("#zipCode-input").value.trim();
    const propertyAddress = `${streetAddress}, ${city}, ${state}, ${zipCode}`; // Concatenate address

    // Get other fields
    const drivewaySqft = parseInt(document.querySelector("#driveway-sqft-input").value.trim());
    const proposedPrice = document.querySelector("#proposed-price-input").value.trim();
    const addNotes = document.querySelector("#addtl-cmnt-input").value.trim();

    // Validate fields
    if (!streetAddress || !city || !state || !zipCode) {
        alert("Please provide a complete address.");
        return;
    }

    if (!drivewaySqft || isNaN(drivewaySqft)) {
        alert("Please provide a valid driveway square footage.");
        return;
    }

    if (!proposedPrice || isNaN(proposedPrice)) {
        alert("Please provide a valid proposed price.");
        return;
    }

    // Get the file inputs
    const fileInput1 = document.querySelector("#fileInput1").files[0];
    const fileInput2 = document.querySelector("#fileInput2").files[0];
    const fileInput3 = document.querySelector("#fileInput3").files[0];
    const fileInput4 = document.querySelector("#fileInput4").files[0];
    const fileInput5 = document.querySelector("#fileInput5").files[0];

    if (!fileInput1 || !fileInput2 || !fileInput3 || !fileInput4 || !fileInput5) {
        alert("Please upload all 5 required images.");
        return;
    }

    // Create FormData and append fields
    const formData = new FormData();
    formData.append("clientID", clientID);
    formData.append("propertyAddress", propertyAddress); // Add the concatenated address
    formData.append("drivewaySqft", drivewaySqft);
    formData.append("proposedPrice", proposedPrice);
    formData.append("addNotes", addNotes);
    formData.append("fileInput1", fileInput1);
    formData.append("fileInput2", fileInput2);
    formData.append("fileInput3", fileInput3);
    formData.append("fileInput4", fileInput4);
    formData.append("fileInput5", fileInput5);

    // Debugging: Log FormData
    console.log('Submitting new quote request with the following data:');
    formData.forEach((value, key) => console.log(`${key}: ${value}`));

    // Send the FormData to the server
    fetch("http://localhost:5050/newQuoteRequest", {
        method: "POST",
        body: formData,
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                alert("Quote request submitted successfully!");
                console.log(data);

                // Redirect to the dashboard
                const newUrl = new URL(window.location.href);
                newUrl.pathname = "/Client/ClientDashboard.html";
                newUrl.protocol = "http:";
                window.location.href = newUrl.toString();
            } else {
                alert(data.error || "An error occurred while submitting the quote request.");
            }
        })
        .catch((error) => console.error("Error:", error));
}


/* ------------------- QUOTE RESPONSE-------------------- */
function quoteResponse() {
    const respondBtn = document.querySelector('#quote-rspnd-btn');
    const submitResponseBtn = document.querySelector('#submitResponse');
    const responseForm = document.getElementById('responseForm');

    // Initially hide the form
    responseForm.style.display = 'none';

    respondBtn.onclick = function () {
        const selectedOrder = document.querySelector('input[type="radio"]:checked');
        if (!selectedOrder) {
            alert("Please select a quote to respond to.");
            return;
        }

        // Fetch dataset properties from the selected radio button
        const responseID = selectedOrder.value; // Response ID
        const proposedPrice = selectedOrder.dataset.proposedPrice;
        const startDate = selectedOrder.dataset.startDate;
        const endDate = selectedOrder.dataset.endDate;
        const addNote = selectedOrder.dataset.addNote;

        console.log("Selected Response ID:", responseID);
        console.log("Proposed Price:", proposedPrice);
        console.log("Start Date:", startDate);
        console.log("End Date:", endDate);
        console.log("Note:", addNote);

        // Show and populate the response form
        responseForm.style.display = 'block';
        document.getElementById('newPrice').value = proposedPrice || "";
        document.getElementById('newStartDate').value = new Date(startDate) || "";
        document.getElementById('newEndDate').value = new Date(endDate) || "";
        document.getElementById('addNewNote').value;

        // Attach responseID to the submit button
        submitResponseBtn.dataset.responseID = responseID;
    };

    submitResponseBtn.onclick = function () {
        const responseID = submitResponseBtn.dataset.responseID;
        const newPrice = document.getElementById('newPrice').value;
        const newStartDate = document.getElementById('newStartDate').value;
        const newEndDate = document.getElementById('newEndDate').value;
        const addNote = document.getElementById('addNewNote').value;

        console.log(`Submitting new response for responseID: ${responseID}`);
        console.log(`New Price: ${newPrice}, Start Date: ${newStartDate}, End Date: ${newEndDate}, Note: ${addNote}`);

        fetch(`http://localhost:5050/Client/QuoteHistory/Response/${responseID}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                proposedPrice: newPrice,
                startDate: newStartDate,
                endDate: newEndDate,
                addNote,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                alert("Response submitted successfully!");
                console.log(data);

                responseForm.reset();
                responseForm.style.display = 'none';
            })
            .catch((error) => console.error("Error submitting response:", error));
    };
}


/* ------------------- QUOTE ACCEPT-------------------- */
function quoteAccept() {
    const acceptBtn = document.querySelector('#quote-accept-btn');
    acceptBtn.onclick = function () {
        const selectedOrder = document.querySelector('input[type="radio"]:checked');
        if (!selectedOrder) {
            alert("Please select a quote to accept.");
            return;
        }

        const responseID = selectedOrder.value; // Get the selected responseID
        console.log(`Accepting quote with responseID: ${responseID}`);

        fetch(`http://localhost:5050/Client/QuoteHistory/Accept/${responseID}`, {
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'PUT',
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            alert("Quote accepted successfully!");
            console.log(data);
            window.location.reload()
        })
        .catch(error => console.error("Error accepting quote: ", error));
    };
}







/* ------------------- INVOICE RESPONSE-------------------- */
function invoiceResponse() {
    const billingBtn = document.querySelector('#invoice-rspnd-btn');
    const submitBillingResponseBtn = document.querySelector('#submitBillingResponse');
    const billingForm = document.getElementById('billing-Form');
    // let rspnsID;
    // Initially hide the form
    billingForm.style.display = 'none';

    billingBtn.onclick = function () {
        const selectedOrder = document.querySelector('input[type="radio"]:checked');
        if (!selectedOrder) {
            alert("Please select a quote to respond to.");
            return;
        }

        // Fetch dataset properties from the selected radio button
        const invoiceID = selectedOrder.value; // Response ID
        // const rspnsID = selectedOrder.dataset.responseID;
        const amountDue = selectedOrder.dataset.amountDue;
        const responseNote = selectedOrder.dataset.responseNote;

        console.log("Selected quote ID:", invoiceID);
        // console.log("Selected response ID:", rspnsID);
        console.log("Amount Due:", amountDue);
        console.log("Note:", responseNote);

        // Show and populate the response form
        billingForm.style.display = 'block';
        document.getElementById('amountDue').value = amountDue || "";
        document.getElementById('addNewNote').value;

        // Attach invoiceID to the submit button
        submitBillingResponseBtn.dataset.invoiceID = invoiceID;
    };

    submitBillingResponseBtn.onclick = function () {
        const invoiceID = submitBillingResponseBtn.dataset.invoiceID;
        // const responseID = rspnsID;
        const amountDue = document.getElementById('amountDue').value;
        const responseNote = document.getElementById('addNewNote').value;

        console.log(`Submitting new response for responseID: ${invoiceID}`);
        console.log(`New Price: ${amountDue}, Note: ${responseNote}`);

        fetch(`http://localhost:5050/Client/Invoices/Response/${invoiceID}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                // responseID,
                amountDue,
                responseNote,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                alert("Response submitted successfully!");
                console.log(data);

                billingForm.reset();
                billingForm.style.display = 'none';
            })
            .catch((error) => console.error("Error submitting response:", error));
    };
}


/* ------------------- INVOICE RESPONSE-------------------- */
function invoiceAccept() {
    const acceptBtn = document.querySelector('#invoice-accept-btn');
    acceptBtn.onclick = function () {
        const selectedOrder = document.querySelector('input[type="radio"]:checked');
        if (!selectedOrder) {
            alert("Please select a quote to accept.");
            return;
        }

        const responseID = selectedOrder.value; // Get the selected responseID
        console.log(`Accepting quote with responseID: ${responseID}`);

        fetch(`http://localhost:5050/Client/Invoices/Accept/${responseID}`, {
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'PUT',
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            alert("Quote accepted successfully!");
            console.log(data);
            window.location.reload()
        })
        .catch(error => console.error("Error accepting quote: ", error));
    };
}




function loadClientHTMLTable(data) {
    console.debug("loadHTMLTable called.");
    const clientID = data[0]?.clientID || activeClient;
    const table = document.querySelector('table tbody');
    let caption = document.querySelector('#clientInfoTable caption'); // Locate the caption

    if (!data || data.length === 0) {
        table.innerHTML = "<tr><td colspan='12'>No data available</td></tr>";
        return;
    }

    // Set the table caption to the clientID from the first record or active client variable
    if (caption) {
        caption.textContent = `Registration Information for ` + clientID;
    } 
    else {
        const newCaption = document.createElement('caption');
        newCaption.textContent = `Registration Information for ` + clientID;
        document.querySelector('table').prepend(newCaption);
    }

    let tableHtml = "";
    data.forEach(function ({ clientID, email, password, firstName, lastName, phoneNumber, creditCardNum, 
        creditCardCVV, creditCardExp, homeAddress, registerDate, loginTime, activeStatus
    }) {
        tableHtml += "<tr>";
        tableHtml += `<td>${clientID}</td>`;
        tableHtml += `<td>${email}</td>`;
        tableHtml += `<td>${password}</td>`;
        tableHtml += `<td>${firstName}</td>`;
        tableHtml += `<td>${lastName}</td>`;
        tableHtml += `<td>${phoneNumber || '--'}</td>`;
        tableHtml += `<td>${creditCardNum || '--'}</td>`;
        tableHtml += `<td>${creditCardCVV || '--'}</td>`;
        tableHtml += `<td>${creditCardExp || '--'}</td>`;
        tableHtml += `<td>${homeAddress}</td>`;
        tableHtml += `<td>${new Date(registerDate).toISOString().split('T')[0]}</td>`;
        tableHtml += `<td>${loginTime ? new Date(loginTime).toLocaleString() : '--'}</td>`;
        tableHtml += `<td>${activeStatus}</td>`;
        tableHtml += "</tr>";
    });

    table.innerHTML = tableHtml;
}



function loadQuoteHistoryTable(data) {
    const clientID = data[0]?.clientID || activeClient;
    console.log("loadQuoteHistoryTable called for ", clientID);

    const table = document.querySelector('table tbody');
    let caption = document.querySelector('#quoteHistoryTable caption'); // Locate the caption

    if (!data || data.length === 0) {
        table.innerHTML = "<tr><td colspan='12'>No data available</td></tr>";
        return;
    }

    // Set the table caption to the clientID from the first record or active client variable
    if (caption) {
        caption.textContent = `Quote History for ` + clientID;
    } 
    else {
        const newCaption = document.createElement('caption');
        newCaption.textContent = `Quote History for ` + clientID;
        document.querySelector('table').prepend(newCaption);
    }
    
    let tableHtml = "";
    //data.forEach(({ responseID, clientID, quoteID, propertyAddress, drivewaySqft, requestedPrice, clientNote, responseDate, status, image1, image2, image3, image4, image5 }) => {
    data.forEach(({ responseID, quoteID, propertyAddress, drivewaySqft, proposedPrice, startDate, endDate, addNote, responseDate, status, isMostRecentPending }) => {
        tableHtml += "<tr>";
        tableHtml +=`<td>${isMostRecentPending ? `<input type="radio" name="selectedOrder" value="${responseID}" 
                        data-proposed-price="${proposedPrice}" 
                        data-start-date="${startDate}" 
                        data-end-date="${endDate}" 
                        data-add-note="${addNote}" />` : ""}</td>`;
        tableHtml += `<td>${responseID}</td>`;
        tableHtml += `<td>${quoteID}</td>`;
        tableHtml += `<td>${propertyAddress}</td>`;
        tableHtml += `<td>${drivewaySqft}</td>`;
        tableHtml += `<td>$${proposedPrice}</td>`;
        tableHtml += `<td>${startDate ? new Date(startDate).toLocaleDateString('en-US', { year: '2-digit', month: '2-digit', day: '2-digit' }) : "--"}</td>`;
        tableHtml += `<td>${endDate ? new Date(endDate).toLocaleDateString('en-US', { year: '2-digit', month: '2-digit', day: '2-digit' }) : "--"}</td>`;
        tableHtml += `<td>${addNote}</td>`;
        tableHtml += `<td>${responseDate ? new Date(responseDate).toLocaleDateString('en-US', { year: '2-digit', month: '2-digit', day: '2-digit' }) : "--"}</td>`;
        tableHtml += `<td>${status}</td>`;
        tableHtml += "</tr>";
    });

    table.innerHTML = tableHtml;
}



// For each function that loads the client data into a table
function loadWorkOrderHistoryTable(data){
    const clientID = data[0]?.clientID || activeClient;
    console.log("clientindex.js: loadWorkOrderHistory called for ", clientID);

    const table = document.querySelector('table tbody');
    let caption = document.querySelector('#workOrderHistoryTable caption'); // Locate the caption

    if (!data || data.length === 0) {
        table.innerHTML = "<tr><td colspan='12'>No data available</td></tr>";
        return;
    }

    // Set the table caption to the clientID from the first record or active client variable
    if (caption) {
        caption.textContent = `Work Order History for ` + clientID;
    } 
    else {
        const newCaption = document.createElement('caption');
        newCaption.textContent = `Work Order History for ` + clientID;
        document.querySelector('table').prepend(newCaption);
    }

    let tableHtml = "";
    data.forEach(function ({ workOrderID, quoteID, clientID, propertyAddress, dateRange, price, status }){
        tableHtml += "<tr>";
        tableHtml +=`<td>${workOrderID}</td>`;
        tableHtml +=`<td>${quoteID}</td>`;
        tableHtml +=`<td>${clientID}</td>`;
        tableHtml +=`<td>${propertyAddress}</td>`;
        tableHtml +=`<td>${dateRange}</td>`;
        tableHtml +=`<td>$${price}</td>`;
        tableHtml +=`<td>${status}</td>`;
        tableHtml += "</tr>";
    });

    table.innerHTML = tableHtml;
}



loadInvoiceTable = function(data){
    const clientID = data[0]?.clientID || activeClient;
    console.log("clientindex.js: loadInvoiceTable called for ", clientID);
    console.log("Client ID:", clientID);

    const table = document.querySelector('table tbody');
    let caption = document.querySelector('#invoiceTable caption'); // Locate the caption

    if (!data || data.length === 0) {
        table.innerHTML = "<tr><td colspan='13'>No data available</td></tr>";
        return;
    }

    // Set the table caption to the clientID from the first record or active client variable
    if (caption) {
        caption.textContent = `Invoice History for ${clientID}`;
    } 
    else {
        const newCaption = document.createElement('caption');
        newCaption.textContent = `Invoice History for ${clientID}`;
        document.querySelector('table').prepend(newCaption);
    }    

    let tableHtml = "";
    // workOrderID, clientID
    data.forEach(function ({ status, invoiceID, isMostRecentPaid, responseID, workOrderID, amountDue, propertyAddress, dateCreated, responseNote, responseDate, datePaid }){
        tableHtml += "<tr>";
        tableHtml +=`<td>${isMostRecentPaid ? `<input type="radio" name="selectedOrder" value="${invoiceID}" 
            data-responseID="${responseID}" 
            data-amount-due="${amountDue}" 
            data-add-note="${responseNote}" />` : ""}</td>`;
        tableHtml +=`<td>${status}</td>`;
        tableHtml +=`<td>${invoiceID}</td>`;
        tableHtml +=`<td>${responseID || '--'}</td>`;
        tableHtml +=`<td>${workOrderID}</td>`;
        tableHtml +=`<td>$${amountDue}</td>`;
        tableHtml +=`<td>${propertyAddress}</td>`;
        tableHtml += `<td>${dateCreated ? new Date(dateCreated).toLocaleDateString('en-US', { year: '2-digit', month: '2-digit', day: '2-digit' }) : "--"}</td>`;
        tableHtml +=`<td>${responseNote || '--'}</td>`;
        tableHtml += `<td>${responseDate ? new Date(responseDate).toLocaleDateString('en-US', { year: '2-digit', month: '2-digit', day: '2-digit' }) : "--"}</td>`;
        tableHtml +=`<td>${datePaid ? new Date(datePaid).toLocaleDateString('en-US', { year: '2-digit', month: '2-digit', day: '2-digit' }) : "--"}</td>`;
        tableHtml += "</tr>";
    });

    table.innerHTML = tableHtml;
}