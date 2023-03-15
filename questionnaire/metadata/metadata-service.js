'use strict';

const defaults = {};
defaults.createQuestionnaireDAL = require('../questionnaire-dal');

function createMetadataService({
    logger,
    createQuestionnaireDAL = defaults.createQuestionnaireDAL
} = {}) {
    const db = createQuestionnaireDAL({logger});

    async function getMetadata(userId, query = {}) {
        const results = await db.getQuestionnaireMetadata(query, userId);

        // Add expiry time & map
        const metadata = results.map(data => {
            return {
                type: 'metadata',
                id: data.id,
                attributes: {
                    'questionnaire-id': data.id,
                    'questionnaire-document-version': data['questionnaire-document-version'],
                    created: data.created,
                    modified: data.modified,
                    'submission-status': data.submission_status,
                    'user-id': data.userId,
                    expires: new Date(
                        new Date(
                            new Date(data.created).setUTCDate(
                                new Date(data.created).getUTCDate() + 31
                            )
                        ).setUTCHours(0, 0, 0, 0)
                    ).toISOString()
                }
            };
        });

        return {
            data: metadata
        };
    }

    return Object.freeze({
        getMetadata
    });
}

module.exports = createMetadataService;
