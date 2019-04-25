const express = require('express');
const validateJWT = require('express-jwt');
const jwtAuthz = require('express-jwt-authz');
const q = require('./questionnaire');

const router = express.Router();
const rxCaseReference = /^[0-9]{2}\\[0-9]{6}$/;

// express-jwt-authz doesnt allow the "failWithError" opt to be set globally,
// wrap it to avoid passing it in manually on every call
function permissions(...scopes) {
    return jwtAuthz(scopes, {failWithError: true});
}

// Ensure JWT is valid
router.use(validateJWT({secret: process.env.SECRET}));

router.route('/:questionnaireId/sections/answers').get(permissions('read:answers'), (req, res) => {
    // /questionnaires/68653be7-877f-4106-b91e-4ba8dac883f3/sections/answers

    if (req.params.questionnaireId !== '68653be7-877f-4106-b91e-4ba8dac883f3') {
        const err = Error(`Resource ${req.originalUrl} does not exist`);
        err.name = 'HTTPError';
        err.statusCode = 404;
        err.error = '404 Not Found';
        throw err;
    }

    // Return resource collection
    const resourceCollection = Object.keys(q.answers).reduce((acc, sectionAnswersId) => {
        const sectionAnswers = q.answers[sectionAnswersId];

        acc.push({
            type: 'answers',
            id: sectionAnswersId,
            attributes: sectionAnswers
        });

        return acc;
    }, []);

    res.json({
        data: resourceCollection
    });
});

router
    .route('/:questionnaireId/sections/system/answers')
    .post(permissions('create:system-answers'), (req, res) => {
        if (req.params.questionnaireId !== '68653be7-877f-4106-b91e-4ba8dac883f3') {
            const err = Error(`Resource ${req.originalUrl} does not exist`);
            err.name = 'HTTPError';
            err.statusCode = 404;
            err.error = '404 Not Found';
            throw err;
        }

        if (req.body.data && req.body.data.id) {
            const err = Error(`Endpoint ${req.originalUrl} does not accept a client-generated id`);
            err.name = 'HTTPError';
            err.statusCode = 403;
            err.error = '403 Forbidden';
            throw err;
        }

        if (req.body.data && req.body.data.type && req.body.data.type !== 'answers') {
            const err = Error(
                `Endpoint ${req.originalUrl} accepts only resources of type "answers"`
            );
            err.name = 'HTTPError';
            err.statusCode = 409;
            err.error = '409 Conflict';
            throw err;
        }

        if (
            req.body.data &&
            req.body.data.attributes &&
            req.body.data.attributes['case-reference'] &&
            rxCaseReference.test(req.body.data.attributes['case-reference'])
        ) {
            q.answers.system = {
                'case-reference': req.body.data.attributes['case-reference']
            };
        } else {
            const err = Error(`Bad request`);
            err.name = 'HTTPError';
            err.statusCode = 400;
            err.error = '400 Bad Request';
            throw err;
        }

        const response = {
            data: {
                type: 'answers',
                id: 'system',
                attributes: q.answers.system
            }
        };

        res.status(201).json(response);
    });

module.exports = router;
