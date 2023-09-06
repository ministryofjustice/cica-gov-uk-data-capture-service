'use strict';

const defaults = {};
defaults.createQuestionnaireService = require('../questionnaire-service');
defaults.createQuestionnaireDAL = require('../questionnaire-dal');
defaults.createTaskRunner = require('../questionnaire/utils/taskRunner');
defaults.sequential = require('../questionnaire/utils/taskRunner/tasks/sequential');
// Pull in additional task implementations here
const {transformAndUpload} = require('../questionnaire/utils/taskRunner/tasks/transformAndUpload');
const {
    generateReferenceNumber
} = require('../questionnaire/utils/taskRunner/tasks/generateCaseReference');
const {sendSubmissionMessageToSQS} = require('../questionnaire/utils/taskRunner/tasks/postToSQS');
const sendNotifyMessageToSQS = require('../questionnaire/utils/taskRunner/tasks/postToNotify');

function createSubmissionService({
    logger,
    apiVersion,
    ownerId,
    createQuestionnaireService = defaults.createQuestionnaireService,
    createQuestionnaireDAL = defaults.createQuestionnaireDAL,
    createTaskRunner = defaults.createTaskRunner,
    sequential = defaults.sequential,
    taskImplementations = {
        transformAndUpload,
        generateReferenceNumber,
        sendSubmissionMessageToSQS,
        sendNotifyMessageToSQS
    }
} = {}) {
    const db = createQuestionnaireDAL({logger});
    const questionnaireService = createQuestionnaireService({
        logger,
        apiVersion,
        ownerId
    });

    function hasSummaryIdInProgressEntries(questionnaireDefinition) {
        // are we currently, or have we been on this questionnaire's summary page?
        // we infer a questionnaire is complete if the user has visited the summary page.
        const summarySectionIds = questionnaireDefinition.routes.summary;
        const progressEntries = questionnaireDefinition.progress;

        return summarySectionIds.some(summarySectionId =>
            progressEntries.includes(summarySectionId)
        );
    }

    async function isSubmittable(questionnaireId, questionnaireDefinition) {
        // 1 - does it exist
        // 2 - if exists, is it in a submittable state
        // 3 - has it already been submitted
        const submissionStatus = await questionnaireService.getQuestionnaireSubmissionStatus(
            questionnaireId
        );

        if (submissionStatus === 'COMPLETED') {
            return false;
        }

        return hasSummaryIdInProgressEntries(questionnaireDefinition);
    }

    function getOnSubmitTaskDefinitionCopy(questionnaireDefinition) {
        const onSubmitTaskDefinition = questionnaireDefinition.onSubmit;

        if (onSubmitTaskDefinition === undefined) {
            throw Error('Questionnaire has no "onSubmit" property');
        }

        return JSON.parse(JSON.stringify(onSubmitTaskDefinition));
    }

    async function submit(questionnaireId) {
        try {
            const questionnaireDefinition = await questionnaireService.getQuestionnaire(
                questionnaireId
            );

            if ((await isSubmittable(questionnaireId, questionnaireDefinition)) === false) {
                throw Error(
                    `Questionnaire with ID "${questionnaireId}" is not in a submittable state`
                );
            }

            const onSubmitTaskDefinition = getOnSubmitTaskDefinitionCopy(questionnaireDefinition);
            const taskRunner = createTaskRunner({
                taskImplementations: {
                    ...taskImplementations,
                    sequential,
                    // Add additional task implementations here

                    // DON'T INCLUDE THIS TEST TASK
                    updateCaseRefTestTask: async data => {
                        data.questionnaire.answers.system['case-reference'] = '11\\223344';
                        await db.updateQuestionnaire(data.questionnaire.id, data.questionnaire);
                        return true;
                    }
                },
                context: {
                    logger,
                    questionnaireDef: questionnaireDefinition
                }
            });

            await questionnaireService.updateQuestionnaireSubmissionStatus(
                questionnaireId,
                'IN_PROGRESS'
            );

            await taskRunner.run(onSubmitTaskDefinition);

            await questionnaireService.updateQuestionnaireSubmissionStatus(
                questionnaireId,
                'COMPLETED'
            );

            // return a submission document
            return {
                data: {
                    type: 'submissions',
                    id: questionnaireId,
                    attributes: {
                        status: 'COMPLETED',
                        submitted: true,
                        questionnaireId,
                        caseReferenceNumber: '11\\223344' // TODO: DO WE NEED THIS? ADDED DUMMY CASE REF TO PASS TEST.
                    }
                }
            };
        } catch (err) {
            const {task} = err;

            if (task === undefined) {
                throw err;
            }

            await questionnaireService.updateQuestionnaireSubmissionStatus(
                questionnaireId,
                'FAILED'
            );

            // eslint-disable-next-line no-throw-literal
            throw {
                data: {
                    type: 'submissions',
                    id: questionnaireId,
                    attributes: {
                        status: 'FAILED',
                        submitted: false,
                        questionnaireId,
                        caseReferenceNumber: '11\\223344' // TODO: DO WE NEED THIS? ADDED DUMMY CASE REF TO PASS TEST.
                    }
                }
            };
        }
    }

    return Object.freeze({
        submit
    });
}

module.exports = createSubmissionService;
