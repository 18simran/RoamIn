const mongoose = require("mongoose");
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const Review = require("../Models/reviews");
const Listing = require("../Models/listing");

const mainRoute = (req, res) => {
  res.send("This is Home page ");
  console.log("I am root");
};

const allListings = async (req, res) => {
  const listings = await Listing.find({});
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
  const listData = await Listing.findById(`${id}`);
  if (!listData) {
    req.flash("error", "Listing you requested for doesn't exist");
    res.redirect("/listings/listingsall");
  }

  res.render("Listings/edit", { listData });
};
//edit Listing
const editList = async (req, res) => {
  const id = req.params.id;
  const { title, description, image, price, location, country } = req.body;

  if (!title || !description || !image || !price || !location || !country) {
    throw new ExpressError(400, "update not valid");
  }
  let editList = await Listing.findByIdAndUpdate(
    `${id}`,
    {
      title: title,
      description: description,
      image: image,
      price: price,
      location: location,
      country: country,
    },
    { runValidators: true }
  );
  editList.save();
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
  mainRoute,
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
