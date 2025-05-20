const Listing = require("../Models/listing");
const homeLayout = (req, res) => {
  res.render("Listings/home");
};

const categoryListings = async (req, res) => {
  try {
    const categoryParam = req.params.category;
    const listings = await Listing.find({
      category: { $regex: new RegExp(`^${categoryParam}$`, "i") },
    });
    res.render("Listings/categoryListings", {
      listings,
      category: categoryParam,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};
module.exports = {
  homeLayout,
  categoryListings,
};
