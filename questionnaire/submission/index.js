'use strict';

const defaults = {};
defaults.createQuestionnaireDAL = require('../questionnaire-dal');
<<<<<<< HEAD
defaults.createTaskRunner = require('../questionnaire/utils/taskRunner').createTaskRunner;
=======
defaults.createTaskRunner = require('../questionnaire/utils/taskRunner');
>>>>>>> WIP: Allow DCS to run submission tasks
defaults.sequential = require('../questionnaire/utils/taskRunner/tasks/sequential');
// Pull in additional task implementations here

function createSubmissionService({
    logger,
    createQuestionnaireDAL = defaults.createQuestionnaireDAL,
    createTaskRunner = defaults.createTaskRunner,
    sequential = defaults.sequential
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
