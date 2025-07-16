const express = require('express');
const tiktok = require('../controllers/tiktok.controller');
const { setSession, isLoggedInquery, isLoggedIn } = require('../middleware/user');

const router = express.Router();

router.get('/login', isLoggedInquery, setSession, tiktok.tiktokLogin);

router.get('/authenticate', tiktok.tiktokCodeReturn);

router.post('/validatelink', isLoggedIn, tiktok.validatateTiktokLink);

router.get('/getTiktokMedia', tiktok.getTiktokMedia);

router.get('/getMediaInfo', tiktok.getMediaInfo);

module.exports = router;
