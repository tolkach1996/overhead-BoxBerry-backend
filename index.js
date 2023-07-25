const express = require('express');
const cors = require('cors');
const cron = require('cron');
const fileupload = require('express-fileupload');
const { initialMongoConnection } = require('./utils/mongoose');

const routerExcel = require('./routers/excel.router');
const routerFilter = require('./routers/filter.router');
const routerMs = require('./routers/ms.router');
const routerBoxBerry = require('./routers/boxberry.router');

const { updateListPointBoxberry } = require('./services/points.service');

require('dotenv').config();
initialMongoConnection();

const PORT = process.env.PORT || 5000

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(fileupload());
app.use('/excel', routerExcel);
app.use('/filters', routerFilter);
app.use('/ms', routerMs);
app.use('/boxberry', routerBoxBerry);

const job = new cron.CronJob(
    '0 */2 * * *',
    updateListPointBoxberry
);



app.listen(PORT, async () => {
    console.log(`server started on port ${PORT}`);
    await updateListPointBoxberry();
    job.start();
});