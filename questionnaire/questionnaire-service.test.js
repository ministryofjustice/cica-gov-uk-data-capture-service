'use strict';

const VError = require('verror');

const createQuestionnaireService = require('./questionnaire-service');

function getQuestionnaireDefinition() {
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
                                        'type_someone-else': "The child's title must be a string"
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
                                                maxLength: 'Last name must be 70 characters or less'
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

describe('Questionnaire Service', () => {
    describe('Answering a section', () => {
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
    });
    describe('getMetadata', () => {
        it('should return metadata to match the api contract', async () => {
            const questionnaireService = createQuestionnaireService({
                logger: () => 'Logged from dataset test',
                createQuestionnaireDAL: () => ({
                    getQuestionnaireMetadata: () => {
                        return {
                            rows: [
                                {
                                    id: '6fbc0958-e70c-4e37-ab65-12b96e8d37c1',
                                    'questionnaire-version': '4.2.0',
                                    created: '2023-01-25T10:42:24.016Z',
                                    modified: '2023-01-25T10:42:49.604Z',
                                    submission_status: 'NOT_STARTED',
                                    'user-id': 'abc123'
                                }
                            ]
                        };
                    }
                })
            });

            const actual = await questionnaireService.getMetadata();

            const expected = {
                data: [
                    {
                        type: 'metadata',
                        id: '6fbc0958-e70c-4e37-ab65-12b96e8d37c1',
                        attributes: {
                            'questionnaire-id': '6fbc0958-e70c-4e37-ab65-12b96e8d37c1',
                            'questionnaire-document-version': '4.2.0',
                            created: '2023-01-25T10:42:24.016Z',
                            modified: '2023-01-25T10:42:49.604Z',
                            state: 'NOT_STARTED',
                            'user-id': 'abc123',
                            expires: '2023-02-25T00:00:00.000Z'
                        }
                    }
                ]
            };

            expect(actual).toEqual(expected);
        });
    });
});
