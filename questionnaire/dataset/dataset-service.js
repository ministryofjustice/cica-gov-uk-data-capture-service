'use strict';

const VError = require('verror');

const defaults = {};
defaults.createQuestionnaireDAL = require('../questionnaire-dal');

function createDatasetService({
    logger,
    createQuestionnaireDAL = defaults.createQuestionnaireDAL
} = {}) {
    const db = createQuestionnaireDAL({logger});

    async function getResource(questionnaireId) {
        const questionnaire = await db.getQuestionnaire(questionnaireId);
        const dataset = new Map();

        questionnaire.progress.forEach(sectionId => {
            const sectionAnswers = questionnaire.answers[sectionId];

            if (sectionAnswers) {
                Object.keys(sectionAnswers).forEach(questionId => {
                    const answer = sectionAnswers[questionId];

                    if (dataset.has(questionId)) {
                        const existingAnswer = dataset.get(questionId);

                        // Answers for a specific question id can be collected over multiple sections.
                        // If previous answers have already be processed for an id, use an appropriate
                        // merge strategy for the given data type e.g. push to an array, concatenate strings with a delimiter
                        // ONLY SUPPORTS ARRAYS AT THE MOMENT
                        if (Array.isArray(existingAnswer)) {
                            // Ensure answers are of the same type
                            if (Array.isArray(answer)) {
                                existingAnswer.push(...answer);
                            } else {
                                throw new VError(
                                    `Question id "${questionId}" found more than once with different answer types. Unable to combine type "array" with "${typeof answer}"`
                                );
                            }
                        } else {
                            throw new VError(
                                `Question id "${questionId}" found more than once with unsupported type "${typeof existingAnswer}". Only arrays can be used to combine answers for a single id`
                            );
                        }
                    } else {
                        dataset.set(questionId, answer);
                    }
                });
            }
        });

        return [
            {
                type: 'dataset',
                id: 0,
                attributes: Object.fromEntries(dataset)
            }
        ];
    }

    return Object.freeze({
        getResource
    });
}

module.exports = createDatasetService;
