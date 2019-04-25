const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const helmet = require('helmet');

const docsRouter = require('./docs/routes');
const questionnaireRouter = require('./questionnaire/routes');

const app = express();

app.use(helmet());
app.use(logger('dev'));
// https://expressjs.com/en/api.html#express.json
app.use(express.json({type: 'application/vnd.api+json'}));
// https://expressjs.com/en/api.html#express.urlencoded
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

app.use('/docs', docsRouter);

// Default to JSON:API content type for all responses
app.use((req, res, next) => {
    res.type('application/vnd.api+json');
    next();
});
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

// Central error handler
// https://www.joyent.com/node-js/production/design/errors
// https://github.com/i0natan/nodebestpractices/blob/master/sections/errorhandling/centralizedhandling.md
app.use(async (err, req, res, next) => {
    const error = {errors: []};

    if (err.statusCode === 400) {
        error.errors.push({
            status: 400,
            title: err.error,
            detail: err.message
        });

        return res.status(400).json(error);
    }

    if (err.statusCode === 403) {
        error.errors.push({
            status: 403,
            title: err.error,
            detail: err.message
        });

        return res.status(403).json(error);
    }

    if (err.statusCode === 404) {
        error.errors.push({
            status: 404,
            title: err.error,
            detail: err.message
        });

        return res.status(404).json(error);
    }

    if (err.statusCode === 409) {
        error.errors.push({
            status: 409,
            title: err.error,
            detail: err.message
        });

        return res.status(409).json(error);
    }

    if (err.name === 'UnauthorizedError') {
        error.errors.push({
            status: 401,
            title: err.error,
            detail: err.message
        });

        return res.status(401).json(error);
    }

    // Non-operational error
    return next(err);
});

module.exports = app;
