// pre-defined module
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

// custom module
const { mongodbConnectionUrl, dbName } = require("../../../config");

exports.connectMongodb = () => {
  mongoose
    // .connect(mongodbConnectionUrl, {
    //   dbName,
    //   useNewUrlParser: true,
    //   useUnifiedTopology: true,
    // })
    .connect(mongodbConnectionUrl)
    .then(() => {
      console.log("DB connection successful");
    })
    .catch((err) => {
      console.log(err.message);
    });
  mongoose.connection.on("connected", () => {
    console.log("Mongoose connected to DB");
  });
  mongoose.connection.on("error", (err) => {
    console.log(err.message);
  });
  mongoose.connection.on("disconnected", () => {
    console.log("Mongoose is disconnected from DB");
  });
  process.on("SIGINT", async () => {
    await mongoose.connection.close();
    process.exit(0);
  });
};
