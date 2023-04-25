'use strict';

const DB_QUERY_ERROR_QUESTIONNAIRE_ID = 'acbfcd8e-1299-478a-a9f1-7005f4b713ed';
const DB_QUERY_ERROR_SUBMISSION_STATUS_ID = 'FAIL_TEST';
const DB_QUERY_ROW_COUNT_ZERO_QUESTIONNAIRE_ID = 'c9723b81-c50d-4050-805f-108995067913';
const DB_QUERY_ROW_COUNT_ZERO_SUBMISSION_STATUS = 'ZERO_ROWS_SUBMISSION_STATUS';
const DB_QUERY_UPDATE_SUCCCESS_ID = '11111111-c50d-4050-805f-108995067913';

jest.doMock('../db/index.js', () => {
    const dbServiceMock = {
        query: jest.fn((queryText, parameters) => {
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

            if (parameters.includes(DB_QUERY_UPDATE_SUCCCESS_ID)) {
                return {
                    rows: [{status: 'ok'}],
                    rowCount: 1
                };
            }

            return {
                rows: [],
                rowCount: 0
            };
        })
    };

    return () => dbServiceMock;
});

// require mocked db service
const mockedDbService = require('../db/index.js')({
    logger: () => 'Logged from DAL test'
});
const createQuestionnaireDAL = require('./questionnaire-dal');

beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
});

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
        it('Should not successfully update the db', async () => {
            const questionnaireDAL = createQuestionnaireDAL({logger: jest.fn()});
            await expect(
                questionnaireDAL.updateQuestionnaire(DB_QUERY_ROW_COUNT_ZERO_QUESTIONNAIRE_ID, {})
            ).rejects.toThrow(
                `Questionnaire "${DB_QUERY_ROW_COUNT_ZERO_QUESTIONNAIRE_ID}" was not updated successfully`
            );
        });

        it('Should throw when a db connnectivity issue is encountered', async () => {
            const questionnaireDAL = createQuestionnaireDAL({logger: jest.fn()});
            await expect(
                questionnaireDAL.updateQuestionnaire(DB_QUERY_ERROR_QUESTIONNAIRE_ID, {})
            ).rejects.toThrow('DB_QUERY_ERROR');
        });
    });

    describe('getQuestionnaire', () => {
        it('Should not successfully select from the db', async () => {
            const questionnaireDAL = createQuestionnaireDAL({logger: jest.fn()});
            await expect(
                questionnaireDAL.getQuestionnaire(DB_QUERY_ROW_COUNT_ZERO_QUESTIONNAIRE_ID, {})
            ).rejects.toThrow(
                `Questionnaire "${DB_QUERY_ROW_COUNT_ZERO_QUESTIONNAIRE_ID}" not found`
            );
        });

        it('Should throw when a db connnectivity issue is encountered', async () => {
            const questionnaireDAL = createQuestionnaireDAL({logger: jest.fn()});
            await expect(
                questionnaireDAL.getQuestionnaire(DB_QUERY_ERROR_QUESTIONNAIRE_ID)
            ).rejects.toThrow('DB_QUERY_ERROR');
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

    describe('updateQuestionnaireExpiresDate', () => {
        const query =
            "UPDATE questionnaire SET expires = current_timestamp + INTERVAL '30 minutes' WHERE id = $1";

        it('Should execute an update query to set the expires column', async () => {
            const questionnaireDAL = createQuestionnaireDAL({logger: jest.fn()});

            await questionnaireDAL.updateQuestionnaireExpiresDate(DB_QUERY_UPDATE_SUCCCESS_ID);

            expect(mockedDbService.query).toHaveBeenCalledTimes(1);
            expect(mockedDbService.query).toHaveBeenCalledWith(query, [
                DB_QUERY_UPDATE_SUCCCESS_ID
            ]);
        });

        it('Should throw if row count is 0', async () => {
            const questionnaireDAL = createQuestionnaireDAL({logger: jest.fn()});
            await expect(
                questionnaireDAL.updateQuestionnaireExpiresDate(
                    DB_QUERY_ROW_COUNT_ZERO_QUESTIONNAIRE_ID
                )
            ).rejects.toThrow(
                `Questionnaire "${DB_QUERY_ROW_COUNT_ZERO_QUESTIONNAIRE_ID}" expires date was not updated successfully`
            );
        });

        it('Should handle errors gracefully', async () => {
            const questionnaireDAL = createQuestionnaireDAL({logger: jest.fn()});
            await expect(
                questionnaireDAL.updateQuestionnaireExpiresDate(DB_QUERY_ERROR_QUESTIONNAIRE_ID)
            ).rejects.toThrow('DB_QUERY_ERROR');
        });
    });
});
