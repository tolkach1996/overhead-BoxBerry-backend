const express = require('express')
const cors = require('cors')
const xlsx = require('xlsx')
const Moysklad = require('moysklad')
const axios = require("axios")
const { initialMongoConnection } = require('./utils/mongoose')
const fileupload = require('express-fileupload')
const path = require('path');
const { fetch } = require('undici')
const boxberryModel = require('./models/boxberry.model')
require('dotenv').config()
initialMongoConnection()

const msToken = process.env.MOYSKLAD_TOKEN
const boxberryToken = process.env.Boxbery_TOKEN
const PORT = process.env.PORT || 5000


const app = express()
app.use(cors({ origin: "*" }))
app.use(express.json())
app.use(fileupload())

const ms = Moysklad({ msToken, fetch });


const start = () => {
    try {
        app.listen(PORT, () => console.log(`server started on port ${PORT}`))
    }
    catch (e) {
        console.log(e)
    }
}


app.post('/downloadConsigmentExcel', (req, res) => {
    const workbook = xlsx.utils.book_new();
    let table = []
    for (let item of req.body?.data) {
        let declaredSum = 0;
        if (item.orders.length > 1) {
            for (let order of item.orders) {
                declaredSum += order.declaredSum
            }
            if (declaredSum < 10000) declaredSum = 5
        }
        else declaredSum = 5
        let newStreing = {
            "Дата посылки (ГГГГММДД)": item.dataPackage,
            "Номер заказа в ИМ": item.orders[0].number,
            "Объявленная стоимость": declaredSum,
            "Сумма к оплате": item.paySum,
            "Стоимость доставки": item.deliverySum,
            "Дата передачи ЗП": item.dataPackage,
            "Номер паллеты": '',
            "Номер акта передачи": '',
            "Вид доставки": item.typeTransfer,
            "Код ПВЗ": item.codePWZ,
            "Код пункта поступления": item.departurePointCode,
            "ФИО": item.fio,
            "Номер телефона": item.phone,
            "Доп. номер телефона": '',
            "E-mail для оповещений": '',
            "Наименование организации": '',
            "Адрес": '',
            "ИНН": '',
            "КПП": '',
            "Расчетный счет": '',
            "Наименование банка": '',
            "Кор. счет": '',
            "БИК": '',
            "Вес 1-ого места": item.weightPackage,
            "Вес 2-ого места": '',
            "Вес 3-ого места": '',
            "Вес 4-ого места": '',
            "Вес 5-ого места": '',
            "Индекс": '',
            "Город": '',
            "Адрес получателя": '',
            "Время доставки, от (ЧЧ:ММ)": '',
            "Время доставки, до (ЧЧ:ММ)": '',
            "Дата доставки (ГГГГММДД)": '',
            "Комментарий": '',
            "Баркод 1-го места": '',
            "Баркод 2-го места": '',
            "Баркод 3-го места": '',
            "баркод 4-го места": '',
            "Баркод 5-го места": '',
            "Тип отпраления ПР": '',
            "Хрупкий груз для ПР": '',
            "Оптимизация тарифа ПР": '',
            "Строгий тип отправления ПР": '',
            "Длина, см": '',
            "Ширина, см": '',
            "Высота, см": '',
            "Тип упаковки": '',
            "Запретить изменение упаковки": '',
            "Тип выдачи": '',
        }
        table.push(newStreing)
    }
    const worksheet = xlsx.utils.json_to_sheet(table)
    xlsx.utils.book_append_sheet(workbook, worksheet)
    xlsx.writeFile(workbook, `files/test.xlsx`);
    const pathFile = path.join(__dirname, 'files', 'test.xlsx');
    res.sendFile(pathFile);
})

app.get('/getFilterData', async (req, res) => {
    try {
        let metadata = await getFilterMetadata();
        let projects = await getFilterProject();
        res.json({ metadata: metadata, projects: projects })
    }
    catch (e) {
        console.error(e)
    }
})

app.post('/postSelectedFilters', async (req, res) => {
    try {
        const { selectedMetadata, selectedProjects } = req.body.data
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
            options.filter.state.name.push(item.name)
        }
        for (item of selectedProjects) {
            options.filter.project.push('https://online.moysklad.ru/api/remap/1.2/entity/project/' + item.id)
        }
        const getCustomerOrder = await ms.GET('entity/customerorder', options);
        let todayDate = new Date()
        todayDate = todayDate.getFullYear() + String(todayDate.getMonth() + 1).padStart(2, '0') + String(todayDate.getDate()).padStart(2, '0')
        const response = []
        for (item of getCustomerOrder.rows) {
            let declaredSum = item.sum / 100 < 10000 ? 5 : item.sum / 100;
            if (response.find(order => order.fio == item.agent.name)) {
                let order = {
                    fio: item.agent.name,
                    number: item.name,
                    declaredSum: declaredSum,
                    dataTransfer: todayDate,
                };
                response[response.findIndex(order => order.fio == item.agent.name)].orders.push(order)
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
                    index = index.replace(/,*$/, "").replace(/^\,*/, "")
                    getPointBoxbery = await boxberryModel.findOne({ Index: `${index}` }).lean()
                    deliverySum = await axios.get(`https://api.boxberry.ru/json.php?token=${boxberryToken}&method=DeliveryCosts&targetstart=010&target=${getPointBoxbery.Code}&weight=3000`)
                    paySum = Math.ceil(deliverySum.data.price / 50) * 50
                    deliverySum = deliverySum.data.price
                    getPointBoxbery = getPointBoxbery.Code
                } else continue
                let object = {
                    fio: item.agent.name,
                    phone: item.agent.phone,
                    dataPackage: todayDate,
                    typeTransfer: '1',
                    deliverySum: deliverySum,
                    paySum: paySum,
                    departurePointCode: '010',
                    codePWZ: getPointBoxbery,
                    weightPackage: '3000',
                    orders: [
                        {
                            fio: item.agent.name,
                            number: item.name,
                            declaredSum: declaredSum,
                            dataTransfer: todayDate,
                        }
                    ]
                }
                response.push(object)
            }
        }
        res.json(response)
    }
    catch (e) { console.log(e) }
})

app.post('/sendConsigmentBoxBerry', async (req, res) => {
    for (let item of req.body.data) {
        let declaredSum = 0;
        if (item.orders.length > 1) {
            for (let order of item.orders) {
                declaredSum += order.declaredSum
            }
            if (declaredSum < 10000) declaredSum = 5
        }
        else declaredSum = 5
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
        let res = await axios.post(`https://api.boxberry.ru/json.php?`, options)
        console.log(res.data)
    }
})

async function getFilterMetadata() {
    const metadata = []
    const getMetadata = await ms.GET('entity/customerorder/metadata');
    await getMetadata.states.forEach(({ id, name }) => metadata.push({ id, name }));
    return metadata
}
async function getFilterProject() {
    const project = []
    const getProjects = await ms.GET('entity/project');
    getProjects.rows.forEach(({ id, name }) => project.push({ id, name }))
    return project
}


start()

/*

*/