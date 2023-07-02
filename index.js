const express = require('express')
const cors = require('cors')
const xlsx = require('xlsx')
const Moysklad = require('moysklad')
const fileupload = require('express-fileupload')
const path = require('path');
const { fetch } = require('undici')
require('dotenv').config()


const token = process.env.MOYSKLAD_TOKEN
const PORT = process.env.PORT || 5000


const app = express()
app.use(cors({ origin: "*" }))
app.use(express.json())
app.use(fileupload())

const ms = Moysklad({ token, fetch });


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


app.post('/postSelectedFilters', (req, res) => {
    const { selectedMetadata, selectedProjects } = req.body.data
    console.log(selectedMetadata)
    console.log(selectedProjects)
    res.send('Получил запрос')
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












const options = {
    limit: 1,
    expand: 'project',
    filter: {
        state: {
            name: "Отгружен + Чек"
        },
        /*project: {
            name: 'Frudia май'
        }*/
    }
}




let test = async function () {
    const getCustomerOrder = await ms.GET('entity/project', { limit: "2", expand: 'group', });
    console.log(getCustomerOrder.rows[0])

    /*const filterCustomerOrder = []
    const getCustomerOrder = await ms.GET('entity/customerorder', options);
    console.log(getCustomerOrder.rows[0].project.name)

    for (let i = 0; i < Math.ceil(getCustomerOrder.meta.size / 1000); i++) {
        for (let n = 0; n < 1000; n += 100) {
            const customerOrder = await ms.GET('entity/customerorder', { filter: { state: { name: "Отгружен + Чек" } }, limit: "100", offset: i + n, expand: 'project' });
            for (order of customerOrder.rows) {
                if ('project' in order) {
                    if (order.project.name == "Frudia май") {
                        filterCustomerOrder.push(order)
                    }
                }
            }
        }
    }
    console.log(filterCustomerOrder.length)*/
}
test();


start()