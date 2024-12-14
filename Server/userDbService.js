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

   // LOGIN: get ClientDB by username and password, update login and active status to online
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
               if (err) reject(new Error(err.message));
               else resolve(results);
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

   // LOGOUT: get ClientDB by username and change active status to offline
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


   // CREATE NEW QUOTE REQUEST FOR CLIENT
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
            return { quoteID, clientID, propertyAddress, drivewaySqft, proposedPrice, addNote, images: imagePaths};
      } catch (error) {
            console.error("Error creating new quote request:", error);
            throw error;
      }
   }
  
   
   // GET QUOTE HISTORY FOR CLIENT
   async getQuoteHistoryTable(clientID) {
      try {
            const response = await new Promise((resolve, reject) => {
               const query = `SELECT 
               QH.responseID,
               QH.quoteID,
               QR.propertyAddress,
               QR.drivewaySqft,
               QH.proposedPrice,
               QH.startDate,
               QH.endDate,
               QH.addNote,
               QH.responseDate,
               QH.status,
               CASE 
                  WHEN QH.responseID = (
                     SELECT MAX(responseID)
                     FROM QuoteHistory
                     WHERE quoteID = QH.quoteID
                  ) AND QH.status = 'Pending'
                  THEN 1
                  ELSE 0
               END AS isMostRecentPending
               FROM QuoteHistory QH
               JOIN QuoteRequest QR ON QH.quoteID = QR.quoteID
               WHERE QH.clientID = ?
               ORDER BY  QH.quoteID, QH.responseID ASC;`;

               connection.query(query, [clientID], (err, results) => {
                  if (err) reject(new Error(err.message));
                  else resolve(results);
               });
            });

            console.log("Quote results from dbservice: ", response); // Debugging output
            return response; // Return the query results
      } catch (error) {
            console.error("Quote History error in database: ", error);
            throw error; // Re-throw the error to handle it where the function is called
      }
   }
  
// GET WORK ORDER HISTORY FOR CLIENT
   async getWorkOrderHistory(clientID) {
      try {
            const response = await new Promise((resolve, reject) => {
               const query = `SELECT 
               WO.workOrderID,
               WO.quoteID,
               WO.clientID,
               QR.propertyAddress,
               WO.dateRange,
               QH.proposedPrice AS price,
               WO.status
            FROM WorkOrder WO
            JOIN QuoteRequest QR ON WO.quoteID = QR.quoteID
            JOIN QuoteHistory QH ON WO.responseID = QH.responseID
            WHERE WO.clientID LIKE ?;`;

            connection.query(query, [clientID], (err, results) => {
               if (err) reject(new Error(err.message));
               else resolve(results);
            });
         });
         console.log("Work Order results from dbservice: ", response); // for debugging to see the result of select
         return response;
      } catch (error) {
            console.error('Quote History query error:', error);
      }
   }

// GET INVOICE HISTORY FOR CLIENT
   async getInvoiceHistory(clientID) {
      try {

         // Updates invoice status to 'Overdue' if datePaid is null and dateCreated is more than 7 days ago
         const update = await new Promise((resolve, reject) => {
            const query = `UPDATE Invoice SET status = 'Overdue' WHERE datePaid IS NULL AND DATEDIFF(CURDATE(), dateCreated) > 7;`;
            connection.query(query, (err, results) => {
               if (err) reject(new Error(err.message));
               else resolve(results);
            });
         });

         // Get invoice history for a client
         const response = await new Promise((resolve, reject) => {
            const query = `SELECT 
            I.clientID,
            I.status,
            CASE 
               WHEN I.status = 'DUE' AND (
                  IR.responseID IS NULL OR IR.responseID = (
                     SELECT MAX(responseID)
                     FROM InvoiceResponses
                     WHERE invoiceID = I.invoiceID
                  )
               )
               THEN 1
               ELSE 0
            END AS isMostRecentPaid,
            I.invoiceID,
            IR.responseID,
            I.workOrderID,
            I.amountDue,
            QR.propertyAddress,
            I.dateCreated,
            IR.responseNote,
            I.datePaid,
            IR.responseDate
            FROM Invoice I
            LEFT JOIN InvoiceResponses IR ON I.invoiceID = IR.invoiceID
            LEFT JOIN 
                  WorkOrder WO ON I.workOrderID = WO.workOrderID
            LEFT JOIN 
                  QuoteRequest QR ON WO.quoteID = QR.quoteID
            WHERE 
                  I.clientID LIKE ?;`;

            connection.query(query, [clientID], (err, results) => {
               if (err) reject(new Error(err.message));
               else resolve(results);
            });
         });
         console.log("Invoice results from dbservice: ", response); // for debugging to see the result of select
         return response;
      } catch (error) {
            console.error('Invoice History query error:', error);
      }
   
   }


   async insertQuoteResponse(responseID, proposedPrice, startDate, endDate, addNote) {
      const newStartDate = new Date(startDate);
      const newEndDate = new Date(endDate);
      const keepStatus = 'Pending';
      let clientID;
      let quoteID;
      console.log(`Inserting response for responseID: ${responseID}`);
      try {
         const selection = await new Promise((resolve, reject) => {
            const query = "SELECT * FROM QuoteHistory WHERE responseID = ?;";
            connection.query(query, [responseID], (err, results) => {
               if (err) reject(new Error(err.message));
               else resolve(results);
            });
         });
         // Return the responseID result and grab missing parameters from client response
         if (selection.length > 0) {
            const firstResult = selection[0];
            clientID = firstResult.clientID;
            quoteID = firstResult.quoteID;
            console.log(`Client ID: ${clientID}, Quote ID: ${quoteID}`);
            if (proposedPrice === null) proposedPrice = firstResult.proposedPrice;
            if (startDate === null) newStartDate = firstResult.startDate;
            if (endDate === null) newEndDate = firstResult.endDate;
            if (addNote === null) addNote = '';
         } else {
            throw new Error("No response found with responseID: " + responseID);
         }

            const query = `INSERT INTO QuoteHistory (clientID, quoteID, proposedPrice, startDate, endDate, addNote, status)
               VALUES (?, ?, ?, ?, ?, ?, ?);
            `;
            const response = await new Promise((resolve, reject) => {
               connection.query(
                  query,
                  [clientID, quoteID, proposedPrice, newStartDate, newEndDate, addNote, keepStatus],
                  (err, results) => {
                        if (err) reject(new Error(err.message));
                        else resolve(results);
                  }
               );
            });
            return response;
      } catch (error) {
            console.error("Error inserting response:", error);
            throw error;
      }
   }
  
   // Once accepted, phpmyadmin will trigger the update to populate to workOrder
   acceptQuoteResonse(invoiceID) {
      console.log(`Accepting quote response with responseID: ${responseID}`);
      try {
         const query = `UPDATE QuoteHistory SET status = 'Accepted' WHERE invoiceID = ?;`;
         const response = new Promise((resolve, reject) => {
            connection.query(query, [invoiceID], (err, results) => {
               if (err) reject(new Error(err.message));
               else resolve(results);
            });
         });
         return response;
      } catch (error) {
         console.error("Error accepting quote response:", error);
         throw error;
      }
   }


   async insertInvoiceResponse(invoiceID, amountDue, responseNote) {
      const keepStatus = 'Pending';
      //let clientID;
      //let quoteID;
      console.log(`Inserting response for responseID: ${invoiceID}`);
      try {

         const query = `INSERT INTO InvoiceResponses (invoiceID, amountDue, responseNote)
            VALUES (?, ?, ?);
         `;
         const response = await new Promise((resolve, reject) => {
            connection.query(
               query,
               [invoiceID, amountDue, responseNote],
               (err, results) => {
                     if (err) reject(new Error(err.message));
                     else resolve(results);
               }
            );
         });
         return response;
      } catch (error) {
            console.error("Error inserting response:", error);
            throw error;
      }
   }
  

   // Once accepted, phpmyadmin will trigger the update to populate to workOrder
   acceptInvoiceResonse(responseID) {
      console.log(`Accepting quote response with responseID: ${responseID}`);
      try {
         const query = `UPDATE QuoteHistory SET status = 'Accepted' WHERE responseID = ?;`;
         const response = new Promise((resolve, reject) => {
            connection.query(query, [responseID], (err, results) => {
               if (err) reject(new Error(err.message));
               else resolve(results);
            });
         });
         return response;
      } catch (error) {
         console.error("Error accepting quote response:", error);
         throw error;
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
         return response;
      } catch (error) {
         console.error("Error: ", error);
      }
   }


   //david
   async getAllQuotes() {
      try {
          const response = await new Promise((resolve, reject) => {
              const query = `
                  SELECT 
                      QR.quoteID,
                      QR.clientID,
                      QR.propertyAddress,
                      QR.drivewaySqft,
                      QR.proposedPrice,
                      QR.addNote,
                      QRI.image1,
                      QRI.image2,
                      QRI.image3,
                      QRI.image4,
                      QRI.image5
                  FROM 
                      QuoteRequest QR
                  LEFT JOIN 
                      QuoteRequestImage QRI
                  ON 
                      QR.quoteID = QRI.quoteID;
              `;
              connection.query(query, (err, results) => {
                  if (err) reject(err);
                  else resolve(results);
              });
          });
          return response;
      } catch (err) {
          console.error('Error in getAllQuotes:', err);
          throw err;
      }
  }

  async acceptQuote(clientID, quoteID, proposedPrice, startDate, endDate, addNote) {
   return new Promise((resolve, reject) => {
       const query = `
           UPDATE QuoteHistory
           SET status = 'Accepted',
               proposedPrice = ?,
               startDate = ?,
               endDate = ?,
               addNote = ?,
               responseDate = NOW()
           WHERE clientID = ? AND quoteID = ?;
       `;
       connection.query(
           query,
           [proposedPrice, startDate, endDate, addNote, clientID, quoteID],
           (err, result) => {
               if (err) reject(err);
               else resolve(result);
           }
       );
   });
}




async rejectQuote(clientID, quoteID, addNote) {
   try {
       const response = await new Promise((resolve, reject) => {
           const query = `
               UPDATE QuoteHistory
               SET status = 'Rejected', addNote = ?, responseDate = NOW()
               WHERE quoteID = ? AND clientID = ?;
           `;
           connection.query(query, [addNote, quoteID, clientID], (err, result) => {
               if (err) reject(err);
               else resolve(result);
           });
       });
       return response;
   } catch (error) {
       console.error("Error rejecting quote:", error.message);
       throw error;
   }
}

async getQuoteDetails(quoteID) {
   return new Promise((resolve, reject) => {
       const query = `
           SELECT qr.*, qri.image1, qri.image2, qri.image3, qri.image4, qri.image5
           FROM QuoteRequest qr
           LEFT JOIN QuoteRequestImage qri ON qr.quoteID = qri.quoteID
           WHERE qr.quoteID = ?;
       `;
       connection.query(query, [quoteID], (err, results) => {
           if (err) reject(err);
           else resolve(results[0]); // Return the first result
       });
   });
}






async createWorkOrder(clientID, quoteID, dateRange) {
   try {
       const response = await new Promise((resolve, reject) => {
           const query = `
               INSERT INTO WorkOrder (clientID, quoteID, dateRange, status)
               VALUES (?, ?, ?, 'Scheduled');
           `;
           connection.query(query, [clientID, quoteID, dateRange], (err, result) => {
               if (err) reject(err);
               else resolve(result);
           });
       });
       return response;
   } catch (error) {
       console.error("Error creating work order:", error.message);
       throw error;
   }
}









async checkWorkOrder(workOrderID) {
   try {
       const response = await new Promise((resolve, reject) => {
           const query = "SELECT 1 FROM WorkOrder WHERE workOrderID = ? LIMIT 1";
           connection.query(query, [workOrderID], (err, result) => {
               if (err) reject(err);
               else resolve(result.length > 0);
           });
       });
       return response;
   } catch (err) {
       console.error("Error in checkWorkOrder:", err.message);
       throw err;
   }
}
async checkClient(clientID) {
   try {
       const response = await new Promise((resolve, reject) => {
           const query = "SELECT 1 FROM ClientDB WHERE clientID = ? LIMIT 1";
           connection.query(query, [clientID], (err, result) => {
               if (err) reject(err);
               else resolve(result.length > 0);
           });
       });
       return response;
   } catch (err) {
       console.error("Error in checkClient:", err.message);
       throw err;
   }
}

//david generating invoice for client
async generateInvoice(workOrderID, clientID, amountDue, discount) {
   try {
       const response = await new Promise((resolve, reject) => {
           const query = `
               INSERT INTO Invoice (workOrderID, clientID, amountDue, dateCreated)
               VALUES (?, ?, ?, NOW())
           `;
           const finalAmount = amountDue - discount; // Calculate final amount
           console.log("Executing Query:", query);
           console.log("With Values:", [workOrderID, clientID, finalAmount]);

           connection.query(query, [workOrderID, clientID, finalAmount], (err, result) => {
               if (err) {
                   console.error("Database Error:", err.message); // Log database error
                   reject(err);
               } else {
                   console.log("Query Successful:", result); // Log successful query
                   resolve(result);
               }
           });
       });
       return response;
   } catch (err) {
       console.error("Error in generateInvoice:", err.message);
       throw err;
   }
}

//david seeing all the invoice response 
async getAllInvoiceResponses() {
    try {
      const response = await new Promise((resolve, reject) => {
          const query = `
             SELECT ir.responseID, ir.invoiceID, ir.responseNote, ir.responseDate, i.clientID, i.amountDue, qh.quoteID, qh.status
                FROM InvoiceResponses ir
                JOIN Invoice i ON ir.invoiceID = i.invoiceID
                JOIN QuoteHistory qh ON i.workOrderID = qh.quoteID
            `;
          connection.query(query, (err, results) => {
              if (err) reject(err);
              else resolve(results);
          });
      });
      return response;
  } catch (err) {
      console.error("Error in getAllInvoiceResponses:", err.message);
      throw err;
  }
}

//for david to respond to the invoices
async updateInvoiceResponseStatus(responseID, status, note = null) {
   try {
       const response = await new Promise((resolve, reject) => {
           const query = note
               ? `UPDATE InvoiceResponses SET responseNote = ?, responseDate = NOW() WHERE responseID = ?`
               : `UPDATE InvoiceResponses SET responseDate = NOW() WHERE responseID = ?`;

           const params = note ? [note, responseID] : [responseID];

           connection.query(query, params, (err, result) => {
               if (err) reject(err);
               else resolve(result);
           });
       });
       return response;
   } catch (error) {
       console.error("Error updating InvoiceResponses:", error.message);
       throw error;
   }
}
async updateQuoteHistoryStatus(quoteID, clientID, status, note) {
   try {
       const response = await new Promise((resolve, reject) => {
           const query = `
               UPDATE QuoteHistory
               SET status = ?, responseDate = NOW(), addNote = ?
               WHERE quoteID = ? AND clientID = ?
           `;

           connection.query(query, [status, note, quoteID, clientID], (err, result) => {
               if (err) reject(err);
               else resolve(result);
           });
       });
       return response;
   } catch (error) {
       console.error("Error updating QuoteHistory:", error.message);
       throw error;
   }
}




// async updateInvoiceResponse(responseID, note) {
//    try {
//        const response = await new Promise((resolve, reject) => {
//            const query = `
//                UPDATE InvoiceResponses 
//                SET responseNote = ?, responseDate = NOW() 
//                WHERE responseID = ?
//            `;
//            connection.query(query, [note, responseID], (err, result) => {
//                if (err) reject(err);
//                else resolve(result);
//            });
//        });
//        return response;
//    } catch (err) {
//        console.error("Error in updateInvoiceResponse:", err.message);
//        throw err;
//    }
// }







   // // Search ClientDB by first name
   // async searchByFirstName(firstName) {
   //    try {
   //       const response = await new Promise((resolve, reject) => {
   //          const query = "SELECT * FROM ClientDB WHERE firstName LIKE ?;";
   //          connection.query(query, [firstName], (err, results) => {
   //             if (err) reject(new Error(err.message));
   //             else resolve(results);
   //          });
   //       });
   //       return response;
   //    } catch (error) {
   //       console.log(error);
   //       // console.error("Error in searchByFirstName: ", error);
   //       // throw error; // Ensure the error is propagated
   //    }
   // }

   // // Search ClientDB by last name
   // async searchByLastName(lastName) {
   //    try {
   //       const response = await new Promise((resolve, reject) => {
   //          const query = "SELECT * FROM ClientDB WHERE lastName LIKE ?;";
   //          connection.query(query, [lastName], (err, results) => {
   //             if (err) reject(new Error(err.message));
   //             else resolve(results);
   //          });
   //       });
   //       return response;
   //    } catch (error) {
   //       console.error("Error in searchByLastName:", error);
   //    }
   // }


   // // Search ClientDB by first and last name
   // async searchByFirstAndLastName(firstName, lastName) {
   //    try {
   //       const response = await new Promise((resolve, reject) => {
   //          const query = "SELECT * FROM ClientDB WHERE firstName LIKE ? AND lastName LIKE ?;";
   //          connection.query(query, [`%${firstName}%`, `%${lastName}%`], (err, results) => {
   //             if (err) reject(new Error(err.message));
   //             else resolve(results);
   //          });
   //       });
   //       return response;
   //    } catch (error) {
   //       console.log(error);
   //    }
   // }

   // // Search ClientDB by clientID
   // async searchByClientID(clientID) {
   //    try {
   //       const response = await new Promise((resolve, reject) => {
   //          const query = "SELECT * FROM ClientDB WHERE clientID LIKE ?;";
   //          connection.query(query, [clientID], (err, results) => {
   //             if (err) reject(new Error(err.message));
   //             else resolve(results);
   //          });
   //       });
   //       return response;
   //    } catch (error) {
   //       console.error("Error in searchByClientID:", error);
   //    }
   // }

   // // Search ClientDB by salary range
   // async searchBySalary(minSalary, maxSalary) {
   //    try {
   //       const response = await new Promise((resolve, reject) => {
   //          const query = "SELECT * FROM ClientDB WHERE salary BETWEEN ? AND ?;";
   //          connection.query(query, [minSalary, maxSalary], (err, results) => {
   //             if (err) reject(new Error(err.message));
   //             else resolve(results);
   //          });
   //       });
   //       return response;
   //    } catch (error) {
   //       console.log(error);
   //    }
   // }

   // // Search ClientDB by age range
   // async searchByAge(minAge, maxAge) {
   //    try {
   //       const response = await new Promise((resolve, reject) => {
   //          const query = "SELECT * FROM ClientDB WHERE age BETWEEN ? AND ?;";
   //          connection.query(query, [minAge, maxAge], (err, results) => {
   //             if (err) reject(new Error(err.message));
   //             else resolve(results);
   //          });
   //       });
   //       return response;
   //    } catch (error) {
   //       console.log(error);
   //    }
   // }

   // // Search ClientDB registered after specific user
   // async searchAfterRegDate(clientID) {
   //    try {
   //       const response = await new Promise((resolve, reject) => {
   //          const query = "SELECT * FROM ClientDB WHERE registerDate > (SELECT registerDate FROM ClientDB WHERE clientID = ?);";
   //          connection.query(query, [clientID], (err, results) => {
   //             if (err) reject(new Error(err.message));
   //             else resolve(results);
   //          });
   //       });
   //       console.log(response); // for debugging to see the result of select
   //       return response;
   //    } catch (error) {
   //       console.error(error);
   //    }
   // }

   // // Search ClientDB registered on same day as user
   // async searchSameDayRegDate(clientID) {
   //    try {
   //       const response = await new Promise((resolve, reject) => {
   //          const query = "SELECT * FROM ClientDB WHERE registerDate = (SELECT registerDate FROM ClientDB WHERE clientID = ?);";
   //          connection.query(query, [clientID], (err, results) => {
   //             if (err) reject(new Error(err.message));
   //             else resolve(results);
   //          });
   //       });
   //       console.log(response); // for debugging to see the result of select
   //       return response;
   //    } catch (error) {
   //       console.error(error);
   //    }
   // }

   // // Search ClientDB who never signed in
   // async searchNeverSignedIn() {
   //    // const emptyDate = '0000-00-00 00:00:00.00';
   //    let emptyDate = new Date('0000-00-00 00:00:00.00');

   //    // let emptyDate = 'null';
   //    // const emptyDate = "";
   //    try {
   //       const response = await new Promise((resolve, reject) => {
   //          const query = "SELECT * FROM ClientDB WHERE loginTime IS NULL;";
   //          connection.query(query, (err, results) => {
   //             if (err) reject(new Error(err.message));
   //             else resolve(results);
   //          });
   //       });
   //       return response;
   //    } catch (error) {
   //       console.log(error);
   //    }
   // }

   // // Search ClientDB who registered today
   // async searchRegToday() {
   //    try {
   //       const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
   //       const response = await new Promise((resolve, reject) => {
   //          const query = "SELECT * FROM ClientDB WHERE registerDate = ?;";
   //          connection.query(query, [today], (err, results) => {
   //             if (err) reject(new Error(err.message));
   //             else resolve(results);
   //          });
   //       });
   //       return response;
   //    } catch (error) {
   //       console.log(error);
   //    }
   // }
}

module.exports = userDbService;
