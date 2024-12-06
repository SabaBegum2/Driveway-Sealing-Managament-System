// const mysql = require('mysql2');

// // Define your database configuration
// const db = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: '',
//     database: 'web_app',
//     port: 3306
// });

// // Test the database connection
// db.connect((err) => {
//     if (err) {
//         console.error('Database connection failed:', err.message);
//     } else {
//         console.log('Database connected successfully');
//         db.query('SELECT COUNT(*) AS total FROM users', (err, results) => {
//             if (err) {
//                 console.error('Test query failed:', err.message);
//             } else {
//                 console.log('Test query result:', results[0].total);
//             }
//             db.end(); // Close the connection after the test
//         });
//     }
// });

