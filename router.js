const express= require('express')
const controller = require('./controller');
const router = express.Router();
router.post('/identify',controller.identify)
module.exports = router;