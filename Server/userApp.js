// Server: application services, accessible by URIs

const mysql = require('mysql');
const express = require('express')
//const router = express.Router();
const cors = require('cors')
const dotenv = require('dotenv')
dotenv.config()
const bodyParser = require('body-parser'); // Import body-parser

const app = express();
const userDbService = require('./userDbService');
//david
//const clientRoutes  = require('./Client/clientindex');
// const clientIndex = require('./Client/clientindex');
// const quotesRoutes = require('./DavidSmith/Quotes');
// const workOrdersRoutes = require('../DavidSmith/Orders');
// const invoicesRoutes = require('./DavidSmith/invoices');

// const clientIndex = require('../Client/clientindex'); // Relative path to Client folder
// const quotesRoutes = require('../DavidSmith/Quotes'); // Relative path to DavidSmith folder
// const workOrdersRoutes = require('../DavidSmith/Orders'); // Ensure the path is correct
// const invoicesRoutes = require('../DavidSmith/invoices'); // Ensure the path is correct

app.use(cors());
app.use(express.json())//middleware
app.use(express.urlencoded({extended: false}));

//david routes
// app.use('/clientIndex', clientIndex);
// app.use('/quotes', quotesRoutes);
// app.use('/Orders', workOrdersRoutes);
// app.use('/invoices', invoicesRoutes);

// Correct paths to modules
//const clientIndex = require('../Client/clientindex'); // ../ to access Client folder
const quotesRouter = require('./Quotes'); // ../ to access DavidSmith folder
const workOrdersRoutes = require('../DavidSmith/Orders'); // Corrected relative path
const invoicesRoutes = require('../DavidSmith/invoices'); // Corrected relative path

// Use routes
//app.use('/clientIndex', clientIndex);
app.use('/quotes', quotesRouter);
app.use('/Orders', workOrdersRoutes);
app.use('/invoices', invoicesRoutes);



// // Read all client data
app.get('/getClientData', (request, response) => {
    
    const db = userDbService.getUserDbServiceInstance();
    
    const result =  db.getAllClientData(); // call a DB function

    result
    .then(data => response.json({ data: data }))
    .catch(err => console.log(err));
});

//Read all data
app.get('/getAll', (request, response) => {
    
    const db = userDbService.getUserDbServiceInstance();
    
    const result =  db.getAllData(); // call a DB function

    result
    .then(data => response.json({ data: data }))
    .catch(err => console.log(err));
});


// Create new Client
app.post('/register', async(request, response) => {
    console.log("userApp: insert a row.");
    try {
        const {clientID, email, password, firstName, lastName, phoneNumber, creditCardNum, creditCardCVV, creditCardExp, homeAddress} = request.body;

        // Check for missing fields
        if (!clientID || !email || !password || !firstName || !lastName || !phoneNumber || !homeAddress) {
            return response.status(400).json({ message: "All required fields must be filled." });
        }

        const db = userDbService.getUserDbServiceInstance();

        const result = await db.registerNewUser(clientID, email, password, firstName, lastName, phoneNumber, creditCardNum, creditCardCVV, creditCardExp, homeAddress);

        response.status(201).json({ message: "User registration successful!", data: result });
    }
    catch (error) {
        console.error(error);
        response.status(500).json({ error: "An error occurred while registering user." });
    }
});


app.post('/login', async (request, response) => {

    app.use(bodyParser.json());

    const { clientID, password } = request.body;

    console.log("receiving clientID:", clientID); // debugging
    console.log("receiving password:", password); // debugging

    const db = userDbService.getUserDbServiceInstance();

    try {
        // Search for a user with both the matching clientID and password
        const result = await db.searchByClientIDAndPassword(clientID, password);

        // If no matching user is found, return an error
        if (!result) {
            return response.status(401).json({ error: "Invalid User ID or Password" });
        }

        // Successful login
        response.json({ success: true });
        // activeUser = clientID;
        // console.log("Active user: ", activeUser);
    } catch (err) {
        console.error(err);
        response.status(500).json({ error: "An error occurred while logging in." });
    }
});


app.get('/search/:firstName', (request, response) => { // we can debug by URL
    console.log("userApp.js - search by first name");
    const {firstName} = request.params;
    
    console.log(firstName);

    const db = userDbService.getUserDbServiceInstance();

    let result;
    if(firstName === "all") // in case we want to search all
       result = db.getAllData()
    else 
       result =  db.searchByFirstName(firstName); // call a DB function

    result
    .then(data => response.json({data: data}))
    .catch(err => console.log(err));
});



//search ClientDB by last name
app.get('/searchLastName/:lastName', (request, response) => {
    const { lastName } = request.params;
    //console.log(lastName);
    console.log(lastName);  // Debugging

    const db = userDbService.getUserDbServiceInstance();

    let result;
    if (lastName === "all") {
        // Return empty array if last name is not provided
        //result = Promise.resolve([]);
        result = db.getAllData()
    } else {
        // Proceed with searching by last name
        result = db.searchByLastName(lastName);
    }
    result

    .then(data => response.json({data: data}))
    .catch(err => console.log('Error: ', err));
});


//search ClientDB by first name and last name
app.get('/search/fullname/:firstName/:lastName', (request, response) => {
    const { firstName, lastName } = request.params;
    console.log(firstName, lastName);

    const db = userDbService.getUserDbServiceInstance();

    const result = db.searchByFirstAndLastName(firstName, lastName);

    result
        .then(data => response.json({ data: data }))
        .catch(err => {
            console.error("Error: ", err);
            response.status(500).json({ error: "An error occurred while searching ClientDB." });
    });
});


//search ClientDB by client id
app.get('/searchClientID/:clientID', (request, response) => {
    const { clientID } = request.params;
    console.log(clientID);  // Debugging

    const db = userDbService.getUserDbServiceInstance();

    let result;
    if (clientID === "all") {
        // Return empty array if last name is not provided
        //result = Promise.resolve([]);
        result = db.getAllData()
    } else {
        // Proceed with searching by last name
        result = db.searchByClientID(clientID);
    }
    result

    .then(data => response.json({data: data}))
    .catch(err => console.log('Error: ', err));
});

/*
app.get('/search/salary/:min/:max', (request, response) => {
    const { min, max } = request.params;

    const db = userDbService.getUserDbServiceInstance();

    const result = db.searchBySalary(min, max);

    result
        .then(data => response.json({ data: data }))
        .catch(err => console.log(err));
});
*/

/*
// Search ClientDB by age range
app.get('/search/age/:min/:max', (request, response) => {
    const { min, max } = request.params;
    
    const db = userDbService.getUserDbServiceInstance();

    const result = db.searchByAge(min, max);

    result
        .then(data => response.json({ data: data }))
        .catch(err => console.log(err));
});
*/

// Search ClientDB registered after specific user
app.get('/search/regAfter/:clientID', (request, response) => {
    const { clientID } = request.params;

    const db = userDbService.getUserDbServiceInstance();

    const result = db.searchAfterRegDate(clientID);

    result
        .then(data => response.json({ data: data }))
        .catch(err => console.log(err));
});

// Search ClientDB registered same day as specific user
app.get('/search/regSameDay/:clientID', (request, response) => {
    const { clientID } = request.params;

    const db = userDbService.getUserDbServiceInstance();

    const result = db.searchSameDayRegDate(clientID);

    result
        .then(data => response.json({ data: data }))
        .catch(err => console.log(err));
});


// Search ClientDB who never signed in
app.get('/search/neverSignedIn', (request, response) => {

    const db = userDbService.getUserDbServiceInstance();

    const result = db.searchNeverSignedIn();

    result
        .then(data => response.json({ data: data }))
        .catch(err => console.log(err));
});

// Search ClientDB who registered today
app.get('/search/regToday', (request, response) => {


    const db = userDbService.getUserDbServiceInstance();

    const result = db.searchRegToday();

    result
        .then(data => response.json({ data: data }))
        .catch(err => console.log(err));
});



// Route for searching ClientDB registered today
app.get('/search/RegisteredToday', async (request, response) => {
    try {
        const db = userDbService.getUserDbServiceInstance();
        const result = await db.searchByRegisteredToday();
        //response.json({ data: data });
        response.json({ data: result });
    } catch (err) {
        console.error(err);
        response.status(500).json({ error: "An error occurred while searching ClientDB." });
    }
});

// Route to fetch all quotes for david 
app.get('/quotes', (req, res) => {
    db.query('SELECT * FROM quotes', (err, results) => {
        if (err) {
            console.error('Error fetching quotes:', err);
            res.status(500).json({ error: 'Database query failed' });
        } else {
            res.json(results); // Send the quotes back to the client
        }
    });
});
//submit a new quote
// app.post('/quotes', async (req, res) => {
//     const { client_id, property_address, driveway_square_feet, proposed_price, client_note } = req.body;

//     if (!client_id || !property_address || !driveway_square_feet || !proposed_price) {
//         return res.status(400).json({ error: 'Required fields are missing.' });
//     }

//     try {
//         const [result] = await pool.query(
//             `INSERT INTO Quotes 
//             (client_id, property_address, driveway_square_feet, proposed_price, client_note, status, created_at) 
//             VALUES (?, ?, ?, ?, ?, "Pending", NOW())`,
//             [client_id, property_address, driveway_square_feet, proposed_price, client_note]
//         );
//         res.status(201).json({ quote_id: result.insertId });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Failed to submit quote.' });
//     }
// });

// Respond to a quote
// app.put('/quotes/:id/respond', async (req, res) => {
//     const { id } = req.params;
//     const { david_proposed_price, time_window_start, time_window_end, david_response_note, status } = req.body;

//     if (!david_proposed_price || !time_window_start || !time_window_end || !status) {
//         return res.status(400).json({ error: 'Required fields are missing.' });
//     }

//     try {
//         await pool.query(
//             `UPDATE Quotes 
//             SET david_proposed_price = ?, time_window_start = ?, time_window_end = ?, david_response_note = ?, status = ?, updated_at = NOW() 
//             WHERE quote_id = ?`,
//             [david_proposed_price, time_window_start, time_window_end, david_response_note, status, id]
//         );
//         res.sendStatus(200);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Failed to respond to quote.' });
//     }
// });

// Routes fir david
// const quotesRoutes = require('./routes/quotes');
// const workOrdersRoutes = require('./routes/workOrders');
// const billsRoutes = require('./routes/bills');

// app.use('/quotes', quotesRoutes);
// app.use('/workOrders', workOrdersRoutes);
// app.use('/bills', billsRoutes);
// New routes


// function acceptQuote(quoteID) {
//     const newPrice = document.getElementById(`new-price-${quoteID}`).value;

//     fetch(`/quotes/accept/${quoteID}`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ newPrice }),
//     })
//         .then(response => response.json())
//         .then(data => {
//             alert(data.message);
//             loadQuotes(); // Reload quotes
//         })
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
//         .then(data => {
//             alert(data.message);
//             loadQuotes(); // Reload quotes
//         })
//         .catch(error => console.error('Error:', error));
// }

// app.post('/quotes/reject/:quoteID', (req, res) => {
//     const { quoteID } = req.params;
//     const { rejectionNote, clientID } = req.body;
//     console.log('Received data:', { quoteID, counterPrice, startDate, endDate, addNote, clientID });

//     if (!rejectionNote) {
//         res.status(400).json({ error: 'Rejection note is required.' });
//         return;
//     }

//     const sql = `
//         INSERT INTO QuoteHistory (quoteID, clientID, addNote, status)
//         VALUES (?, ?, ?, 'Rejected')
//     `;

//     db.query(sql, [quoteID, clientID, rejectionNote], (err, result) => {
//         if (err) {
//             console.error('Error rejecting quote:', err);
//             res.status(500).json({ error: 'Failed to reject the quote.' });
//             return;
//         }

//         res.json({ message: `Quote ${quoteID} has been rejected.` });
//     });
// });

app.post('/quotes/counter/:quoteID', async (req, res) => {
    const { quoteID } = req.params;
    const { counterPrice, startDate, endDate, addNote, clientID } = req.body;

    if (!counterPrice || !startDate || !endDate || !clientID) {
        res.status(400).json({ error: 'All fields are required.' });
        return;
    }

    const sql = `
        INSERT INTO QuoteHistory (quoteID, clientID, proposedPrice, startDate, endDate, addNote, status)
        VALUES (?, ?, ?, ?, ?, ?, 'Pending')
    `;

    try {
        const result = await userDbService.query(sql, [quoteID, clientID, counterPrice, startDate, endDate, addNote]);
        res.json({ message: `Counter proposal for Quote ${quoteID} has been submitted.`, responseID: result.insertId });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Failed to insert counter proposal into QuoteHistory.' });
    }
});

// app.post('/quotes/reject/:quoteID', async (req, res) => {
//     const { quoteID } = req.params;
//     const { addNote, clientID } = req.body;

//     console.log('Rejecting quote:', { quoteID, addNote, clientID });

//     // Validate input
//     if (!addNote) {
//         res.status(400).json({ error: 'Rejection note is required.' });
//         return;
//     }

//     const sql = `
//         INSERT INTO QuoteHistory (quoteID, clientID, addNote, status)
//         VALUES (?, ?, ?, 'Rejected')
//     `;

//     try {
//         const result = await userDbService.query(sql, [quoteID, clientID, addNote]);
//         res.json({ message: `Quote ${quoteID} has been rejected.`, responseID: result.insertId });
//     } catch (err) {
//         console.error('Error rejecting quote:', err);
//         res.status(500).json({ error: 'Failed to reject the quote.' });
//     }
// });
// app.post('/quotes/reject/:quoteID', async (req, res) => {
//     const { quoteID } = req.params;
//     const { rejectionNote } = req.body;

//     console.log('Rejecting quote:', { quoteID, rejectionNote });

//     // Validate input
//     if (!rejectionNote || typeof rejectionNote !== 'string') {
//         res.status(400).json({ error: 'Rejection note must be a non-empty string.' });
//         return;
//     }

//     const sql = `
//         INSERT INTO QuoteHistory (quoteID, addNote, status)
//         VALUES (?, ?, 'Rejected')
//     `;

//     try {
//         const result = await userDbService.query(sql, [quoteID, rejectionNote]);
//         res.json({ message: `Quote ${quoteID} has been rejected.`, responseID: result.insertId });
//     } catch (err) {
//         console.error('Error rejecting quote:', err);
//         res.status(500).json({ error: 'Failed to reject the quote.' });
//     }
// });


// app.post('/quotes/reject/:quoteID', async (req, res) => {
//     const { quoteID } = req.params;
//     const { rejectionNote } = req.body;

//     console.log('Rejecting quote:', { quoteID, rejectionNote });

//     // Validate the rejection note
//     if (!rejectionNote || typeof rejectionNote !== 'string') {
//         return res.status(400).json({ error: 'Rejection note must be a non-empty string.' });
//     }

//     if (rejectionNote.length > 255) {
//         return res.status(400).json({ error: 'Rejection note is too long. Max length is 255 characters.' });
//     }

//     const sql = `
//         INSERT INTO QuoteHistory (quoteID, addNote, status)
//         VALUES (?, ?, 'Rejected')
//     `;

//     try {
//         const result = await userDbService.query(sql, [quoteID, rejectionNote]);
//         res.json({ message: `Quote ${quoteID} has been rejected.`, responseID: result.insertId });
//     } catch (err) {
//         console.error('Error rejecting quote:', err);
//         res.status(500).json({ error: 'Failed to reject the quote.' });
//     }
// });

app.post('/quotes/reject/:quoteID', async (req, res) => {
    const { quoteID } = req.params;
    const { rejectionNote, clientID } = req.body;

    console.log('Rejecting quote:', { quoteID, rejectionNote, clientID });

    if (!rejectionNote || !clientID) {
        return res.status(400).json({ error: 'Rejection note and client ID are required.' });
    }

    const sql = `
        INSERT INTO QuoteHistory (quoteID, clientID, addNote, status)
        VALUES (?, ?, ?, 'Rejected')
    `;

    try {
        const result = await userDbService.query(sql, [quoteID, clientID, rejectionNote]);
        res.json({ message: `Quote ${quoteID} has been rejected.`, responseID: result.insertId });
    } catch (err) {
        console.error('Error rejecting quote:', err);
        res.status(500).json({ error: 'Failed to reject the quote.' });
    }
});




//bills
// app.post('/invoices', (req, res) => {
//     const { workOrderID, clientID, amountDue } = req.body;

//     // Validate input
//     if (!workOrderID || !clientID || !amountDue) {
//         res.status(400).json({ success: false, error: 'Missing required fields.' });
//         return;
//     }

//     // Insert new invoice into the Invoice table
//     const sql = `
//         INSERT INTO Invoice (workOrderID, clientID, amountDue, dateCreated)
//         VALUES (?, ?, ?, NOW())
//     `;

//     db.query(sql, [workOrderID, clientID, amountDue], (err, result) => {
//         if (err) {
//             console.error('Error inserting invoice:', err);
//             res.status(500).json({ success: false, error: 'Database error.' });
//             return;
//         }

//         res.json({
//             success: true,
//             message: 'Invoice created successfully.',
//             invoiceID: result.insertId,
//         });
//     });
// });

//works 
// app.post('/invoices', (req, res) => {
//     const { workOrderID, clientID, amountDue } = req.body;

//     // Validate input
//     if (!workOrderID || !clientID || !amountDue) {
//         res.status(400).json({ success: false, error: 'Missing required fields.' });
//         return;
//     }

//     const sql = `
//         INSERT INTO Invoice (workOrderID, clientID, amountDue, dateCreated)
//         VALUES (?, ?, ?, NOW())
//     `;

//     db.query(sql, [workOrderID, clientID, amountDue], (err, result) => {
//         if (err) {
//             console.error('Error inserting invoice:', err);
//             res.status(500).json({ success: false, error: 'Database error.' });
//             return;
//         }

//         res.json({
//             success: true,
//             message: 'Invoice created successfully.',
//             invoiceID: result.insertId,
//         });
//     });
// });

// app.post('/invoices', (req, res) => {
//     console.log('Request body:', req.body); // Debug log
//     const { workOrderID, clientID, amountDue } = req.body;

//     if (!workOrderID || !clientID || !amountDue) {
//         res.status(400).json({ success: false, error: 'Missing required fields.' });
//         return;
//     }

//     const sql = `
//         INSERT INTO Invoice (workOrderID, clientID, amountDue, dateCreated)
//         VALUES (?, ?, ?, NOW())
//     `;

//     db.query(sql, [workOrderID, clientID, amountDue], (err, result) => {
//         if (err) {
//             console.error('Database error:', err);
//             res.status(500).json({ success: false, error: 'Database error.' });
//             return;
//         }

//         console.log('Invoice created with ID:', result.insertId); // Debug log
//         res.json({
//             success: true,
//             message: 'Invoice created successfully.',
//             invoiceID: result.insertId,
//         });
//     });
// });

//*****works perfectly******
// app.post('/invoices', (req, res) => {
//     console.log('Request received:', req.body); // Log the request data

//     const { workOrderID, clientID, amountDue } = req.body;

//     if (!workOrderID || !clientID || !amountDue) {
//         console.error('Missing fields:', { workOrderID, clientID, amountDue });
//         res.status(400).json({ success: false, error: 'Missing required fields.' });
//         return;
//     }

//     const sql = `
//         INSERT INTO Invoice (workOrderID, clientID, amountDue, dateCreated)
//         VALUES (?, ?, ?, NOW())
//     `;

//     db.query(sql, [workOrderID, clientID, amountDue], (err, result) => {
//         if (err) {
//             console.error('Database error:', err);
//             res.status(500).json({ success: false, error: 'Database error.' });
//             return;
//         }

//         console.log('Invoice created:', result.insertId); // Log success
//         res.json({ success: true, message: 'Invoice created successfully.', invoiceID: result.insertId });
//     });
// });
app.post('/invoices', (req, res) => {
    console.log('Request body:', req.body); // Log incoming request data

    const { workOrderID, clientID, amountDue } = req.body;

    if (!workOrderID || !clientID || !amountDue) {
        console.error('Missing required fields:', { workOrderID, clientID, amountDue });
        res.status(400).json({ success: false, error: 'Missing required fields.' });
        return;
    }

    const sql = `
        INSERT INTO Invoice (workOrderID, clientID, amountDue, dateCreated)
        VALUES (?, ?, ?, NOW())
    `;

    db.query(sql, [workOrderID, clientID, amountDue], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            res.status(500).json({ success: false, error: 'Database error.' });
            return;
        }

        console.log('Invoice created successfully:', result.insertId); // Log successful creation
        res.json({
            success: true,
            message: 'Invoice created successfully.',
            invoiceID: result.insertId,
        });
    });
});


//All quotes and bills
app.get("/quotehistory", (req, res) => {
    console.log("Fetching quote history...");
    const query = "SELECT * FROM QuoteHistory";
    userDbService.query(query, (err, results) => {
        if (err) {
            console.error("Database query error:", err);
            res.status(500).send("Server error");
        } else {
            console.log("Query results:", results);
            res.json(results);
        }
    });
});

//works******

// app.get("/workorders", (req, res) => {
//     const query = "SELECT workOrderID, clientID, dateRange, status FROM WorkOrder";

//     userDbService.query(query, (err, results) => {
//         if (err) {
//             console.error("Error fetching work orders:", err);
//             res.status(500).send("Server error");
//         } else {
//             res.json(results);
//         }
//     });
// });
// app.get("/workorders", (req, res) => {
//     const query = "SELECT workOrderID, clientID, dateRange, status FROM WorkOrder";

//     userDbService.query(query, (err, results) => {
//         if (err) {
//             console.error("Error fetching work orders:", err);
//             res.status(500).send("Server error");
//         } else {
//             res.json(results);
//         }
//     });
// });

app.put("/workorders/:workOrderID", (req, res) => {
    const { workOrderID } = req.params;
    const { status } = req.body;

    // Validate the status
    if (!["Scheduled", "Completed", "Cancelled"].includes(status)) {
        return res.status(400).json({ error: "Invalid status value." });
    }

    const query = `
        UPDATE WorkOrder
        SET status = ?
        WHERE workOrderID = ?;
    `;

    userDbService.query(query, [status, workOrderID], (err, result) => {
        if (err) {
            console.error("Error updating work order status:", err);
            res.status(500).send("Server error");
        } else {
            res.json({ message: `Work order #${workOrderID} updated to ${status}` });
        }
    });
});

app.get("/workorders", (req, res) => {
    const query = "SELECT workOrderID, clientID, dateRange, status FROM WorkOrder";

    userDbService.query(query, (err, results) => {
        if (err) {
            console.error("Error fetching work orders:", err);
            res.status(500).send("Server error");
        } else {
            res.json(results); // Send work orders as JSON
        }
    });
});

//revenue
app.get('/revenue', (req, res) => {
    const { startDate, endDate } = req.query;

    console.log("Received query parameters:", startDate, endDate);

    if (!startDate || !endDate) {
        return res.status(400).json({ error: "Start date and end date are required." });
    }

    const query = `
        SELECT 
            SUM(i.amountDue) AS totalRevenue
        FROM 
            WorkOrder w
        JOIN 
            Invoice i
        ON 
            w.workOrderID = i.workOrderID
        WHERE 
            w.status = 'Completed'
        AND 
            i.datePaid BETWEEN ? AND ?;
    `;

    userDbService.query(query, [startDate, endDate], (err, results) => {
        if (err) {
            console.error("Error calculating revenue:", err);
            res.status(500).send("Failed to calculate revenue");
        } else {
            const totalRevenue = results[0]?.totalRevenue || 0;
            res.json({ totalRevenue });
        }
    });
});











// debug function, will be deleted later
app.post('/debug', (request, response) => {
    // console.log(request.body); 

    const {debug} = request.body;
    console.log(debug);

    return response.json({success: true});
});   

// debug function: use http://localhost:5050/testdb to try a DB function
// should be deleted finally
app.get('/testdb', (request, response) => {
    
    const db = userDbService.getUserDbServiceInstance();

    
    const result =  db.deleteByClientID("14"); // call a DB function here, change it to the one you want

    result
    .then(data => response.json({data: data}))
    .catch(err => console.log(err));
});



// If port isn't set, then defaults to 5050
// This was my workaround to force my computer to recognize 
// the backend server without changing file ClientDB
const port = process.env.PORT || 5050;
// set up the web server listener
app.listen(port,
    () => {
        console.log("I am listening on the configured port " + process.env.PORT)
    }
);
