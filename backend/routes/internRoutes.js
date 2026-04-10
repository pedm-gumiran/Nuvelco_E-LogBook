const express = require('express');
const router = express.Router();
const internController = require('../controllers/internController');

/* GET ALL INTERNS */
router.get('/', internController.getAllInterns);

/* GET INTERN BY ID */
router.get('/:id', internController.getInternById);

/* CREATE INTERN */
router.post('/', internController.createIntern);

/* UPDATE INTERN */
router.put('/:id', internController.updateIntern);

/* DELETE INTERN */
router.delete('/:id', internController.deleteIntern);

module.exports = router;
