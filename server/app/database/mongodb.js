const mongoose = require('mongoose');
// const chalk = require('chalk');

module.exports = async () => {
    const DB = process.env.DB || 'mongodb://127.0.0.1:27017';
    // const uri = "mongodb://0.0.0.0:27017/";

    try {
        mongoose.connect(DB, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })

        console.log('*** CONNECTED TO MONGODB ***')
    } catch(error) {
        console.log('*** CONNECTION TO MONGODB FAILED ***')
        console.log('error', error)
        throw error;
    }
}