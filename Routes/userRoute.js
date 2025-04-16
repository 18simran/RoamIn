const express = require("express");
const router = express.Router();
const passport = require("passport");

const {
  signUpForm,
  signUp,
  loginForm,
  login,
  logout,
} = require("../Controllers/userController");
const { saveRedirectUrl } = require("../middleware");

router.get("/signup", signUpForm);
router.post("/signup", signUp);
router;
router.get("/login", loginForm);
router.post(
  "/login",
  saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "login",
    failureFlash: true,
  }),
  login
);
router.get("/logout", logout);
module.exports = router;
