const express = require('express')
const cors = require('cors')
const fileupload = require('express-fileupload')
const { initialMongoConnection } = require('./utils/mongoose')

const routerExcel = require('./routers/excel.router')
const routerFilter = require('./routers/filter.router')
const routerMs = require('./routers/ms.router')
const routerBoxBerry = require('./routers/boxberry.router')

require('dotenv').config()
initialMongoConnection()

const PORT = process.env.PORT || 5000

const app = express()
app.use(cors({ origin: "*" }))
app.use(express.json())
app.use(fileupload())
app.use('/excel', routerExcel)
app.use('/filters', routerFilter)
app.use('/ms', routerMs)
app.use('/boxberry', routerBoxBerry)

app.listen(PORT, () => console.log(`server started on port ${PORT}`))