require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const ejsmate = require("ejs-mate");
const cookieParser = require("cookie-parser");
const ExpressError = require("./utils/ExpressError");
const listingRoutes = require("./Routes/listingRoute");
const reviewRoutes = require("./Routes/reviewRoute");
const userRoutes = require("./Routes/userRoute");
const homepageRoutes = require("./Routes/homepageRoute");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./Models/user");
const MongoStore = require("connect-mongo");
const session = require("express-session");
const dbUrl = process.env.ATLASDB_URL;
const secretKey = process.env.SECRET;
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: secretKey,
  },
  touchAfter: 24 * 3600,
});
store.on("error", () => {
  console.log("mongo session error", err);
});
const sessionOptions = {
  store,
  secret: secretKey,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
const flash = require("connect-flash");
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.successMsg = req.flash("success");
  res.locals.errMsg = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(cookieParser("mySuperSecret123"));

app.engine("ejs", ejsmate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "Views"));
app.use(express.static(path.join(__dirname, "public")));

// Cookie test routes
app.get("/getcookies", (req, res) => {
  res.cookie("greet", "hello");
  res.send("Cookie set");
});

app.get("/getsignedcookie", (req, res) => {
  res.cookie("color", "blue", { signed: true });
  console.log(req.signedCookies);
  res.send("Signed cookie set");
});

app.get("/verify", (req, res) => {
  console.log(req.cookies);
  console.log(req.signedCookies);
  res.send("Verified cookies");
});
//session
app.get("/register", (req, res) => {
  let { name = "anonymous" } = req.query;
  req.session.name = name;

  if (name === "anonymous") {
    req.flash("success", "user not registered");
  } else {
    req.flash("error", "user registered successfully");
  }
  res.redirect("/hello");
});
app.get("/hello", (req, res) => {
  res.render("page.ejs", { name: req.session.name });
});
// Routes
app.use("/", homepageRoutes);
app.use("/listings", listingRoutes);
app.use("/listings", reviewRoutes);
app.use("/listings", userRoutes);

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page not found!"));
});

// Error Handler
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error.ejs", { message });
});

module.exports = app;
