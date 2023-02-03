'use strict';

const defaults = {};
defaults.createQuestionnaireDAL = require('../questionnaire-dal');

function createMetadataService({
    logger,
    createQuestionnaireDAL = defaults.createQuestionnaireDAL
} = {}) {
    const db = createQuestionnaireDAL({logger});

    async function getMetadata(query = {}) {
        const results = await db.getQuestionnaireMetadata(query);

        // Add expiry time & map
        const meta = results.map(data => ({
            type: 'metadata',
            id: data.id,
            attributes: {
                'questionnaire-id': data.id,
                'questionnaire-document-version': data['questionnaire-version'],
                created: data.created,
                modified: data.modified,
                state: data.submission_status,
                'user-id': data['user-id'],
                expires: new Date(
                    new Date(
                        new Date(data.created).setUTCDate(new Date(data.created).getUTCDate() + 31)
                    ).setUTCHours(0, 0, 0, 0)
                ).toISOString()
            }
        }));

        return {
            data: meta
        };
    }

    return Object.freeze({
        getMetadata
    });
}

module.exports = createMetadataService;
