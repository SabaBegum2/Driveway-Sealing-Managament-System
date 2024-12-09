
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
    
    // if (!document.body.dataset.sharedListenerSet) {
    //     console.log("Setting up shared logout event listener...");
    //     document.addEventListener("click", logout); 

    //     document.body.dataset.sharedListenerSet = true; // Mark listener as set
    // }

    const currentPage = document.body.getAttribute('data-page');  // Identify the current page

    console.log(`Current page: ${currentPage}`);

    if (currentPage === 'ClientDashboardPage') {
        console.log('Setting up ClientPage');
        document.addEventListener("click", setClientDashboard);
    }
    else if (currentPage === 'ClientWorkOrderPage') {
        console.log('Setting up WorkOrderPage');
        document.addEventListener("click", setWorkOrderPage);
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


 //   else {
        // fetch('http://localhost:5050/Client/clientDetails', {
        //     method: 'GET',
        //     credentials: 'include' // Ensure session cookie is sent
        // })
        //     .then(response => {
        //         if (!response.ok) {
        //             throw new Error('Failed to fetch client details. Status: ' + response.status);
        //         }
        //         return response.json();
        //     })
        //     .then(data => loadClientDetails(data['data']))
        //     .catch(error => {
        //         console.error('Error fetching client details:', error);
        //         alert('Failed to load client details. Please try again.');
        //     });
        // }
    // fetch('http://localhost:5050/Client/clientDetails')     
    // .then(response => response.json())
    // .then(data => loadClientDetails(data['data']));
    // }

//});

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
    
}

function logout(event) {
    event.preventDefault();
    console.log('Logging ' + activeClient + ' out...');

    fetch(`http://localhost:5050/logout/${activeClient}/`)
    .then(response => response.json())
    .then(data => loadHTMLTable(data['data']));
    console.log("Search button clicked for first name");
}



function createNewQuote(event) {
    event.preventDefault();
    console.log('Setting up NewQuotePage');

    const submitQuote = document.querySelector('#new-quote-btn');

    // Hide and show tabs dynamically

}


// document.getElementById('fileInput').addEventListener('change', function(event) {
//     var file = event.target.files[0];
//     var fileInfo = `
//       <p>File Name: ${file.name}</p>
//       <p>File Size: ${file.size} bytes</p>
//       <p>File Type: ${file.type}</p>
//     `;
//     document.getElementById('fileInfo').innerHTML = fileInfo;
// });



/* --------------- LOGOUT FUNCTION ---------------- */



// const searchAgeBtn =  document.querySelector('#search-age-btn');
// searchAgeBtn.onclick = function (){
//     event.preventDefault();
//     fetch('http://localhost:5050/logout', {
//         method: 'POST',
//         credentials: 'include' // Ensures cookies are sent
//     })
//     .then(response => response.json())
//     .then(data => {
//         if (data.success) {
//             alert('Logged out successfully');
//             window.location.href = '/LoginPage.html'; // Redirect to login page
//         }
//     })
//     .catch(error => {
//         console.error('Error logging out:', error);
//     });
// }


function setupTabNavigation() {
    //const tabLinks = document.querySelectorAll('.tabLinks');
    const tabOptions = document.querySelectorAll('.toggleTabs');

    tabOptions.addEventListener('click', function (event) {
        if (event.target.classList.contains('toggleLinks')) {

            event.preventDefault();

            const tabName = event.target.getAttribute('data-tab');
            if (!tabName) {
                console.error('Failed to retrieve tab name');
                return;
            }

            history.pushState({ tab: tabName }, '', `./ClientDashboard.html#${tabName}`);
            showTab(tabName);
            callTabHandler(tabName);
        }
    });
}
    // Add click event listeners to each tab
    // tabLinks.forEach(link => {
    //     link.addEventListener('click', function (event) {
    //         event.preventDefault(); // Prevent default link behavior
    //         const tabName = this.getAttribute('data-tab');

    //         // Update browser history
    //         history.pushState({ tab: tabName }, '', `./ClientDashboard.html#${tabName}`);

    //         // Show the selected tab
    //         showTab(tabName);

    //         // Call a specific function for each tab (extendable functionality)
    //         callTabHandler(tabName);
        
    //     });
    // });
//}

function showTab(tabName) {
    const clientContents = document.querySelectorAll('.clientContent');
    const tabLinks = document.querySelectorAll('.tabLinks');

    // Hide all tabs
    clientContents.forEach(content => content.style.display = 'none');

    // Remove active class from all tab links
    tabLinks.forEach(tab => tab.classList.remove('active'));

    // Show the selected tab content
    const selectedTab = document.getElementById(tabName);
    if (selectedTab) {
        selectedTab.style.display = 'block';
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    }
}


function defineTabActions() {
    const clientPage = document.querySelector('.clientContainer');

    // Delegate all actions (clicks, submits) to the container
    clientContainer.addEventListener('click', function (event) {
        // Example: Handle button clicks
        if (event.target && event.target.classList.contains('exampleButton')) {
            console.log('Example button clicked!');
            // Add button-specific logic here
        }
    });

    clientContainer.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent form submission

        // Identify which form was submitted
        const formId = event.target.getAttribute('id');
        if (formId === 'quoteForm') {
            submitNewQuote(event);
        }
    });
}


function callTabHandler(tabName) {
    switch (tabName) {
        case "Home":
            handleHomeTab();
            break;
        case "NewQuote":
            handleNewQuoteTab();
            break;
        case "Orders":
            handleOrdersTab();
            break;
        case "Bills":
            handleBillsTab();
            break;
        default:
            console.error(`No handler defined for tab: ${tabName}`);
    }
}


// Define individual tab functions
function handleHomeTab() {
    console.log("Home tab clicked");
    // Add your Home tab-specific functionality here
}


function submitNewQuote() {
    signInForm.onclick = function (event) {
        event.preventDefault(); // Prevent default form submission

        const clientID = document.getElementById("clientID-input").value;
        const password = document.getElementById("password-input").value;

        console.log("clientID:", clientID); // debugging
        console.log("password:", password); // debugging

        // Send the login data to the server
        fetch('http://localhost:5050/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ clientID, password }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Login successful');
                const newUrl = new URL(window.location.href);
                newUrl.pathname = '/Client/ClientDashboard.html';
                newUrl.protocol = 'http:';
                window.location.href = newUrl.toString(); // Redirect after successful login
                } else {
                alert(data.error); // Show error message from the server
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred during login. Please try again.');
        });
    }
}

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
