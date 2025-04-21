const mongoose = require("mongoose");
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const Review = require("../Models/reviews");
const Listing = require("../Models/listing");

const allListings = async (req, res) => {
  const { location } = req.query;
  let listings;

  if (location) {
    listings = await Listing.find({
      location: { $regex: location, $options: "i" },
    });
  } else {
    listings = await Listing.find({});
  }
  res.render("Listings/index", { listings });
};

//show route
const showList = async (req, res) => {
  const id = req.params.id;
  const list = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  if (!list) {
    req.flash("error", "Listing you requested for doesn't exist");
    res.redirect("/listings/listingsall");
  }
  res.render("Listings/list", { list });
};
//Get form
const getForm = async (req, res) => {
  res.render("Listings/new");
};
//create Listing
const createListing = wrapAsync(async (req, res) => {
  let url = req.file.path;
  let filename = req.file.filename;
  console.log(url + " " + filename);
  const addNewList = new Listing(req.body);
  addNewList.owner = req.user._id;
  addNewList.image = { url, filename };
  await addNewList.save();
  // res.send(req.file);
  req.flash("success", "New Listing created");
  res.redirect("/listings/listingsall");
});
//edit Form
const editForm = async (req, res) => {
  const id = req.params.id;
  const listData = await Listing.findById(id);
  if (!listData) {
    req.flash("error", "Listing you requested for doesn't exist");
    res.redirect("/listings/listingsall");
  }
  console.log(listData);
  let original_img_url = listData.image.url;
  original_img_url = original_img_url.replace("/upload", "/upload/w_250");
  console.log(original_img_url);
  res.render("Listings/edit", { listData, original_img_url });
};
//edit Listing
const editList = async (req, res) => {
  let id = req.params.id;
  let editList = await Listing.findByIdAndUpdate(
    id,
    {
      ...req.body,
    },
    { runValidators: true }
  );
  console.log(req.file);
  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    editList.image = { url, filename };
    await editList.save();
  }
  req.flash("success", "Listing Updated");
  res.redirect(`/listings/listingsall/${id}`);
};
//delete
const deleteList = async (req, res) => {
  const id = req.params.id;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing deleted");
  res.redirect(`/listings/listingsall/${id}`);
};
//reviews post route
const addReviews = wrapAsync(async (req, res) => {
  const id = req.params.id;
  let listing = await Listing.findById(id);
  let newReview = new Review(req.body.review);
  newReview.author = req.user._id;
  listing.reviews.push(newReview);
  console.log(newReview);
  await newReview.save();
  await listing.save();
  req.flash("success", "Review added");
  res.redirect(`/listings/listingsall/${id}`);
});
//delete review
const deleteReview = wrapAsync(async (req, res) => {
  const { id, reviewId } = req.params;
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Review deleted");
  res.redirect(`/listings/listingsall/${id}`);
});

module.exports = {
  allListings,
  showList,
  getForm,
  createListing,
  editForm,
  editList,
  deleteList,
  addReviews,
  deleteReview,
};
