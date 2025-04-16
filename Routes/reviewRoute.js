const express = require("express");
const { review } = require("../schema");
const ExpresError = require("../utils/ExpressError");
const router = express.Router();
const {
  addReviews,
  deleteReview,
} = require("../Controllers/listingController");
const { isLoggedin } = require("../middleware");
const { isReviewAuthor } = require("../middleware");
const validateReview = (req, res, next) => {
  let { error, value } = review.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    console.log(errMsg);
    throw new ExpresError(400, errMsg);
  } else {
    req.body = value;
    next();
  }
};
router.post("/listingsall/:id/reviews", isLoggedin, validateReview, addReviews);
router.delete(
  "/listingsall/:id/reviews/:reviewId",
  isLoggedin,
  isReviewAuthor,
  deleteReview
);
module.exports = router;
