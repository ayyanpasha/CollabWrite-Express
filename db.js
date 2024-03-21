const mongoose = require('mongoose');
require('dotenv').config();

const connectToDb = () => {
    mongoose.connect(process.env.MONGO_DB_URI)
        .then(() => {
            console.log("MongoDB connected");
        })
        .catch((error) => {
            console.error(error);
        })
}
module.exports = connectToDb;