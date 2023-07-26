const cron = require('cron');
const { updateListPointBoxberry } = require('../services/points.service');

const cronJob = new cron.CronJob(
    '0 */2 * * *',
    updateListPointBoxberry
);

module.exports = cronJob;