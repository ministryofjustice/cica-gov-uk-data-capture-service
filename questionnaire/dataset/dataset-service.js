'use strict';

const VError = require('verror');

const defaults = {};
defaults.createQuestionnaireDAL = require('../questionnaire-dal');
defaults.createQuestionnaireHelper = require('../questionnaire/questionnaire');

function createDatasetService({
    logger,
    createQuestionnaireDAL = defaults.createQuestionnaireDAL,
    createQuestionnaireHelper = defaults.createQuestionnaireHelper
} = {}) {
    const db = createQuestionnaireDAL({logger});

    function mergeArrays(target, source) {
        const targetIsArray = Array.isArray(target);
        const sourceIsArray = Array.isArray(source);

        if (targetIsArray && sourceIsArray) {
            return target.concat(source);
        }

        throw new VError(
            `Target and Source must be arrays. Target type: "${
                targetIsArray ? 'array' : typeof target
            }". Source type: "${sourceIsArray ? 'array' : typeof source}"`
        );
    }

    function mergeAttributeValues(targetAttribute, sourceAttribute) {
        targetAttribute.value = mergeArrays(targetAttribute.value, sourceAttribute.value);
        targetAttribute.valueLabel = mergeArrays(
            targetAttribute.valueLabel,
            sourceAttribute.valueLabel
        );

        return targetAttribute;
    }

    function applyNormalisedAttributeDetails(attribute, questionnaire) {
        const normalisedAttributeDetails = questionnaire.getNormalisedDetailsForAttribute(
            attribute.id
        );

        if (
            normalisedAttributeDetails !== undefined &&
            normalisedAttributeDetails.title !== undefined
        ) {
            attribute.label = normalisedAttributeDetails.title;
        }

        return attribute;
    }

    function getFlatDataView(questionnaire) {
        const dataset = new Map();
        const answers = questionnaire.getOrderedAnswers();

        Object.values(answers).forEach(sectionAnswers => {
            Object.keys(sectionAnswers).forEach(questionId => {
                const answer = sectionAnswers[questionId];
                const existingAnswer = dataset.get(questionId);

                if (existingAnswer !== undefined) {
                    const mergedAnswers = mergeArrays(existingAnswer, answer);

                    dataset.set(questionId, mergedAnswers);
                } else {
                    dataset.set(questionId, answer);
                }
            });
        });

        return Object.fromEntries(dataset);
    }

    function getHierachicalDataView(questionnaire) {
        const dataset = new Map();

        const dataAttrs = questionnaire.getDataAttributes({includeMetadata: false});

        dataAttrs.forEach(attribute => {
            const existingAttribute = dataset.get(attribute.id);

            if (existingAttribute !== undefined) {
                mergeAttributeValues(existingAttribute, attribute);
            } else {
                const mutatedAttribute = applyNormalisedAttributeDetails(attribute, questionnaire);

                dataset.set(mutatedAttribute.id, mutatedAttribute);
            }
        });

        return Array.from(dataset.values());
    }

    async function getResource(questionnaireId, resourceVersion = '1.0.0') {
        const questionnaireDefinition = await db.getQuestionnaire(questionnaireId);
        const questionnaire = createQuestionnaireHelper({questionnaireDefinition});

        if (resourceVersion === '1.0.0') {
            const dataset = getFlatDataView(questionnaire);

            return [
                {
                    type: 'dataset',
                    id: '0',
                    attributes: dataset
                }
            ];
        }

        if (resourceVersion === '2.0.0') {
            const dataset = getHierachicalDataView(questionnaire);

            return [
                {
                    type: 'dataset',
                    id: '0',
                    attributes: {
                        values: dataset
                    }
                }
            ];
        }

        throw Error(`Dataset resource version "${resourceVersion}" is unsupported`);
    }

    return Object.freeze({
        getResource
    });
}

module.exports = createDatasetService;
