'use strict';

const DB_QUERY_ERROR_QUESTIONNAIRE_ID = 'acbfcd8e-1299-478a-a9f1-7005f4b713ed';
const DB_QUERY_ERROR_SUBMISSION_STATUS_ID = 'FAIL_TEST';
const DB_QUERY_ROW_COUNT_ZERO_QUESTIONNAIRE_ID = 'c9723b81-c50d-4050-805f-108995067913';
const DB_QUERY_ROW_COUNT_ZERO_SUBMISSION_STATUS = 'ZERO_ROWS_SUBMISSION_STATUS';
const DB_QUERY_SUCCESS_QUESTIONNAIRE_ID = '12345678-c50d-4050-805f-108995067913';

beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
});

jest.doMock('../db/index.js', () => {
    const dbServiceMock = {
        query: jest.fn((query, parameters) => {
            if (parameters.includes(DB_QUERY_ERROR_QUESTIONNAIRE_ID)) {
                throw new Error('DB_QUERY_ERROR');
            }

            if (parameters.includes(DB_QUERY_ERROR_SUBMISSION_STATUS_ID)) {
                throw new Error('DB_QUERY_ERROR');
            }

            if (parameters.includes(DB_QUERY_ROW_COUNT_ZERO_QUESTIONNAIRE_ID)) {
                return {
                    rows: [],
                    rowCount: 0
                };
            }

            return {
                rows: [{status: 'ok'}],
                rowCount: 1
            };
        })
    };

    return () => dbServiceMock;
});

const mockedDbService = require('../db/index.js')({
    logger: () => 'Logged from DAL test'
});

const createQuestionnaireDAL = require('./questionnaire-dal');

describe('questionnaire data access layer', () => {
    describe('createQuestionnaire', () => {
        it('Should throw when a db connnectivity issue is encountered', async () => {
            const questionnaireDAL = createQuestionnaireDAL({logger: jest.fn()});
            await expect(
                questionnaireDAL.createQuestionnaire(DB_QUERY_ERROR_QUESTIONNAIRE_ID, {})
            ).rejects.toThrow('DB_QUERY_ERROR');
        });
    });

    describe('updateQuestionnaire', () => {
        const query =
            "UPDATE questionnaire SET questionnaire = $1, modified = current_timestamp WHERE id = $2 AND questionnaire -> 'answers' -> 'owner' ->> 'owner-id' = $3";
        it('Should run an update questionnaire query', async () => {
            const questionnaire = {answers: {}};
            const questionnaireId = DB_QUERY_SUCCESS_QUESTIONNAIRE_ID;
            const owner = {
                id: 'urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6',
                isAuthenticated: true
            };
            const questionnaireDAL = createQuestionnaireDAL({logger: jest.fn(), owner});
            await questionnaireDAL.updateQuestionnaire(questionnaire, questionnaireId);

            expect(mockedDbService.query).toHaveBeenCalledTimes(1);
            expect(mockedDbService.query).toHaveBeenCalledWith(query, [
                questionnaireId,
                questionnaire,
                owner.id
            ]);
        });

        it('Should error gracefully if no rows are updated', async () => {
            const questionnaire = {answers: {}};
            const questionnaireId = DB_QUERY_ROW_COUNT_ZERO_QUESTIONNAIRE_ID;
            const owner = {
                id: 'urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6',
                isAuthenticated: true
            };
            const questionnaireDAL = createQuestionnaireDAL({logger: jest.fn(), owner});
            await expect(
                questionnaireDAL.updateQuestionnaire(questionnaireId, questionnaire)
            ).rejects.toThrow(
                'Questionnaire "c9723b81-c50d-4050-805f-108995067913" was not updated successfully'
            );
        });

        it('Should handle errors gracefully', async () => {
            const questionnaire = {answers: {}};
            const questionnaireId = DB_QUERY_ERROR_QUESTIONNAIRE_ID;
            const owner = {
                id: 'urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6',
                isAuthenticated: true
            };
            const questionnaireDAL = createQuestionnaireDAL({logger: jest.fn(), owner});

            await expect(
                questionnaireDAL.updateQuestionnaire(questionnaire, questionnaireId)
            ).rejects.toThrow('DB_QUERY_ERROR');
        });
    });

    describe('getQuestionnaire', () => {
        const query =
            "SELECT questionnaire FROM questionnaire WHERE id = $1 AND questionnaire -> 'answers' -> 'owner' ->> 'owner-id' = $2";
        it('Should run a get questionnaire query', async () => {
            const questionnaireId = DB_QUERY_SUCCESS_QUESTIONNAIRE_ID;
            const owner = {
                id: 'urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6',
                isAuthenticated: true
            };
            const questionnaireDAL = createQuestionnaireDAL({logger: jest.fn(), owner});
            await questionnaireDAL.getQuestionnaire(questionnaireId);

            expect(mockedDbService.query).toHaveBeenCalledTimes(1);
            expect(mockedDbService.query).toHaveBeenCalledWith(query, [questionnaireId, owner.id]);
        });

        it('Should handle errors gracefully', async () => {
            const questionnaireId = DB_QUERY_ERROR_QUESTIONNAIRE_ID;
            const owner = {
                id: 'urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6',
                isAuthenticated: true
            };
            const questionnaireDAL = createQuestionnaireDAL({logger: jest.fn(), owner});

            await expect(questionnaireDAL.getQuestionnaire(questionnaireId)).rejects.toThrow(
                'DB_QUERY_ERROR'
            );
        });
    });

    describe('getQuestionnaireSubmissionStatus', () => {
        it('Should not successfully select from the db', async () => {
            const questionnaireDAL = createQuestionnaireDAL({logger: jest.fn()});
            await expect(
                questionnaireDAL.getQuestionnaireSubmissionStatus(
                    DB_QUERY_ROW_COUNT_ZERO_QUESTIONNAIRE_ID,
                    {}
                )
            ).rejects.toThrow(
                `Questionnaire "${DB_QUERY_ROW_COUNT_ZERO_QUESTIONNAIRE_ID}" not found`
            );
        });

        it('Should throw when a db connnectivity issue is encountered', async () => {
            const questionnaireDAL = createQuestionnaireDAL({logger: jest.fn()});
            await expect(
                questionnaireDAL.getQuestionnaireSubmissionStatus(DB_QUERY_ERROR_QUESTIONNAIRE_ID)
            ).rejects.toThrow('DB_QUERY_ERROR');
        });
    });

    describe('updateQuestionnaireSubmissionStatus', () => {
        it('Should not successfully update the db', async () => {
            const questionnaireDAL = createQuestionnaireDAL({logger: jest.fn()});
            await expect(
                questionnaireDAL.updateQuestionnaireSubmissionStatus(
                    DB_QUERY_ROW_COUNT_ZERO_QUESTIONNAIRE_ID,
                    'COMPLETED'
                )
            ).rejects.toThrow(
                `Questionnaire "${DB_QUERY_ROW_COUNT_ZERO_QUESTIONNAIRE_ID}" submission status not successfully updated to "COMPLETED"`
            );
        });

        it('Should throw when a db connnectivity issue is encountered', async () => {
            const questionnaireDAL = createQuestionnaireDAL({logger: jest.fn()});
            await expect(
                questionnaireDAL.updateQuestionnaireSubmissionStatus(
                    DB_QUERY_ERROR_QUESTIONNAIRE_ID,
                    'COMPLETED'
                )
            ).rejects.toThrow('DB_QUERY_ERROR');
        });
    });

    describe('getQuestionnaireIdsBySubmissionStatus', () => {
        it('Should not successfully select from the db', async () => {
            const questionnaireDAL = createQuestionnaireDAL({logger: jest.fn()});
            const response = await questionnaireDAL.getQuestionnaireIdsBySubmissionStatus(
                DB_QUERY_ROW_COUNT_ZERO_SUBMISSION_STATUS
            );
            await expect(response).toEqual([]);
        });

        it('Should throw when a db connnectivity issue is encountered', async () => {
            const questionnaireDAL = createQuestionnaireDAL({logger: jest.fn()});
            await expect(
                questionnaireDAL.getQuestionnaireIdsBySubmissionStatus(
                    DB_QUERY_ERROR_SUBMISSION_STATUS_ID
                )
            ).rejects.toThrow('DB_QUERY_ERROR');
        });
    });

    describe('getQuestionnaireModifiedDate', () => {
        it('Should not successfully select from the db', async () => {
            const questionnaireDAL = createQuestionnaireDAL({logger: jest.fn()});
            await expect(
                questionnaireDAL.getQuestionnaireModifiedDate(
                    DB_QUERY_ROW_COUNT_ZERO_QUESTIONNAIRE_ID
                )
            ).rejects.toThrow(
                `Questionnaire "${DB_QUERY_ROW_COUNT_ZERO_QUESTIONNAIRE_ID}" not found`
            );
        });

        it('Should throw when a db connnectivity issue is encountered', async () => {
            const questionnaireDAL = createQuestionnaireDAL({logger: jest.fn()});
            await expect(
                questionnaireDAL.getQuestionnaireModifiedDate(DB_QUERY_ERROR_QUESTIONNAIRE_ID)
            ).rejects.toThrow('DB_QUERY_ERROR');
        });
    });

    describe('updateQuestionnaireModifiedDate', () => {
        it('Should not successfully update the db', async () => {
            const questionnaireDAL = createQuestionnaireDAL({logger: jest.fn()});
            await expect(
                questionnaireDAL.updateQuestionnaireModifiedDate(
                    DB_QUERY_ROW_COUNT_ZERO_QUESTIONNAIRE_ID
                )
            ).rejects.toThrow(
                `Questionnaire "${DB_QUERY_ROW_COUNT_ZERO_QUESTIONNAIRE_ID}" modified date was not updated successfully`
            );
        });

        it('Should throw when a db connnectivity issue is encountered', async () => {
            const questionnaireDAL = createQuestionnaireDAL({logger: jest.fn()});
            await expect(
                questionnaireDAL.updateQuestionnaireModifiedDate(DB_QUERY_ERROR_QUESTIONNAIRE_ID)
            ).rejects.toThrow('DB_QUERY_ERROR');
        });
    });
});
