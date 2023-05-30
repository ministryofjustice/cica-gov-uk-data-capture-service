/* eslint-disable no-shadow */

'use strict';

const questionnaireFixture = require('./test-fixtures/res/questionnaireCompleteWithCRN');

beforeEach(() => {
    jest.clearAllMocks();
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

// Mock the default DAL
jest.doMock('./questionnaire-dal', () => {
    const dalServiceMock = {
        createQuestionnaire: jest.fn(() => {
            return 'ok!';
        }),
        getQuestionnaire: jest.fn(() => {
            return questionnaireFixture;
        }),
        updateQuestionnaire: jest.fn(() => {
            return 'ok!';
        }),
        getQuestionnaireByOwner: jest.fn(() => {
            return questionnaireFixture;
        }),
        updateQuestionnaireByOwner: jest.fn(() => {
            return 'ok!';
        })
    };

    return () => dalServiceMock;
});

const mockDalService = require('./questionnaire-dal')();

const createQuestionnaireService = require('./questionnaire-service');

describe('Questionnaire Service', () => {
    describe('DCS API Version 1', () => {
        const questionnaireService = createQuestionnaireService({
            logger: () => 'Logged from createQuestionnaire test',
            apiVersion: undefined, // Undefined should only occur for DCS API v1
            ownerId: undefined // Undefined should only occur for DCS API v1
        });
        describe('createQuestionnaire', () => {
            it('Should create a questionnaire', async () => {
                const templatename = 'sexual-assault';

                const actual = await questionnaireService.createQuestionnaire(templatename);

                expect(actual.data).toMatchObject({
                    id: expect.any(String),
                    type: 'questionnaires',
                    attributes: expect.any(Object)
                });
            });

            it('Should error if templateName not found', async () => {
                const templatename = 'not-a-template';

                await expect(
                    questionnaireService.createQuestionnaire(templatename)
                ).rejects.toThrow('Template "not-a-template" does not exist');
            });
        });

        describe('getProgressEntries', () => {
            it('Should return a progressEntry collection', async () => {
                const questionnaireId = '12345678-7dec-11d0-a765-00a0c91e6bf6';
                const query = undefined;

                const actual = await questionnaireService.getProgressEntries(
                    questionnaireId,
                    query
                );

                expect(Array.isArray(actual.data)).toBe(true);
                expect(actual.data[0]).toMatchObject({
                    id: expect.any(String),
                    type: 'progress-entries',
                    attributes: expect.any(Object),
                    relationships: expect.any(Object)
                });
            });

            it('Should NOT use DB functions which filter by owner', async () => {
                const questionnaireId = '12345678-7dec-11d0-a765-00a0c91e6bf6';
                const query = {
                    filter: {
                        sectionId: 'p-applicant-when-did-the-crime-happen'
                    }
                };

                await questionnaireService.getProgressEntries(questionnaireId, query);

                expect(mockDalService.getQuestionnaire).toHaveBeenCalledTimes(1);
                expect(mockDalService.updateQuestionnaire).toHaveBeenCalledTimes(1);
                expect(mockDalService.getQuestionnaireByOwner).not.toHaveBeenCalled();
                expect(mockDalService.updateQuestionnaireByOwner).not.toHaveBeenCalled();
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
                    expect(actual.data[0]).toMatchObject({
                        id: expect.any(String),
                        type: 'progress-entries',
                        attributes: {
                            url: expect.any(Object),
                            sectionId: 'p-applicant-when-did-the-crime-happen'
                        },
                        relationships: expect.any(Object)
                    });
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
                    expect(actual.data[0]).toMatchObject({
                        id: expect.any(String),
                        type: 'progress-entries',
                        attributes: {
                            url: expect.any(Object),
                            sectionId: 'p-applicant-declaration'
                        },
                        relationships: expect.any(Object)
                    });
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
                    expect(actual.data[0]).toMatchObject({
                        id: expect.any(String),
                        type: 'progress-entries',
                        attributes: {
                            url: expect.any(Object),
                            sectionId: 'p-applicant-when-did-the-crime-happen'
                        },
                        relationships: expect.any(Object)
                    });
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
                    expect(actual.data[0]).toMatchObject({
                        id: expect.any(String),
                        type: 'progress-entries',
                        attributes: {
                            url: expect.any(Object),
                            sectionId: 'p-applicant-enter-your-email-address'
                        },
                        relationships: expect.any(Object)
                    });
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
                    expect(actual.data[0]).toMatchObject({
                        id: 'referrer',
                        type: 'progress-entries',
                        attributes: {
                            url:
                                'https://uat.claim-criminal-injuries-compensation.service.justice.gov.uk/start-page',
                            sectionId: expect.any(Object)
                        }
                    });
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

    describe('DCS API Version 2023-05-17', () => {
        const questionnaireService = createQuestionnaireService({
            logger: () => 'Logged from createQuestionnaire test',
            apiVersion: '2023-05-17',
            ownerId: 'urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6'
        });
        describe('createQuestionnaire', () => {
            it('Should create a questionnaire', async () => {
                const templatename = 'sexual-assault';
                const ownerData = {
                    id: 'urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6',
                    isAuthenticated: true
                };

                const actual = await questionnaireService.createQuestionnaire(
                    templatename,
                    ownerData
                );

                expect(actual.data).toMatchObject({
                    id: expect.any(String),
                    type: 'questionnaires',
                    attributes: expect.any(Object)
                });
            });

            it('Should error if templateName not found', async () => {
                const templatename = 'not-a-template';
                const ownerData = {
                    id: 'urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6',
                    isAuthenticated: true
                };

                await expect(
                    questionnaireService.createQuestionnaire(templatename, ownerData)
                ).rejects.toThrow('Template "not-a-template" does not exist');
            });

            it('Should set owner data in the answers', async () => {
                const templatename = 'sexual-assault';
                const ownerData = {
                    id: 'urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6',
                    isAuthenticated: true
                };

                await questionnaireService.createQuestionnaire(templatename, ownerData);

                expect(mockDalService.createQuestionnaire).toHaveBeenCalledTimes(1);
                expect(mockDalService.createQuestionnaire).toHaveBeenCalledWith(
                    expect.any(String),
                    expect.objectContaining({
                        answers: {
                            owner: {
                                ownerId: 'urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6',
                                isAuthenticated: true
                            }
                        }
                    })
                );
            });

            it('Should error if owner data is undefined', async () => {
                const questionnaireService = createQuestionnaireService({
                    logger: () => 'Logged from createQuestionnaire test',
                    apiVersion: '2023-05-17'
                });
                const templatename = 'sexual-assault';
                const ownerData = undefined;

                await expect(
                    questionnaireService.createQuestionnaire(templatename, ownerData)
                ).rejects.toThrow('Owner data must be defined');
            });
        });

        describe('getProgressEntries', () => {
            it('Should return a progressEntry collection', async () => {
                const questionnaireId = '12345678-7dec-11d0-a765-00a0c91e6bf6';
                const query = undefined;

                const actual = await questionnaireService.getProgressEntries(
                    questionnaireId,
                    query
                );

                expect(Array.isArray(actual.data)).toBe(true);
                expect(actual.data[0]).toMatchObject({
                    id: expect.any(String),
                    type: 'progress-entries',
                    attributes: expect.any(Object),
                    relationships: expect.any(Object)
                });
            });

            it('Should ONLY use DB functions which filter by owner', async () => {
                const questionnaireId = '12345678-7dec-11d0-a765-00a0c91e6bf6';
                const query = {
                    filter: {
                        sectionId: 'p-applicant-when-did-the-crime-happen'
                    }
                };

                await questionnaireService.getProgressEntries(questionnaireId, query);

                expect(mockDalService.getQuestionnaireByOwner).toHaveBeenCalledTimes(1);
                expect(mockDalService.updateQuestionnaireByOwner).toHaveBeenCalledTimes(1);
                expect(mockDalService.getQuestionnaire).not.toHaveBeenCalled();
                expect(mockDalService.updateQuestionnaire).not.toHaveBeenCalled();
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
                    expect(actual.data[0]).toMatchObject({
                        id: expect.any(String),
                        type: 'progress-entries',
                        attributes: {
                            url: expect.any(Object),
                            sectionId: 'p-applicant-when-did-the-crime-happen'
                        },
                        relationships: expect.any(Object)
                    });
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
                    expect(actual.data[0]).toMatchObject({
                        id: expect.any(String),
                        type: 'progress-entries',
                        attributes: {
                            url: expect.any(Object),
                            sectionId: 'p-applicant-declaration'
                        },
                        relationships: expect.any(Object)
                    });
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
                    expect(actual.data[0]).toMatchObject({
                        id: expect.any(String),
                        type: 'progress-entries',
                        attributes: {
                            url: expect.any(Object),
                            sectionId: 'p-applicant-when-did-the-crime-happen'
                        },
                        relationships: expect.any(Object)
                    });
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
                    expect(actual.data[0]).toMatchObject({
                        id: expect.any(String),
                        type: 'progress-entries',
                        attributes: {
                            url: expect.any(Object),
                            sectionId: 'p-applicant-enter-your-email-address'
                        },
                        relationships: expect.any(Object)
                    });
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
                    expect(actual.data[0]).toMatchObject({
                        id: 'referrer',
                        type: 'progress-entries',
                        attributes: {
                            url:
                                'https://uat.claim-criminal-injuries-compensation.service.justice.gov.uk/start-page',
                            sectionId: expect.any(Object)
                        }
                    });
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
});
