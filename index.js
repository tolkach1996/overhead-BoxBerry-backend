const express = require("express");
const cors = require("cors");
const fileupload = require("express-fileupload");

const serveStatic = require("serve-static");
const history = require("connect-history-api-fallback");

const { errorMiddleware } = require("./middleware");
const { boxberryRouter, excelRouter, filterRouter, moySkladRouter, citiesRouter, authRouter } = require("./routers");
const ordersRouter = require("./core/orders/orders.router");
const { mongoInitial, cronJob } = require("./utils");
const { updateListPointBoxberry } = require("./services/points.service");
const CitiesService = require("./services/cities.service");
const AuthService = require("./services/auth.service");

const { USER_ROLE } = require("./constants");

require("dotenv").config();
mongoInitial();

const PORT = process.env.PORT || 5000;

const app = express();

app.use(cors({ origin: "*" }));

app.use(express.json());
app.use(fileupload());
app.use("/api/excel", excelRouter);
app.use("/api//filters", filterRouter);
app.use("/api//ms", moySkladRouter);
app.use("/api//boxberry", boxberryRouter);
app.use("/api//cities", citiesRouter);
app.use("/api//auth", authRouter);

// Новая версия рутов
app.use("/api//orders", ordersRouter);

app.use(errorMiddleware);

app.listen(PORT, async () => {
    console.log(`server started on port ${PORT}`);
    //await AuthService.register({ login: 'боксберри', role: USER_ROLE.LOGISTICIAN, password: '12345l' });
    // await AuthService.register({ login: 'склад', role: USER_ROLE.STOCK_MANAGER, password: '12345s' });
    //await MoyskladService.getStatusList();
    //await CitiesService.readPriceFromExcel();

    cronJob();
    await updateListPointBoxberry();
    await CitiesService.updateFromBoxBerry();
});
