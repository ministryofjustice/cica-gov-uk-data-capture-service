'use strict';

const defaults = {};
defaults.createSection = require('./section');
defaults.createTaxonomy = require('./taxonomy/taxonomy');
defaults.groupDataAttributesByTaxonomy = require('./utils/groupDataAttributesByTaxonomy');
defaults.mutateObjectValues = require('./utils/mutateObjectValues');
defaults.getValueInterpolator = require('./utils/getValueInterpolator');
defaults.getValueContextualiser = require('./utils/getValueContextualiser');

function createQuestionnaire({
    questionnaireDefinition,
    createSection = defaults.createSection,
    createTaxonomy = defaults.createTaxonomy,
    groupDataAttributesByTaxonomy = defaults.groupDataAttributesByTaxonomy,
    mutateObjectValues = defaults.mutateObjectValues,
    getValueInterpolator = defaults.getValueInterpolator,
    getValueContextualiser = defaults.getValueContextualiser
}) {
    function getAnswers() {
        return questionnaireDefinition.answers;
    }

    function getTaxonomies() {
        return questionnaireDefinition.taxonomies;
    }

    function getTaxonomy(taxonomyId) {
        const taxonomyDefinition = getTaxonomies()[taxonomyId];

        if (taxonomyDefinition !== undefined) {
            if (taxonomyDefinition.l10n !== undefined) {
                const allQuestionnaireAnswers = {answers: getAnswers()};
                const valueContextualier = getValueContextualiser(
                    taxonomyDefinition,
                    allQuestionnaireAnswers
                );

                // TODO: DON'T MUTATE ORIGINAL!
                mutateObjectValues(taxonomyDefinition, [valueContextualier]);
            }

            return createTaxonomy({
                id: taxonomyId,
                definition: taxonomyDefinition
            });
        }

        return undefined;
    }

    function getSectionDefinitions() {
        return questionnaireDefinition.sections;
    }

    function getSectionDefinition(sectionId) {
        return getSectionDefinitions()[sectionId];
    }

    function getSectionAnswers(sectionId) {
        return getAnswers()[sectionId];
    }

    function getProgress() {
        return questionnaireDefinition.progress || [];
    }

    function getProgressUntil(sectionId) {
        const allProgress = getProgress();
        const endIndex = allProgress.indexOf(sectionId);

        if (endIndex > -1) {
            const progressSubset = allProgress.slice(0, endIndex);
            return progressSubset;
        }

        return allProgress;
    }

    function transformDataAttribute(dataAttribute) {
        const {meta} = dataAttribute;
        const {sectionId} = meta;
        const summaryTitle = meta.summary && meta.summary.title;
        const themeId = meta.classifications && meta.classifications.theme;
        const format = meta.keywords && meta.keywords.format;
        const transformedData = {...dataAttribute};

        delete transformedData.meta;

        if (summaryTitle !== undefined) {
            transformedData.label = summaryTitle;
        }

        if (sectionId !== undefined) {
            transformedData.sectionId = sectionId;
        }

        if (themeId !== undefined) {
            transformedData.theme = themeId;
        }

        if (format !== undefined) {
            transformedData.format = format;
        }

        return transformedData;
    }

    function evaluateJsonExpression(value, sectionId) {
        const fnName = value[0];

        if (fnName === 'summary') {
            // TODO: handle multiple summary pages e.g. summarise between last summary and this one
            const progressSubset = getProgressUntil(sectionId);
            const summaryOptions = value[1];

            // eslint-disable-next-line no-use-before-define
            const dataAttributes = getDataAttributes({
                progress: progressSubset,
                dataAttributeTransformer: transformDataAttribute
            });
            const summary = groupDataAttributesByTaxonomy({
                dataAttributes,
                taxonomy: getTaxonomy(summaryOptions.groupByTaxonomy)
            });

            return summary;
        }

        return value;
    }

    function isJsonExpression(value) {
        return Array.isArray(value) && typeof value[0] === 'string';
    }

    function getResolvedVars(sectionId, sectionVars = []) {
        const resolvedVars = {};

        sectionVars.forEach(sectionVar => {
            const {name, value} = sectionVar;

            if (isJsonExpression(value)) {
                resolvedVars[name] = evaluateJsonExpression(value, sectionId);
            } else {
                resolvedVars[name] = value;
            }
        });

        return resolvedVars;
    }

    function getSectionDefinitionVars(sectionDefinition) {
        // TODO: replace this function body with an actual implementation of "vars"

        const {schema} = sectionDefinition;

        if (schema && 'properties' in schema && 'p-check-your-answers' in schema.properties) {
            schema.properties['p-check-your-answers'].properties.summaryInfo.summaryStructure =
                'q.var:summary';

            return [
                {
                    name: 'summary',
                    value: ['summary', {groupByTaxonomy: 'theme'}]
                }
            ];
        }

        return undefined;
    }

    function getVarName(identifier) {
        return identifier.split(':')[1];
    }

    function getValueVarReplacer(vars) {
        return (key, value) => {
            if (typeof value === 'string' && value.startsWith('q.var:')) {
                const varName = getVarName(value);

                return vars[varName];
            }

            return value;
        };
    }

    function getSection(sectionId) {
        const sectionDefinition = getSectionDefinition(sectionId);
        const sectionDefinitionVars = getSectionDefinitionVars(sectionDefinition);
        const allQuestionnaireAnswers = {answers: getAnswers()};
        const orderedValueTransformers = [];
        const valueInterpolator = getValueInterpolator(allQuestionnaireAnswers);

        if (sectionDefinition.l10n !== undefined) {
            const valueContextualier = getValueContextualiser(
                sectionDefinition,
                allQuestionnaireAnswers
            );

            orderedValueTransformers.push(valueContextualier);
        }

        if (sectionDefinitionVars !== undefined) {
            const resolvedVars = getResolvedVars(sectionId, sectionDefinitionVars);
            const valueVarReplacer = getValueVarReplacer(resolvedVars);

            orderedValueTransformers.push(valueVarReplacer);
        }

        orderedValueTransformers.push(valueInterpolator);

        // TODO: DON'T MUTATE ORIGINAL!
        // contextualise > replace vars > interpolate
        mutateObjectValues(sectionDefinition.schema, orderedValueTransformers);

        return createSection({id: sectionId, sectionDefinition});
    }

    function getDataAttributes({progress = getProgress(), dataAttributeTransformer} = {}) {
        const allDataAttributes = [];

        progress.forEach(sectionId => {
            const sectionAnswers = getSectionAnswers(sectionId);

            if (sectionAnswers !== undefined) {
                const section = getSection(sectionId);
                const sectionDataAttributes = section.getAttributesByData({
                    data: sectionAnswers,
                    includeMetadata: true,
                    mapAttribute: dataAttributeTransformer
                });

                allDataAttributes.push(...sectionDataAttributes);
            }
        });

        return allDataAttributes;
    }

    return Object.freeze({
        getTaxonomy,
        getSection
    });
}

module.exports = createQuestionnaire;
