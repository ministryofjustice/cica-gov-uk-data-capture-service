'use strict';

const VError = require('verror');

const defaults = {};
defaults.createQuestionnaireDAL = require('../questionnaire-dal');

function createMetadataService({
    logger,
    createQuestionnaireDAL = defaults.createQuestionnaireDAL
} = {}) {
    const db = createQuestionnaireDAL({logger});

    function buildMetadataResource(data) {
        return {
            type: 'metadata',
            id: data.id,
            attributes: {
                questionnaireId: data.id,
                questionnaireDocumentVersion: data.questionnaireDocumentVersion,
                created: data.created,
                modifed: data.modifed,
                submissionStatus: data.submissionStatus,
                userId: data.userId,
                expires: new Date(
                    new Date(
                        new Date(data.created).setUTCDate(new Date(data.created).getUTCDate() + 31)
                    ).setUTCHours(0, 0, 0, 0)
                ).toISOString()
            }
        };
    }

    async function getMetadata(query) {
        if (query) {
            const {filter} = query;
            if (filter?.['user-id']) {
                const results = await db.getQuestionnaireMetadataByUserId(filter['user-id']);
                const metadataResource = buildMetadataResource(results);

                return {
                    data: [metadataResource]
                };
            }

            throw new VError(
                {
                    name: 'ResourceNotFound'
                },
                `Metadata resource does not exist for query"`
            );
        }

        const results = await db.getQuestionnairesMetadataCollection();
        const metadataCollection = results.map(metadataItem => buildMetadataResource(metadataItem));

        return {
            data: metadataCollection
        };
    }

    return Object.freeze({
        getMetadata
    });
}

module.exports = createMetadataService;
