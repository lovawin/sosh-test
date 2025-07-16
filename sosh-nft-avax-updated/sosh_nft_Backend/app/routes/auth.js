const express = require('express');

const router = express.Router();
const AuthController = require('../controllers/auth.controller');

const Auth = new AuthController();

router.get('/message', Auth.signMessage);
router.post('/login', Auth.login);
router.get('/logout', Auth.logout);

module.exports = router;
