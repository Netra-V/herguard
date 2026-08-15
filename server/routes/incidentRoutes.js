const express = require('express');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  createIncident, getIncidents, getMyIncidents, getNearbyIncidents, getIncident, deleteIncident,
} = require('../controllers/incidentController');

const router = express.Router();

router.get('/', getIncidents);
router.get('/nearby', getNearbyIncidents);
router.get('/my/reports', protect, getMyIncidents);
router.get('/:id', getIncident);
router.post('/', protect, upload.single('photo'), createIncident);
router.delete('/:id', protect, deleteIncident);

module.exports = router;
