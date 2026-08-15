const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getContacts, createContact, updateContact, deleteContact, setPrimary,
} = require('../controllers/contactController');

const router = express.Router();
router.use(protect);

router.get('/', getContacts);
router.post('/', createContact);
router.put('/:id', updateContact);
router.delete('/:id', deleteContact);
router.patch('/:id/primary', setPrimary);

module.exports = router;