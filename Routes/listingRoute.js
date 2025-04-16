const express = require("express");
const router = express.Router();
const { listing } = require("../schema");
const ExpressError = require("../utils/ExpressError");
const { isLoggedin, isOwner } = require("../middleware");
const multer = require("multer");
const { storage } = require("../cloudConfiq.js");
const upload = multer({ storage });
const {
  mainRoute,
  allListings,
  getForm,
  showList,
  createListing,
  editForm,
  editList,
  deleteList,
} = require("../Controllers/listingController");
const validateListing = (req, res, next) => {
  let { error, value } = listing.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    console.log(errMsg);
    throw new ExpressError(400, errMsg);
  } else {
    req.body = value;
    next();
  }
};
router.get("/", mainRoute);
router.get("/listingsall", allListings);
router
  .route("/listingsall/new")
  .get(isLoggedin, getForm)
  .post(
    isLoggedin,
    upload.single("listing[image]"),
    validateListing,
    createListing
  );
// router.get("/listingsall/new", getForm);
// router.post("/listingsall/new", validateListing, createListing);
router
  .route("/listingsall/:id")
  .get(showList)
  .delete(isLoggedin, isOwner, deleteList);
router
  .route("/listingsall/:id/edit")
  .get(isLoggedin, isOwner, editForm)
  .put(editList);
module.exports = router;
