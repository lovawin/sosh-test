const express = require('express');
const upload = require('../utils/multer');
const { bearerUserFetch } = require('../middleware/user');

const router = express.Router();
const functionHandler = require('../handler/http/requesthandler');
const UserCollection = require('../controllers/user.controller');

const User = new UserCollection();

router.get('/getUserByWalletAddress/:wallet_address', User.getUserByAccount);
router.get('/checkusername', User.checkUsername);
router.get('/getuserdetails/:userId', bearerUserFetch, User.getUserById);
router.post('/updateUser', User.updateUser);
router.post('/updateprofileimage', upload.single('image'), User.updateProfileImage);
router.post('/removeprofileimage', upload.single('image'), User.removeProfileImage);
router.get('/follow/:followerid', User.follow);
router.get('/unfollow/:followerid', User.unfollow);
router.get('/getfollowers/:userId', User.getFollower);
router.get('/suggesteduser/getUsers', User.suggestedUser);
router.get('/getConfig', User.getConfig);
router.delete('/delete', User.deleteUser);

module.exports = router;
