const express = require('express');
const router = express.Router();
const invoicesController = require('../DavidSmith/invoicesController');

// Get all invoices
router.get('/', invoicesController.getAllInvoices);

// Get a specific invoice by ID
router.get('/:id', invoicesController.getInvoiceById);

// Create a new invoice
router.post('/', invoicesController.createInvoice);

// Update an invoice (e.g., mark as paid)
router.put('/:id', invoicesController.updateInvoice);

// Delete an invoice
router.delete('/:id', invoicesController.deleteInvoice);

module.exports = router;
