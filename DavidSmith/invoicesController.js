const db = require('../Server/userDbService');

// Get all invoices
exports.getAllInvoices = (req, res) => {
    const query = 'SELECT * FROM Invoice';
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

// Get a specific invoice by ID
exports.getInvoiceById = (req, res) => {
    const query = 'SELECT * FROM Invoice WHERE invoiceID = ?';
    db.query(query, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results[0] || { message: 'Invoice not found' });
    });
};

// Create a new invoice
exports.createInvoice = (req, res) => {
    const { workOrderID, clientID, amountDue } = req.body;
    const query = `
        INSERT INTO Invoice (workOrderID, clientID, amountDue, dateCreated)
        VALUES (?, ?, ?, NOW())
    `;
    db.query(query, [workOrderID, clientID, amountDue], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Invoice created successfully', id: result.insertId });
    });
};

// Update an invoice (mark as paid)
exports.updateInvoice = (req, res) => {
    const query = 'UPDATE Invoice SET datePaid = NOW() WHERE invoiceID = ?';
    db.query(query, [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Invoice marked as paid' });
    });
};

// Delete an invoice
exports.deleteInvoice = (req, res) => {
    const query = 'DELETE FROM Invoice WHERE invoiceID = ?';
    db.query(query, [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Invoice deleted successfully' });
    });
};
