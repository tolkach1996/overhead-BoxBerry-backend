const xlsx = require('xlsx');
const path = require('path');

const axios = require("axios");
const citiesModel = require('../models/cities.model');
require('dotenv').config();

const boxberryToken = process.env.BOXBERRY_TOKEN;

class CitiesService {
    static async getAll() {
        const cities = await citiesModel.find().sort({ name: 1 }).lean();
        return cities;
    }

    static async findByCity(city) {
        return await citiesModel.findOne({ name: city }).lean();
    }

    static async updateFromBoxBerry() {
        const cities = await this.getAll();
        let res = await axios.get(`https://api.boxberry.ru/json.php?token=${boxberryToken}&method=ListCities&CountryCode=643`);

        const insertCities = [];

        for (let item of res.data) {
            const isExist = cities.find(c => c.name === item.Name);
            if (!isExist) {
                insertCities.push({
                    name: item.Name,
                    code: item.Code,
                    price: null,
                    dateEdit: null
                });
            }
        }

        await citiesModel.insertMany(insertCities)

        console.log('- Cities Upload');
    }

    static async updateyCity(city, payload) {
        payload.dateEdit = new Date();
        await citiesModel.findOneAndUpdate({ name: city }, payload);
    }
    static async updateById(id, payload) {
        payload.dateEdit = new Date();
        await citiesModel.findOneAndUpdate({ _id: id }, payload);
    } 

    static async readPriceFromExcel() {
        try {
            const PRICE_COL = 'Цена доставки';
            const CITY_COL = 'Город';

            const wb = xlsx.readFile(path.join(__dirname, '../files', '/citiesPrice.xlsx'));
            const array = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);

            for (let row of array) {
                const { [CITY_COL]: city, [PRICE_COL]: price } = row;
                await this.updateyCity(city, { price });
            }

            console.log('- UPDATED CITIES PRICES');
        } catch(e) {
            console.error(e);
        }
    }
}

module.exports = CitiesService;