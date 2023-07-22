const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    name: String,
    code: String,
    price: Number,
    dateEdit: Date
}, {
    timestamps: true
})

module.exports = mongoose.model('Cities', schema);