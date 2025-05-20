const express = require("express");
const {
  homeLayout,
  categoryListings,
} = require("../Controllers/homepageController");
const router = express.Router();

router.get("/", homeLayout);

router.get("/category/:category", categoryListings);

module.exports = router;
