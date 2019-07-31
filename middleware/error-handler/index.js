'use strict';

const VError = require('verror');

// Central error handler
// https://www.joyent.com/node-js/production/design/errors
// https://github.com/i0natan/nodebestpractices/blob/master/sections/errorhandling/centralizedhandling.md
module.exports = async (err, req, res, next) => {
    const error = {errors: []};

    // handle a malformed JSON request e.g. can't be parsed by the bodyparser (express.json)
    // https://github.com/expressjs/body-parser/issues/122#issuecomment-328190379
    if ('type' in err && err.type === 'entity.parse.failed') {
        error.errors.push({
            status: 400,
            title: 'Bad Request',
            detail: 'Request JSON is malformed'
        });

        return res.status(400).json(error);
    }

    /*
        {
            "stack": "Error: should be equal to one of the allowed values\n    at /usr/src/app/node_modules/express-openapi-validator/dist/middlewares/openapi.request.validator.js:57:32\n    at Layer.handle [as handle_request] (/usr/src/app/node_modules/express/lib/router/layer.js:95:5)\n    at trim_prefix (/usr/src/app/node_modules/express/lib/router/index.js:317:13)\n    at /usr/src/app/node_modules/express/lib/router/index.js:284:7\n    at Function.process_params (/usr/src/app/node_modules/express/lib/router/index.js:335:12)\n    at next (/usr/src/app/node_modules/express/lib/router/index.js:275:10)\n    at /usr/src/app/node_modules/express-openapi-validator/dist/middlewares/openapi.multipart.js:40:13\n    at Layer.handle [as handle_request] (/usr/src/app/node_modules/express/lib/router/layer.js:95:5)\n    at trim_prefix (/usr/src/app/node_modules/express/lib/router/index.js:317:13)",
            "message": "should be equal to one of the allowed values",
            "status": 400,
            "errors": [
                {
                    "path": "data.type",
                    "errorCode": "enum.openapi.validation",
                    "message": "should be equal to one of the allowed values",
                    "location": "body"
                },
                {
                    "path": "data.attributes.templateName",
                    "errorCode": "type.openapi.validation",
                    "message": "should be string",
                    "location": "body"
                }
            ],
            "name": "Error"
        }

       {
        "errors": [
            {
            "status": "403",
            "source": { "pointer": "/data/attributes/secretPowers" },
            "detail": "Editing secret powers is not authorized on Sundays."
            },
            {
            "status": "422",
            "source": { "pointer": "/data/attributes/volume" },
            "detail": "Volume does not, in fact, go to 11."
            },
            {
            "status": "500",
            "source": { "pointer": "/data/attributes/reputation" },
            "title": "The backend responded with an error",
            "detail": "Reputation service not responding after three requests."
            }
        ]
        }
    */
    // handle express-openapi-validator request errors
    if (err.status === 400) {
        err.errors.forEach(errorObj => {
            error.errors.push({
                status: 400,
                title: '400 Bad Request',
                detail: errorObj.message,
                source: {pointer: `/${errorObj.path.replace(/\./g, '/')}`}
            });
        });

        return res.status(400).json(error);
    }

    if (err.name === 'JSONSchemaValidationError') {
        error.errors.push({
            status: 400,
            title: 'JSONSchemaValidationError',
            detail: VError.info(err).schemaErrors
        });

        return res.status(400).json(error);
    }

    // questionnaire submission bulk error response.
    if (err.name === 'JSONSchemaValidationErrors') {
        VError.info(err).schemaErrors.forEach(schemaError => {
            error.errors.push({
                status: 400,
                title: 'JSONSchemaValidationError',
                detail: schemaError
            });
        });
        return res.status(400).json(error);
    }

    if (err.statusCode === 400) {
        error.errors.push({
            status: 400,
            title: '400 Bad Request',
            detail: err.message
        });

        return res.status(400).json(error);
    }

    if (err.statusCode === 403) {
        error.errors.push({
            status: 403,
            title: '403 Forbidden',
            detail: err.message
        });

        return res.status(403).json(error);
    }

    if (err.statusCode === 404) {
        error.errors.push({
            status: 404,
            title: '404 Not Found',
            detail: err.message
        });

        return res.status(404).json(error);
    }

    if (err.name === 'ResourceNotFound') {
        error.errors.push({
            status: 404,
            title: '404 Not Found',
            detail: err.message
        });

        return res.status(404).json(error);
    }

    if (err.name === 'UpdateNotSuccessful') {
        error.errors.push({
            status: 500,
            title: 'UpdateNotSuccessful',
            detail: err.message
        });

        return res.status(404).json(error);
    }

    if (err.statusCode === 409) {
        error.errors.push({
            status: 409,
            title: '409 Conflict',
            detail: err.message
        });

        return res.status(409).json(error);
    }

    if (err.name === 'UnauthorizedError') {
        error.errors.push({
            status: 401,
            title: '401 Unauthorized',
            detail: err.message
        });

        return res.status(401).json(error);
    }

    // Non-operational error
    return next(err);
};
