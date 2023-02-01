'use strict';

const createMetadataService = require('./metadata-service');

describe('Questionnaire Service', () => {
    describe('getMetadata', () => {
        it('should return metadata to match the api contract', async () => {
            const metadataService = createMetadataService({
                logger: () => 'Logged from dataset test',
                createQuestionnaireDAL: () => ({
                    getQuestionnaireMetadata: () => {
                        return {
                            rows: [
                                {
                                    id: '6fbc0958-e70c-4e37-ab65-12b96e8d37c1',
                                    'questionnaire-version': '4.2.0',
                                    created: '2023-01-01T10:42:24.016Z',
                                    modified: '2023-01-01T10:42:49.604Z',
                                    submission_status: 'NOT_STARTED',
                                    'user-id': 'abc123'
                                }
                            ]
                        };
                    }
                })
            });

            const actual = await metadataService.getMetadata();

            const expected = {
                data: [
                    {
                        type: 'metadata',
                        id: '6fbc0958-e70c-4e37-ab65-12b96e8d37c1',
                        attributes: {
                            'questionnaire-id': '6fbc0958-e70c-4e37-ab65-12b96e8d37c1',
                            'questionnaire-document-version': '4.2.0',
                            created: '2023-01-01T10:42:24.016Z',
                            modified: '2023-01-01T10:42:49.604Z',
                            state: 'NOT_STARTED',
                            'user-id': 'abc123',
                            expires: '2023-02-01T00:00:00.000Z'
                        }
                    }
                ]
            };

            expect(actual).toEqual(expected);
        });
    });
});
