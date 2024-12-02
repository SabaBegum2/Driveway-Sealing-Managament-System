//david smith page functions
const e = require("express");

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



