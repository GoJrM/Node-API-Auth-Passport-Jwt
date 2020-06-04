const authController = require('../../controllers/authController');

const router = require('express').Router();

router.get('/auth/logout', authController.logUserOut);

module.exports = router;