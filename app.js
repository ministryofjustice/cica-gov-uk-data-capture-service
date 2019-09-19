'use strict';

const express = require('express');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const path = require('path');
const {OpenApiValidator} = require('express-openapi-validator');
const pino = require('pino-http');
const errorHandler = require('./middleware/error-handler');
const docsRouter = require('./docs/routes');
const questionnaireRouter = require('./questionnaire/routes');

const app = express();
const logger = pino({
    level: process.env.DCS_LOG_LEVEL,
    prettyPrint:
        process.env.NODE_ENV === 'production'
            ? false
            : {
                  levelFirst: true,
                  colorize: true,
                  translateTime: true
                  // errorProps: 'req,res'
              },
    customLogLevel: (res, err) => {
        if (res.statusCode >= 400 && res.statusCode < 500) {
            return 'warn';
        }

        if (res.statusCode >= 500 || err) {
            return 'error';
        }

        return 'info';
    }
});

// security
app.use(helmet());
// explicity set the Content Security Policy.
// not set in Helmet by default.
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'*'", 'data:']
        }
    })
);
// logging
app.use(logger);
// https://expressjs.com/en/api.html#express.json
app.use(express.json({type: 'application/vnd.api+json'}));
// https://expressjs.com/en/api.html#express.urlencoded
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/docs', docsRouter);

// Default to JSON:API content type for all subsequent responses
app.use((req, res, next) => {
    res.type('application/vnd.api+json');
    next();
});

// Install the OpenApiValidator onto express app
new OpenApiValidator({
    apiSpecPath: './openapi/openapi.json'
}).install(app);

app.use('/api/v1/questionnaires', questionnaireRouter);

// Express doesn't treat 404s as errors. If the following handler has been reached then nothing else matched e.g. a 404
// https://expressjs.com/en/starter/faq.html#how-do-i-handle-404-responses
app.use(req => {
    const err = Error(`Endpoint ${req.url} does not exist`);
    err.name = 'HTTPError';
    err.statusCode = 404;
    err.error = '404 Not Found';
    throw err;
});

app.use((err, req, res, next) => {
    // Get pino to attach the correct error and stack trace to the log entry
    // https://github.com/pinojs/pino-http/issues/61
    res.err = err;

    // forward the centralised error handler
    next(err);
});

// Central error handler
// https://www.joyent.com/node-js/production/design/errors
// https://github.com/i0natan/nodebestpractices/blob/master/sections/errorhandling/centralizedhandling.md
app.use(errorHandler);

module.exports = app;
