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
    //fs.createReadStream('Sheets/test.xlsx').pipe(res)
    //res.status(200).json('Сервер создал файл Excel')
    //res.sendFile(__dirname + )


})


app.get('/getFilterData', (req, res) => {
    let data = [];
    let project = [];
    getFilterData(data, project)


    console.log(data)

    //res.send()

    //const workbook = xlsx.utils.book_new();
    //const worksheet = xlsx.utils.json_to_sheet(req.body?.data)
    //xlsx.utils.book_append_sheet(workbook, worksheet)
    //xlsx.writeFile(workbook, `files/test.xlsx`);

    //const pathFile = path.join(__dirname, 'files', 'test.xlsx');


    //res.sendFile(pathFile);


})
async function getFilterData(data, project) {
    const metadata = await ms.GET('entity/customerorder/metadata');
    metadata.states.forEach(({ name }) => data.push(name));
    const projects = await ms.GET('entity/project');
    projects.rows.forEach(item => project.push(item.name))
    return data, project
    console.log(data, project)
}

/*const ms = Moysklad({ token, fetch })
const options = {
    //limit: 7,
    filter: {
        state: {
            name: 'Оплачен'
        }
    },
    expand: 'state'
}
let test = async function () {
    const productsCollection = await ms.GET('entity/customerorder', options);

    productsCollection.rows.forEach(item => {
        console.log(`${item.meta.uuidHref} - ${item.state.name} - ${item.payedSum / 100} руб`);
    });

}*/
const ms = Moysklad({ token, fetch });

let test = async function () {
    const data = await ms.GET('entity/customerorder/metadata');
    //data.states.forEach(({ name }) => console.log(name));
    const project = await ms.GET('entity/project');
    //project.rows.forEach(item => console.log(item.name))
    return (data, project)
}


//test();
//const productsCollection = ms.GET('entity/product', { limit: 50 })
//console.log(productsCollection)



start()