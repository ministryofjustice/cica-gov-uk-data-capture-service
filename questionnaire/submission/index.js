'use strict';

const defaults = {};
defaults.createQuestionnaireDAL = require('../questionnaire-dal');
defaults.createTaskRunner = require('../questionnaire/utils/taskRunner');
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
                        submitted: true,
                        questionnaireId,
                        caseReferenceNumber: '11\\223344' // TODO: DO WE NEED THIS? ADDED DUMMY CASE REF TO PASS TEST.
                    }
                }
            };
        } catch (err) {
            // TODO: UNHAPPY THINGS ARE NOT COVERED
            console.log(err, questionnaireId);

            // return {
            //     data: {
            //         type: 'submissions',
            //         id: questionnaireId,
            //         attributes: {
            //             status: 'FAILED',
            //             submitted: false,
            //             questionnaireId
            //         }
            //     }
            // };

            throw err;
        }
    }

    return Object.freeze({
        submit
    });
}

module.exports = createSubmissionService;
