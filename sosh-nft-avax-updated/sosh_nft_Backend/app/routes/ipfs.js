const express = require('express');

const router = express.Router();
const IpfsController = require('../controllers/ipfs.controller');
const { isLoggedIn } = require('../middleware/user');

const IPFS = new IpfsController();

router.post('/uploadmetadata', isLoggedIn, IPFS.uploadmetadata);

module.exports = router;
