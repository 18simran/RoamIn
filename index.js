if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const app = require("./app");
const mongoose = require("mongoose");
const Listing = require("./Models/listing");
const initdata = require("./data");
const port = 5000;
// Database Connection
const dbUrl = process.env.ATLASDB_URL;

async function main() {
  await mongoose.connect(dbUrl);
}
main()
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.log(error));

const initDB = async () => {
  await Listing.deleteMany({});
  initdata.data = initdata.data.map((obj) => ({
    ...obj,
    owner: "67fb43af97405dc80b2c7260",
  }));
  await Listing.insertMany(initdata.data);
};
// initDB();

app.listen(port, () => console.log(`Listening on port ${port}`));
