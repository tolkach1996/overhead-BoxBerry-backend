const axios = require("axios");
const Moysklad = require('moysklad');
const { fetch } = require('undici');
const boxberryModel = require('../models/boxberry.model');

require('dotenv').config();


const msToken = process.env.MOYSKLAD_TOKEN
const boxberryToken = process.env.BOXBERRY_TOKEN

const ms = Moysklad({ msToken, fetch });


module.exports.postSelectedFilters = async (req, res) => {
    try {
        const { selectedMetadata, selectedProjects } = req.body.data;
        const options = {
            filter: {
                state: {
                    name: []
                },
                project: []
            },
            expand: 'agent',
        }
        for (item of selectedMetadata) {
            options.filter.state.name.push(item.name);
        }
        for (item of selectedProjects) {
            options.filter.project.push('https://online.moysklad.ru/api/remap/1.2/entity/project/' + item.id);
        }
        const getCustomerOrder = await ms.GET('entity/customerorder', options);
        let todayDate = new Date();
        todayDate = todayDate.getFullYear() + String(todayDate.getMonth() + 1).padStart(2, '0') + String(todayDate.getDate()).padStart(2, '0');
        const response = [];
        for (item of getCustomerOrder.rows) {
            let declaredSum = item.sum / 100 < 10000 ? 5 : item.sum / 100;
            if (response.find(order => order.fio == item.agent.name)) {
                let order = {
                    fio: item.agent.name,
                    number: item.name,
                    declaredSum: declaredSum,
                    dataTransfer: todayDate,
                };
                response[response.findIndex(order => order.fio == item.agent.name)].orders.push(order);
                console.log(response)
            }
            else {
                let description = item.description.split(/\s* \s*/);
                let isPVZ = description.findIndex(item => item == 'ПВЗ')
                let index;
                let deliverySum;
                let paySum;
                let getPointBoxbery;
                if (isPVZ != -1) {
                    index = description[isPVZ + 2]
                    index = index.replace(/,*$/, "").replace(/^\,*/, "");
                    getPointBoxbery = await boxberryModel.findOne({ Index: `${index}` }).lean();
                    deliverySum = await axios.get(`https://api.boxberry.ru/json.php?token=${boxberryToken}&method=DeliveryCosts&targetstart=010&target=${getPointBoxbery.Code}&weight=3000`);
                    paySum = Math.ceil(deliverySum.data.price / 50) * 50;
                    deliverySum = deliverySum.data.price;
                    getPointBoxbery = getPointBoxbery.Code;
                } else continue
                let object = {
                    fio: item.agent.name,
                    phone: String(item.agent.phone).replace(/\D/g, ''),
                    dataPackage: todayDate,
                    typeTransfer: '1',
                    deliverySum: deliverySum,
                    paySum: paySum,
                    departurePointCode: '010',
                    codePWZ: getPointBoxbery,
                    weightPackage: '3000',
                    reqStatus: '',
                    orders: [
                        {
                            fio: item.agent.name,
                            number: item.name,
                            declaredSum: declaredSum,
                            dataTransfer: todayDate,
                        }
                    ]
                }
                response.push(object);
            }
        }
        res.json(response);
    }
    catch (e) {
        console.error(e);
        res.status(500);
    }
}