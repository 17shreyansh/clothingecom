const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
  submitContact,
  getContacts,
  updateContact,
  deleteContact
} = require('../controllers/contact');

router.post('/', submitContact);
router.get('/', protect, admin, getContacts);
router.put('/:id', protect, admin, updateContact);
router.delete('/:id', protect, admin, deleteContact);

module.exports = router;