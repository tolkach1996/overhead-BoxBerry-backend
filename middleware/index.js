const errorMiddleware = require('./error.middleware');
const authMiddleware = require('./auth.middleware');

module.exports = {
    errorMiddleware,
    authMiddleware
}