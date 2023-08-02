const axios = require("axios");
require('dotenv').config();

const boxberryToken = process.env.BOXBERRY_TOKEN;


module.exports.sendConsigmentBoxBerry = async (req, res, next) => {
    try {
        const table = [];
        for (let item of req.body.data) {

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
            if (data.track) { table.push({ res: "Ок" }) }
            else {
                table.push({ res: "Ошибка", err: data.err });
            }
        }
        res.status(200).json(table);
    }
    catch (e) {
        next(e);
    }
}