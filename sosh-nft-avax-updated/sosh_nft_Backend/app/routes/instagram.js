const express = require("express");
const instagram = require("../controllers/instagram.controller");
const insta = require("../services/passport_instagram");
const {
  isLoggedIn,
  setSession,
  isLoggedInquery,
} = require("../middleware/user");

const router = express.Router();

router.get("/login", isLoggedInquery, setSession, instagram.instaLogin);

router.get(
  "/authenticate",
  // insta.authenticate("instagram"),
  instagram.instaCodeReturn
);

router.post("/validatelink", isLoggedIn, instagram.validateInstaLink);

router.get("/getInstaMedia", instagram.getInstaMedia);

router.get("/getMediaInfo", instagram.getMediaInfo);

module.exports = router;
