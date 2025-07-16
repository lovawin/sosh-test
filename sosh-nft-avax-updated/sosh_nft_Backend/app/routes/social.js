const express = require('express');

const router = express.Router();
const SocialController = require('../controllers/social.controller');

const Social = new SocialController();

router.get('/list', Social.socialList);

module.exports = router;
