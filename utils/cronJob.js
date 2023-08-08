const cron = require('cron');
const { updateListPointBoxberry } = require('../services/points.service');
const SitiesService = require('../services/cities.service');

const pointLists = new cron.CronJob(
    '0 */1 * * *',
    updateListPointBoxberry
);
const cityList = new cron.CronJob(
    '0 3 */1 * *',
    async () => {
        await SitiesService.updateFromBoxBerry();
    }
)

function startCron() {
    pointLists.start();
    cityList.start();
}

module.exports = startCron;