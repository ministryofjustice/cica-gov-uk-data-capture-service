'use strict';

const VError = require('verror');
const createQuestionnaireHelper = require('../questionnaire/questionnaire');

const defaults = {};
defaults.createQuestionnaireDAL = require('../questionnaire-dal');
defaults.qExpression = require('q-expressions');
defaults.getJsonExpressionEvaluator = require('../questionnaire/utils/getJsonExpressionEvaluator');
defaults.getValueContextualiser = require('../questionnaire/utils/getValueContextualiser');
defaults.mutateObjectValues = require('../questionnaire/utils/mutateObjectValues');

function createTaskListService({
    logger,
    apiVersion,
    ownerId,
    createQuestionnaireDAL = defaults.createQuestionnaireDAL,
    qExpression = defaults.qExpression,
    getJsonExpressionEvaluator = defaults.getJsonExpressionEvaluator,
    getValueContextualiser = defaults.getValueContextualiser,
    mutateObjectValues = defaults.mutateObjectValues
} = {}) {
    const db = createQuestionnaireDAL({logger, ownerId});

    async function getQuestionnaire(questionnaireId) {
        return db.getQuestionnaireByOwner(questionnaireId);
    }

    // if the result of a localisation attempt is "null", then that
    // means that the relevant role cannot be assertained at this point.
    // e.g. if you went to the task list on the very first page, it
    // would have no answers in order to localise anything.
    // if there are any "null" return values, then what is the desired UI
    // update here? do we show or hide anything? leave the section/task
    // "blank" or with a default message?
    function localiseSectionsAndTasks(questionnaire) {
        const taskListDefinition = questionnaire.getTaskListDefinition();
        if (taskListDefinition.l10n !== undefined) {
            const orderedValueTransformers = [];
            const allQuestionnaireAnswers = {answers: questionnaire.getAnswers()};
            const jsonExpressionEvaluator = getJsonExpressionEvaluator({
                ...allQuestionnaireAnswers,
                attributes: {
                    q__roles: questionnaire.getRoles()
                }
            });

            const valueContextualier = getValueContextualiser(
                taskListDefinition,
                allQuestionnaireAnswers
            );
            orderedValueTransformers.push(jsonExpressionEvaluator, valueContextualier);

            // TODO: DON'T MUTATE ORIGINAL!
            mutateObjectValues(taskListDefinition, orderedValueTransformers);
        }
    }

    function getRelevantStepsWithRelevantTasksForGivenRoles(questionnaire) {
        const taskListDefinition = questionnaire.getTaskListDefinition();
        const taskListSections = taskListDefinition.sections;

        if (taskListSections) {
            const answersAndRoles = {
                answers: questionnaire.getAnswers(),
                attributes: {
                    q__roles: questionnaire.getRoles()
                }
            };
            const relevantSteps = taskListSections.filter(section => {
                const defaultRelevance = true;
                let isRelevantStep = defaultRelevance;
                if ('cond' in section) {
                    isRelevantStep = qExpression.evaluate(section.cond, answersAndRoles);
                }

                // if this step is needed, now filter the tasks.
                if (isRelevantStep === true) {
                    const relevantTasks = section.tasks.filter(task => {
                        if ('cond' in task) {
                            const isRelevantTask = qExpression.evaluate(task.cond, answersAndRoles);
                            return isRelevantTask;
                        }
                        return defaultRelevance;
                    });
                    section.tasks = relevantTasks;
                }

                return isRelevantStep;
            });

            return relevantSteps;
        }

        return [];
    }

    async function getTaskListData(questionnaireId) {
        if (!ownerId || apiVersion !== '2023-05-17') {
            throw new VError(
                {
                    name: 'getTaskListDataNotSuccessful'
                },
                `getTaskListData cannot be used with ownerId "${ownerId}" and apiVersion "${apiVersion}"`
            );
        }

        const questionnaireDefinition = await getQuestionnaire(questionnaireId);
        const questionnaire = createQuestionnaireHelper({questionnaireDefinition});
        getRelevantStepsWithRelevantTasksForGivenRoles(questionnaire);
        localiseSectionsAndTasks(questionnaire);

        const taskListDefinition = questionnaire.getTaskListDefinition();

        const taskListResource = {
            type: 'task-list',
            id: questionnaireId,
            attributes: {
                title: taskListDefinition.title,
                description: taskListDefinition.description,
                sections: taskListDefinition.sections,
                labelCompleted: taskListDefinition.labelCompleted,
                labelIncomplete: taskListDefinition.labelIncomplete,
                labelCannotStart: taskListDefinition.labelCannotStart
            }
        };

        return {
            data: [taskListResource]
        };
    }

    return Object.freeze({
        getTaskListData
    });
}

module.exports = createTaskListService;
