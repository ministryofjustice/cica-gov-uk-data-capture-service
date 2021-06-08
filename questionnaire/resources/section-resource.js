'use strict';

const JsonTranslator = require('json-translator');
const replaceJsonPointers = require('../../services/replace-json-pointer/index');

const sharedJsonTranslator = JsonTranslator();

async function contextualiseJson(sectionSchemaAsJson, {l10n, data}) {
    if (l10n) {
        const jsonTranslator = await sharedJsonTranslator;
        const contextualisedJson = jsonTranslator.translate(sectionSchemaAsJson, {
            vars: l10n.vars,
            translations: l10n.translations,
            data
        });

        return contextualisedJson;
    }

    return sectionSchemaAsJson;
}

async function SectionResource({sectionId, questionnaire}) {
    const section = questionnaire.sections[sectionId];
    const {schema: sectionSchema, l10n} = section;
    const sectionSchemaAsJson = JSON.stringify(sectionSchema);
    const contextualisedSectionSchemaAsJson = await contextualiseJson(sectionSchemaAsJson, {
        l10n,
        data: {
            answers: questionnaire.answers
        }
    });
    const sectionSchemaAsJsonWithReplacements = replaceJsonPointers(
        contextualisedSectionSchemaAsJson,
        questionnaire
    );
    const sectionResource = {
        type: 'sections',
        id: sectionId,
        attributes: JSON.parse(sectionSchemaAsJsonWithReplacements)
    };

    // Add any answer relationships
    const {answers} = questionnaire;
    const sectionAnswers = answers ? answers[sectionId] : undefined;

    if (sectionAnswers) {
        sectionResource.relationships = {
            answer: {
                data: {
                    type: 'answers',
                    id: sectionId
                }
            }
        };
    }

    return sectionResource;
}

module.exports = SectionResource;
