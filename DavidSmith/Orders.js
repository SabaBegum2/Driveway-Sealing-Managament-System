//routes for orders management
const express = require('express');
const router = express.Router();
const workOrdersController = require('../DavidSmith/OrdersControllers');

// Get all work orders
router.get('/', workOrdersController.getAllWorkOrders);

// Get a specific work order by ID
router.get('/:id', workOrdersController.getWorkOrderById);

// Create a new work order
router.post('/', workOrdersController.createWorkOrder);

// Update a work order (e.g., status or date range)
router.put('/:id', workOrdersController.updateWorkOrder);

// Delete a work order
router.delete('/:id', workOrdersController.deleteWorkOrder);

module.exports = router;
