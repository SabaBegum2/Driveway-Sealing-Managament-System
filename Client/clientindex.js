
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

    // const clientID = sessionStorage.getItem('clientID'); // Retrieve clientID from sessionStorage
    // console.log("Client ID:", clientID); // Use this value as needed

    // const urlParams = new URLSearchParams(window.location.search);
    // const clientID = urlParams.get('clientID'); // Retrieve the clientID from the query parameter
    // activeClient = clientID;
    // console.log("Client ID:", clientID); // Use this value as needed
    // console.log("Active ID:", activeClient); // Use this value as needed

    // Retrieve clientID from URL query parameters (if available)
    const urlParams = new URLSearchParams(window.location.search);
    let clientID = urlParams.get('clientID');

    // If no clientID in the URL, try to retrieve it from sessionStorage
    if (!clientID) {
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

    if (currentPage === "QuoteHistoryPage") {
        console.log('Setting up QuoteHistoryPage');
        getQuoteHistory(); // Automatically fetch quote history on page load
    }
    
    if (currentPage === 'ClientDashboardPage') {
        console.log('Setting up ClientPage');
        document.addEventListener("click", setClientDashboard);
    }
    else if (currentPage === "QuoteHistoryPage") {
        console.log('Setting up QuoteHistoryPage');
        document.addEventListener("click", setQuoteHistoryPage);
    }
    else if (currentPage === 'ClientWorkOrderPage') {
        console.log('Setting up WorkOrderPage');
        document.addEventListener("click", setWorkOrderPage);
    }
    else if (currentPage === 'ClientNewQuotePage') {
        console.log('Setting up new quote request page');
        const newQuoteForm = document.getElementById('newQuoteForm');
        newQuoteForm.addEventListener('submit', submitNewQuoteRequest); 
    }
    else {
        fetch(`http://localhost:5050/ClientDB/${clientID}`)     
        .then(response => response.json())
        .then(data => loadClientHTMLTable(data['data']));
        }
});



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
        alert("User successfully logged out!");
        console.log(data);  // debugging

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
    event.preventDefault();
    const target = event.target;

    if (document.querySelector("#new-quote-page") === target) {
        submitNewQuoteRequest(event);
    }
}


function submitNewQuoteRequest(event) {
    event.preventDefault();

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





function setQuoteHistoryPage(event) {
    event.preventDefault();
    const target = event.target;

    if (document.querySelector("#quote-history-page") === target) {
        getQuoteHistory(event);
    }
}

function getQuoteHistory(event) {
    event.preventDefault();
    console.log("Fetching quote history for client:", activeClient);
    fetch(`http://localhost:5050/Client/QuoteHistory?clientID=${activeClient}`)
        .then((response) => response.json())
        .then((data) => {
            console.log("Quote History Data:", data);
            loadQuoteHistoryTable(data.data); // Populate the table
        })
        .catch((error) => console.error("Error fetching quote history:", error));
}


// function getQuoteHistory() {
//     signInForm.onclick = function (event) {
//         event.preventDefault(); // Prevent default form submission

//         const clientID = document.getElementById("clientID-input").value;
//         const password = document.getElementById("password-input").value;

//         console.log("clientID:", clientID); // debugging
//         console.log("password:", password); // debugging

//         // Send the login data to the server
//         fetch('http://localhost:5050/login', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ clientID, password }),
//         })
//         .then(response => response.json())
//         .then(data => {
//             if (data.success) {
//                 alert('Login successful');
//                 const newUrl = new URL(window.location.href);
//                 newUrl.pathname = '/Client/ClientDashboard.html';
//                 newUrl.protocol = 'http:';
//                 window.location.href = newUrl.toString(); // Redirect after successful login
//                 } else {
//                 alert(data.error); // Show error message from the server
//             }
//         })
//         .catch(error => {
//             console.error('Error:', error);
//             alert('An error occurred during login. Please try again.');
//         });
//     }
// }

function handleNewQuoteTab() {
    console.log("New Quote tab clicked");
    // Add your New Quote tab-specific functionality here
    submitNewQuote();
}

function handleOrdersTab(event) {
    console.log("Orders tab clicked");
    // Add your Orders tab-specific functionality here
}

function handleBillsTab(event) {
    console.log("Bills tab clicked");
    // Add your Bills tab-specific functionality here
}




function loadClientHTMLTable(data) {
    console.debug("loadHTMLTable called.");

    const table = document.querySelector('table tbody');

    if (!data || data.length === 0) {
        table.innerHTML = "<tr><td class='no-data' colspan='12'>No Data</td></tr>";
        return;
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
        tableHtml += `<td>${phoneNumber || 'N/A'}</td>`;
        tableHtml += `<td>${creditCardNum || 'N/A'}</td>`;
        tableHtml += `<td>${creditCardCVV || 'N/A'}</td>`;
        tableHtml += `<td>${creditCardExp || 'N/A'}</td>`;
        tableHtml += `<td>${homeAddress}</td>`;
        tableHtml += `<td>${new Date(registerDate).toISOString().split('T')[0]}</td>`;
        tableHtml += `<td>${loginTime ? new Date(loginTime).toLocaleString() : 'N/A'}</td>`;
        tableHtml += `<td>${activeStatus}</td>`;
        tableHtml += "</tr>";
    });

    table.innerHTML = tableHtml;
}

function loadQuoteHistoryTable(data) {
    const table = document.querySelector("#quoteHistoryTable tbody");

    if (!data || data.length === 0) {
        table.innerHTML = "<tr><td colspan='12'>No data available</td></tr>";
        return;
    }

    let tableHtml = "";
    data.forEach(({ responseDate, responseID, quoteID, clientID, propertyAddress, drivewaySqft, requestedPrice, clientNote, image1, image2, image3, image4, image5 }) => {
        tableHtml += `
            <tr>
                <td>${responseDate}</td>
                <td>${responseID}</td>
                <td>${quoteID}</td>
                <td>${clientID}</td>
                <td>${propertyAddress}</td>
                <td>${drivewaySqft}</td>
                <td>${requestedPrice}</td>
                <td>${clientNote}</td>
                <td><img src="${image1}" alt="Image 1" width="50"></td>
                <td><img src="${image2}" alt="Image 2" width="50"></td>
                <td><img src="${image3}" alt="Image 3" width="50"></td>
                <td><img src="${image4}" alt="Image 4" width="50"></td>
                <td><img src="${image5}" alt="Image 5" width="50"></td>
            </tr>
        `;
    });

    table.innerHTML = tableHtml;
}



// For each function that loads the client data into a table
function loadWorkOrderHistory(data){
    debug("userindex.js: loadHTMLTable called.");

    const table = document.querySelector('table tbody'); 
    
    if(data.length === 0){
        table.innerHTML = "<tr><td class='no-data' colspan='10'>No Data</td></tr>";
        return;
    }

    let tableHtml = "";
    data.forEach(function ({workOrderID, clientID, quoteID, responseID, dateRange, status}){
        tableHtml += "<tr>";
        tableHtml +=`<td>${workOrderID}</td>`;
        tableHtml +=`<td>${clientID}</td>`;
        tableHtml +=`<td>${quoteID}</td>`;
        tableHtml +=`<td>${responseID}</td>`;
        tableHtml +=`<td>${dateRange}</td>`;
        tableHtml +=`<td>${status}</td>`;
        tableHtml += "</tr>";
    });

    table.innerHTML = tableHtml;
}


function loadClientDetails(data) {
    console.debug("userindex.js: loadClientDetails called.");

    const table = document.querySelector('table tbody');

    if (data.length === 0) {
        table.innerHTML = "<tr><td class='no-data' colspan='20'>No Data</td></tr>";
        return;
    }

    let tableHtml = "";
    data.forEach(function ({
        clientID, email, firstName, lastName, phoneNumber, homeAddress, registerDate, loginTime, activeStatus,
        quoteID, propertyAddress, drivewaySqft, requestedPrice, clientNote,
        image1, image2, image3, image4, image5,
        responseID, responsePrice, startDate, endDate, responseNote, quoteStatus, responseDate,
        workOrderID, workDateRange, workStatus,
        invoiceID, amountDue, invoiceDateCreated, invoiceDatePaid,
        invoiceResponseNote, invoiceResponseDate
    }) {
        tableHtml += "<tr>";
        tableHtml += `<td>${clientID}</td>`;
        tableHtml += `<td>${email}</td>`;
        tableHtml += `<td>${firstName}</td>`;
        tableHtml += `<td>${lastName}</td>`;
        tableHtml += `<td>${phoneNumber}</td>`;
        tableHtml += `<td>${homeAddress}</td>`;
        tableHtml += `<td>${registerDate}</td>`;
        tableHtml += `<td>${loginTime}</td>`;
        tableHtml += `<td>${activeStatus}</td>`;
        tableHtml += `<td>${quoteID ?? 'N/A'}</td>`;
        tableHtml += `<td>${propertyAddress ?? 'N/A'}</td>`;
        tableHtml += `<td>${drivewaySqft ?? 'N/A'}</td>`;
        tableHtml += `<td>${requestedPrice ?? 'N/A'}</td>`;
        tableHtml += `<td>${clientNote ?? 'N/A'}</td>`;
        tableHtml += `<td>${image1 ?? 'N/A'}</td>`;
        tableHtml += `<td>${image2 ?? 'N/A'}</td>`;
        tableHtml += `<td>${image3 ?? 'N/A'}</td>`;
        tableHtml += `<td>${image4 ?? 'N/A'}</td>`;
        tableHtml += `<td>${image5 ?? 'N/A'}</td>`;
        tableHtml += `<td>${responseID ?? 'N/A'}</td>`;
        tableHtml += `<td>${responsePrice ?? 'N/A'}</td>`;
        tableHtml += `<td>${startDate ?? 'N/A'}</td>`;
        tableHtml += `<td>${endDate ?? 'N/A'}</td>`;
        tableHtml += `<td>${responseNote ?? 'N/A'}</td>`;
        tableHtml += `<td>${quoteStatus ?? 'N/A'}</td>`;
        tableHtml += `<td>${responseDate ?? 'N/A'}</td>`;
        tableHtml += `<td>${workOrderID ?? 'N/A'}</td>`;
        tableHtml += `<td>${workDateRange ?? 'N/A'}</td>`;
        tableHtml += `<td>${workStatus ?? 'N/A'}</td>`;
        tableHtml += `<td>${invoiceID ?? 'N/A'}</td>`;
        tableHtml += `<td>${amountDue ?? 'N/A'}</td>`;
        tableHtml += `<td>${invoiceDateCreated ?? 'N/A'}</td>`;
        tableHtml += `<td>${invoiceDatePaid ?? 'N/A'}</td>`;
        tableHtml += `<td>${invoiceResponseNote ?? 'N/A'}</td>`;
        tableHtml += `<td>${invoiceResponseDate ?? 'N/A'}</td>`;
        tableHtml += "</tr>";
    });

    table.innerHTML = tableHtml;
}
