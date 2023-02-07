'use strict';

const createQuestionnaireHelper = require('../questionnaire/questionnaire');
const questionnaireDefinition = require('../templates');

function createMetadataService({logger} = {}) {
    async function getMetadata(query = {}) {
        const questionnaire = createQuestionnaireHelper({
            questionnaireDefinition
        });

        const results = questionnaire.getMetadata({query, logger});

        return {
            type: 'metadata',
            id: results.id,
            attributes: {
                'questionnaire-id': results.id,
                'questionnaire-document-version': results.questionnaireDocumentVersion,
                created: results.created,
                modified: results.modified,
                state: results.submission_status,
                'user-id': results['user-id'],
                expires: results.expires
            }
        };
    }

    return Object.freeze({
        getMetadata
    });
}

module.exports = createMetadataService;
