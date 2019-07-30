'use strict';

const express = require('express');
const validateJWT = require('express-jwt');

const createQuestionnaireService = require('./questionnaire-service');
const q = require('./questionnaire');
const permissions = require('../middleware/route-permissions');

const router = express.Router();
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

        const questionnaireService = createQuestionnaireService({logger: req.log});
        const response = await questionnaireService.createQuestionnaire(templateName);

        res.status(201).json(response);
    } catch (err) {
        next(err);
    }
});

router
    .route('/:questionnaireId/sections/answers')
    .get(permissions('read:questionnaires'), (req, res) => {
        // /questionnaires/68653be7-877f-4106-b91e-4ba8dac883f3/sections/answers
        if (req.params.questionnaireId !== '285cb104-0c15-4a9c-9840-cb1007f098fb') {
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
    .post(permissions('create:system-answers'), async (req, res, next) => {
        try {
            // There can only every be one "answers" block per section
            // TODO: handle multiple attempts to "create" answers
            const answers = req.body.data.attributes;
            const questionnaireService = createQuestionnaireService({logger: req.log});
            const response = await questionnaireService.createAnswers(
                req.params.questionnaireId,
                'system',
                answers
            );

            res.status(201).json(response);
        } catch (err) {
            next(err);
        }
    });

router
    .route('/:questionnaireId/sections/:sectionId/answers')
    .post(permissions('create:questionnaires'), async (req, res, next) => {
        try {
            // There can only every be one "answers" block per section
            // TODO: handle multiple attempts to "create" answers
            const answers = req.body.data.attributes;
            const questionnaireService = createQuestionnaireService({logger: req.log});
            const response = await questionnaireService.createAnswers(
                req.params.questionnaireId,
                req.params.sectionId,
                answers
            );

            res.status(201).json(response);
        } catch (err) {
            next(err);
        }
    });

router
    .route('/:questionnaireId/submissions')
    .get(permissions('read:questionnaires'), async (req, res, next) => {
        try {
            const {questionnaireId} = req.params;
            const questionnaireService = createQuestionnaireService({logger: req.log});
            const submissionStatus = await questionnaireService.getQuestionnaireSubmissionStatus(
                questionnaireId
            );
            // the default value for this column is "NOT_STARTED", so if it doesn't
            // exist, then it must not be a valid questionnaire ID.
            if (!submissionStatus) {
                const err = Error(
                    `Questionnaire with questionnaireId "${questionnaireId}" does not exist`
                );
                err.name = 'HTTPError';
                err.statusCode = 404;
                err.error = '404 Not Found';
                throw err;
            }

            const response = await questionnaireService.getSubmissionResponseData({
                questionnaireId,
                submissionStatus
            });

            if (response.data.attributes.submitted) {
                await questionnaireService.updateQuestionnaireSubmissionStatus(
                    questionnaireId,
                    'COMPLETED'
                );
                response.data.attributes.status = 'COMPLETED';
                await questionnaireService.submitQuestionnaire(questionnaireId);
            }

            // // const notificationResponse = {body: 'Message sent'};
            // const notificationResponse = await messageBus.post('NotificationQueue', {
            //     templateId: '1ddf1d87-09b3-4a2b-aa27-d73823f4a886',
            //     email_address: applicantEmailAddress,
            //     personalisation: {
            //         email_address: applicantEmailAddress,
            //         applicant_name: applicantName,
            //         case_reference: caseReferenceNumber
            //     }
            // });

            res.status(200).json(response);
        } catch (err) {
            next(err);
        }
    })
    .post(permissions('update:questionnaires'), async (req, res, next) => {
        try {
            const {questionnaireId} = req.params;
            const questionnaireService = createQuestionnaireService({logger: req.log});
            const submissionStatus = await questionnaireService.getQuestionnaireSubmissionStatus(
                questionnaireId
            );

            // the default value for this column is "NOT_STARTED", so if it doesn't
            // exist, then it must not be a valid questionnaire ID.
            if (!submissionStatus) {
                const err = Error(
                    `Questionnaire with questionnaireId "${questionnaireId}" does not exist`
                );
                err.name = 'HTTPError';
                err.statusCode = 404;
                err.error = '404 Not Found';
                throw err;
            }

            const response = await questionnaireService.getSubmissionResponseData({
                questionnaireId,
                submissionStatus
            });

            // already done? return asap.
            if (submissionStatus === 'COMPLETED') {
                res.status(200).json(response);
            }

            if (submissionStatus === 'IN_PROGRESS') {
                res.status(200).json(response);
            }

            if (submissionStatus === 'NOT_STARTED') {
                await questionnaireService.startSubmission(questionnaireId);
                response.data.attributes.status = 'IN_PROGRESS';
                res.status(201).json(response);
            }
        } catch (err) {
            next(err);
        }
    });

module.exports = router;
