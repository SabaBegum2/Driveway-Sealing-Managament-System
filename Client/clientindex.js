
document.addEventListener('DOMContentLoaded', function () {
    const currentPage = document.body.getAttribute('data-page');  // Identify the current page
    console.log(`Current page: ${currentPage}`);

    if (currentPage === 'ClientPage') {
        // const clientForm = document.getElementById('clientForm');
        // clientForm.addEventListener("click", setupClientPage);
        // toggleOptions(clickedTab);
        setupClientPage() 
    }
    else {
        fetch('http://localhost:5050/getall')     
        .then(response => response.json())
        .then(data => loadHTMLTable(data['data']));
        }
});

/* ----------------------------------------------- */
/* ------------ CLIENT PAGE FUNCTIONS ------------ */
/* ----------------------------------------------- */

function setupClientPage() {
    console.log('Setting up ClientPage');

    // Hide and show tabs dynamically
    setupTabNavigation();

    // Handle initial page load
    const tabName = window.location.hash.replace('#', '') || 'Home';

    // Show the initial tab
    showTab(tabName);

    // Call the corresponding tab function on page load
    callTabHandler(tabName);

    // Listen for back/forward navigation
    window.addEventListener('popstate', function (event) {
        const stateTab = event.state ? event.state.tab : 'Home';
        showTab(stateTab);
    });

    defineTabActions();
}


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
                newUrl.pathname = '/Client/ClientDashboard.html#Home';
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