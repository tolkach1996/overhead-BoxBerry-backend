const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    id: String,
    idMoysklad: String,
    date: Date,
    client: {
        id: String,
        name: String,
        phone: String
    },
    summa: Number,
    project: {
        id: String,
        name: String
    },
    stock: {
        id: String,
        name: String
    },
    status: {
        id: String,
        name: String
    },
    type: String,
    dateMove: Date
},
{
    timestamps: true,
    versionKey: false
})

const OrderMovement = mongoose.model('OrderMovement', schema);

module.exports = OrderMovement;