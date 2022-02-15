'use strict';

const VError = require('verror');

// TODO: Remove replaceJsonPointers dependency on next major template release
const replaceJsonPointers = require('../../services/replace-json-pointer');

const defaults = {};
defaults.createQuestionnaireDAL = require('../questionnaire-dal');
defaults.createSection = require('../section/section');

function createDatasetService({
    logger,
    createQuestionnaireDAL = defaults.createQuestionnaireDAL,
    createSection = defaults.createSection
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

    function getGlobalAttributeDetailsByAttributeId(attributeId, questionnaire) {
        const globalAttributeDetails = questionnaire.meta && questionnaire.meta.attributes;

        if (globalAttributeDetails !== undefined) {
            const attributeDetails = globalAttributeDetails[attributeId];

            return attributeDetails;
        }

        return undefined;
    }

    function applyGlobalAttributeDetails(attribute, questionnaire) {
        const globalAttributeDetails = getGlobalAttributeDetailsByAttributeId(
            attribute.id,
            questionnaire
        );

        if (globalAttributeDetails !== undefined && globalAttributeDetails.title !== undefined) {
            attribute.label = globalAttributeDetails.title;
        }

        return attribute;
    }

    function getFlatDataView(questionnaire) {
        const dataset = new Map();

        questionnaire.progress.forEach(sectionId => {
            const sectionAnswers = questionnaire.answers[sectionId];

            if (sectionAnswers) {
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
            }
        });

        return Object.fromEntries(dataset);
    }

    function getHierachicalDataView(questionnaire) {
        const {progress, sections, answers} = questionnaire;
        const dataset = new Map();

        function getDatasetEntryForConvertedStringToBoolean({sectionDefinition, sectionId}) {
            const {schema} = sectionDefinition;
            const schemaJSON = JSON.stringify(schema);
            const interpolatedSchemaJSON = replaceJsonPointers(schemaJSON, questionnaire);
            const interpolatedSchema = JSON.parse(interpolatedSchemaJSON);
            const questionId = Object.keys(sectionDefinition.schema.properties)[0];
            const currentAnswer = questionnaire.answers[sectionId][questionId];
            return {
                questionId,
                entry: {
                    type: 'simple',
                    id: questionId,
                    label: interpolatedSchema.properties[questionId].title,
                    value: currentAnswer === 'yes',
                    valueLabel: currentAnswer === 'not-sure' ? 'no' : currentAnswer
                }
            };
        }

        function getDatasetEntryForSummarySection({sectionDefinition, sectionId}) {
            const {schema} = sectionDefinition;
            const schemaJSON = JSON.stringify(schema);
            const interpolatedSchemaJSON = replaceJsonPointers(schemaJSON, questionnaire);
            const interpolatedSchema = JSON.parse(interpolatedSchemaJSON);

            const questionId =
                sectionId.indexOf('mainapplicant') !== -1
                    ? 'q-mainapplicant-declaration'
                    : 'q-applicant-declaration';
            const descriptionId = questionId.replace('q-', '');
            const value = `i-agree-${sectionId
                .split('-')
                .splice(3)
                .join('-')}`.replace(/(-$)/, '');

            return {
                questionId,
                entry: {
                    type: 'simple',
                    id: questionId,
                    label: interpolatedSchema.allOf[0].properties[descriptionId].description,
                    value,
                    valueLabel: 'Submit'
                }
            };
        }

        progress.forEach(sectionId => {
            const questionAnswers = answers[sectionId];

            if (
                [
                    'p-applicant-infections',
                    'p-applicant-pregnancy',
                    'p-applicant-pregnancy-loss'
                ].includes(sectionId) &&
                questionnaire.version === '5.2.1'
            ) {
                const datasetEntry = getDatasetEntryForConvertedStringToBoolean({
                    sectionDefinition: sections[sectionId],
                    sectionId
                });
                dataset.set(datasetEntry.questionId, datasetEntry.entry);
            } else if (
                [
                    'p-applicant-declaration',
                    'p-mainapplicant-declaration-under-12',
                    'p-mainapplicant-declaration-12-and-over'
                ].includes(sectionId) &&
                questionnaire.version === '5.2.1'
            ) {
                // // TODO: START - Remove this block (hardcoded declaration) on next major template release
                const datasetEntry = getDatasetEntryForSummarySection({
                    sectionDefinition: sections[sectionId],
                    sectionId
                });
                dataset.set(datasetEntry.questionId, datasetEntry.entry);
                // TODO: END - Remove this block (hardcoded declaration) on next major template release
            } else if (questionAnswers !== undefined) {
                const sectionDefinition = sections[sectionId];
                const section = createSection({sectionDefinition});
                const attributes = section.getAttributesByData(questionAnswers);

                attributes.forEach(attribute => {
                    const existingAttribute = dataset.get(attribute.id);

                    if (existingAttribute !== undefined) {
                        mergeAttributeValues(existingAttribute, attribute);
                    } else {
                        const mutatedAttribute = applyGlobalAttributeDetails(
                            attribute,
                            questionnaire
                        );

                        dataset.set(mutatedAttribute.id, mutatedAttribute);
                    }
                });
            }
        });

        return Array.from(dataset.values());
    }

    async function getResource(questionnaireId, resourceVersion = '1.0.0') {
        const questionnaire = await db.getQuestionnaire(questionnaireId);

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
