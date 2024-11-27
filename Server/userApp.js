// Server: application services, accessible by URIs

const express = require('express')
const cors = require ('cors')
const dotenv = require('dotenv')
dotenv.config()
const bodyParser = require('body-parser'); // Import body-parser

const app = express();
const userDbService = require('./userDbService');

app.use(cors());
app.use(express.json())
app.use(express.urlencoded({extended: false}));



// Read all data
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
