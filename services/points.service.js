const axios = require("axios");
const boxberryModel = require('../models/boxberry.model');
require('dotenv').config();

const boxberryToken = process.env.Boxbery_TOKEN

module.exports.updateListPointBoxberry = async () => {
    let res = await axios.get(`https://api.boxberry.ru/json.php?token=${boxberryToken}&method=ListPoints&prepaid=1&CountryCode=643`);
    for (let item of res.data) {
        item.Index = item.Address.split(/\s*,\s*/)[0];
    }
    await boxberryModel.deleteMany({});
    await boxberryModel.insertMany(res.data);
}
