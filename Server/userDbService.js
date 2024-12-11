// database services, accessible by userDbService methods.

const mysql = require('mysql');
const dotenv = require('dotenv');
dotenv.config(); // read from .env file

let instance = null; 

// if you use .env to configure

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

// the following are database functions,

class userDbService {
   static getUserDbServiceInstance() {
      return instance ? instance : new userDbService();
   }

   async getAllClientData(clientID) {
      try {
         // use await to call an asynchronous function
         const response = await new Promise((resolve, reject) => {
            const query = "SELECT * FROM ClientDB WHERE clientID LIKE ?;";
            connection.query(query, [clientID], (err, results) => {
                  if (err) reject(new Error(err.message));
                  else resolve(results);
               }
            );
         });
         return response;
      } catch (error) {
         console.log("Error in getAllClientData: ", error);
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

      try {
         // const registerDate = new Date().toISOString().split('T')[0];
         const register = new Date();
         console.log("registerDate: ", register);
         let timeLoggedIn = new Date('0000-00-00 00:00:00.00');

         const insertProfile = await new Promise((resolve, reject) => {
            const query = "INSERT INTO ClientDB (clientID, email, password, firstName, lastName, phoneNumber, creditCardNum, creditCardCVV, creditCardExp, homeAddress, registerDate, loginTime) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
            connection.query(query, [clientID, email, password, firstName, lastName, phoneNumber, creditCardNum, creditCardCVV, creditCardExp, homeAddress, register, timeLoggedIn], (err, results) => {
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
            registerDate: register,
            loginTime: timeLoggedIn,
         }
      } catch (error) {
         console.log(error);
         console.error("Error in registerNewUser: ", error);
         throw error;
      }
   }

   // FOR LOGIN
   async searchByClientIDAndPassword(clientID, password) {
      const newLoginTime = new Date();
      const active = 'online';

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
            const datequery = "UPDATE ClientDB SET loginTime = ?, activeStatus = ? WHERE clientID = ? AND password = ?;";
            console.log("executing sign in date query:", datequery, [newLoginTime, active, clientID, password]); // debugging
            connection.query(datequery, [newLoginTime, active, clientID, password], (err, results) => {
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

   // Search ClientDB by username and change active status to offline
   async logoutClient(clientID, activeStatus) {
      console.log("Logging out client with ID:", clientID); // Debugging
      activeStatus = 'offline';
      try {
         const response = await new Promise((resolve, reject) => {
            const query = "UPDATE ClientDB SET activeStatus = ? WHERE clientID = ?";
            connection.query(query, [activeStatus, clientID], (err, results) => {
               if (err) reject(new Error(err.message));
               else resolve(results);
            });
         });
         return response;
      } catch (error) {
         console.error("Error logging Client out:", error);
      }
   }


   async createQuoteRequest(clientID, propertyAddress, drivewaySqft, proposedPrice, addNote, imagePaths) {
      console.log("Creating new quote request for clientID:", clientID); // Debugging
      try {
            //const createDate = new Date(); // Current timestamp
            // Insert into QuoteRequest table
            const insertProfile = await new Promise((resolve, reject) => {
               const query = "INSERT INTO QuoteRequest (clientID, propertyAddress, drivewaySqft, proposedPrice, addNote) VALUES (?, ?, ?, ?, ?);";
               connection.query(query, [clientID, propertyAddress, drivewaySqft, proposedPrice, addNote], (err, results) => {
                  if (err) reject(new Error(err.message));
                  else resolve(results.insertId); // Get the auto-generated quoteID
               });
            });
            console.log("New quote request successfully inserted (text portion) for clientID:", clientID); // Debugging

            const quoteID = insertProfile; // Use the auto-generated quoteID

            // Insert images into QuoteRequestImage table
            const insertImages = await new Promise((resolve, reject) => {
               const imagequery = "INSERT INTO QuoteRequestImage (quoteID, image1, image2, image3, image4, image5) VALUES (?, ?, ?, ?, ?, ?);";
               connection.query(imagequery, [quoteID, imagePaths.fileInput1, imagePaths.fileInput2, imagePaths.fileInput3, imagePaths.fileInput4, imagePaths.fileInput5], (err, results) => {
                  if (err) reject(new Error(err.message));
                  else resolve(results);
               });
            });

            console.log("Images for new quote successfully inserted for quoteID:", quoteID); // Debugging

            // Return the inserted data for confirmation
            return {
               quoteID,
               clientID,
               propertyAddress,
               drivewaySqft,
               proposedPrice,
               addNote,
               images: imagePaths,
            };
      } catch (error) {
            console.error("Error creating new quote request:", error);
            throw error;
      }
   }
  
   async getQuoteHistoryTable(clientID) {
      try {
          const response = await new Promise((resolve, reject) => {
            const query = `SELECT qh.responseDate, qh.responseID, qh.quoteID, qh.clientID, qr.propertyAddress, qr.drivewaySqft, qr.proposedPrice AS requestedPrice, 
               qr.addNote AS clientNote, qri.image1, qri.image2, qri.image3, qri.image4, qri.image5 FROM QuoteHistory qh 
               LEFT JOIN QuoteRequest qr ON qh.quoteID = qr.quoteID 
               LEFT JOIN QuoteRequestImage qri ON qh.quoteID = qri.quoteID 
               WHERE qh.clientID = ?;`;
  
              connection.query(query, [clientID], (err, results) => {
                  if (err) {
                      reject(new Error(err.message));
                  } else {
                      resolve(results);
                  }
              });
          });
  
          console.log(response); // Debugging output
          return response; // Return the query results
      } catch (error) {
          console.error("Quote History query error:", error);
          throw error; // Re-throw the error to handle it where the function is called
      }
  }
  

   async getWorkOrderHistory(clientID) {
      try {
            const response = await new Promise((resolve, reject) => {
               const query = "SELECT * FROM WorkOrder WHERE clientID = ?";
               connection.query(query, [clientID], (err, results) => {
                  if (err) reject(new Error(err.message));
                  else resolve(results);
               });
            });

            console.log(response); // for debugging to see the result of select
            return response;
      } catch (error) {
            console.error('Quote History query error:', error);
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
