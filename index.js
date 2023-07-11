const express = require('express')
const cors = require('cors')
const xlsx = require('xlsx')
const Moysklad = require('moysklad')
const axios = require("axios")
const { initialMongoConnection } = require('./utils/mongoose')
const fileupload = require('express-fileupload')
const path = require('path');
const { fetch } = require('undici')
const listPointsBoxbery = require('./models/ListPointsBoxbery')
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
    const worksheet = xlsx.utils.json_to_sheet(req.body?.data)
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
            //limit: '1'
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
            let description = item.description.split(/\s* \s*/);
            let isPVZ = description.findIndex(item => item == 'ПВЗ')
            let index;
            let deliverySum;
            let paySum;
            let getPointBoxbery;
            if (isPVZ != -1) {
                index = description[isPVZ + 2]
                index = index.replace(/,*$/, "").replace(/^\,*/, "")
                getPointBoxbery = await listPointsBoxbery.findOne({ Index: `${index}` }).lean()
                deliverySum = await axios.get(`https://api.boxberry.ru/json.php?token=${boxberryToken}&method=DeliveryCosts&targetstart=010&target=${getPointBoxbery.Code}&weight=3000`)
                paySum = Math.ceil(deliverySum.data.price / 50) * 50
                deliverySum = deliverySum.data.price
                getPointBoxbery = getPointBoxbery.Code
            } else continue
            let declaredSum = item.sum / 100 < 10000 ? 5 : item.sum / 100;
            let object = {
                dataPackage: todayDate,
                number: item.name,
                declaredSum: declaredSum,
                paySum: paySum,
                deliverySum: deliverySum,
                dataTransfer: todayDate,
                typeTransfer: '1',
                codePWZ: getPointBoxbery,
                departurePointCode: '010',
                fio: item.agent.name,
                phone: item.agent.phone,
                weightPackage: '3000'
            }
            response.push(object)
        }
        res.json(response)
    }
    catch (e) { console.log(e) }
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