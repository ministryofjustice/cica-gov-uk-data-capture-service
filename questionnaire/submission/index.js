'use strict';

const defaults = {};
defaults.createQuestionnaireDAL = require('../questionnaire-dal');
defaults.createTaskRunner = require('../questionnaire/utils/taskRunner').createTaskRunner;
defaults.sequential = require('../questionnaire/utils/taskRunner/tasks/sequential');
const {transformAndUpload} = require('../questionnaire/utils/taskRunner/tasks/transformAndUpload');
const {
    generateReferenceNumber
} = require('../questionnaire/utils/taskRunner/tasks/generateCaseReference');
const {sendSubmissionMessageToSQS} = require('../questionnaire/utils/taskRunner/tasks/postToSQS');
const sendNotifyMessageToSQS = require('../questionnaire/utils/taskRunner/tasks/postToNotify');

function createSubmissionService({
    logger,
    createQuestionnaireDAL = defaults.createQuestionnaireDAL,
    createTaskRunner = defaults.createTaskRunner,
    sequential = defaults.sequential
} = {}) {
    const db = createQuestionnaireDAL({logger});

    async function submit(questionnaireId) {
        try {
            const questionnaireDef = await db.getQuestionnaire(questionnaireId);
            const onSubmitTaskDefinition = JSON.parse(JSON.stringify(questionnaireDef.onSubmit));
            const taskRunner = createTaskRunner({
                taskImplementations: {
                    sequential,
                    transformAndUpload,
                    generateReferenceNumber,
                    sendSubmissionMessageToSQS,
                    sendNotifyMessageToSQS
                },
                context: {
                    questionnaireDef,
                    logger
                }
            });

            await taskRunner.run(onSubmitTaskDefinition);

            // return a submission document
            return {
                data: {
                    type: 'submissions',
                    id: questionnaireId,
                    attributes: {
                        status: 'COMPLETED',
                        submitted: true
                    }
                }
            };
        } catch (err) {
            // TODO: UNHAPPY THINGS ARE NOT COVERED
            console.log(err);

            return {
                data: {
                    type: 'submissions',
                    id: questionnaireId,
                    attributes: {
                        status: 'FAILED',
                        submitted: false
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
