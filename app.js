const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const helmet = require('helmet');

const questionnaireRouter = require('./questionnaire/routes');
const app = express();


app.use(helmet());
app.use(logger('dev'));
// https://expressjs.com/en/api.html#express.json
app.use(express.json());
// https://expressjs.com/en/api.html#express.urlencoded
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());


app.use('/questionnaires', questionnaireRouter);

module.exports = app;
