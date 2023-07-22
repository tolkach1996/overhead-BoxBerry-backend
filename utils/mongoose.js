const mongoose = require('mongoose');

function initialMongoConnection() {
    mongoose.Promise = global.Promise;
    const options = {
        socketTimeoutMS: 30000,
        keepAlive: true,
        useUnifiedTopology: true,
        useNewUrlParser: true
    }
    mongoose.set('debug', false);
    mongoose.connection
        .on('error', error => console.log(error))
        .on('close', () => console.log('Database connection closed.'))
        .once('open', () => {
            const info = mongoose.connections[0];
            console.log(`Connected to ${info.host}:${info.port}/${info.name}`);
        })
    mongoose.connect(process.env.MONGO_URL, options);
}

module.exports = initialMongoConnection;