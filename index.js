const express = require('express');
const cors = require('cors');
const fileupload = require('express-fileupload');

const serveStatic = require('serve-static');
const history = require('connect-history-api-fallback')
const path = require('path');

const { errorMiddleware } = require('./middleware');
const { boxberryRouter, excelRouter, filterRouter, moySkladRouter, citiesRouter } = require('./routers');
const { mongoInitial, cronJob } = require('./utils');
const { updateListPointBoxberry } = require('./services/points.service');
const CitiesService = require('./services/cities.service');

require('dotenv').config();
mongoInitial();

const PORT = process.env.PORT || 5000
const IS_PRODUCTION = process.env.IS_PRODUCTION == 'true';

const app = express();

if (IS_PRODUCTION) {
    console.log('PROD...');
    app.use(history())
    app.use(serveStatic(path.resolve(__dirname, 'client')))
} else {
    console.log('DEV ...');
    app.use(cors({ origin: "*" }));
}

app.use(express.json());
app.use(fileupload());
app.use('/excel', excelRouter);
app.use('/filters', filterRouter);
app.use('/ms', moySkladRouter);
app.use('/boxberry', boxberryRouter);
app.use('/cities', citiesRouter);

app.use(errorMiddleware);

app.listen(PORT, async () => {
    console.log(`server started on port ${PORT}`);
    cronJob();
    await updateListPointBoxberry();
    await CitiesService.updateFromBoxBerry();
    await CitiesService.readPriceFromExcel();
});