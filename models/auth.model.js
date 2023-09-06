const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    login: String,
    password: String,
    role: String,
    active: Boolean,
},
{
    timestamps: true,
    versionKey: false
})

module.exports = mongoose.model('User', schema);