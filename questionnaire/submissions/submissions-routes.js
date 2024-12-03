'use strict';

const express = require('express');

const permissions = require('../../middleware/route-permissions');
const createSubmissionService = require('./submissions-service.js');
const createQuestionnaireService = require('../questionnaire-service');

const router = express.Router();

router
    .route('/:questionnaireId/submissions')
    .get(permissions('read:questionnaires'), async (req, res, next) => {
        try {
            const {questionnaireId} = req.params;
            const questionnaireService = createQuestionnaireService({
                logger: req.log,
                apiVersion: req.get('Dcs-Api-Version'),
                ownerId: req.get('On-Behalf-Of')
            });
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

            const response = await questionnaireService.getSubmissionResponseData(questionnaireId);

            res.status(200).json(response);
        } catch (err) {
            next(err);
        }
    })
    .post(permissions('update:questionnaires'), async (req, res, next) => {
        const {questionnaireId, maintenanceMode} = req.params;

        try {
            const questionnaireService = createQuestionnaireService({
                logger: req.log,
                apiVersion: req.get('Dcs-Api-Version'),
                ownerId: req.get('On-Behalf-Of')
            });

            // stop the getSubmissionResponseData > startSubmission function from being called!
            await questionnaireService.updateQuestionnaireSubmissionStatus(
                questionnaireId,
                'IN_PROGRESS'
            );

            // run tasks
            const submissionService = createSubmissionService({
                logger: req.log,
                apiVersion: req.get('Dcs-Api-Version'),
                ownerId: req.get('On-Behalf-Of')
            });
            const submissionResource = await submissionService.submit(
                questionnaireId,
                maintenanceMode
            );

            res.status(201).json(submissionResource);
        } catch (err) {
            next(err);
        }
    });

router.route('/resubmit-failed').post(permissions('admin'), async (req, res, next) => {
    let response;
    try {
        const submissionService = createSubmissionService({
            logger: req.log
        });
        response = await submissionService.postFailedSubmissions();
    } catch (err) {
        next(err);
    }
    res.status(200).json(response);
});

module.exports = router;
