'use strict';

const defaults = {};
defaults.createSection = require('../section/section');
defaults.createTaxonomy = require('./taxonomy/taxonomy');
defaults.groupDataAttributesByTaxonomy = require('./utils/groupDataAttributesByTaxonomy');
defaults.mutateValues = require('./utils/mutateValues');
defaults.replaceJsonPointer = require('./utils/replaceJsonPointer');

function createQuestionnaire({
    questionnaireDefinition,
    createSection = defaults.createSection,
    createTaxonomy = defaults.createTaxonomy,
    groupDataAttributesByTaxonomy = defaults.groupDataAttributesByTaxonomy,
    mutateValues = defaults.mutateValues,
    replaceJsonPointer = defaults.replaceJsonPointer
}) {
    function getTaxonomies() {
        return questionnaireDefinition.taxonomies;
    }

    function getTaxonomy(taxonomyId) {
        const taxonomyDefinition = getTaxonomies()[taxonomyId];

        if (taxonomyDefinition !== undefined) {
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

    function getAnswers() {
        return questionnaireDefinition.answers;
    }

    function getSectionAnswers(sectionId) {
        return getAnswers()[sectionId];
    }

    function getProgress() {
        return questionnaireDefinition.progress || [];
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

    function evaluateJsonExpression(value) {
        const fnName = value[0];

        if (fnName === 'summary') {
            const summaryOptions = value[1];
            // TODO: Look at removing circular function dependency
            // eslint-disable-next-line no-use-before-define
            const dataAttributes = getDataAttributes(transformDataAttribute);
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

    function resolveVars(sectionVars) {
        const resolvedVars = {};

        sectionVars.forEach(sectionVar => {
            const {name, value} = sectionVar;

            if (isJsonExpression(value)) {
                resolvedVars[name] = evaluateJsonExpression(value);
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

    function getVarReferenceReplacer(vars, answers) {
        return (key, value) => {
            if (typeof value === 'string') {
                if (value.startsWith('q.var:')) {
                    const varName = getVarName(value);

                    return vars[varName];
                }

                return replaceJsonPointer(value, {answers});
            }

            return value;
        };
    }

    function getSection(sectionId) {
        const sectionDefinition = getSectionDefinition(sectionId);
        const sectionDefinitionVars = getSectionDefinitionVars(sectionDefinition);
        let resolvedVars;

        if (sectionDefinitionVars !== undefined) {
            resolvedVars = resolveVars(sectionDefinitionVars);
        }

        const replacer = getVarReferenceReplacer(resolvedVars, getAnswers());

        mutateValues(sectionDefinition.schema, replacer);

        return createSection({id: sectionId, sectionDefinition});
    }

    function getDataAttributes(dataAttributeTransformer) {
        const progress = getProgress();
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
