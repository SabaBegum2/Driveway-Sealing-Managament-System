// //routes for quotes management
// const express = require('express');
// const router = express.Router();
// const db = require('../Server/userDbService');

// // Create a new quote
// router.post('/', async (req, res) => {
//   const { clientID, propertyAddress, drivewaySqft, proposedPrice, addNote } = req.body;

//   try {
//     const query = `
//       INSERT INTO QuoteRequest (clientID, propertyAddress, drivewaySqft, proposedPrice, addNote)
//       VALUES (?, ?, ?, ?, ?);
//     `;
//     const [result] = await db.execute(query, [
//       clientID, propertyAddress, drivewaySqft, proposedPrice, addNote,
//     ]);
//     res.status(201).json({ quoteID: result.insertId });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Get all quotes for a client
// router.get('/:clientID', async (req, res) => {
//   const { clientID } = req.params;

//   try {
//     const [rows] = await db.execute(
//       `SELECT * FROM QuoteRequest WHERE clientID = ?`, 
//       [clientID]
//     );
//     res.status(200).json(rows);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// module.exports = router;


// // routes for quotes management
// const express = require('express');
// const router = express.Router();
// const db = require('../Server/userDbService'); // Adjusted path

// Get all quotes for David
// router.get('/', async (req, res) => {
//   try {
//     const [rows] = await db.query(`SELECT * FROM QuoteRequest`);
//     res.status(200).json(rows);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Handle accept/reject response from David
// router.post('/:quoteID/response', async (req, res) => {
//   const { quoteID } = req.params;
//   const { newPrice, timeWindowStart, timeWindowEnd, note, status } = req.body;

//   try {
//     // Update the quote status and add David's response
//     const query = `
//       UPDATE QuoteRequest
//       SET status = ?, davidNote = ?, proposedPrice = ?, timeWindowStart = ?, timeWindowEnd = ?
//       WHERE quoteID = ?;
//     `;
//     await db.execute(query, [
//       status,
//       note,
//       newPrice,
//       timeWindowStart,
//       timeWindowEnd,
//       quoteID,
//     ]);
//     res.status(200).json({ message: 'Response sent to client.' });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// module.exports = router;

// const express = require('express');
// const router = express.Router();
// const db = require('../Server/userDbService');

// // Get all quotes
// router.get('/', async (req, res) => {
//   try {
//     const query = `
//       SELECT 
//         qr.quoteID, qr.clientID, qr.propertyAddress, qr.drivewaySqft, 
//         qr.proposedPrice, qr.addNote, 
//         qri.image1, qri.image2, qri.image3, qri.image4, qri.image5
//       FROM QuoteRequest qr
//       LEFT JOIN QuoteRequestImage qri ON qr.quoteID = qri.quoteID;
//     `;
//     const [rows] = await db.execute(query);
//     res.status(200).json(rows);
//   } catch (error) {
//     console.error('Error fetching quotes:', error.message);
//     res.status(500).json({ error: 'Failed to fetch quotes' });
//   }
// });

// module.exports = router;
// const express = require('express');
// const router = express.Router();
// const db = require('../Server/userDbService');

// // Fetch all quotes with images
// router.get('/', async (req, res) => {
//     try {
//         const query = `
//             SELECT 
//                 qr.quoteID, qr.clientID, qr.propertyAddress, qr.drivewaySqft, 
//                 qr.proposedPrice, qr.addNote, 
//                 qi.image1, qi.image2, qi.image3, qi.image4, qi.image5 
//             FROM QuoteRequest qr
//             LEFT JOIN QuoteRequestImage qi ON qr.quoteID = qi.quoteID;
//         `;
//         const [rows] = await db.execute(query);
//         res.status(200).json(rows);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// // Reject a quote with a note
// router.post('/reject/:quoteID', async (req, res) => {
//     const { quoteID } = req.params;
//     const { rejectionNote } = req.body;

//     try {
//         const query = `
//             UPDATE QuoteRequest 
//             SET status = 'Rejected', rejectionNote = ? 
//             WHERE quoteID = ?;
//         `;
//         await db.execute(query, [rejectionNote, quoteID]);
//         res.status(200).json({ message: 'Quote rejected successfully.' });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// // Accept a quote with negotiation
// router.post('/accept/:quoteID', async (req, res) => {
//     const { quoteID } = req.params;
//     const { newPrice, startDate, endDate } = req.body;

//     try {
//         const query = `
//             UPDATE QuoteRequest 
//             SET status = 'Accepted', proposedPrice = ?, startDate = ?, endDate = ? 
//             WHERE quoteID = ?;
//         `;
//         await db.execute(query, [newPrice, startDate, endDate, quoteID]);
//         res.status(200).json({ message: 'Quote accepted successfully.' });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// module.exports = router;

// const express = require('express');
// const router = express.Router();
// const db = require('../Server/userDbService'); // Ensure correct path to userDbService.js

// // Fetch all quotes
// router.get('/', async (req, res) => {
//     try {
//         const query = `
//             SELECT 
//                 qr.quoteID, qr.clientID, qr.propertyAddress, qr.drivewaySqft, 
//                 qr.proposedPrice, qr.addNote,
//                 qi.image1, qi.image2, qi.image3, qi.image4, qi.image5
//             FROM QuoteRequest qr
//             LEFT JOIN QuoteRequestImage qi ON qr.quoteID = qi.quoteID;
//         `;
//         const [rows] = await db.execute(query); // Ensure db.execute is called
//         res.status(200).json(rows);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });
// router.get('/test', async (req, res) => {
//     try {
//         const [rows] = await db.query('SELECT 1 + 1 AS solution');
//         res.json({ message: 'Database connection successful', solution: rows[0].solution });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });
// module.exports = router;

// const express = require('express');
// const router = express.Router();
// const db = require('../Server/userDbService'); // Ensure correct path to userDbService.js

// // Fetch all quotes
// router.get('/', async (req, res) => {
//     try {
//         const query = `
//             SELECT 
//                 qr.quoteID, qr.clientID, qr.propertyAddress, qr.drivewaySqft, 
//                 qr.proposedPrice, qr.addNote,
//                 qi.image1, qi.image2, qi.image3, qi.image4, qi.image5
//             FROM QuoteRequest qr
//             LEFT JOIN QuoteRequestImage qi ON qr.quoteID = qi.quoteID;
//         `;
//         const [rows] = await db.execute(query); // Ensure db.execute is working
//         res.status(200).json(rows);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// // Test database connection
// router.get('/test', async (req, res) => {
//     try {
//         const [rows] = await db.query('SELECT 1 + 1 AS solution');
//         res.json({ message: 'Database connection successful', solution: rows[0].solution });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// module.exports = router;

const express = require('express');
const router = express.Router();
const db = require('./userDbService'); // Adjust the path as necessary

// Fetch all quotes
router.get('/', (req, res) => {
    const query = `
        SELECT 
            qr.quoteID, qr.clientID, qr.propertyAddress, qr.drivewaySqft, 
            qr.proposedPrice, qr.addNote,
            qi.image1, qi.image2, qi.image3, qi.image4, qi.image5
        FROM QuoteRequest qr
        LEFT JOIN QuoteRequestImage qi ON qr.quoteID = qi.quoteID;
    `;
    db.query(query, (err, rows) => {
        if (err) {
            console.error('Error fetching quotes:', err);
            res.status(500).json({ error: 'Database query failed' });
        } else {
            res.status(200).json(rows);
        }
    });
});

// Test database connection
router.get('/test', (req, res) => {
    db.query('SELECT 1 + 1 AS solution', (err, rows) => {
        if (err) {
            console.error('Error testing database:', err);
            res.status(500).json({ error: 'Database query failed' });
        } else {
            res.json({ message: 'Database connection successful', solution: rows[0].solution });
        }
    });
});

module.exports = router;
