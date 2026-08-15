const express = require('express');
const { protect } = require('../middleware/auth');
const {
  startTrip, getTrips, getActiveTrip, updateLocation, pauseTrip, endTrip, emergencyStop, deleteTrip,
} = require('../controllers/tripController');

const router = express.Router();
router.use(protect);

router.post('/start', startTrip);
router.get('/', getTrips);
router.get('/active', getActiveTrip);
router.patch('/:id/location', updateLocation);
router.patch('/:id/pause', pauseTrip);
router.patch('/:id/end', endTrip);
router.patch('/:id/emergency', emergencyStop);
router.delete('/:id', deleteTrip);

module.exports = router;