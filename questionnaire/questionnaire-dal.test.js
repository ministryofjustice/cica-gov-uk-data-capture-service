/* eslint-disable global-require */

'use strict';

describe('questionnaire data access layer', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });
    const VALID_QUESTIONNAIRE_ID = 'acbfcd8e-1299-478a-a9f1-7005f4b713ed';
    const ZERO_ROWS_QUESTIONNAIRE_ID = '22222222-1299-478a-a9f1-7005f4b713ed';
    const INVALID_QUESTIONNAIRE_ID = '12345678-1299-478a-a9f1-7005f4b713ed';
    jest.doMock('../db/index.js', () => {
        const dbServiceMock = {
            query: jest.fn((queryText, [uuid, questionnaireId]) => {
                if (uuid === 'acbfcd8e-1299-478a-a9f1-7005f4b713ed') {
                    return {
                        rows: [
                            {
                                questionnaire: {
                                    answers: {}
                                }
                            }
                        ],
                        rowCount: 1
                    };
                }
                if (questionnaireId === '22222222-1299-478a-a9f1-7005f4b713ed') {
                    return {
                        rows: [],
                        rowCount: 0
                    };
                }
                throw new Error('DB_QUERY_ERROR');
            })
        };

        return () => dbServiceMock;
    });

    const mockedDbService = require('../db/index.js')({
        logger: () => 'Logged from DAL test'
    });
    const createQuestionnaireDAL = require('./questionnaire-dal');
    describe('createQuestionnaire', () => {
        const query =
            'INSERT INTO questionnaire (id, questionnaire, created, modified) VALUES($1, $2, current_timestamp, current_timestamp)';
        it('Should run a create questionnaire query', async () => {
            const uuid = VALID_QUESTIONNAIRE_ID;
            const questionnaire = {answers: {}};
            const questionnaireDAL = createQuestionnaireDAL({logger: jest.fn()});
            await questionnaireDAL.createQuestionnaire(uuid, questionnaire);

            expect(mockedDbService.query).toHaveBeenCalledTimes(1);
            expect(mockedDbService.query).toHaveBeenCalledWith(query, [uuid, questionnaire]);
        });

        it('Should handle errors gracefully', async () => {
            const uuid = INVALID_QUESTIONNAIRE_ID;
            const questionnaire = {answers: {}};
            const questionnaireDAL = createQuestionnaireDAL({logger: jest.fn()});

            await expect(questionnaireDAL.createQuestionnaire(uuid, questionnaire)).rejects.toThrow(
                'DB_QUERY_ERROR'
            );
        });
    });

    describe('getQuestionnaire', () => {
        const query =
            "SELECT questionnaire FROM questionnaire WHERE id = $1 AND questionnaire -> 'answers' -> 'owner' ->> 'owner-id' = $2";
        it('Should run a get questionnaire query', async () => {
            const questionnaireId = VALID_QUESTIONNAIRE_ID;
            const ownerId = 'urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6';
            const questionnaireDAL = createQuestionnaireDAL({logger: jest.fn()});
            await questionnaireDAL.getQuestionnaire(questionnaireId, ownerId);

            expect(mockedDbService.query).toHaveBeenCalledTimes(1);
            expect(mockedDbService.query).toHaveBeenCalledWith(query, [questionnaireId, ownerId]);
        });

        it('Should handle errors gracefully', async () => {
            const questionnaireId = INVALID_QUESTIONNAIRE_ID;
            const ownerId = 'urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6';
            const questionnaireDAL = createQuestionnaireDAL({logger: jest.fn()});

            await expect(
                questionnaireDAL.getQuestionnaire(questionnaireId, ownerId)
            ).rejects.toThrow('DB_QUERY_ERROR');
        });
    });

    describe('updateQuestionnaire', () => {
        const query =
            "UPDATE questionnaire SET questionnaire = $1, modified = current_timestamp WHERE id = $2  AND questionnaire -> 'answers' -> 'owner' ->> 'owner-id' = $3";
        it('Should run an update questionnaire query', async () => {
            const questionnaire = {answers: {}};
            const questionnaireId = VALID_QUESTIONNAIRE_ID;
            const ownerId = 'urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6';
            const questionnaireDAL = createQuestionnaireDAL({logger: jest.fn()});
            await questionnaireDAL.updateQuestionnaire(questionnaire, questionnaireId, ownerId);

            expect(mockedDbService.query).toHaveBeenCalledTimes(1);
            expect(mockedDbService.query).toHaveBeenCalledWith(query, [
                questionnaireId,
                questionnaire,
                ownerId
            ]);
        });

        it('Should error gracefully if no rows are updated', async () => {
            const questionnaire = {answers: {}};
            const questionnaireId = ZERO_ROWS_QUESTIONNAIRE_ID;
            const ownerId = 'urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6';
            const questionnaireDAL = createQuestionnaireDAL({logger: jest.fn()});
            await expect(
                questionnaireDAL.updateQuestionnaire(questionnaireId, questionnaire, ownerId)
            ).rejects.toThrow(
                'Questionnaire "22222222-1299-478a-a9f1-7005f4b713ed" was not updated successfully'
            );
        });

        it('Should handle errors gracefully', async () => {
            const questionnaire = {answers: {}};
            const questionnaireId = INVALID_QUESTIONNAIRE_ID;
            const ownerId = 'urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6';
            const questionnaireDAL = createQuestionnaireDAL({logger: jest.fn()});

            await expect(
                questionnaireDAL.updateQuestionnaire(questionnaire, questionnaireId, ownerId)
            ).rejects.toThrow('DB_QUERY_ERROR');
        });
    });
});
