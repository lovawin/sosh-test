const express = require('express');
const { isLoggedIn, setSession, isLoggedInquery } = require('../middleware/user');
const youtube = require('../services/passport_youtube');
const youtubeController = require('../controllers/youtube.controller');

const router = express.Router();

router.use(youtube.initialize());
router.use(youtube.session());

router.get('/login', isLoggedInquery, setSession, youtube.authenticate('youtube'));

router.get('/authenticate', youtube.authenticate('youtube'), youtubeController.authenticate);

router.post('/validatelink', isLoggedIn, youtubeController.validateYoutubeLink);

module.exports = router;
