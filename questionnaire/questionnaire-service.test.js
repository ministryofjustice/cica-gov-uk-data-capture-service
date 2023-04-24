/* eslint-disable global-require */

'use strict';

const questionnaireFixture = require('./test-fixtures/res/questionnaireCompleteWithCRN');

beforeAll(() => {
    jest.resetModules();
});
jest.doMock('q-router', () => {
    const routerServiceMock = {
        current: jest.fn(sectionId => {
            if (sectionId === 'p-not-a-section') {
                return undefined;
            }
            return {
                id: 'p-applicant-when-did-the-crime-happen',
                context: {
                    routes: {
                        initial: 'p-applicant-when-did-the-crime-happen'
                    }
                }
            };
        }),
        first: jest.fn(() => {
            return {
                id: 'p-applicant-declaration',
                context: {
                    routes: {
                        initial: 'p-applicant-declaration'
                    }
                }
            };
        }),
        previous: jest.fn(sectionId => {
            if (sectionId === 'p-first-section') {
                throw new Error('Section Found. No previous section.');
            }
            return {
                id: 'p-applicant-enter-your-email-address',
                context: {
                    routes: {
                        initial: 'p-applicant-enter-your-email-address'
                    }
                }
            };
        })
    };

    return () => routerServiceMock;
});

jest.doMock('./questionnaire/questionnaire', () => {
    const questionnaireHelperMock = {
        getSection: jest.fn(() => {
            return {
                getSchema: jest.fn()
            };
        })
    };

    return () => questionnaireHelperMock;
});

const createQuestionnaireService = require('./questionnaire-service');

const questionnaireService = createQuestionnaireService({
    logger: () => 'Logged from createQuestionnaire test',
    createQuestionnaireDAL: () => ({
        createQuestionnaire: () => {
            return 'ok!';
        },
        getQuestionnaire: () => {
            return questionnaireFixture;
        },
        updateQuestionnaire: () => {
            return 'ok!';
        }
    })
});

describe('Questionnaire Service', () => {
    describe('createQuestionnaire', () => {
        it('Should create a questionnaire', async () => {
            const templatename = 'sexual-assault';
            const owner = {
                id: 'urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6',
                isAuthenticated: true
            };

            const actual = await questionnaireService.createQuestionnaire(templatename, owner);

            expect(actual.data).toHaveProperty('id');
            expect(actual.data).toHaveProperty('type');
            expect(actual.data).toHaveProperty('attributes');
        });

        it('Should error if templateName not found', async () => {
            const templatename = 'not-a-template';
            const owner = {
                id: 'urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6',
                isAuthenticated: true
            };

            await expect(
                questionnaireService.createQuestionnaire(templatename, owner)
            ).rejects.toThrow('Template "not-a-template" does not exist');
        });
    });

    describe('getProgressEntries', () => {
        it('Should return a progressEntry collection', async () => {
            const questionnaireId = '12345678-7dec-11d0-a765-00a0c91e6bf6';
            const query = undefined;
            const ownerId = 'urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6';

            const actual = await questionnaireService.getProgressEntries(
                questionnaireId,
                query,
                ownerId
            );

            expect(Array.isArray(actual.data)).toBe(true);
            expect(actual.data[0]).toHaveProperty('type');
            expect(actual.data[0]).toHaveProperty('attributes');
            expect(actual.data[0]).toHaveProperty('relationships');
        });

        it('Should error gracefully if no ownerId is provided', async () => {
            const questionnaireId = '12345678-7dec-11d0-a765-00a0c91e6bf6';
            const query = undefined;
            const ownerId = undefined;

            await expect(
                questionnaireService.getProgressEntries(questionnaireId, query, ownerId)
            ).rejects.toThrow('OwnerId "undefined" not found');
        });

        describe('filter functions', () => {
            it('Should filter to the current section', async () => {
                const questionnaireId = '12345678-7dec-11d0-a765-00a0c91e6bf6';
                const query = {
                    filter: {
                        position: 'current'
                    }
                };
                const ownerId = 'urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6';

                const actual = await questionnaireService.getProgressEntries(
                    questionnaireId,
                    query,
                    ownerId
                );

                expect(Array.isArray(actual.data)).toBe(true);
                expect(actual.data[0]).toHaveProperty('type');
                expect(actual.data[0]).toHaveProperty('attributes');
                expect(actual.data[0]).toHaveProperty('relationships');
                expect(actual.data[0].attributes.sectionId).toEqual(
                    'p-applicant-when-did-the-crime-happen'
                );
            });

            it('Should filter to the first section', async () => {
                const questionnaireId = '12345678-7dec-11d0-a765-00a0c91e6bf6';
                const query = {
                    filter: {
                        position: 'first'
                    }
                };
                const ownerId = 'urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6';

                const actual = await questionnaireService.getProgressEntries(
                    questionnaireId,
                    query,
                    ownerId
                );

                expect(Array.isArray(actual.data)).toBe(true);
                expect(actual.data[0]).toHaveProperty('type');
                expect(actual.data[0]).toHaveProperty('attributes');
                expect(actual.data[0]).toHaveProperty('relationships');
                expect(actual.data[0].attributes.sectionId).toEqual('p-applicant-declaration');
            });

            it('Should filter to a specific section', async () => {
                const questionnaireId = '12345678-7dec-11d0-a765-00a0c91e6bf6';
                const query = {
                    filter: {
                        sectionId: 'p-applicant-when-did-the-crime-happen'
                    }
                };
                const ownerId = 'urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6';

                const actual = await questionnaireService.getProgressEntries(
                    questionnaireId,
                    query,
                    ownerId
                );

                expect(Array.isArray(actual.data)).toBe(true);
                expect(actual.data[0]).toHaveProperty('type');
                expect(actual.data[0]).toHaveProperty('attributes');
                expect(actual.data[0]).toHaveProperty('relationships');
                expect(actual.data[0].attributes.sectionId).toEqual(
                    'p-applicant-when-did-the-crime-happen'
                );
            });

            it('Should filter to the previous section', async () => {
                const questionnaireId = '12345678-7dec-11d0-a765-00a0c91e6bf6';
                const query = {
                    page: {
                        before: 'p-applicant-enter-your-telephone-number'
                    }
                };
                const ownerId = 'urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6';

                const actual = await questionnaireService.getProgressEntries(
                    questionnaireId,
                    query,
                    ownerId
                );

                expect(Array.isArray(actual.data)).toBe(true);
                expect(actual.data[0]).toHaveProperty('type');
                expect(actual.data[0]).toHaveProperty('attributes');
                expect(actual.data[0]).toHaveProperty('relationships');
                expect(actual.data[0].attributes.sectionId).toEqual(
                    'p-applicant-enter-your-email-address'
                );
            });

            it('Should filter to the referrer where no previous section exists', async () => {
                const questionnaireId = '12345678-7dec-11d0-a765-00a0c91e6bf6';
                const query = {
                    page: {
                        before: 'p-first-section'
                    }
                };
                const ownerId = 'urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6';

                const actual = await questionnaireService.getProgressEntries(
                    questionnaireId,
                    query,
                    ownerId
                );

                expect(Array.isArray(actual.data)).toBe(true);
                expect(actual.data[0]).toHaveProperty('type');
                expect(actual.data[0].type).toEqual('progress-entries');
                expect(actual.data[0]).toHaveProperty('attributes');
                expect(actual.data[0].attributes).toEqual({
                    sectionId: null,
                    url:
                        'https://uat.claim-criminal-injuries-compensation.service.justice.gov.uk/start-page'
                });
                expect(actual.data[0]).toHaveProperty('id');
                expect(actual.data[0].id).toEqual('referrer');
            });

            it('Should error gracefully if section does not exist', async () => {
                const questionnaireId = '12345678-7dec-11d0-a765-00a0c91e6bf6';
                const query = {
                    filter: {
                        sectionId: 'p-not-a-section'
                    }
                };
                const ownerId = 'urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6';

                await expect(
                    questionnaireService.getProgressEntries(questionnaireId, query, ownerId)
                ).rejects.toThrow('ProgressEntry "p-not-a-section" does not exist');
            });
        });
    });
});
