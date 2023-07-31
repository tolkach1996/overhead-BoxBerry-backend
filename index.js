const express = require('express');
const cors = require('cors');
const fileupload = require('express-fileupload');

const { errorMiddleware } = require('./middleware');
const { boxberryRouter, excelRouter, filterRouter, moySkladRouter } = require('./routers');
const { mongoInitial, cronJob } = require('./utils');
const { updateListPointBoxberry } = require('./services/points.service');

require('dotenv').config();
mongoInitial();

const PORT = process.env.PORT || 5000

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(fileupload());
app.use('/excel', excelRouter);
app.use('/filters', filterRouter);
app.use('/ms', moySkladRouter);
app.use('/boxberry', boxberryRouter);

app.use(errorMiddleware);

app.listen(PORT, async () => {
    console.log(`server started on port ${PORT}`);
    cronJob.start();
    //await updateListPointBoxberry();
});