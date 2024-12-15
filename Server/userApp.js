// Server: application services, accessible by URIs

const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
dotenv.config()
const bodyParser = require('body-parser'); // Import body-parser

const app = express();

const userDbService = require('./userDbService');

app.use(cors());

app.use(express.json())
app.use(express.urlencoded({extended: false}));
let activeClient;

const fileUpload = require('express-fileupload');

// Enable file upload middleware
app.use(fileUpload());

app.use((req, res, next) => {
    res.setHeader("Content-Type", "application/json");
    next();
});



app.use(cors({
    origin: "http://127.0.0.1:5500", // Allow requests from your frontend
    credentials: true, // Include credentials if needed
}));


/* REGISTER NEW CLIENT */
app.post('/register', async(request, response) => {
    console.log("userApp: insert a row.");
    try {
        const {clientID, email, password, firstName, lastName, phoneNumber, creditCardNum, creditCardCVV, creditCardExp, homeAddress} = request.body;

        // Check for missing fields during page switches
        if (!clientID || !email || !password || !firstName || !lastName || !phoneNumber || !homeAddress) {
            return response.status(400).json({ message: "Error obtaining some fields." });
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


/* NEW LOGIN */
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
        activeClient = result.clientID;
        response.json({ success: true });

    } catch (err) {
        console.error(err);
        response.status(500).json({ error: "An error occurred while logging in." });
    }
});


/* GET ALL CLIENTID INFO */
app.get('/ClientDB/:clientID', (request, response) => {
    const { clientID } = request.params;
    console.log(clientID);  // Debugging

    const db = userDbService.getUserDbServiceInstance();
    const result =  db.getAllClientData(clientID); // call a DB function

    result
    .then(data => response.json({ data: data }))
    .catch(err => console.log('Error: ', err));
});


/* UPDATE CLIENT ACTIVE STATUS TO OFFLINE */
app.post('/logout/:clientID', async (request, response) => {
    const{ clientID, activeStatus } = request.body;
    console.log("Logging ", clientID, " out of app...");
    const db = userDbService.getUserDbServiceInstance();

    try {
        const result = await db.logoutClient(clientID);

        response.json({ success: true });
    } catch (err) {
        console.error(err);
        response.status(500).json({ error: "Failed to log out." });
    }
});


/* CREATE NEW QUOTE REQUEST */
const imagePath = require('path'); // For handling file paths
app.post('/newQuoteRequest', async (req, res) => {
    console.log("Received new quote request:", req.body);

    try {
        const { clientID, propertyAddress, drivewaySqft, proposedPrice, addNotes } = req.body;

        // Validate required fields
        if (!clientID || !propertyAddress || !drivewaySqft || !proposedPrice) {
            return res.status(400).json({ error: "All required fields must be filled." });
        }

        if (!req.files || Object.keys(req.files).length < 5) {
            return res.status(400).json({ error: "Please upload all 5 images." });
        }

        // Extract uploaded files
        const uploadedFiles = req.files;
        const filePaths = {
            fileInput1: saveFile(uploadedFiles.fileInput1),
            fileInput2: saveFile(uploadedFiles.fileInput2),
            fileInput3: saveFile(uploadedFiles.fileInput3),
            fileInput4: saveFile(uploadedFiles.fileInput4),
            fileInput5: saveFile(uploadedFiles.fileInput5),
        };

        console.log("Saved file paths:", filePaths);

        // Call database function to save the quote request and images
        const db = userDbService.getUserDbServiceInstance();
        const result = await db.createQuoteRequest(clientID, propertyAddress, drivewaySqft, proposedPrice, addNotes, filePaths);

        res.status(201).json({ success: true, data: result });
    } catch (error) {
        console.error("Error processing new quote request:", error);
        res.status(500).json({ error: "An error occurred while processing the quote request." });
    }
});

function saveFile(file) {
    //const path = require('path'); // Import locally within the function
    const baseFolder = 'Driveway-Sealing-Management-System';

    // Construct the relative path dynamically
    const projectBasePath = imagePath.join(__dirname.split(baseFolder)[0], baseFolder);
    console.log("Project base path:", projectBasePath);
    const uploadPath = imagePath.join(projectBasePath, 'Server/uploads', file.name);
    console.log("Upload path:", uploadPath);

    try {
        file.mv(uploadPath, (err) => {
            if (err) {
                console.error("Error saving file:", err);
                throw new Error("Failed to save file");
            }
        });
        // Return a relative URL for database storage
        return `/uploads/${file.name}`;
    } catch (error) {
        console.error("Failed to save file:", error);
        throw error;
    }
}


/* GET CLIENT QUOTE HISTORY */
app.get('/Client/QuoteHistory/:clientID', async (request, response) => {
    const { clientID } = request.params;
    console.log("Getting quote history for ", clientID ,"...");

    const db = userDbService.getUserDbServiceInstance();

    try {
        const data = await db.getQuoteHistoryTable(clientID); // Fetch quote history
        response.json({ data: data }); // Return the fetched data
    } catch (err) {
        console.error('Error in userApp fetching quote history: ', err);
        response.status(500).json({ error: "Failed to fetch quote history." });
    }
    
});


/* GET CLIENT QUOTE RESPONSE */
app.post('/Client/QuoteHistory/Response/:responseID', async (request, response) => {
    const { responseID } = request.params;
    const { proposedPrice, startDate, endDate, addNote } = request.body;

    console.log(`Inserting new response for: ${responseID}`); //quoteID: ${quoteID}`);
    const db = userDbService.getUserDbServiceInstance();

    try {
        const result = await db.insertQuoteResponse(responseID, proposedPrice, startDate, endDate, addNote);
        response.json({ success: true, message: "Response inserted successfully." });
    } catch (err) {
        console.error(err);
        response.status(500).json({ error: "Failed to insert quote response." });
    }
});


/* GET CLIENT ACCEPT FOR QUOTE */
app.put('/Client/QuoteHistory/Accept/:responseID', async (request, response) => {
    const { responseID } = request.params;

    console.log(`Accepting quote with responseID: ${responseID}`);
    const db = userDbService.getUserDbServiceInstance();

    try {
        const result = await db.acceptQuoteResponse(responseID);
        response.json({ success: true, message: "Invoice successfully paid." });
    } catch (err) {
        console.error(err);
        response.status(500).json({ error: "Failed to accept quote." });
    }
});


/* GET CLIENT WORK ORDER HISTORY */
app.get('/Client/WorkOrderHistory/:clientID', async (request, response) => {
    const { clientID } = request.params;
    console.log("Getting work order history for ", clientID ,"...");
    const db = userDbService.getUserDbServiceInstance();

    try {
        const data = await db.getWorkOrderHistory(clientID);
        response.json({ data: data});
    } catch (err) {
        console.error('Error in userApp fetching work order history: ', err);
        response.status(500).json({ error: 'Failed to retrieve quote history in app.' });
    }
});


/* GET CLIENT CANCELLATION FOR ORDER */
app.put('/Client/WorkOrderHistory/Cancel/:workOrderID', async (request, response) => {
    const { workOrderID } = request.params;

    console.log(`Accepting quote with workOrderID: ${workOrderID}`);
    const db = userDbService.getUserDbServiceInstance();

    try {
        const result = await db.cancelWorkOrder(workOrderID);
        response.json({ success: true, message: "Order successfully cancelled." });
    } catch (err) {
        console.error(err);
        response.status(500).json({ error: "Failed to cancel order." });
    }
});


// GET CLIENT INVOICE HISTORY
app.get('/Client/Invoices/:clientID', async (request, response) => {
    const { clientID } = request.params;
    const db = userDbService.getUserDbServiceInstance();

    try {
        const data = await db.getInvoiceHistory(clientID);
        response.json({ data: data});
    } catch (err) {
        console.error('Error in userApp fetching invoice history: ', err);
        response.status(500).json({ error: 'Failed to retrieve invoice history in app.' });
    }
});


/* GET CLIENT INVOICE RESPONSE */
app.post('/Client/Invoices/Response/:invoiceID', async (request, response) => {
    const { invoiceID } = request.params;
    const { clientID, responseNote } = request.body;

    console.log(`Inserting new response for: ${invoiceID}`);
    const db = userDbService.getUserDbServiceInstance();

    try {
        const result = await db.insertInvoiceResponse(invoiceID, clientID, responseNote);
        // const result = await db.insertInvoiceResponse(invoiceID, amountDue, responseNote);
        response.json({ success: true, message: "Response inserted successfully." });
    } catch (err) {
        console.error(err);
        response.status(500).json({ error: "Failed to insert invoice response." });
    }
});


/* INVOICE ACCEPTED AND PAID BY CLIENT */
app.put('/Client/Invoices/Accept/:invoiceID', async (request, response) => {
    const { invoiceID } = request.params;

    console.log(`Accepting invoice with responseID: ${invoiceID}`);
    const db = userDbService.getUserDbServiceInstance();

    try {
        const result = await db.acceptInvoiceResponse(invoiceID);
        response.json({ success: true, message: "Invoice accepted successfully." });
    } catch (err) {
        console.error(err);
        response.status(500).json({ error: "Failed to accept invoice." });
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




/* -------------------------------------------------------- */
/* ------------------- David's Dashboard ------------------ */
/* -------------------------------------------------------- */

//works
app.get('/quotes', (req, res) => {
    const db = userDbService.getUserDbServiceInstance();

    db.getAllQuotes()
        .then((data) => res.json(data))
        .catch((err) => {
            console.error('Error fetching quotes:', err.message);
            res.status(500).json({ error: 'Database query failed', details: err.message });
        });
});


app.post("/quotes/accept", async (req, res) => {
    const { clientID, quoteID, proposedPrice, startDate, endDate, addNote } = req.body;

    if (!clientID || !quoteID || !proposedPrice || !startDate || !endDate || !addNote) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        // 1. Insert into QuoteHistory and get responseID
        const db = userDbService.getUserDbServiceInstance();
        const responseID = await db.acceptQuote(clientID, quoteID, proposedPrice, startDate, endDate, addNote);

        // 2. Format date range for WorkOrder
        const dateRange = `${startDate} to ${endDate}`;

        // 3. Insert into WorkOrder table
        await db.createWorkOrder(clientID, quoteID, responseID, dateRange);

        // Fetch original quote details
        const originalQuote = await db.getQuoteDetails(quoteID);

        res.json({
            message: "Quote accepted successfully and WorkOrder created.",
            clientID: originalQuote.clientID,
            propertyAddress: originalQuote.propertyAddress,
            drivewaySqft: originalQuote.drivewaySqft,
            originalProposedPrice: originalQuote.proposedPrice,
            originalNote: originalQuote.addNote,
        });
    } catch (err) {
        console.error("Error in /quotes/accept:", err.message);
        res.status(500).json({ error: "Failed to accept quote and create WorkOrder." });
    }
});





// Reject a Quote
app.post("/quotes/reject", async (req, res) => {
    const { clientID, quoteID, addNote } = req.body;

    if (!clientID || !quoteID || !addNote) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const db = userDbService.getUserDbServiceInstance();
        await db.rejectQuote(clientID, quoteID, addNote);
        res.json({ message: "Quote rejected successfully" });
    } catch (err) {
        console.error("Error rejecting quote:", err.message);
        res.status(500).json({ error: "Failed to reject quote" });
    }
});



app.get("/invoices/generate", async (req, res) => {
    const { workOrderID, clientID, amountDue, discount = 0 } = req.query;

    if (!workOrderID || !clientID || !amountDue) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const db = userDbService.getUserDbServiceInstance();

        // Check if workOrderID and clientID exist
        const isValidWorkOrder = await db.checkWorkOrder(workOrderID);
        const isValidClient = await db.checkClient(clientID);

        if (!isValidWorkOrder || !isValidClient) {
            return res.status(400).json({ error: "Invalid workOrderID or clientID" });
        }

        // Generate the invoice
        const result = await db.generateInvoice(workOrderID, clientID, amountDue, discount);

        res.json({
            message: "Invoice generated successfully",
            invoiceID: result.insertId,
        });
    } catch (err) {
        console.error("Error generating invoice:", err.message);
        res.status(500).json({ error: "Failed to generate invoice", details: err.message });
    }
});

//responses from clients on quotes
app.get("/invoiceresponses", async (req, res) => {
    try {
        const db = userDbService.getUserDbServiceInstance();
        const responses = await db.getAllInvoiceResponses();
        res.json(responses);
    } catch (error) {
        console.error("Error fetching invoice responses:", error.message);
        res.status(500).json({ error: "Failed to fetch invoice responses" });
    }
});


//options for david to respond to the invoices
app.post("/invoiceresponses/respond", async (req, res) => {
    console.log("Request Body:", req.body);

    const { responseID, action, note, quoteID, clientID } = req.body;

    if (!responseID || !action || !quoteID || !clientID) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const db = userDbService.getUserDbServiceInstance();

        if (action === "accept") {
            // Update InvoiceResponses
            await db.updateInvoiceResponseStatus(responseID, "Accepted");
            // Update QuoteHistory
            await db.updateQuoteHistoryStatus(quoteID, clientID, "Accepted", "Invoice Accepted");

            return res.json({ message: "Invoice accepted and QuoteHistory updated." });
        }

        if (action === "reject") {
            if (!note) {
                return res.status(400).json({ error: "Note is required for rejection." });
            }
            // Update InvoiceResponses
            await db.updateInvoiceResponseStatus(responseID, "Rejected", note);
            // Update QuoteHistory
            await db.updateQuoteHistoryStatus(quoteID, clientID, "Rejected", note);

            return res.json({ message: "Invoice rejected and QuoteHistory updated." });
        }

        if (action === "suggest") {
            return res.json({ message: "Please create a new invoice for the suggested price." });
        }

        return res.status(400).json({ error: "Invalid action." });
    } catch (error) {
        console.error("Error responding to invoice:", error.message);
        res.status(500).json({ error: "Failed to process invoice response." });
    }
});

app.get("/workorders", async (req, res) => {
    try {
        const db = userDbService.getUserDbServiceInstance();
        const workOrders = await db.getAllWorkOrders();
        res.json({ workOrders });
    } catch (err) {
        console.error("Error fetching work orders:", err.message);
        res.status(500).json({ error: "Failed to fetch work orders." });
    }
});

app.post("/workorders/complete", async (req, res) => {
    const { workOrderID } = req.body;

    if (!workOrderID) {
        return res.status(400).json({ error: "Missing workOrderID." });
    }

    try {
        const db = userDbService.getUserDbServiceInstance();
        await db.completeWorkOrder(workOrderID);
        res.json({ message: "Work order marked as completed." });
    } catch (err) {
        console.error("Error marking work order as completed:", err.message);
        res.status(500).json({ error: "Failed to complete work order." });
    }
});

app.get('/revenueReport', async (req, res) => {
    const { startDate, endDate } = req.query;

    const db = userDbService.getUserDbServiceInstance();
    if (!startDate || !endDate) {
        return res.status(400).json({ error: 'startDate and endDate are required.' });
    }

    const query = `
        SELECT 
            SUM(qh.proposedPrice) AS totalRevenue,
            COUNT(wo.workOrderID) AS totalCompletedWorkOrders,
            GROUP_CONCAT(DISTINCT qh.clientID) AS clientIDs
        FROM WorkOrder wo
        JOIN QuoteHistory qh 
            ON wo.responseID = qh.responseID
        WHERE wo.status = 'Completed'
          AND qh.startDate BETWEEN ? AND ?
          AND qh.endDate BETWEEN ? AND ?
    `;

    try {
        const results = await db.query(query, [startDate, endDate, startDate, endDate]);
        res.json({
            startDate,
            endDate,
            totalRevenue: results[0]?.totalRevenue || 0,
            totalCompletedWorkOrders: results[0]?.totalCompletedWorkOrders || 0,
            clientIDs: results[0]?.clientIDs || null
        });
    } catch (err) {
        console.error('Error executing query:', err.message);
        res.status(500).json({ error: 'Failed to generate revenue report.' });
    }
});




/////////////////////// David Queries ////////////////////////////

// Endpoint: Big Clients
app.get('/big-clients', (req, res) => {
    const db = userDbService.getUserDbServiceInstance();
    const query = `
        SELECT 
            clientID, 
            COUNT(workOrderID) AS completedOrders
        FROM 
            WorkOrder
        WHERE 
            status = 'Completed'
        GROUP BY 
            clientID
        HAVING 
            COUNT(workOrderID) = (
                SELECT MAX(orderCount)
                FROM (
                    SELECT COUNT(workOrderID) AS orderCount
                    FROM WorkOrder
                    WHERE status = 'Completed'
                    GROUP BY clientID
                ) AS subquery
            );
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Database query failed' });
        } else {
            res.json(results);
        }
    });
});

// Endpoint: Difficult clients
app.get('/difficult-clients', (req, res) => {
    const db = userDbService.getUserDbServiceInstance();
    const query = `
        WITH PendingCounts AS (
            SELECT 
                qh.clientID,
                qh.quoteID,
                COUNT(*) AS pendingCount
            FROM QuoteHistory qh
            WHERE qh.status = 'Pending'
            GROUP BY qh.clientID, qh.quoteID
        ),
        ClientsWithThreeOrMoreRequests AS (
            SELECT 
                pc.clientID,
                GROUP_CONCAT(pc.quoteID) AS quoteIDs -- Collect the quoteIDs for the client
            FROM PendingCounts pc
            WHERE pc.pendingCount = 2 -- Exactly 2 'Pending' statuses per quoteID
            GROUP BY pc.clientID
            HAVING COUNT(pc.quoteID) >= 3 -- Check for 3 or more quoteIDs with this pattern
        )
        SELECT DISTINCT 
            c.clientID,
            c.firstName,
            c.lastName,
            c.email,
            ct.quoteIDs
        FROM ClientsWithThreeOrMoreRequests ct
        JOIN ClientDB c ON c.clientID = ct.clientID;
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Database query failed:', err.sqlMessage || err.message);
            res.status(500).json({
                error: 'Database query failed',
                details: err.sqlMessage || err.message,
            });
            return;
        }
        res.json(results);
    });
});

// Endpoint: This Month Quotes
app.get('/this-month-quotes', (req, res) => {
    const db = userDbService.getUserDbServiceInstance();
    const query = `
        SELECT 
            qh.responseID,
            qh.quoteID,
            qh.clientID,
            qh.proposedPrice,
            qh.startDate,
            qh.endDate,
            qh.addNote,
            qh.status,
            qh.responseDate
        FROM 
            QuoteHistory qh
        WHERE 
            qh.status = 'Accepted'
            AND MONTH(qh.responseDate) = MONTH(CURDATE())
            AND YEAR(qh.responseDate) = YEAR(CURDATE());
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Database query failed' });
            return;
        }
        res.json(results);
    });
});

// Endpoint: Prospective Clients
app.get('/prospective-clients', (req, res) => {
    const db = userDbService.getUserDbServiceInstance();
    const query = `
        SELECT 
            c.clientID, 
            c.firstName, 
            c.lastName, 
            c.email, 
            c.registerDate
        FROM 
            ClientDB c
        WHERE 
            NOT EXISTS (
                SELECT 1
                FROM QuoteRequest q
                WHERE c.clientID = q.clientID
            );
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Database query failed' });
            return;
        }
        res.json(results);
    });
});

// Endpoint: Largest Driveway
app.get('/largest-driveway', (req, res) => {
    const db = userDbService.getUserDbServiceInstance();
    const query = `
        WITH MaxDriveway AS (
            SELECT MAX(q.drivewaySqft) AS maxSqft
            FROM WorkOrder w
            JOIN QuoteRequest q ON w.quoteID = q.quoteID
        )
        SELECT 
            w.clientID, 
            w.workOrderID, 
            w.quoteID, 
            q.propertyAddress, 
            q.drivewaySqft, 
            w.dateRange
        FROM 
            WorkOrder w
        JOIN 
            QuoteRequest q ON w.quoteID = q.quoteID
        JOIN 
            MaxDriveway m ON q.drivewaySqft = m.maxSqft;
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Database query failed' });
            return;
        }
        res.json(results);
    });
});

// Endpoint: Overdue Bills
app.get('/overdue-bills', (req, res) => {
    const db = userDbService.getUserDbServiceInstance();

    const selectQuery = `
        SELECT DISTINCT 
            c.clientID, 
            c.firstName, 
            c.lastName, 
            c.email,
            i.invoiceID,
            i.dateCreated,
            i.datePaid,
            i.amountDue
        FROM 
            ClientDB c
        JOIN 
            Invoice i ON c.clientID = i.clientID
        WHERE 
            i.datePaid IS NULL 
            AND i.dateCreated IS NOT NULL
            AND DATEDIFF(CURDATE(), i.dateCreated) > 7;
    `;

    db.query(selectQuery, (err, results) => {
        if (err) {
            console.error('Database query failed:', err.sqlMessage || err.message);
            res.status(500).json({
                error: 'Failed to load overdue bills',
                details: err.sqlMessage || err.message,
            });
            return;
        }
        res.json(results);
    });
});





// Endpoint: Bad Clients
app.get('/bad-clients', (req, res) => {
    const db = userDbService.getUserDbServiceInstance();
    const query = `
        SELECT DISTINCT 
            c.clientID, 
            c.firstName, 
            c.lastName, 
            c.email,
            i.invoiceID,
            i.dateCreated
        FROM 
            ClientDB c
        JOIN 
            Invoice i ON c.clientID = i.clientID
        WHERE 
            i.datePaid IS NULL 
            AND DATEDIFF(CURDATE(), i.dateCreated) > 7;
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Database query failed:', err.sqlMessage || err.message);
            res.status(500).json({
                error: 'Database query failed',
                details: err.sqlMessage || err.message,
            });
            return;
        }
        res.json(results);
    });
});



// Endpoint: Good Clients
app.get('/good-clients', (req, res) => {
    const db = userDbService.getUserDbServiceInstance();
    const query = `
        SELECT DISTINCT 
            c.clientID, 
            c.firstName, 
            c.lastName, 
            c.email, 
            i.invoiceID, 
            i.dateCreated, 
            i.datePaid
        FROM 
            ClientDB c
        JOIN 
            Invoice i ON c.clientID = i.clientID
        WHERE 
            i.datePaid IS NOT NULL 
            AND TIMESTAMPDIFF(HOUR, i.dateCreated, i.datePaid) <= 24;
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Database query failed' });
            return;
        }
        res.json(results);
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
