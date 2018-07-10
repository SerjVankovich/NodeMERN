const mongoose = require('mongoose');
let dbURI = 'mongodb://localhost/Loc8r';

if (process.env.NODE_ENV === 'production') {
    //set the production serveruri on dbURI
}


mongoose.connect(dbURI).then(() => {
    console.log("MongoDB connected")
}).catch(error => {
    console.log(error)
});

const gracefulShutdown = (msg, cb) => {
    mongoose.connection.close(() => {
        console.log(msg);
        cb()
    })
};

process.once('SIGUSR2', () => {
    gracefulShutdown('nodemon restart', () => {
        process.kill(process.pid, 'SIGUSR2');
    })
});

process.on('SIGINT', () => {
    gracefulShutdown('app termination', () => {
        process.exit(0)
    })
});

process.on('SIGTERM', () => {
    gracefulShutdown('Heroku app shutdown', () => {
        process.exit(0)
    })
});
require('./locations')