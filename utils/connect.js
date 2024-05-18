const mongoose = require("mongoose");

mongoose.connect(process.env.mongodbUri)
    .then(() => console.log("db connected!"))
    .catch((err) => console.log(err.message));