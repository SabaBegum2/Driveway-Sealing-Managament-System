// database services, accessible by userDbService methods.

const mysql = require('mysql');
const dotenv = require('dotenv');
dotenv.config(); // read from .env file
//const {promisify} = require('util');

let instance = null; 

// if you use .env to configure
//dotenv.config({ path: './Server/.env'}); //

console.log("HOST: " + process.env.HOST);
console.log("DB USER: " + process.env.DB_USER);
console.log("PASSWORD: " + process.env.PASSWORD);
console.log("DATABASE: " + process.env.DATABASE);
console.log("DB PORT: " + process.env.DB_PORT);
const connection = mysql.createConnection({
   host: process.env.HOST,
   user: process.env.DB_USER,
   password: process.env.PASSWORD,
   database: process.env.DATABASE,
   port: process.env.DB_PORT
});

// if you configure directly in this file, there is a security issue, but it will work
// const connection = mysql.createConnection({
//    host:"localhost",
//    user:"root",
//    password:"",
//    database:"web_app",
//    port:3306
// });

connection.connect((err) => {
   if (err) {
      console.log(err.message);
   }
   console.log('db ' + connection.state); // to see if the DB is connected or not
});

// Test a query
connection.query('SELECT 1 + 1 AS solution', (error, results) => {
   if (error) {
      console.error('Query failed:', error.message);
   } else {
      console.log('Test query result:', results[0].solution);
   }
});
// the following are database functions,

class userDbService {
   static getUserDbServiceInstance() {
      return instance ? instance : new userDbService();
   }

   async getAllClientData() {
      try {
         // use await to call an asynchronous function
         const response = await new Promise((resolve, reject) => {
            const query = "SELECT * FROM ClientDB;";
            connection.query(query,
               (err, results) => {
                  if (err) reject(new Error(err.message));
                  else resolve(results);
               }
            );
         });
         return response;

      } catch (error) {
         console.log(error);
      }
   }

   // async getAllData() {
   //    try {
   //       // use await to call an asynchronous function
   //       const response = await new Promise((resolve, reject) => {
   //          const query = "SELECT * FROM ClientDB;";
   //          connection.query(query,
   //             (err, results) => {
   //                if (err) reject(new Error(err.message));
   //                else resolve(results);
   //             }
   //          );
   //       });
   //       return response;

   //    } catch (error) {
   //       console.log(error);
   //    }
   // }

   // FOR REGISTRATION
   async registerNewUser(clientID, email, password, firstName, lastName, phoneNumber, creditCardNum, creditCardCVV, creditCardExp, homeAddress) {
      const active = "online"
      try {
         // const registerDate = new Date().toISOString().split('T')[0];
         const registerDate = new Date();
         console.log("registerDate: ", registerDate);
         let timeLoggedIn = new Date('0000-00-00 00:00:00.00');

         const insertProfile = await new Promise((resolve, reject) => {
            const query = "INSERT INTO ClientDB (clientID, email, password, firstName, lastName, phoneNumber, creditCardNum, creditCardCVV, creditCardExp, homeAddress, registerDate, loginTime) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
            connection.query(query, [clientID, email, password, firstName, lastName, phoneNumber, creditCardNum, creditCardCVV, creditCardExp, homeAddress, registerDate, timeLoggedIn], (err, results) => {
               if (err) reject(new Error(err.message));
               else resolve(results.insertProfile);
            });
         });
         console.log(insertProfile); // for debugging to see the result of select
         return {
            clientID: clientID,
            email: email,
            password: password,
            firstName: firstName,
            lastName: lastName,
            phoneNumber: phoneNumber,
            creditCardNum: creditCardNum,
            creditCardCVV: creditCardCVV,
            creditCardExp: creditCardExp,
            homeAddress: homeAddress,
            registerDate: registerDate,
            loginTime: timeLoggedIn,
         }
      } catch (error) {
         console.log(error);
         throw error;
      }
   }

   // FOR LOGIN
   async searchByClientIDAndPassword(clientID, password) {
      const newLoginTime = new Date();

      try {
         const response = await new Promise((resolve, reject) => {
            const query = "SELECT * FROM ClientDB WHERE clientID = ? AND password = ?;";
            console.log("executing query:", query, [clientID, password]); // debugging
            connection.query(query, [clientID, password], (err, results) => {
               if (err) {
                  reject(new Error(err.message));
               } else {
                  resolve(results);
               }
            });
            const datequery = "UPDATE ClientDB SET loginTime = ? WHERE clientID = ? AND password = ?;";
            console.log("executing sign in date query:", datequery, [newLoginTime, clientID, password]); // debugging
            connection.query(datequery, [newLoginTime, clientID, password], (err, results) => {
               if (err) {
                  reject(new Error(err.message));
               } else {
                  resolve(results);
               }
            });
         });

         // If the response has results, return the first result (assuming clientIDs are unique)
         if (response.length > 0) {
            return response[0]; // Return the user object
         } else {
            return null; // No user found
         }

      } catch (error) {
         console.error("Database query error:", error);
         return null; // Return null on error
      }
   }

   async searchByClientID(clientID) {
      try {
         // use await to call an asynchronous function
         const response = await new Promise((resolve, reject) => {
            const query = "SELECT * FROM ClientDB WHERE clientID = ?;";
            connection.query(query, [clientID], (err, results) => {
               if (err) reject(new Error(err.message));
               else resolve(results);
            });
         });
         // console.log(response); // for debugging to see the result of select
         return response;
      } catch (error) {
         console.error("Error: ", error);
      }
   }

   // Search ClientDB by first name
   async searchByFirstName(firstName) {
      try {
         const response = await new Promise((resolve, reject) => {
            const query = "SELECT * FROM ClientDB WHERE firstName LIKE ?;";
            connection.query(query, [firstName], (err, results) => {
               if (err) reject(new Error(err.message));
               else resolve(results);
            });
         });
         return response;
      } catch (error) {
         console.log(error);
         // console.error("Error in searchByFirstName: ", error);
         // throw error; // Ensure the error is propagated
      }
   }

   // Search ClientDB by last name
   async searchByLastName(lastName) {
      try {
         const response = await new Promise((resolve, reject) => {
            const query = "SELECT * FROM ClientDB WHERE lastName LIKE ?;";
            connection.query(query, [lastName], (err, results) => {
               if (err) reject(new Error(err.message));
               else resolve(results);
            });
         });
         return response;
      } catch (error) {
         console.error("Error in searchByLastName:", error);
      }
   }

   // Search ClientDB by first and last name
   async searchByFirstAndLastName(firstName, lastName) {
      try {
         const response = await new Promise((resolve, reject) => {
            const query = "SELECT * FROM ClientDB WHERE firstName LIKE ? AND lastName LIKE ?;";
            connection.query(query, [`%${firstName}%`, `%${lastName}%`], (err, results) => {
               if (err) reject(new Error(err.message));
               else resolve(results);
            });
         });
         return response;
      } catch (error) {
         console.log(error);
      }
   }

   // Search ClientDB by clientID
   async searchByClientID(clientID) {
      try {
         const response = await new Promise((resolve, reject) => {
            const query = "SELECT * FROM ClientDB WHERE clientID LIKE ?;";
            connection.query(query, [clientID], (err, results) => {
               if (err) reject(new Error(err.message));
               else resolve(results);
            });
         });
         return response;
      } catch (error) {
         console.error("Error in searchByClientID:", error);
      }
   }

   // Search ClientDB by salary range
   async searchBySalary(minSalary, maxSalary) {
      try {
         const response = await new Promise((resolve, reject) => {
            const query = "SELECT * FROM ClientDB WHERE salary BETWEEN ? AND ?;";
            connection.query(query, [minSalary, maxSalary], (err, results) => {
               if (err) reject(new Error(err.message));
               else resolve(results);
            });
         });
         return response;
      } catch (error) {
         console.log(error);
      }
   }

   // Search ClientDB by age range
   async searchByAge(minAge, maxAge) {
      try {
         const response = await new Promise((resolve, reject) => {
            const query = "SELECT * FROM ClientDB WHERE age BETWEEN ? AND ?;";
            connection.query(query, [minAge, maxAge], (err, results) => {
               if (err) reject(new Error(err.message));
               else resolve(results);
            });
         });
         return response;
      } catch (error) {
         console.log(error);
      }
   }

   // Search ClientDB registered after specific user
   async searchAfterRegDate(clientID) {
      try {
         const response = await new Promise((resolve, reject) => {
            const query = "SELECT * FROM ClientDB WHERE registerDate > (SELECT registerDate FROM ClientDB WHERE clientID = ?);";
            connection.query(query, [clientID], (err, results) => {
               if (err) reject(new Error(err.message));
               else resolve(results);
            });
         });
         console.log(response); // for debugging to see the result of select
         return response;
      } catch (error) {
         console.error(error);
      }
   }

   // Search ClientDB registered on same day as user
   async searchSameDayRegDate(clientID) {
      try {
         const response = await new Promise((resolve, reject) => {
            const query = "SELECT * FROM ClientDB WHERE registerDate = (SELECT registerDate FROM ClientDB WHERE clientID = ?);";
            connection.query(query, [clientID], (err, results) => {
               if (err) reject(new Error(err.message));
               else resolve(results);
            });
         });
         console.log(response); // for debugging to see the result of select
         return response;
      } catch (error) {
         console.error(error);
      }
   }

   // Search ClientDB who never signed in
   async searchNeverSignedIn() {
      // const emptyDate = '0000-00-00 00:00:00.00';
      let emptyDate = new Date('0000-00-00 00:00:00.00');

      // let emptyDate = 'null';
      // const emptyDate = "";
      try {
         const response = await new Promise((resolve, reject) => {
            const query = "SELECT * FROM ClientDB WHERE loginTime IS NULL;";
            connection.query(query, (err, results) => {
               if (err) reject(new Error(err.message));
               else resolve(results);
            });
         });
         return response;
      } catch (error) {
         console.log(error);
      }
   }

   // Search ClientDB who registered today
   async searchRegToday() {
      try {
         const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
         const response = await new Promise((resolve, reject) => {
            const query = "SELECT * FROM ClientDB WHERE registerDate = ?;";
            connection.query(query, [today], (err, results) => {
               if (err) reject(new Error(err.message));
               else resolve(results);
            });
         });
         return response;
      } catch (error) {
         console.log(error);
      }
   }
}

module.exports = userDbService;
module.exports = connection;
