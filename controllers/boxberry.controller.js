const axios = require("axios");
require('dotenv').config();

const boxberryToken = process.env.BOXBERRY_TOKEN;


module.exports.sendConsigmentBoxBerry = async (req, res, next) => {
    try {

        const { data: rows } = req.body;

        for (let item of rows) {

            let declaredSum = item.orders.reduce((pre, cur) => {
                return pre += Number(cur.declaredSum);
            }, 0);
            if (declaredSum < 10000) declaredSum = 5;

            let options = {
                token: boxberryToken,
                method: "ParselCreate",
                sdata: {
                    order_id: item.orders[0].number,
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
                    }
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