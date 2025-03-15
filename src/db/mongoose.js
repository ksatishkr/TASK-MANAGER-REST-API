const mongoose = require("mongoose");
const databaseURL = process.env.MONGODB_URL;
mongoose.connect(databaseURL, {}).catch((connectionError) => {
  console.log("Unable to connect to database!", connectionError);
});
