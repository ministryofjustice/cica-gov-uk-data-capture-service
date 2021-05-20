'use strict';

jest.doMock('../db/index.js', () => () => ({
    query: (query, parameters) => {
        if (query === 'SELECT id FROM questionnaire WHERE submission_status = $1') {
            if (parameters.includes('FAILED')) {
                return {
                    rowCount: 4,
                    rows: [
                        {
                            id: '4ddb0208-f7da-4237-a244-34e7e58d2ddf'
                        },
                        {
                            id: '95118e91-8ed9-4b41-a7a8-727a353f2d18'
                        },
                        {
                            id: 'be567065-d11c-4ba1-8c3f-147290c7036f'
                        },
                        {
                            id: '93259f6d-1826-4e97-ba39-53b4e232dd81'
                        }
                    ]
                };
            }
            if (parameters.includes('FAILED2')) {
                return {
                    rowCount: 0
                };
            }
        }
        return [];
    }
}));

const createQuestionnaireDAL = require('./questionnaire-dal');

describe('questionnaire data access layer', () => {
    describe('getQuestionnaireIdsBySubmissionStatus', () => {
        it('should get an array of ids for failed submissions', async () => {
            const questionnaireDAL = createQuestionnaireDAL({logger: jest.fn()});
            const result = await questionnaireDAL.getQuestionnaireIdsBySubmissionStatus('FAILED');
            expect(result).toEqual([
                '4ddb0208-f7da-4237-a244-34e7e58d2ddf',
                '95118e91-8ed9-4b41-a7a8-727a353f2d18',
                'be567065-d11c-4ba1-8c3f-147290c7036f',
                '93259f6d-1826-4e97-ba39-53b4e232dd81'
            ]);
        });
        it('should get an empty array for failed submissions', async () => {
            const questionnaireDAL = createQuestionnaireDAL({logger: jest.fn()});
            const result = await questionnaireDAL.getQuestionnaireIdsBySubmissionStatus('FAILED2');
            expect(result).toEqual([]);
            expect(result.length).toBe(0);
        });
    });
});
