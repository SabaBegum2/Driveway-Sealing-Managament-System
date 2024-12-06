const db = require('../Server/userDbService');

// Get all work orders
exports.getAllWorkOrders = (req, res) => {
    const query = 'SELECT * FROM WorkOrder';
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

// Get a specific work order by ID
exports.getWorkOrderById = (req, res) => {
    const query = 'SELECT * FROM WorkOrder WHERE workOrderID = ?';
    db.query(query, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results[0] || { message: 'Work order not found' });
    });
};

// Create a new work order
exports.createWorkOrder = (req, res) => {
    const { clientID, quoteID, responseID, dateRange } = req.body;
    const query = `
        INSERT INTO WorkOrder (clientID, quoteID, responseID, dateRange)
        VALUES (?, ?, ?, ?)
    `;
    db.query(query, [clientID, quoteID, responseID, dateRange], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Work order created successfully', id: result.insertId });
    });
};

// Update a work order
exports.updateWorkOrder = (req, res) => {
    const { status, dateRange } = req.body;
    const query = 'UPDATE WorkOrder SET status = ?, dateRange = ? WHERE workOrderID = ?';
    db.query(query, [status, dateRange, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Work order updated successfully' });
    });
};

// Delete a work order
exports.deleteWorkOrder = (req, res) => {
    const query = 'DELETE FROM WorkOrder WHERE workOrderID = ?';
    db.query(query, [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Work order deleted successfully' });
    });
};
