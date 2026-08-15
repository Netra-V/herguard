const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getProfile, updateProfile, changePassword, updateSettings, getDashboardStats,
} = require('../controllers/userController');

const router = express.Router();
router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/password', changePassword);
router.put('/settings', updateSettings);
router.get('/dashboard-stats', getDashboardStats);

module.exports = router;