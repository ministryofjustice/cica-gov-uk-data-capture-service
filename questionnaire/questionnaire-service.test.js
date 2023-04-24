/* eslint-disable global-require */

'use strict';

const VError = require('verror');

const questionnaireFixture = require('./test-fixtures/res/questionnaireCompleteWithCRN');

describe('Questionnaire Service', () => {
    beforeAll(() => {
        jest.resetModules();
        jest.clearAllMocks();
    });
    /*function getQuestionnaireDefinition() {
        return {
            sections: {
                'p-applicant-enter-your-name': {
                    l10n: {
                        vars: {
                            lng: 'en',
                            context: {
                                $data:
                                    '/answers/p-applicant-who-are-you-applying-for/q-applicant-who-are-you-applying-for'
                            },
                            ns: 'p-applicant-enter-your-name'
                        },
                        translations: [
                            {
                                language: 'en',
                                namespace: 'p-applicant-enter-your-name',
                                resources: {
                                    title: 'Enter your name',
                                    'title_someone-else': "Enter the child's name",
                                    'summary-title': 'Your name',
                                    'summary-title_someone-else': "Child's name",
                                    'q-applicant-title': {
                                        error: {
                                            required: 'Enter your title',
                                            'required_someone-else': "Enter the child's title",
                                            type: 'Your title must be a string',
                                            'type_someone-else':
                                                "The child's title must be a string"
                                        }
                                    },
                                    'q-applicant-first-name': {
                                        error: {
                                            required: 'Enter your first name',
                                            'required_someone-else': "Enter the child's first name"
                                        }
                                    },
                                    'q-applicant-last-name': {
                                        error: {
                                            required: 'Enter your last name',
                                            'required_someone-else': "Enter the child's last name"
                                        }
                                    }
                                }
                            }
                        ]
                    },
                    schema: {
                        $schema: 'http://json-schema.org/draft-07/schema#',
                        type: 'object',
                        allOf: [
                            {
                                title: 'l10nt:title{?lng,context,ns}',
                                meta: {
                                    compositeId: 'applicant-name',
                                    classifications: {
                                        theme: 'applicant-details'
                                    },
                                    summary: {
                                        title: 'l10nt:summary-title{?lng,context,ns}'
                                    }
                                },
                                required: [
                                    'q-applicant-title',
                                    'q-applicant-first-name',
                                    'q-applicant-last-name'
                                ],
                                propertyNames: {
                                    enum: [
                                        'q-applicant-title',
                                        'q-applicant-first-name',
                                        'q-applicant-last-name'
                                    ]
                                },
                                allOf: [
                                    {
                                        properties: {
                                            'q-applicant-title': {
                                                title: 'Title',
                                                type: 'string',
                                                maxLength: 6,
                                                errorMessage: {
                                                    maxLength: 'Title must be 6 characters or less',
                                                    type:
                                                        'l10nt:q-applicant-title.error.type{?lng,context,ns}'
                                                },
                                                meta: {
                                                    classifications: {
                                                        theme: 'applicant-details'
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        properties: {
                                            'q-applicant-first-name': {
                                                title: 'First name',
                                                type: 'string',
                                                maxLength: 70,
                                                errorMessage: {
                                                    maxLength:
                                                        'First name must be 70 characters or less'
                                                },
                                                meta: {
                                                    classifications: {
                                                        theme: 'applicant-details'
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        properties: {
                                            'q-applicant-last-name': {
                                                title: 'Last name',
                                                type: 'string',
                                                maxLength: 70,
                                                errorMessage: {
                                                    maxLength:
                                                        'Last name must be 70 characters or less'
                                                },
                                                meta: {
                                                    classifications: {
                                                        theme: 'applicant-details'
                                                    }
                                                }
                                            }
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                },
                'p-applicant-who-are-you-applying-for': {
                    schema: {
                        $schema: 'http://json-schema.org/draft-07/schema#',
                        type: 'object',
                        required: ['q-applicant-who-are-you-applying-for'],
                        additionalProperties: false,
                        properties: {
                            'q-applicant-who-are-you-applying-for': {
                                title: 'Who are you applying for?',
                                type: 'string',
                                oneOf: [
                                    {
                                        title: 'Myself',
                                        const: 'myself'
                                    },
                                    {
                                        title: 'Someone else',
                                        const: 'someone-else'
                                    }
                                ],
                                meta: {
                                    classifications: {
                                        theme: 'applicant-details'
                                    }
                                }
                            }
                        }
                    }
                }
            },
            progress: ['p-applicant-who-are-you-applying-for', 'p-applicant-enter-your-name'],
            answers: {
                'p-applicant-who-are-you-applying-for': {
                    'q-applicant-who-are-you-applying-for': 'someone-else'
                }
            },
            routes: {
                states: {
                    'p-applicant-enter-your-name': {
                        on: {
                            ANSWER: [
                                {
                                    target: 'p--transition'
                                }
                            ]
                        }
                    },
                    'p--transition': {
                        type: 'final'
                    }
                }
            }
        };
    }
    describe('Answering a section', () => {
        beforeAll(() => {
            jest.resetModules();
        });
        const createQuestionnaireService = require('./questionnaire-service');
        const questionnaireService2 = createQuestionnaireService({
            logger: () => 'Logged from dataset test',
            createQuestionnaireDAL: () => ({
                getQuestionnaire: questionnaireId => {
                    if (questionnaireId === '01fa0d1e-000a-404c-8efe-7223c24a4fa7') {
                        return getQuestionnaireDefinition();
                    }

                    throw new VError(
                        {
                            name: 'ResourceNotFound'
                        },
                        `Questionnaire "${questionnaireId}" not found`
                    );
                }
            })
        });
        describe('Given a section definition requiring contextualisation', () => {
            describe('And there are no errors with the supplied answers', () => {
                it('should save the answers', async () => {
                    let savedQuestionnaireDefinition;
                    const questionnaireService = createQuestionnaireService({
                        logger: () => 'Logged from dataset test',
                        createQuestionnaireDAL: () => ({
                            getQuestionnaire: questionnaireId => {
                                if (questionnaireId === '01fa0d1e-000a-404c-8efe-7223c24a4fa7') {
                                    return getQuestionnaireDefinition();
                                }

                                throw new VError(
                                    {
                                        name: 'ResourceNotFound'
                                    },
                                    `Questionnaire "${questionnaireId}" not found`
                                );
                            },
                            updateQuestionnaire: (questionnaireId, questionnaire) => {
                                savedQuestionnaireDefinition = questionnaire;
                            }
                        })
                    });

                    await questionnaireService.createAnswers(
                        '01fa0d1e-000a-404c-8efe-7223c24a4fa7',
                        'p-applicant-enter-your-name',
                        {
                            'q-applicant-title': 'Mr',
                            'q-applicant-first-name': 'Foo',
                            'q-applicant-last-name': 'Bar'
                        }
                    );

                    expect(savedQuestionnaireDefinition.answers).toHaveProperty(
                        'p-applicant-enter-your-name'
                    );
                    expect(savedQuestionnaireDefinition.answers).toHaveProperty(
                        'p-applicant-who-are-you-applying-for'
                    );

                    expect(
                        savedQuestionnaireDefinition.answers['p-applicant-enter-your-name']
                    ).toEqual({
                        'q-applicant-first-name': 'Foo',
                        'q-applicant-last-name': 'Bar',
                        'q-applicant-title': 'Mr'
                    });

                    expect(
                        savedQuestionnaireDefinition.answers['p-applicant-who-are-you-applying-for']
                    ).toEqual({
                        'q-applicant-who-are-you-applying-for': 'someone-else'
                    });
                });

                it('should not mutate the section definition being answered', async () => {
                    const originalQuestionnaireDefinition = getQuestionnaireDefinition();
                    const sectionId = 'p-applicant-enter-your-name';
                    let savedQuestionnaireDefinition;
                    const questionnaireService = createQuestionnaireService({
                        logger: () => 'Logged from dataset test',
                        createQuestionnaireDAL: () => ({
                            getQuestionnaire: questionnaireId => {
                                if (questionnaireId === '01fa0d1e-000a-404c-8efe-7223c24a4fa7') {
                                    return getQuestionnaireDefinition();
                                }

                                throw new VError(
                                    {
                                        name: 'ResourceNotFound'
                                    },
                                    `Questionnaire "${questionnaireId}" not found`
                                );
                            },
                            updateQuestionnaire: (questionnaireId, questionnaire) => {
                                savedQuestionnaireDefinition = questionnaire;
                            }
                        })
                    });

                    await questionnaireService.createAnswers(
                        '01fa0d1e-000a-404c-8efe-7223c24a4fa7',
                        sectionId,
                        {
                            'q-applicant-title': 'Mr',
                            'q-applicant-first-name': 'Foo',
                            'q-applicant-last-name': 'Bar'
                        }
                    );

                    const originalSectionDefinition =
                        originalQuestionnaireDefinition.sections[sectionId];
                    const savedSectionDefinition = savedQuestionnaireDefinition.sections[sectionId];

                    expect(savedSectionDefinition).toEqual(originalSectionDefinition);
                });
            });

            describe('And there is an error on page', () => {
                it('should return a contextualised section with errors', async () => {
                    let errorInfo;

                    try {
                        await questionnaireService2.createAnswers(
                            '01fa0d1e-000a-404c-8efe-7223c24a4fa7',
                            'p-applicant-enter-your-name',
                            {
                                'q-applicant-title': ['this array is not a valid title'],
                                'q-applicant-first-name': 'Foo',
                                'q-applicant-last-name': 'Bar'
                            }
                        );
                    } catch (err) {
                        errorInfo = VError.info(err);
                    }

                    const contextualisedTitle = errorInfo.schema.allOf[0].title;
                    const contextualisedError = errorInfo.schemaErrors[0].message;

                    expect(contextualisedTitle).toEqual("Enter the child's name");
                    expect(contextualisedError).toEqual("The child's title must be a string");
                });
            });
        });
    });*/

    describe('getProgressEntries', () => {
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

        // ToDo sort out setup/teardown

        let createQuestionnaireService;
        jest.isolateModules(() => {
            createQuestionnaireService = require('./questionnaire-service');
        });

        const questionnaireService = createQuestionnaireService({
            logger: () => 'Logged from createQuestionnaire test',
            createQuestionnaireDAL: () => ({
                getQuestionnaire: () => {
                    return questionnaireFixture;
                },
                updateQuestionnaire: () => {
                    return 'ok!';
                }
            })
        });

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

    describe('createAnswers', () => {
        const valid_section_id = 'p-some-section';
        const invalid_section_id = 'p-not-a-section';
        const valid_questionnaire_id = '12345678-7dec-11d0-a765-00a0c91e6bf6';
        const invalid_questionnaire_id = '11111111-7dec-11d0-a765-00a0c91e6bf6';
        const answers = {
            'q-some-section': true
        };
        const ownerId = 'urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6';

        jest.doMock('q-router', () => {
            const routerServiceMock = {
                current: jest.fn(sectionId => {
                    return {
                        id: sectionId,
                        context: {
                            routes: {
                                initial: sectionId
                            }
                        }
                    };
                }),
                next: jest.fn(sectionId => {
                    return {
                        id: sectionId,
                        context: {
                            routes: {
                                initial: sectionId
                            }
                        }
                    };
                }),
            };

            return () => routerServiceMock;
        });

        const mockAjv = require('ajv');
        jest.mock('ajv');
        jest.mock('ajv-errors');
        mockAjv.mockImplementation(() => {
            return {
                compile: jest.fn((sectionId) => {
                    return jest.fn(() => {
                        return sectionId !== invalid_section_id;
                    })
                }),
                addFormat: jest.fn()
            };
        });

        const dalServiceMock = {
            getSection: () => {
                return {};
            },
            getQuestionnaire: () => {
                return 'ok';
            },
            updateQuestionnaire: (questionnaireId) => {
                if (questionnaireId === invalid_questionnaire_id){
                    throw new Error('Update failed');
                }
                return 'ok';
            }
        };

        jest.doMock('./questionnaire/questionnaire', () => {
            const questionnaireHelperMock = {
                getSection: jest.fn((sectionId) => {
                    return {
                        getSchema: jest.fn(() => {
                            return sectionId;
                        })
                    };
                }),
                getQuestionnaire: jest.fn(() => {
                    return {
                        answers: {}
                    };
                })
            };

            return () => questionnaireHelperMock;
        });

        const actualQuestionnaireService = jest.requireActual('./questionnaire-service')({
            logger: () => 'Logged from createQuestionnaire test',
            createQuestionnaireDAL: () => (dalServiceMock)
        });

        jest.doMock('./questionnaire-service', () => {
            const questionnaireServiceMock = {
                ...actualQuestionnaireService,
                getSection: jest.fn(sectionId => {
                    return {
                        id: sectionId
                    };
                }),
                getQuestionnaire: jest.fn(() => {
                    return {
                        answers: {}
                    };
                })
            };
            return () => questionnaireServiceMock;
        });

        let createQuestionnaireService;
        jest.isolateModules(() => {
            createQuestionnaireService = require('./questionnaire-service');
        });

        const questionnaireService = createQuestionnaireService({
            logger: () => 'Logged from createQuestionnaire test',
            createQuestionnaireDAL: () => (dalServiceMock)
        });

        it('Should return an answer resource', async () => {
            const actual = await questionnaireService.createAnswers(
                valid_questionnaire_id,
                valid_section_id,
                answers,
                ownerId
            );

            expect(actual.data).toHaveProperty('type');
            expect(actual.data).toHaveProperty('attributes');
            expect(actual.data).toHaveProperty('id');
        });

        it('Should throw a validation error if the schema is not valid', async () => {
             await expect(questionnaireService.createAnswers(
                valid_questionnaire_id,
                invalid_section_id,
                answers,
                ownerId
            )).rejects.toThrow();
        });

        it('Should error gracefully', async () => {
            await expect(questionnaireService.createAnswers(
                invalid_questionnaire_id,
                valid_section_id,
                answers,
                ownerId
            )).rejects.toThrow('Update failed');
        });
    });
});
