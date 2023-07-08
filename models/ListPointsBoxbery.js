const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    Code: {
        type: String
    },
    Name: {
        type: String
    },
    Index: {
        type: String
    },
    Address: {
        type: String
    },
    Phone: {
        type: String
    },
    WorkShedule: {
        type: String
    },
    TripDescription: {
        type: String
    },
    DeliveryPeriod: {
        type: String
    },
    CityCode: {
        type: String
    },
    CityName: {
        type: String
    },
    TariffZone: {
        type: String
    },
    Settlement: {
        type: String
    },
    Area: {
        type: String
    },
    Country: {
        type: String
    },
    GPS: {
        type: String
    },
    AddressReduce: {
        type: String
    },
    OnlyPrepaidOrders: {
        type: String
    },
    Acquiring: {
        type: String
    },
    DigitalSignature: {
        type: String
    },
    CountryCode: {
        type: String
    },
    NalKD: {
        type: String
    },
    Metro: {
        type: String
    },
    TypeOfOffice: {
        type: String
    },
    VolumeLimit: {
        type: String
    },
    LoadLimit: {
        type: String
    },
    Postamat: {
        type: String
    }
})

module.exports = mongoose.model('ListPoints', schema);