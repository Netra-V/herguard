const express = require('express');
const { protect } = require('../middleware/auth');
const { triggerPublicSOS, triggerSOS, resolveSOS, getSOSLogs, getActiveSOS } = require('../controllers/sosController');

const router = express.Router();

// Login-page Emergency SOS: intentionally public, authenticated by the SOS token.
router.post('/public-trigger', triggerPublicSOS);

router.use(protect);

router.post('/trigger', triggerSOS);
router.post('/resolve', resolveSOS);
router.get('/logs', getSOSLogs);
router.get('/active', getActiveSOS);

module.exports = router;