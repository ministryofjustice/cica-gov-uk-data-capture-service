'use strict';

const createQuestionnaire = require('./questionnaire');

const questionnaireDefinition = {
    taxonomies: {
        theme: {
            taxa: {
                'applicant-details': {
                    title: 'Your details'
                },
                'contact-details': {
                    title: 'Contact details'
                },
                crime: {
                    title: 'About the crime'
                },
                offender: {
                    title: 'About the offender'
                }
            }
        }
    },
    sections: {
        'p-applicant-date-of-birth': {
            schema: {
                $schema: 'http://json-schema.org/draft-07/schema#',
                type: 'object',
                required: ['q-applicant-enter-your-date-of-birth'],
                additionalProperties: false,
                properties: {
                    'q-applicant-date-of-birth': {
                        title: 'Enter your date of birth',
                        type: 'string',
                        format: 'date-time',
                        description: 'For example, 31 3 1980.',
                        meta: {
                            keywords: {
                                format: {
                                    precision: 'YYYY-MM-DD'
                                }
                            },
                            classifications: {
                                theme: 'applicant-details'
                            },
                            summary: {
                                title: 'Date of birth'
                            }
                        }
                    }
                }
            }
        },
        'p-applicant-enter-your-email-address': {
            schema: {
                $schema: 'http://json-schema.org/draft-07/schema#',
                type: 'object',
                properties: {
                    'q-applicant-enter-your-email-address': {
                        type: 'string',
                        title: 'Enter your email address',
                        description:
                            'We may use this to contact you if we need to clarify something on your application form (optional).',
                        maxLength: 50,
                        format: 'email',
                        meta: {
                            classifications: {
                                theme: 'contact-details'
                            }
                        }
                    }
                }
            }
        },
        'p-applicant-enter-your-name': {
            schema: {
                $schema: 'http://json-schema.org/draft-07/schema#',
                type: 'object',
                allOf: [
                    {
                        title: 'Enter your name',
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
                        meta: {
                            compositeId: 'q-fullname',
                            classifications: {
                                theme: 'applicant-details'
                            }
                        },
                        allOf: [
                            {
                                properties: {
                                    'q-applicant-title': {
                                        title: 'Title',
                                        type: 'string',
                                        maxLength: 6,
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
        'p-applicant-british-citizen-or-eu-national': {
            schema: {
                $schema: 'http://json-schema.org/draft-07/schema#',
                type: 'object',
                properties: {
                    'q-applicant-british-citizen-or-eu-national': {
                        title:
                            '||/answers/p-applicant-enter-your-name/q-applicant-title|| ||/answers/p-applicant-enter-your-name/q-applicant-first-name|| ||/answers/p-applicant-enter-your-name/q-applicant-last-name||, are you a British citizen or EU national?',
                        type: 'boolean',
                        oneOf: [
                            {
                                title: 'Yes',
                                const: true
                            },
                            {
                                title: 'No',
                                const: false
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
        },
        'p--check-your-answers': {
            schema: {
                $schema: 'http://json-schema.org/draft-07/schema#',
                type: 'object',
                additionalProperties: false,
                properties: {
                    'p-check-your-answers': {
                        title: 'Check your answers',
                        type: 'object',
                        properties: {
                            summaryInfo: {
                                type: 'object',
                                urlPath: 'apply',
                                editAnswerText: 'Change',
                                summaryStructure: [
                                    {
                                        existingStuff: 'foo'
                                    }
                                ],
                                lookup: {
                                    existingStuff: 'bar'
                                }
                            }
                        }
                    }
                }
            }
        },
        'p-applicant-theme-undefined': {
            schema: {
                $schema: 'http://json-schema.org/draft-07/schema#',
                type: 'object',
                properties: {
                    'q-applicant-theme-undefined': {
                        type: 'string',
                        title: 'Enter your fav colour',
                        maxLength: 50
                    }
                }
            }
        },
        'p-applicant-theme-not-found': {
            schema: {
                $schema: 'http://json-schema.org/draft-07/schema#',
                type: 'object',
                properties: {
                    'q-applicant-theme-not-found': {
                        type: 'string',
                        title: 'Enter your fav colour',
                        maxLength: 50,
                        meta: {
                            classifications: {
                                theme: 'this-theme-is-not-found'
                            }
                        }
                    }
                }
            }
        }
    },
    progress: [
        'p-applicant-date-of-birth',
        'p-applicant-enter-your-email-address',
        'p-applicant-enter-your-name',
        'p-applicant-british-citizen-or-eu-national',
        'p-applicant-theme-undefined',
        'p-applicant-theme-not-found',
        'p--check-your-answers'
    ],
    answers: {
        'p-applicant-date-of-birth': {
            'q-applicant-date-of-birth': '1970-01-01T00:00:00.000Z'
        },
        'p-applicant-enter-your-email-address': {
            'q-applicant-enter-your-email-address':
                'bar@9f7b855e-586b-49f0-ac7a-026919732b06.gov.uk'
        },
        'p-applicant-enter-your-name': {
            'q-applicant-title': 'Mr',
            'q-applicant-first-name': 'Foo',
            'q-applicant-last-name': 'Bar'
        },
        'p-applicant-british-citizen-or-eu-national': {
            'q-applicant-british-citizen-or-eu-national': true
        },
        'p-applicant-theme-undefined': {
            'q-applicant-theme-undefined': 'red'
        },
        'p-applicant-theme-not-found': {
            'q-applicant-theme-not-found': 'blue'
        }
    }
};

describe('Questionnaire', () => {
    it('should return a specified taxonomy', async () => {
        const questionnaire = createQuestionnaire({questionnaireDefinition});
        const themeTaxonomy = questionnaire.getTaxonomy('theme');

        expect(themeTaxonomy.getId()).toEqual('theme');
        expect(themeTaxonomy.getTaxon('contact-details').title).toEqual('Contact details');
    });

    describe('Given a section definition requiring data interpolation', () => {
        it('should return an interpolated section', async () => {
            const questionnaire = createQuestionnaire({questionnaireDefinition});
            const section = questionnaire.getSection('p-applicant-british-citizen-or-eu-national');
            const sectionSchema = section.getSchema();

            expect(sectionSchema).toEqual({
                $schema: 'http://json-schema.org/draft-07/schema#',
                type: 'object',
                properties: {
                    'q-applicant-british-citizen-or-eu-national': {
                        title: 'Mr Foo Bar, are you a British citizen or EU national?',
                        type: 'boolean',
                        oneOf: [
                            {
                                title: 'Yes',
                                const: true
                            },
                            {
                                title: 'No',
                                const: false
                            }
                        ],
                        meta: {
                            classifications: {
                                theme: 'applicant-details'
                            }
                        }
                    }
                }
            });
        });
    });

    describe('Given a section definition requiring an answer summary', () => {
        it('should return a section containing an answer summary', async () => {
            const questionnaire = createQuestionnaire({questionnaireDefinition});
            const section = questionnaire.getSection('p--check-your-answers');
            const sectionSchema = section.getSchema();

            expect(sectionSchema).toEqual({
                $schema: 'http://json-schema.org/draft-07/schema#',
                type: 'object',
                additionalProperties: false,
                properties: {
                    'p-check-your-answers': {
                        title: 'Check your answers',
                        type: 'object',
                        properties: {
                            summaryInfo: {
                                type: 'object',
                                urlPath: 'apply',
                                editAnswerText: 'Change',
                                summaryStructure: [
                                    {
                                        type: 'theme',
                                        id: 'applicant-details',
                                        title: 'Your details',
                                        values: [
                                            {
                                                id: 'q-applicant-date-of-birth',
                                                type: 'simple',
                                                label: 'Date of birth',
                                                value: '1970-01-01T00:00:00.000Z',
                                                sectionId: 'p-applicant-date-of-birth',
                                                theme: 'applicant-details',
                                                format: {
                                                    precision: 'YYYY-MM-DD',
                                                    value: 'date-time'
                                                }
                                            },
                                            {
                                                id: 'q-fullname',
                                                type: 'composite',
                                                label: 'Enter your name',
                                                values: [
                                                    {
                                                        id: 'q-applicant-title',
                                                        type: 'simple',
                                                        label: 'Title',
                                                        value: 'Mr',
                                                        sectionId: 'p-applicant-enter-your-name',
                                                        theme: 'applicant-details'
                                                    },
                                                    {
                                                        id: 'q-applicant-first-name',
                                                        type: 'simple',
                                                        label: 'First name',
                                                        value: 'Foo',
                                                        sectionId: 'p-applicant-enter-your-name',
                                                        theme: 'applicant-details'
                                                    },
                                                    {
                                                        id: 'q-applicant-last-name',
                                                        type: 'simple',
                                                        label: 'Last name',
                                                        value: 'Bar',
                                                        sectionId: 'p-applicant-enter-your-name',
                                                        theme: 'applicant-details'
                                                    }
                                                ],
                                                sectionId: 'p-applicant-enter-your-name',
                                                theme: 'applicant-details'
                                            },
                                            {
                                                id: 'q-applicant-british-citizen-or-eu-national',
                                                type: 'simple',
                                                label:
                                                    'Mr Foo Bar, are you a British citizen or EU national?',
                                                value: true,
                                                valueLabel: 'Yes',
                                                sectionId:
                                                    'p-applicant-british-citizen-or-eu-national',
                                                theme: 'applicant-details'
                                            }
                                        ]
                                    },
                                    {
                                        type: 'theme',
                                        id: 'contact-details',
                                        title: 'Contact details',
                                        values: [
                                            {
                                                id: 'q-applicant-enter-your-email-address',
                                                type: 'simple',
                                                label: 'Enter your email address',
                                                value:
                                                    'bar@9f7b855e-586b-49f0-ac7a-026919732b06.gov.uk',
                                                sectionId: 'p-applicant-enter-your-email-address',
                                                theme: 'contact-details',
                                                format: {
                                                    value: 'email'
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        type: 'theme',
                                        id: 'default',
                                        title: 'Answers',
                                        values: [
                                            {
                                                id: 'q-applicant-theme-undefined',
                                                type: 'simple',
                                                label: 'Enter your fav colour',
                                                value: 'red',
                                                sectionId: 'p-applicant-theme-undefined'
                                            },
                                            {
                                                id: 'q-applicant-theme-not-found',
                                                type: 'simple',
                                                label: 'Enter your fav colour',
                                                value: 'blue',
                                                sectionId: 'p-applicant-theme-not-found',
                                                theme: 'this-theme-is-not-found'
                                            }
                                        ]
                                    }
                                ],
                                lookup: {
                                    existingStuff: 'bar'
                                }
                            }
                        }
                    }
                }
            });
        });
    });
});
