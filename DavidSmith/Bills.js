//routes for bill management
const express = require('express');
const router = express.Router();
const pool = require('../Server/userDbService');

// Get a specific bill
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [bill] = await pool.query('SELECT * FROM Bills WHERE bill_id = ?', [id]);
        res.json(bill);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create a new bill
router.post('/', async (req, res) => {
    const { work_order_id, client_id, amount } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO Bills (work_order_id, client_id, amount, status, created_at) VALUES (?, ?, ?, "Pending", NOW())',
            [work_order_id, client_id, amount]
        );
        res.status(201).json({ bill_id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
