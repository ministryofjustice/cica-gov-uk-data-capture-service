'use strict';

const request = require('supertest');
const VError = require('verror');
const getQuestionnaireResponse = require('./test-fixtures/res/questionnaireCompleteWithCRN.json');
const getQuestionnaireResponseWithInvalidAnswers = require('./test-fixtures/res/questionnaireCompleteWithInvalidAnswers.json');
// const questionnaireCompleteWithoutCRN = require('./test-fixtures/res/questionnaireCompleteWithoutCRN.json');

const tokens = {
    'read:progress-entries':
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJkYXRhLWNhcHR1cmUtc2VydmljZSIsImlzcyI6IiQuYXVkIiwianRpIjoiYjc0MzQ4NjAtYTQzMy00NmZkLTg1MjYtNzdjOTY4ZmFmNTY0Iiwic3ViIjoiJC5hdWQiLCJzY29wZSI6InJlYWQ6cHJvZ3Jlc3MtZW50cmllcyIsImlhdCI6MTU3MDAyNjEyNX0.m7YNquCSFPQlxL2H1T-vzrM4pY9wJ_LLDNwipZUkags'
};
let app;

describe('Questionnaire Service', () => {
    describe('Progress Entries', () => {
        beforeAll(() => {
            // mock the DAL db integration
            jest.doMock('../questionnaire/questionnaire-dal.js', () =>
                // return a modified factory function, that returns an object with a method, that returns a valid created response
                jest.fn(() => ({
                    getQuestionnaire: () => getQuestionnaireResponse,
                    updateQuestionnaire: () => undefined
                }))
            );

            // eslint-disable-next-line global-require
            app = require('../app');
        });
        it('should return a collection of progress entries', async () => {
            const response = await request(app)
                .get('/api/v1/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/progress-entries')
                .set('Authorization', `Bearer ${tokens['read:progress-entries']}`);
            expect(response.body.data.length).toBeGreaterThan(1);
        });
        it('should return a collection of light progress entries', async () => {
            const response = await request(app)
                .get('/api/v1/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/progress-entries')
                .set('Authorization', `Bearer ${tokens['read:progress-entries']}`);
            const progressEntries = response.body.data[0];
            expect(progressEntries).toHaveProperty('type', 'progress-entries');
            expect(progressEntries).toHaveProperty('id');
            expect(progressEntries).toHaveProperty('attributes');
            expect(progressEntries).toHaveProperty('relationships');
        });
        it('should return a progress entry filtered by sectionId', async () => {
            const response = await request(app)
                .get(
                    '/api/v1/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/progress-entries?filter[sectionId]=p-applicant-enter-your-name'
                )
                .set('Authorization', `Bearer ${tokens['read:progress-entries']}`);
            expect(response.body.data[0].id).toEqual('p-applicant-enter-your-name');
        });
        it('should return the progress entry before a certain section', async () => {
            const response = await request(app)
                .get(
                    '/api/v1/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/progress-entries?page[before]=p-applicant-enter-your-name'
                )
                .set('Authorization', `Bearer ${tokens['read:progress-entries']}`);
            expect(response.body.data[0].id).toEqual(
                'p-applicant-have-you-applied-for-or-received-any-other-compensation'
            );
        });
        it('should return the first progress entry', async () => {
            const response = await request(app)
                .get(
                    '/api/v1/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/progress-entries?filter[position]=first'
                )
                .set('Authorization', `Bearer ${tokens['read:progress-entries']}`);
            expect(response.body.data[0].id).toEqual('p-applicant-declaration');
        });
        it('should return the referrer progress entry when querying for the entry before the first progress entry', async () => {
            const response = await request(app)
                .get(
                    '/api/v1/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/progress-entries?page[before]=p-applicant-declaration'
                )
                .set('Authorization', `Bearer ${tokens['read:progress-entries']}`);
            expect(response.body.data[0].attributes.url).toEqual(
                'https://uat.claim-criminal-injuries-compensation.service.justice.gov.uk/start-page'
            );
        });
    });
    describe('Validate All Answers', () => {
        beforeAll(() => {
            jest.resetModules().clearAllMocks();
            // mock the DAL db integration
            jest.doMock('../questionnaire/questionnaire-dal.js', () =>
                // return a modified factory function, that returns an object with a method, that returns a valid created response
                jest.fn(() => ({
                    getQuestionnaire: () => getQuestionnaireResponseWithInvalidAnswers,
                    getQuestionnaireSubmissionStatus: () => 'NOT_STARTED'
                }))
            );
            // eslint-disable-next-line global-require
            app = require('../app');
        });
        it('should throw an error if an answer is not valid', async () => {
            // eslint-disable-next-line global-require
            const questionnaireService = require('./questionnaire-service')({
                logger: {error: () => {}}
            });

            // https://github.com/facebook/jest/issues/1377
            // https://github.com/facebook/jest/pull/3068
            // compatible with Jest v. >= 20.0.0
            await expect(
                questionnaireService.validateAllAnswers('someQuestionnaireId')
            ).rejects.toEqual(
                new VError({
                    name: 'JSONSchemaValidationErrors'
                })
            );
        });
    });
    describe('Create Answers', () => {
        it('should throw an error if an answer is not valid', async () => {
            beforeAll(() => {
                jest.resetModules().clearAllMocks();
                // mock the DAL db integration
                jest.doMock('../questionnaire/questionnaire-dal.js', () =>
                    // return a modified factory function, that returns an object with a method, that returns a valid created response
                    jest.fn(() => ({
                        getQuestionnaire: () => getQuestionnaireResponseWithInvalidAnswers,
                        getQuestionnaireSubmissionStatus: () => 'NOT_STARTED'
                    }))
                );
                // eslint-disable-next-line global-require
                app = require('../app');
            });

            // eslint-disable-next-line global-require
            const questionnaireService = require('./questionnaire-service')({
                logger: {error: () => {}}
            });

            // https://github.com/facebook/jest/issues/1377
            // https://github.com/facebook/jest/pull/3068
            // compatible with Jest v. >= 20.0.0
            await expect(
                questionnaireService.createAnswers(
                    'someQuestionnaireId',
                    'p-applicant-enter-your-date-of-birth',
                    {
                        'q-applicant-enter-your-date-of-birth': 'invalid date'
                    }
                )
            ).rejects.toEqual(
                new VError({
                    name: 'JSONSchemaValidationError'
                })
            );
        });
        it('should throw an error if an section does not exist', async () => {
            beforeAll(() => {
                jest.resetModules().clearAllMocks();
                // mock the DAL db integration
                jest.doMock('../questionnaire/questionnaire-dal.js', () =>
                    // return a modified factory function, that returns an object with a method, that returns a valid created response
                    jest.fn(() => ({
                        getQuestionnaire: () => getQuestionnaireResponseWithInvalidAnswers,
                        getQuestionnaireSubmissionStatus: () => 'NOT_STARTED'
                    }))
                );
                // eslint-disable-next-line global-require
                app = require('../app');
            });

            // eslint-disable-next-line global-require
            const questionnaireService = require('./questionnaire-service')({
                logger: {error: () => {}}
            });

            // https://github.com/facebook/jest/issues/1377
            // https://github.com/facebook/jest/pull/3068
            // compatible with Jest v. >= 20.0.0
            await expect(
                questionnaireService.createAnswers(
                    'someQuestionnaireId',
                    'p-applicant-this-section-does-not-exist',
                    {
                        'q-applicant-enter-your-date-of-birth': 'invalid date'
                    }
                )
            ).rejects.toEqual(
                new VError('Section "p-applicant-this-section-does-not-exist" not found')
            );
        });
    });
    describe('Submissions', () => {
        describe('COMPLETED', () => {
            beforeAll(() => {
                jest.resetModules().clearAllMocks();
                // mock the DAL db integration
                jest.doMock('../questionnaire/questionnaire-dal.js', () =>
                    // return a modified factory function, that returns an object with a method, that returns a valid created response
                    jest.fn(() => ({
                        getQuestionnaire: () => getQuestionnaireResponse,
                        getQuestionnaireSubmissionStatus: jest
                            .fn()
                            .mockReturnValueOnce('IN_PROGRESS')
                            .mockReturnValueOnce('COMPLETED'),
                        retrieveCaseReferenceNumber: () => '12\\123456',
                        updateQuestionnaireSubmissionStatus: () => undefined,
                        sendConfirmationNotification: () => undefined
                    }))
                );
                // eslint-disable-next-line global-require
                app = require('../app');
            });
            it('should update submission status to COMPLETED if CRN exists', async () => {
                // eslint-disable-next-line global-require
                const questionnaireService = require('./questionnaire-service')({
                    logger: {error: () => {}}
                });

                await expect(
                    questionnaireService.getSubmissionResponseData('someQuestionnaireId')
                ).resolves.toEqual({
                    data: {
                        id: 'someQuestionnaireId',
                        type: 'submissions',
                        attributes: {
                            questionnaireId: 'someQuestionnaireId',
                            submitted: true,
                            status: 'COMPLETED',
                            caseReferenceNumber: '19\\751194'
                        }
                    }
                });
            });
        });
        // describe('FAILED', () => {
        //     beforeAll(() => {
        //         jest.resetModules().clearAllMocks();
        //         jest.doMock('../services/message-bus/index.js', () => {
        //             jest.fn(() => ({
        //                 post: () =>
        //                     Promise.resolve({
        //                         body: 'NOT Message sent'
        //                     })
        //             }));
        //         });
        //         jest.doMock('./questionnaire-dal.js', () =>
        //             jest.fn(() => ({
        //                 getQuestionnaire: () => questionnaireCompleteWithoutCRN,
        //                 getQuestionnaireSubmissionStatus: () => 'FAILED'
        //                 // getQuestionnaireSubmissionStatus: jest
        //                 //     .fn()
        //                 //     .mockReturnValueOnce('IN_PROGRESS')
        //                 //     .mockReturnValueOnce('FAILED'),
        //                 // updateQuestionnaireSubmissionStatus: () => undefined
        //             }))
        //         );
        //         // eslint-disable-next-line global-require
        //         app = require('../app');
        //     });
        //     it('should set submission status to FAILED if submissionQueue is not contactable', async () => {
        //         // // eslint-disable-next-line global-require
        //         // const messageBus = require('../services/message-bus/index.js')();
        //         // console.log({messageBus});

        //         // eslint-disable-next-line global-require
        //         const questionnaireService = require('./questionnaire-service')({
        //             logger: {error: () => {}}
        //         });

        //         await expect(
        //             questionnaireService.getSubmissionResponseData('someQuestionnaireId', true)
        //         ).resolves.toEqual({
        //             data: {
        //                 id: 'someQuestionnaireId',
        //                 type: 'submissions',
        //                 attributes: {
        //                     questionnaireId: 'someQuestionnaireId',
        //                     submitted: false,
        //                     status: 'FAILED',
        //                     caseReferenceNumber: null
        //                 }
        //             }
        //         });
        //     });
        // });
    });
});
