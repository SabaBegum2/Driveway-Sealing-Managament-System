// Server: application services, accessible by URIs

const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
dotenv.config()
const bodyParser = require('body-parser'); // Import body-parser

// Import the express-session library to manage user sessions
//const session = require('express-session');
const app = express();

const userDbService = require('./userDbService');

app.use(cors());
// app.use(cors({
//     origin: 'http://127.0.0.1:5500', // Replace with your frontend origin
//     credentials: true // Allow cookies and session credentials
// }));

app.use(express.json())
app.use(express.urlencoded({extended: false}));
let activeClient;

const fileUpload = require('express-fileupload');

// Enable file upload middleware
app.use(fileUpload());


// multer = require('multer');

//Function to serve static files from the uploads folder
// app.use('/uploads', (req, res, next) => {
//     const path = require('path'); // Import locally
//     const baseFolder = 'Driveway-Sealing-Management-System';
//     const projectBasePath = path.join(__dirname.split(baseFolder)[0], baseFolder);
//     const uploadsPath = path.join(projectBasePath, 'Server/uploads');

//     express.static(uploadsPath)(req, res, next); // Serve static files
// });



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



// // Helper function to save uploaded files
// function saveFile(file) {
//     const uploadPath = path.join(__dirname, 'uploads', file.name);

//     try {
//         file.mv(uploadPath, (err) => {
//             if (err) {
//                 console.error("Error saving file:", err);
//                 throw new Error("Failed to save file");
//             }
//         });
//         return uploadPath; // Return the saved file path for database storage
//     } catch (error) {
//         console.error("Failed to save file:", error);
//         throw error;
//     }
// }



// // Read all data
// app.get('/getAll', (request, response) => {
    
//     const db = userDbService.getUserDbServiceInstance();
    
//     const result = db.getAllClientData(); // call a DB function

//     result
//     .then(data => response.json({ data: data }))
//     .catch(err => console.log(err));
// });


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
