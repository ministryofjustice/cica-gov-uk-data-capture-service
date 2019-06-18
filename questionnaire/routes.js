'use strict';

const express = require('express');
const validateJWT = require('express-jwt');

const questionnaireService = require('./questionnaire-service')();
const q = require('./questionnaire');
const permissions = require('../middleware/route-permissions');

const router = express.Router();
const rxCaseReference = /^[0-9]{2}\\[0-9]{6}$/;
const rxTemplateName = /^[a-zA-Z0-9-]{1,30}$/;

// Ensure JWT is valid
router.use(validateJWT({secret: process.env.SECRET}));

router.route('/').post(permissions('create:questionnaires'), async (req, res, next) => {
    try {
        if (
            req.body.data &&
            req.body.data.attributes &&
            req.body.data.attributes.templateId &&
            !rxTemplateName.test(req.body.data.attributes.templateName)
        ) {
            const err = Error(`Bad request`);
            err.name = 'HTTPError';
            err.statusCode = 400;
            err.error = '400 Bad Request';
            throw err;
        }

        const {templateName} = req.body.data.attributes;

        const response = await questionnaireService.createQuestionnaire(templateName);

        res.status(201).json(response);
    } catch (err) {
        next(err);
    }
});

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
