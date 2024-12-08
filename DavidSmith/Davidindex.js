// // // //david smith page functions
// // // const e = require("express");

// // // document.addEventListener('DOMContentLoaded', function () {
// // //     const currentPage = document.body.getAttribute('data-page');  // Identify the current page
// // //     console.log(`Current page: ${currentPage}`);

// // //     if (currentPage === 'ClientPage') {
// // //         // const clientForm = document.getElementById('clientForm');
// // //         // clientForm.addEventListener("click", setupClientPage);
// // //         // toggleOptions(clickedTab);
// // //         setupClientPage() 
// // //     }
// // //     else {
// // //         fetch('http://localhost:5050/getall')     
// // //         .then(response => response.json())
// // //         .then(data => loadHTMLTable(data['data']));
// // //         }
// // // });


// // document.querySelector('.submitQuote').addEventListener('click', async (e) => {
// //     e.preventDefault();
// //     const data = {
// //         client_name: document.getElementById('client-name').value,
// //         service_details: document.getElementById('service-details').value,
// //         time_start: document.getElementById('time-start').value,
// //         time_end: document.getElementById('time-end').value,
// //         quote_price: document.getElementById('quote-price').value
// //     };
// //     const response = await fetch('http://localhost:3000/quotes', {
// //         method: 'POST',
// //         headers: { 'Content-Type': 'application/json' },
// //         body: JSON.stringify(data)
// //     });
// //     const result = await response.json();
// //     console.log(result);
// // });

// document.addEventListener("DOMContentLoaded", () => {
//     console.log("Davidindex.js loaded successfully!");

//     // Tab Navigation Logic
//     const tabs = document.querySelectorAll(".tabLinks");
//     const contents = document.querySelectorAll(".DavidContent");

//     tabs.forEach(tab => {
//         tab.addEventListener("click", (event) => {
//             event.preventDefault();

//             // Deactivate all tabs and hide content
//             tabs.forEach(t => t.classList.remove("active"));
//             contents.forEach(content => content.style.display = "none");

//             // Activate clicked tab and display corresponding content
//             const targetTab = tab.getAttribute("data-tab");
//             tab.classList.add("active");
//             document.getElementById(targetTab).style.display = "block";
//         });
//     });

//     // Default to showing the Home tab
//     document.querySelector(".tabLinks[data-tab='Home']").click();

//     // Submit Quote Form
//     const quoteForm = document.getElementById("quoteForm");
//     quoteForm?.addEventListener("submit", (event) => {
//         event.preventDefault();

//         const clientName = document.getElementById("client-name").value;
//         const serviceDetails = document.getElementById("service-details").value;
//         const timeStart = document.getElementById("time-start").value;
//         const timeEnd = document.getElementById("time-end").value;
//         const quotePrice = document.getElementById("quote-price").value;

//         // Simulate sending data to the backend
//         console.log("Quote Submitted:", { clientName, serviceDetails, timeStart, timeEnd, quotePrice });

//         alert("Quote submitted successfully!");
//         quoteForm.reset();
//     });

//     // Generate Bill Button
//     const generateBillButtons = document.querySelectorAll(".generate-bill-btn");
//     generateBillButtons.forEach(button => {
//         button.addEventListener("click", () => {
//             alert("Generate bill functionality is not implemented yet!");
//         });
//     });

//     // Submit Bill Form
//     const billForm = document.getElementById("generate-bill-form");
//     billForm?.addEventListener("submit", (event) => {
//         event.preventDefault();

//         const workDone = document.getElementById("work-done").value;
//         const cost = document.getElementById("cost").value;
//         const discount = document.getElementById("discount").value || "None";
//         const note = document.getElementById("bill-note").value;

//         // Simulate sending data to the backend
//         console.log("Bill Generated:", { workDone, cost, discount, note });

//         alert("Bill submitted successfully!");
//         billForm.reset();
//     });

//     // Submit Response to Bill Form
//     const respondBillForm = document.getElementById("respond-bill-form");
//     respondBillForm?.addEventListener("submit", (event) => {
//         event.preventDefault();

//         const response = document.getElementById("bill-response").value;
//         const applyDiscount = document.getElementById("apply-discount").checked;
//         const discountAmount = applyDiscount ? document.getElementById("discount-amount").value : "None";

//         // Simulate sending response to the backend
//         console.log("Response to Bill Submitted:", { response, applyDiscount, discountAmount });

//         alert("Bill response submitted successfully!");
//         respondBillForm.reset();
//     });

//     // Show/Hide Discount Input Based on Checkbox
//     const applyDiscountCheckbox = document.getElementById("apply-discount");
//     const discountInput = document.getElementById("discount-amount");
//     applyDiscountCheckbox?.addEventListener("change", () => {
//         discountInput.style.display = applyDiscountCheckbox.checked ? "block" : "none";
//     });
// });

// document.addEventListener('DOMContentLoaded', () => {
//     // Fetch quotes when the Quotes tab is clicked
//     document.querySelector('[data-tab="Quotes"]').addEventListener('click', fetchQuotes);

//     function fetchQuotes() {
//         fetch('/quotes')
//             .then(response => response.json())
//             .then(data => renderQuotes(data))
//             .catch(error => console.error('Error fetching quotes:', error));
//     }

//     function renderQuotes(quotes) {
//         const quoteList = document.getElementById('quote-list');
//         quoteList.innerHTML = ''; // Clear existing quotes

//         quotes.forEach(quote => {
//             const li = document.createElement('li');
//             li.innerHTML = `
//                 <p><strong>Quote ID:</strong> ${quote.quoteID}</p>
//                 <p><strong>Client ID:</strong> ${quote.clientID}</p>
//                 <p><strong>Address:</strong> ${quote.propertyAddress}</p>
//                 <p><strong>Driveway Sqft:</strong> ${quote.drivewaySqft}</p>
//                 <p><strong>Proposed Price:</strong> $${quote.proposedPrice}</p>
//                 <p><strong>Client Notes:</strong> ${quote.addNote}</p>
//                 <div class="quote-actions">
//                     <button class="accept-quote-btn" data-id="${quote.quoteID}">Accept</button>
//                     <button class="reject-quote-btn" data-id="${quote.quoteID}">Reject</button>
//                 </div>
//             `;
//             quoteList.appendChild(li);
//         });

//         // Add event listeners for accept and reject buttons
//         document.querySelectorAll('.accept-quote-btn').forEach(button => {
//             button.addEventListener('click', handleAcceptQuote);
//         });

//         document.querySelectorAll('.reject-quote-btn').forEach(button => {
//             button.addEventListener('click', handleRejectQuote);
//         });
//     }

//     function handleAcceptQuote(event) {
//         const quoteID = event.target.getAttribute('data-id');
//         const newPrice = prompt('Enter the price you propose:');
//         const timeWindowStart = prompt('Enter the start date (YYYY-MM-DD):');
//         const timeWindowEnd = prompt('Enter the end date (YYYY-MM-DD):');
//         const note = prompt('Enter a note for the client (optional):');

//         const acceptData = {
//             quoteID,
//             newPrice,
//             timeWindowStart,
//             timeWindowEnd,
//             note,
//             status: 'Accepted',
//         };

//         fetch(`/quotes/${quoteID}/response`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify(acceptData)
//         })
//         .then(response => response.json())
//         .then(data => {
//             alert('Quote accepted and response sent to client.');
//             fetchQuotes(); // Refresh the quotes list
//         })
//         .catch(error => console.error('Error accepting quote:', error));
//     }

//     function handleRejectQuote(event) {
//         const quoteID = event.target.getAttribute('data-id');
//         const note = prompt('Enter a note explaining the rejection:');

//         const rejectData = {
//             quoteID,
//             note,
//             status: 'Rejected',
//         };

//         fetch(`/quotes/${quoteID}/response`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify(rejectData)
//         })
//         .then(response => response.json())
//         .then(data => {
//             alert('Quote rejected and response sent to client.');
//             fetchQuotes(); // Refresh the quotes list
//         })
//         .catch(error => console.error('Error rejecting quote:', error));
//     }
// });

//*******this is a working code, the quotes load *****

// function loadQuotes() {
//     fetch('http://localhost:5050/quotes')
//         .then(response => response.json())
//         .then(quotes => {
//             const quoteList = document.getElementById('quote-list');
//             quotes.forEach(quote => {
//                 const listItem = document.createElement('li');
//                 listItem.innerHTML = `
//                     <p><strong>Client Name:</strong> ${quote.clientID}</p>
//                     <p><strong>Address:</strong> ${quote.propertyAddress}</p>
//                     <p><strong>Square Feet:</strong> ${quote.drivewaySqft}</p>
//                     <p><strong>Proposed Price:</strong> $${quote.proposedPrice}</p>
//                     <p><strong>Note:</strong> ${quote.addNote || 'No notes'}</p>
//                     <div>
//                         <img src="${quote.image1}" alt="Driveway Image 1" style="width: 200px; height: 200px; margin-right: 20px;">
//                         <img src="${quote.image2}" alt="Driveway Image 2" style="width: 200px; height: 200px; margin-right: 20px;">
//                         <img src="${quote.image3}" alt="Driveway Image 3" style="width: 200px; height: 200px; margin-right: 20px;">
//                         <img src="${quote.image4}" alt="Driveway Image 4" style="width: 200px; height: 200px; margin-right: 20px;">
//                         <img src="${quote.image5}" alt="Driveway Image 5" style="width: 200px; height: 200px; margin-right: 20px;">
//                     </div>
//                     <input type="number" id="new-price-${quote.quoteID}" placeholder="Enter New Price">
//                     <textarea id="note-${quote.quoteID}" placeholder="Add Note"></textarea>
//                     <button onclick="acceptQuote(${quote.quoteID})">Accept</button>
//                     <button onclick="rejectQuote(${quote.quoteID})">Reject</button>
//                 `;
//                 quoteList.appendChild(listItem);
//             });
//         })
//         .catch(error => console.error('Error:', error));
// }

// function acceptQuote(quoteID) {
//     const newPrice = document.getElementById(`new-price-${quoteID}`).value;
//     const startDate = '2024-01-01'; // Example dates
//     const endDate = '2024-01-07';

//     fetch(`/quotes/accept/${quoteID}`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ newPrice, startDate, endDate }),
//     })
//         .then(response => response.json())
//         .then(data => alert(data.message))
//         .catch(error => console.error('Error:', error));
// }

// function rejectQuote(quoteID) {
//     const rejectionNote = document.getElementById(`note-${quoteID}`).value;

//     fetch(`/quotes/reject/${quoteID}`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ rejectionNote }),
//     })
//         .then(response => response.json())
//         .then(data => alert(data.message))
//         .catch(error => console.error('Error:', error));
// }

// document.addEventListener('DOMContentLoaded', loadQuotes);



//Function to load quotes from the server and display them
function loadQuotes() {
    fetch('http://localhost:5050/quotes')
        .then(response => response.json())
        .then(quotes => {
            const quoteList = document.getElementById('quote-list');
            quotes.forEach(quote => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `
                    <p><strong>Client Name:</strong> ${quote.clientID}</p>
                    <p><strong>Address:</strong> ${quote.propertyAddress}</p>
                    <p><strong>Square Feet:</strong> ${quote.drivewaySqft}</p>
                    <p><strong>Proposed Price:</strong> $${quote.proposedPrice}</p>
                    <p><strong>Note:</strong> ${quote.addNote || 'No notes'}</p>
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
        .catch(error => console.error('Error:', error));
}

// Function to respond with a counter proposal
function respondWithCounter(quoteID) {
    const counterPrice = document.getElementById(`counter-price-${quoteID}`).value;
    const startDate = document.getElementById(`start-date-${quoteID}`).value;
    const endDate = document.getElementById(`end-date-${quoteID}`).value;

    if (!counterPrice || !startDate || !endDate) {
        alert('Please provide all details for the counter proposal.');
        return;
    }

    fetch(`/quotes/counter/${quoteID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ counterPrice, startDate, endDate }),
    })
        .then(response => response.json())
        .then(data => alert(data.message))
        .catch(error => console.error('Error:', error));
}

// Function to reject the request with a note
function rejectRequest(quoteID) {
    const rejectionNote = document.getElementById(`rejection-note-${quoteID}`).value;

    if (!rejectionNote) {
        alert('Please provide a rejection note.');
        return;
    }

    fetch(`/quotes/reject/${quoteID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rejectionNote }),
    })
        .then(response => response.json())
        .then(data => alert(data.message))
        .catch(error => console.error('Error:', error));
}

// Load quotes on page load
document.addEventListener('DOMContentLoaded', loadQuotes);
