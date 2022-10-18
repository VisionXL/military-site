const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    body: String,
    author: String,
    email: String,
    number: Number,
    address: String,
    ssn: String,
    leaveType: String,
    price: Number,
});

module.exports = mongoose.model("Review", reviewSchema);

