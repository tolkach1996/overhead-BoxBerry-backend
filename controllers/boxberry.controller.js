const axios = require("axios");
require('dotenv').config();

const { calcDeclaredSum, setIssue } = require('../helpers');

const boxberryToken = process.env.BOXBERRY_TOKEN;


module.exports.sendConsigmentBoxBerry = async (req, res, next) => {
    try {

        const { data: rows } = req.body;

        for (let item of rows) {

            const declaredSum = calcDeclaredSum(item.orders, item.declaredStatus);
            const issue = setIssue(item.openingStatus);

            let options = {
                token: boxberryToken,
                method: "ParselCreate",
                sdata: {
                    order_id: item.numberOrder,
                    price: declaredSum,
                    payment_sum: item.paySum,
                    delivery_sum: item.deliverySum,
                    vid: "1",
                    shop: {
                        name: item.codePWZ,
                        name1: item.departurePointCode
                    },
                    customer: {
                        fio: item.fio,
                        phone: item.phone
                    },
                    weights: {
                        weight: item.weightPackage
                    },
                    issue
                }
            }
            let responce = await axios.post(`https://api.boxberry.ru/json.php?`, options);
            const data = responce.data
            if (data.track) {
                item.reqStatus = 'Ок';
            } else {
                item.reqStatus = data.err;
            }
        }
        res.status(200).json({ ok: true, rows });
    }
    catch (e) {
        next(e);
    }
}