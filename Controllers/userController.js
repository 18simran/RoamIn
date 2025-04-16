const mongoose = require("mongoose");
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const User = require("../Models/user");
const signUpForm = async (req, res) => {
  res.render("Users/signup");
};
const signUp = wrapAsync(async (req, res) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);
    req.login(registeredUser, (err) => {
      if (err) {
        next(err);
      }
      req.flash("success", "Welcome to RoamIn");
      res.redirect("/listings/listingsall");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("signup");
  }
});
const loginForm = async (req, res) => {
  res.render("Users/login");
};
const login = async (req, res) => {
  req.flash("success", "Welcome Back!");
  let redirectUrl = res.locals.redirectUrl || "/listings/listingsall";
  res.redirect(redirectUrl);
};
const logout = async (req, res) => {
  req.logout((err) => {
    if (err) {
      next(err);
    }
    req.flash("success", "you are logged out!");
    res.redirect("/listings/listingsall");
  });
};
module.exports = { signUpForm, signUp, loginForm, login, logout };
