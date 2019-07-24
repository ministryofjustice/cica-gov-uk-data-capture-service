'use strict';

const express = require('express');
const validateJWT = require('express-jwt');

const createQuestionnaireService = require('./questionnaire-service');
const createProgressEntriesService = require('../services/progress-entries/progress-entries-service');
const permissions = require('../middleware/route-permissions');

const router = express.Router();
// const rxCaseReference = /^[0-9]{2}\\[0-9]{6}$/;
const rxTemplateName = /^[a-zA-Z0-9-]{1,60}$/;
const rxValidQuestionnaireId = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const rxValidSectionId = /^p--?([a-z0-9-]+)$/;
const rxValidSectionName = /^(?!p)([a-z0-9-]+)$/;

// Ensure JWT is valid
router.use(validateJWT({secret: process.env.SECRET}));

router
    .route('/progress-entries')
    .get(permissions('read-write:questionnaires'), async (req, res, next) => {
        try {
            const reqQueryParams = req.query;
            const {questionnaireId} = reqQueryParams; // TODO: get from CICA web session data.
            // https://jsonapi.org/examples/#pagination

            // page: {
            //     JSON:API standard compliant:
            //     before: 'p-applicant-british-citizen-or-eu-national', // get the progress entry for the section before the specified section.
            //     after: 'p-applicant-declaration', // get the progress entry for the section after the specified section.
            //     size: 1, // number of progress entries returned. defaulted to `1`.
            //
            //     non-compliant:
            //     id: 0, // index of the progress entry you want.
            //     sectionId: 'p-applicant-declaration', // get the progress entry relating to this section (if it is present in the progress).
            // }
            const page = {
                before: reqQueryParams.progressEntryBefore,
                // after: reqQueryParams.after, // currently unused.
                // size: 1, // currently unused.
                id: reqQueryParams.progressEntryId,
                sectionId: reqQueryParams.sectionId
            };

            // for each of the properties of `page`, we need to check that they
            // exist, then check if they conform to the required pattern.
            if (
                !rxValidQuestionnaireId.test(questionnaireId) ||
                (page.before && !rxValidSectionId.test(page.before)) ||
                (page.id && Number.parseInt(page.id, 10) === page.id && page.id > -1) ||
                (page.sectionId && !rxValidSectionId.test(page.sectionId))
            ) {
                const err = Error(`Bad request`);
                err.name = 'HTTPError';
                err.statusCode = 400;
                err.error = '400 Bad Request';
                throw err;
            }

            const questionnaireService = createQuestionnaireService({logger: req.log});
            const response = await questionnaireService.getQuestionnaire(questionnaireId);

            if (!response.rows[0]) {
                const err = Error(`Resource ${req.originalUrl} does not exist`);
                err.name = 'HTTPError';
                err.statusCode = 404;
                err.error = '404 Not Found';
                throw err;
            }
            const {questionnaire} = response.rows[0];

            const progressEntriesService = createProgressEntriesService();
            const progressEntry = progressEntriesService.getProgressEntry(page, questionnaire);

            if (!progressEntry) {
                const err = Error(`Resource ${req.originalUrl} does not exist`);
                err.name = 'HTTPError';
                err.statusCode = 404;
                err.error = '404 Not Found';
                throw err;
            }

            res.json(progressEntry);
        } catch (err) {
            next(err);
        }
    });

router.route('/').post(permissions('read-write:questionnaires'), async (req, res, next) => {
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
    .route('/:questionnaireId')
    .get(permissions('read-write:questionnaires'), async (req, res, next) => {
        try {
            const {questionnaireId} = req.params;

            if (!rxValidQuestionnaireId.test(questionnaireId)) {
                const err = Error(`Bad request`);
                err.name = 'HTTPError';
                err.statusCode = 400;
                err.error = '400 Bad Request';
                throw err;
            }

            const questionnaireService = createQuestionnaireService({logger: req.log});
            const response = await questionnaireService.getQuestionnaire(questionnaireId);

            if (!response.rows[0]) {
                const err = Error(`Resource ${req.originalUrl} does not exist`);
                err.name = 'HTTPError';
                err.statusCode = 404;
                err.error = '404 Not Found';
                throw err;
            }

            const {questionnaire} = response.rows[0];

            res.status(200).json({
                data: {
                    type: 'questionnaire',
                    id: questionnaireId,
                    attributes: questionnaire
                }
            });
        } catch (err) {
            next(err);
        }
    });

router
    .route('/:questionnaireId/sections/answers')
    .get(permissions('read-write:questionnaires'), async (req, res, next) => {
        try {
            const {questionnaireId} = req.params;

            if (!rxValidQuestionnaireId.test(questionnaireId)) {
                const err = Error(`Bad request`);
                err.name = 'HTTPError';
                err.statusCode = 400;
                err.error = '400 Bad Request';
                throw err;
            }

            const questionnaireService = createQuestionnaireService({logger: req.log});
            const response = await questionnaireService.getQuestionnaire(questionnaireId);
            if (!response.rows[0]) {
                const err = Error(`Resource ${req.originalUrl} does not exist`);
                err.name = 'HTTPError';
                err.statusCode = 404;
                err.error = '404 Not Found';
                throw err;
            }

            const {questionnaire} = response.rows[0];

            // Return resource collection
            // const resourceCollection = Object.keys(questionnaire.answers).reduce(
            //     (acc, sectionAnswersId) => {
            //         const sectionAnswers = questionnaire.answers[sectionAnswersId];

            //         acc.push({
            //             type: 'answers',
            //             id: sectionAnswersId,
            //             attributes: sectionAnswers
            //         });

            //         return acc;
            //     },
            //     []
            // );
            const resourceCollection = [];
            resourceCollection.push({
                type: 'answers',
                id: questionnaireId,
                attributes: questionnaire.answers
            });

            res.status(200).json({
                data: resourceCollection
            });
        } catch (err) {
            next(err);
        }
    });

router
    .route('/:questionnaireId/sections/system/answers')
    .post(permissions('read-write:questionnaires'), async (req, res, next) => {
        try {
            // There can only every be one "answers" block per section
            // TODO: handle multiple attempts to "create" answers
            const answers = req.body.data[0].attributes;
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
    .route('/:questionnaireId/sections/:sectionName/answers')
    .get(permissions('read-write:questionnaires'), async (req, res, next) => {
        try {
            const {questionnaireId} = req.params;
            const {sectionName} = req.params;

            if (
                !rxValidSectionName.test(sectionName) ||
                !rxValidQuestionnaireId.test(questionnaireId)
            ) {
                const err = Error(`Bad request`);
                err.name = 'HTTPError';
                err.statusCode = 400;
                err.error = '400 Bad Request';
                throw err;
            }

            const questionnaireService = createQuestionnaireService({logger: req.log});
            const response = await questionnaireService.getQuestionnaire(questionnaireId);

            if (!response.rows[0]) {
                const err = Error(`Resource ${req.originalUrl} does not exist`);
                err.name = 'HTTPError';
                err.statusCode = 404;
                err.error = '404 Not Found';
                throw err;
            }

            const {questionnaire} = response.rows[0];
            let prefixedSectionId;

            if (questionnaire.sections[sectionName]) {
                prefixedSectionId = sectionName;
            } else if (questionnaire.sections[`p-${sectionName}`]) {
                prefixedSectionId = `p-${sectionName}`;
            } else if (questionnaire.sections[`p--${sectionName}`]) {
                prefixedSectionId = `p--${sectionName}`;
            }

            // if the section doesn't exist in the questionnaire...
            if (!questionnaire.sections[prefixedSectionId]) {
                const err = Error(`Resource ${req.originalUrl} does not exist`);
                err.name = 'HTTPError';
                err.statusCode = 404;
                err.error = '404 Not Found';
                throw err;
            }

            // answers may be empty. return them anyway.
            const questionnaireSectionAnswers = questionnaire.answers[prefixedSectionId] || {};

            const resourceCollection = [];

            resourceCollection.push({
                type: 'answers',
                id: prefixedSectionId,
                attributes: questionnaireSectionAnswers
            });

            res.status(200).json({
                data: resourceCollection
            });
        } catch (err) {
            next(err);
        }
    })
    .post(permissions('read-write:questionnaires'), async (req, res, next) => {
        try {
            const {questionnaireId} = req.params;
            const {sectionName} = req.params;
            if (
                !rxValidSectionName.test(sectionName) ||
                !rxValidQuestionnaireId.test(questionnaireId)
            ) {
                const err = Error(`Bad request`);
                err.name = 'HTTPError';
                err.statusCode = 400;
                err.error = '400 Bad Request';
                throw err;
            }

            const questionnaireService = createQuestionnaireService({logger: req.log});
            const responseQuestionnaire = await questionnaireService.getQuestionnaire(
                questionnaireId
            );

            if (!responseQuestionnaire.rows[0]) {
                const err = Error(`Resource ${req.originalUrl} does not exist`);
                err.name = 'HTTPError';
                err.statusCode = 404;
                err.error = '404 Not Found';
                throw err;
            }
            const {questionnaire} = responseQuestionnaire.rows[0];
            let prefixedSectionId;

            if (questionnaire.sections[sectionName]) {
                prefixedSectionId = sectionName;
            } else if (questionnaire.sections[`p-${sectionName}`]) {
                prefixedSectionId = `p-${sectionName}`;
            } else if (questionnaire.sections[`p--${sectionName}`]) {
                prefixedSectionId = `p--${sectionName}`;
            }

            // There can only every be one "answers" block per section
            // TODO: handle multiple attempts to "create" answers
            const answers = req.body.data[0].attributes;

            // already got answers in the answers object relating to this section?
            // if so do an update (200), else do a create(201).

            const progressEntriesService = createProgressEntriesService();
            const progressEntry = progressEntriesService.getProgressEntryBySectionId(
                questionnaire,
                prefixedSectionId
            );

            if (!progressEntry) {
                const err = Error(`Resource ${req.originalUrl} does not exist`);
                err.name = 'HTTPError';
                err.statusCode = 404;
                err.error = '404 Not Found';
                throw err;
            }

            const answersInclude = progressEntry.included.filter(x => x.type === 'answers');
            const existingAnswers = answersInclude[0].attributes;
            if (existingAnswers) {
                // update.
                const response = await questionnaireService.updateAnswers(
                    questionnaireId,
                    sectionName,
                    answers
                );
                res.status(200).json(response);
            } else {
                // create.
                const response = await questionnaireService.createAnswers(
                    questionnaireId,
                    sectionName,
                    answers
                );
                res.status(201).json(response);
            }
        } catch (err) {
            next(err);
        }
    });

router
    .route('/:questionnaireId/sections/:sectionName')
    .get(permissions('read-write:questionnaires'), async (req, res, next) => {
        try {
            const {questionnaireId} = req.params;
            const {sectionName} = req.params;

            if (
                !rxValidSectionName.test(sectionName) ||
                !rxValidQuestionnaireId.test(questionnaireId)
            ) {
                const err = Error(`Bad request`);
                err.name = 'HTTPError';
                err.statusCode = 400;
                err.error = '400 Bad Request';
                throw err;
            }

            const questionnaireService = createQuestionnaireService({logger: req.log});
            const response = await questionnaireService.getQuestionnaire(questionnaireId);

            if (!response.rows[0]) {
                const err = Error(`Resource ${req.originalUrl} does not exist`);
                err.name = 'HTTPError';
                err.statusCode = 404;
                err.error = '404 Not Found';
                throw err;
            }
            // refactor this to be abstracted out of the controller.
            const {questionnaire} = response.rows[0];
            let section;
            let prefixedSectionId;

            if (questionnaire.sections[sectionName]) {
                section = questionnaire.sections[sectionName];
                prefixedSectionId = sectionName;
            } else if (questionnaire.sections[`p-${sectionName}`]) {
                section = questionnaire.sections[`p-${sectionName}`];
                prefixedSectionId = `p-${sectionName}`;
            } else if (questionnaire.sections[`p--${sectionName}`]) {
                section = questionnaire.sections[`p--${sectionName}`];
                prefixedSectionId = `p--${sectionName}`;
            }

            if (!section) {
                const err = Error(`Resource ${req.originalUrl} does not exist`);
                err.name = 'HTTPError';
                err.statusCode = 404;
                err.error = '404 Not Found';
                throw err;
            }

            const resourceCollection = [];
            resourceCollection.push({
                type: 'section',
                id: prefixedSectionId,
                attributes: section
            });

            const includedResource = [];

            // if there are answers.
            if (questionnaire.answers[prefixedSectionId]) {
                includedResource.push({
                    links: {
                        self: `/api/v1/questionnaires/${questionnaireId}/sections/${prefixedSectionId}/answers`
                    },
                    type: 'answers',
                    id: prefixedSectionId,
                    attributes: questionnaire.answers[prefixedSectionId] || {}
                });
            }

            const meta = {
                initial: questionnaire.routes.initial,
                final: !!(
                    questionnaire.routes.states[prefixedSectionId] &&
                    questionnaire.routes.states[prefixedSectionId].type &&
                    questionnaire.routes.states[prefixedSectionId].type === 'final'
                ),
                summary: questionnaire.routes.summary
            };

            res.status(200).json({
                data: resourceCollection,
                included: includedResource,
                meta
            });
        } catch (err) {
            next(err);
        }
    });

module.exports = router;
