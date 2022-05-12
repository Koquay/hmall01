const morgan = require('morgan');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const express = require('express');

process.env.DIST = path.join(__dirname, "../../../client/dist/client");
process.env.INDEX = path.join(process.env.DIST, "/index.html");

module.exports = (app) => {
    app.use(bodyParser.json());
    app.use(
        bodyParser.urlencoded({
            extended: true
        })
    );
    app.use(express.json());
    app.use(morgan('common'));
    app.use(cors());
    app.use(helmet({
        contentSecurityPolicy: false,
      }));
    app.use(express.static(process.env.DIST))
}