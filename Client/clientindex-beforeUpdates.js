
// document.addEventListener('DOMContentLoaded', function () {
//     const currentPage = document.body.getAttribute('data-page');  // Identify the current page
//     console.log(`Current page: ${currentPage}`);


//     if (currentPage === 'ClientDashboardPage') {
//         //const clientForm = document.getElementById('clientForm');
//         document.addEventListener("click", setClientDashboard);
//         // toggleOptions(clickedTab);
//         //setClientPage() 
//     }
//     else if (currentPage === 'ClientWorkOrderPage') {
//         document.addEventListener("click", setWorkOrderPage);
//         //setWorkOrderPage();
//     }
//     else {
//         const logoutBtn = document.querySelector('#logout-btn');
//         logoutBtn.addEventListener('click', logout);

//         // fetch('http://localhost:5050/getall')     
//         // .then(response => response.json())
//         // .then(data => loadHTMLTable(data['data']));
//     }
// });

// document.addEventListener('DOMContentLoaded', function() {
//     // one can point your browser to http://localhost:5050/getAll to check what it returns first.
//     fetch('http://localhost:5050/Client/getall')
//     .then(response => response.json())
//     .then(data => loadHTMLTable(data['data']));
// });

// const searchRegAfterUserBtn = document.querySelector('#search-reg-after-btn');
// searchRegAfterUserBtn.onclick = function () {
//     const ClientIDInput = document.querySelector('#after-reg-input');
//     const clientID = ClientIDInput.value;
//     ClientIDInput.value = "";

//     //console.log("Search value: ", searchValue);
//     //searchInput.value = "";

//     fetch(`http://localhost:5050/Client/ClientOrders/${clientID}`)
//     .then(response => response.json())
//     .then(data => loadWorkOrderHistory(data['data']));
//     console.log("Successfully retrieved `${clientID}`'s data");
// });

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

        // console.log('Setting up ClientPage');
        // const clientDbPage = document.querySelector('Client-Dashboard-Page');
        // clientDbPage.document.addEventListener('click', setClientDashboard);
    }
    else if (currentPage === "QuoteHistoryPage") {
        fetch(`http://localhost:5050/Client/QuoteHistory/${clientID}`)
            .then(response => response.json())
            .then(data => loadQuoteHistoryTable(data['data']))
            .catch(error => console.error("Error fetching quote history: ", error));
        //quoteHistoryResponse();

        // console.log('Setting up QuoteHistoryPage');
        // const quoteHistoryPage = document.querySelector('Quote-History-Page');
        // quoteHistoryPage.document.addEventListener('click', setQuoteHistoryPage);
    }
    else if (currentPage === 'ClientWorkOrderPage') {
        fetch(`http://localhost:5050/Client/WorkOrderHistory/${clientID}`)
            .then(response => response.json())
            .then(data => loadWorkOrderHistoryTable(data['data']))
            .catch(error => console.error("Error fetching quote history: ", error));

        // console.log('Setting up WorkOrderPage');
        // const workOrderHistoryPage = document.getElementById('Work-Order-History-Page');
        // workOrderHistoryPage.document.addEventListener('click', setworkOrderHistoryPage);
        // document.addEventListener("click", setWorkOrderPage);
    }
    else if (currentPage === 'ClientBillsPage') {
        fetch(`http://localhost:5050/Client/Invoices/${clientID}`)
            .then(response => response.json())
            .then(data => loadInvoiceTable(data['data']))
            .catch(error => console.error("Error fetching quote history: ", error));

        // console.log('Setting up BillsPage');
        // const billsPage = document.getElementById('Bills-Page');
        // billsPage.document.addEventListener('click', setInvoicePage);
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
    // logoutBtn.addEventListener('click', logout);
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


// // fetch call is to call the backend
// document.addEventListener('DOMContentLoaded', function() {
//     // one can point your browser to http://localhost:5050/getAll to check what it returns first.
//     fetch('http://localhost:5050/getAll')     
//     .then(response => response.json())
//     .then(data => loadHTMLTable(data['data']));
// });




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


quoteHistoryResponse = function() {
    // when the respond btn is clicked
    const addBtn = document.querySelector('#rspnd-quote-btn');
    addBtn.onclick = function (){
        const nameInput = document.querySelector('#name-input');
        const name = nameInput.value;
        nameInput.value = "";

        fetch('http://localhost:5050/insert', {
            headers: {
                'Content-type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({name: name})
        })
        .then(response => response.json())
        .then(data => insertRowIntoTable(data['data']));
    }
}


// function setQuoteHistoryPage(event) {
//     event.preventDefault();
//     const target = event.target;
//     const clientID = activeClient;

//     console.log("Fetching quote history for client:", clientID);
//     fetch(`http://localhost:5050/Client/QuoteHistory/${clientID}`)
//         .then((response) => response.json())
//         .then(data => loadQuoteHistoryTable(data['data']))
//         .catch((error) => console.error("Error fetching quote history: ", error))
// }


// const getQuoteHistory = document.addEventListener('Quote-History-Page');
// getQuoteHistory.onclick = function () {
// function getQuoteHistory(target) {
//     target.preventDefault();
//     const clientID = activeClient;

//     console.log("Fetching quote history for client:", clientID);
//     fetch(`http://localhost:5050/Client/QuoteHistory/${clientID}`)
//         .then((response) => response.json())
//         // .then((data) => {
//         //     console.log("Quote History Data:", data);
//         //     loadQuoteHistoryTable(data.data); // Populate the table
//         // })
//         .then(data => loadQuoteHistoryTable(data['data']))
//         .catch((error) => console.error("Error fetching quote history: ", error));
// }


// function setworkOrderHistoryPage() {

// }


// function setInvoicePage() {

// }



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
        // const isMostRecentPending = status === "Pending"; // Show selection only for the first pending order
        tableHtml += "<tr>";
        tableHtml +=`<td>${isMostRecentPending ? `<input type="radio" name="selectedOrder" value="${isMostRecentPending}" />` : ""}</td>`;
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

        // tableHtml += `<td><img src="/uploads/${image1.split('/').pop()}" width="50"></td>`;
        // tableHtml += `<td><img src="/uploads/${image2.split('/').pop()}" width="50"></td>`;
        // tableHtml += `<td><img src="/uploads/${image3.split('/').pop()}" width="50"></td>`;
        // tableHtml += `<td><img src="/uploads/${image4.split('/').pop()}" width="50"></td>`;
        // tableHtml += `<td><img src="/uploads/${image5.split('/').pop()}" width="50"></td>`;
        tableHtml += "</tr>";
    });

    table.innerHTML = tableHtml;

    // Attach event listener for submission
    document.getElementById('quote-rspnd-btn').addEventListener('click', handleResponse);
    document.getElementById('quote-accept-btn').addEventListener('click', handleAccept);
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
        tableHtml +=`<td>${isPending ? `<input type="radio" name="selectedOrder" value="${responseID}" />` : ""}</td>`;
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
        table.innerHTML = "<tr><td colspan='12'>No data available</td></tr>";
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
    data.forEach(function ({ status, invoiceID, responseID, workOrderID, amountDue, propertyAddress, dateBilled, responseNote, responseDate, datePaid }){
        tableHtml += "<tr>";
        tableHtml +=`<td>${status}</td>`;
        tableHtml +=`<td>${invoiceID}</td>`;
        tableHtml +=`<td>${responseID || '--'}</td>`;
        tableHtml +=`<td>${workOrderID}</td>`;
        tableHtml +=`<td>${amountDue}</td>`;
        tableHtml +=`<td>${propertyAddress}</td>`;
        tableHtml += `<td>${dateBilled ? new Date(dateBilled).toLocaleDateString('en-US', { year: '2-digit', month: '2-digit', day: '2-digit' }) : "--"}</td>`;
        tableHtml +=`<td>${responseNote || '--'}</td>`;
        tableHtml += `<td>${responseDate ? new Date(responseDate).toLocaleDateString('en-US', { year: '2-digit', month: '2-digit', day: '2-digit' }) : "--"}</td>`;
        tableHtml +=`<td>${datePaid ? new Date(datePaid).toLocaleDateString('en-US', { year: '2-digit', month: '2-digit', day: '2-digit' }) : "--"}</td>`;
        tableHtml += "</tr>";
    });

    table.innerHTML = tableHtml;
}


// function handleResponse() {
//     const selectedOrder = document.querySelector('input[name="selectedOrder"]:checked');
//     if (!selectedOrder) {
//         alert("Please select a pending order to respond to.");
//         return;
//     }

//     const responseID = selectedOrder.value;
//     console.log(`Responding to quote with ID: ${responseID}`);
//     // Add logic to handle response submission (e.g., show a form or make an API call)
// }

// function handleAccept() {
//     const selectedOrder = document.querySelector('input[name="selectedOrder"]:checked');
//     if (!selectedOrder) {
//         alert("Please select a pending order to accept.");
//         return;
//     }

//     const responseID = selectedOrder.value;
//     console.log(`Accepting quote with ID: ${responseID}`);
//     // Add logic to handle acceptance (e.g., make an API call)
// }

function handleResponse() {
    const selectedOrders = document.querySelectorAll('input[type="radio"]:checked');
    if (selectedOrders.length === 0) {
        alert("Please select at least one pending order to respond to.");
        return;
    }

    selectedOrders.forEach(selectedOrder => {
        const responseID = selectedOrder.value;
        console.log(`Responding to quote with responseID: ${responseID}`);
        // Add logic for response submission (e.g., show a form or make an API call)
    });
}

function handleAccept() {
    const selectedOrders = document.querySelectorAll('input[type="radio"]:checked');
    if (selectedOrders.length === 0) {
        alert("Please select at least one pending order to accept.");
        return;
    }

    selectedOrders.forEach(selectedOrder => {
        const responseID = selectedOrder.value;
        console.log(`Accepting quote with responseID: ${responseID}`);
        // Add logic for acceptance (e.g., make an API call)
    });
}

// function loadClientDetails(data) {
//     const clientID = data[0]?.clientID || activeClient;
//     console.log("clientindex.js: loadClientDetails called for ", clientID);
//     const table = document.querySelector('table tbody');

//     if (data.length === 0) {
//         table.innerHTML = "<tr><td class='no-data' colspan='20'>No Data</td></tr>";
//         return;
//     }

//     let tableHtml = "";
//     data.forEach(function ({
//         clientID, email, firstName, lastName, phoneNumber, homeAddress, registerDate, loginTime, activeStatus,
//         quoteID, propertyAddress, drivewaySqft, requestedPrice, clientNote,
//         image1, image2, image3, image4, image5,
//         responseID, responsePrice, startDate, endDate, responseNote, quoteStatus, responseDate,
//         workOrderID, workDateRange, workStatus,
//         invoiceID, amountDue, invoiceDateCreated, invoiceDatePaid,
//         invoiceResponseNote, invoiceResponseDate
//     }) {
//         tableHtml += "<tr>";
//         tableHtml += `<td>${clientID}</td>`;
//         tableHtml += `<td>${email}</td>`;
//         tableHtml += `<td>${firstName}</td>`;
//         tableHtml += `<td>${lastName}</td>`;
//         tableHtml += `<td>${phoneNumber}</td>`;
//         tableHtml += `<td>${homeAddress}</td>`;
//         tableHtml += `<td>${registerDate}</td>`;
//         tableHtml += `<td>${loginTime}</td>`;
//         tableHtml += `<td>${activeStatus}</td>`;
//         tableHtml += `<td>${quoteID ?? '--'}</td>`;
//         tableHtml += `<td>${propertyAddress ?? '--'}</td>`;
//         tableHtml += `<td>${drivewaySqft ?? '--'}</td>`;
//         tableHtml += `<td>${requestedPrice ?? '--'}</td>`;
//         tableHtml += `<td>${clientNote ?? '--'}</td>`;
//         tableHtml += `<td>${image1 ?? '--'}</td>`;
//         tableHtml += `<td>${image2 ?? '--'}</td>`;
//         tableHtml += `<td>${image3 ?? '--'}</td>`;
//         tableHtml += `<td>${image4 ?? '--'}</td>`;
//         tableHtml += `<td>${image5 ?? '--'}</td>`;
//         tableHtml += `<td>${responseID ?? '--'}</td>`;
//         tableHtml += `<td>${responsePrice ?? '--'}</td>`;
//         tableHtml += `<td>${startDate ?? '--'}</td>`;
//         tableHtml += `<td>${endDate ?? '--'}</td>`;
//         tableHtml += `<td>${responseNote ?? '--'}</td>`;
//         tableHtml += `<td>${quoteStatus ?? '--'}</td>`;
//         tableHtml += `<td>${responseDate ?? '--'}</td>`;
//         tableHtml += `<td>${workOrderID ?? '--'}</td>`;
//         tableHtml += `<td>${workDateRange ?? '--'}</td>`;
//         tableHtml += `<td>${workStatus ?? '--'}</td>`;
//         tableHtml += `<td>${invoiceID ?? '--'}</td>`;
//         tableHtml += `<td>${amountDue ?? '--'}</td>`;
//         tableHtml += `<td>${invoiceDateCreated ?? '--'}</td>`;
//         tableHtml += `<td>${invoiceDatePaid ?? '--'}</td>`;
//         tableHtml += `<td>${invoiceResponseNote ?? '--'}</td>`;
//         tableHtml += `<td>${invoiceResponseDate ?? '--'}</td>`;
//         tableHtml += "</tr>";
//     });

//     table.innerHTML = tableHtml;
// }



// function submitNewQuoteRequest(event) {
//     // Prevent the default form submission behavior
//     event.preventDefault();

//     // Get the input values from the form
//     const clientID = activeClient;
//     const streetAddress = document.querySelector("#streetAddress-input").value.trim();
//     const city = document.querySelector("#city-input").value.trim();
//     const state = document.querySelector("#state-input").value.trim();
//     const zipCode = document.querySelector("#zipCode-input").value.trim();
//     const drivewaySqft = document.querySelector("#driveway-sqft-input").value.trim();
//     const proposedPrice = document.querySelector("#proposed-price-input").value.trim();
//     const addNotes = document.querySelector("#addtl-cmnt-input").value.trim();
//     const fileInput1 = document.querySelector("#fileInput1").files[0];
//     const fileInput2 = document.querySelector("#fileInput2").files[0];
//     const fileInput3 = document.querySelector("#fileInput3").files[0];
//     const fileInput4 = document.querySelector("#fileInput4").files[0];
//     const fileInput5 = document.querySelector("#fileInput5").files[0];

//     // Concatenate the property address
//     const propertyAddress = `${streetAddress}, ${city}, ${state}, ${zipCode}`;
//     console.log("Property Address:", propertyAddress);

//     // Validate the inputs
//     if (!streetAddress || !city || !state || !zipCode) {
//         alert("Please provide a complete address.");
//         return;
//     }

//     if (!drivewaySqft || isNaN(drivewaySqft)) {
//         alert("Please provide a valid driveway square footage.");
//         return;
//     }

//     if (!proposedPrice || isNaN(proposedPrice)) {
//         alert("Please provide a valid proposed price.");
//         return;
//     }

//     if (!fileInput1 || !fileInput2 || !fileInput3 || !fileInput4 || !fileInput5) {
//         alert("Please upload all 5 required images.");
//         return;
//     }

//     // Send the data to the server
//     fetch("http://localhost:5050/newQuoteRequest", {
//         method: "POST",
//         body: JSON.stringify({clientID, propertyAddress, drivewaySqft, proposedPrice, addNotes, fileInput1, fileInput2, fileInput3, fileInput4, fileInput5}),
//     })
//         .then((response) => response.json())
//         .then((data) => {
//             if (data.success) {
//                 alert("Quote request submitted successfully!");
//                 console.log(data);

//                 // Redirect to a confirmation or dashboard page
//                 const newUrl = new URL(window.location.href);
//                 newUrl.pathname = "/Client/ClientDashboard.html";
//                 newUrl.protocol = "http:";
//                 window.location.href = newUrl.toString();
//             } else {
//                 alert(data.error || "An error occurred while submitting the quote request.");
//             }
//         })
//         .catch((error) => console.error("Error:", error));
// }

// function logout(event) {
//     event.preventDefault();
//     console.log('Logging ' + activeClient + ' out...');

//     fetch(`http://localhost:5050/logout/${activeClient}/`)
//     .then(response => response.json())
//     .then(data => loadHTMLTable(data['data']));
//     console.log("Search button clicked for first name");
// }