const axios = require("axios");
const Moysklad = require('moysklad');
const { fetch } = require('undici');
const boxberryModel = require('../models/boxberry.model');

require('dotenv').config();


const msToken = process.env.MOYSKLAD_TOKEN
const boxberryToken = process.env.BOXBERRY_TOKEN;

const ms = Moysklad({ msToken, fetch });

const projectUrl = 'https://online.moysklad.ru/api/remap/1.2/entity/project/';

function formatTelephone(tel) {
    const numberTel = tel.replace(/\D/g, '');
    if (numberTel.charAt(0) != 7) {
        return `7${numberTel.substring(1)}`;
    }
    return numberTel;
}

module.exports.postSelectedFilters = async (req, res, next) => {
    try {
        const { selectedMetadata, selectedProjects } = req.body;
        const options = {
            filter: {
                state: {
                    name: []
                },
                project: []
            },
            expand: 'agent, project',
        }
        options.filter.state.name = selectedMetadata.map(item => item.name);
        options.filter.project = selectedProjects.map(item => (projectUrl + item.id));

        let getCustomerOrder = await ms.GET('entity/customerorder', options);
        const todayDate = new Date().toLocaleDateString('ru-RU', { year: "numeric", month: 'numeric', day: 'numeric' }).split('.').reverse().join('');
        const response = [];

        const pages = Math.ceil(getCustomerOrder.meta.size / getCustomerOrder.meta.limit);

        for (let i = 0; i < pages; i++) {
            for (let item of getCustomerOrder.rows) {

                const partsComment = item.description.split(' ');
                const isBoxberry = !!partsComment.find(item => item == 'ПВЗ');
    
                if (isBoxberry) {
                    const declaredSum = item.sum / 100 < 10000 ? 5 : item.sum / 100;
                    const sumOrder = Number(item.sum / 100);
                    const index = partsComment.map(item => item.replace(/\D/g, '')).filter(item => item.length === 6);
                    const pointsBoxberry = await boxberryModel.find({ Index: { $in: index } }, { Code: 1, Address: 1 }).lean();
                    const pointBoxberry = pointsBoxberry.find(point => {
                        return item.description.includes(point.Address);
                    });
                    if (!pointBoxberry) {
                        console.error('ERROR');
                    }
                    let deliverySum = null;
                    let codePoint = null;
                    let paySum = null;
                    if (pointBoxberry) {
                        codePoint = pointBoxberry.Code;
                        const fetchDeliveryBoxberry = await axios.get(`https://api.boxberry.ru/json.php?token=${boxberryToken}&method=DeliveryCosts&targetstart=010&target=${codePoint}&weight=3000`);
                        deliverySum = fetchDeliveryBoxberry?.data?.price;
                        paySum = deliverySum ? Math.ceil(deliverySum / 50) * 50 : null;
                    }
    
                    const rowData = {
                        id: item.id,
                        project: item?.project?.name || null,
                        fio: item.agent.name,
                        numberOrder: item.name,
                        sumOrder,
                        comment: item.description,
                        phone: formatTelephone(item.agent.phone),
                        dataPackage: todayDate,
                        typeTransfer: '1',
                        deliverySum: deliverySum,
                        declaredSum,
                        paySum: paySum,
                        departurePointCode: '010',
                        codePWZ: codePoint,
                        weightPackage: '3000',
                    }
    
                    const order = response.find(item => {
                        const isSameName = String(item.fio).toLowerCase() == String(rowData.fio).toLowerCase();
                        const isSamePhone = item.phone == rowData.phone;
    
                        return isSameName || isSamePhone;
                    })
    
                    if (order) {
                        order.orders.push(rowData);
                    } else {
                        rowData.orders = [JSON.parse(JSON.stringify(rowData))];
                        response.push(rowData);
                    }
                }
            }

            options.offset = i * 100 + 100;
            if (i !== pages - 1) getCustomerOrder = await ms.GET('entity/customerorder', options);
        }

        response.sort((a, b) => {
            if (a.fio > b.fio) return 1;
            if (a.fio < b.fio) return -1;
            return 0;
        })

        res.status(200).json(response);
    }
    catch (e) {
        next(e);
    }
}