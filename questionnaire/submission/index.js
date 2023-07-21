'use strict';

const defaults = {};
defaults.createQuestionnaireDAL = require('../questionnaire-dal');
defaults.createTaskRunner = require('../questionnaire/utils/taskRunner').createTaskRunner;
defaults.sequential = require('../questionnaire/utils/taskRunner/tasks/sequential');
defaults.transformAndUpload = require('../questionnaire/utils/taskRunner/tasks/transformAndUpload');
defaults.generateCaseReference = require('../questionnaire/utils/taskRunner/tasks/generateCaseReference');
defaults.postToSQS = require('../questionnaire/utils/taskRunner/tasks/postToSQS');

function createSubmissionService({
    logger,
    createQuestionnaireDAL = defaults.createQuestionnaireDAL,
    createTaskRunner = defaults.createTaskRunner,
    sequential = defaults.sequential,
    transformAndUpload = defaults.transformAndUpload,
    generateCaseReference = defaults.generateCaseReference,
    postToSQS = defaults.generateCaseReference
} = {}) {
    const db = createQuestionnaireDAL({logger});

    async function submit(questionnaireId) {
        try {
            const questionnaireDefinition = await db.getQuestionnaire(questionnaireId);
            const onSubmitTaskDefinition = JSON.parse(
                JSON.stringify(questionnaireDefinition.onSubmit)
            );
            const taskRunner = createTaskRunner({
                taskImplementations: {
                    sequential,
                    transformAndUpload,
                    generateCaseReference,
                    postToSQS
                },
                context: {
                    questionnaireDef: questionnaireDefinition,
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
