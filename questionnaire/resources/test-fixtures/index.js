'use strict';

const attributes = {
    sectionWithoutL10nAndWithoutAnswer: {
        schema: {
            $schema: 'http://json-schema.org/draft-07/schema#',
            type: 'object',
            required: ['q-applicant-british-citizen-or-eu-national'],
            additionalProperties: false,
            properties: {
                'q-applicant-british-citizen-or-eu-national': {
                    title: 'Are you a British citizen or EU national?',
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
                    ]
                }
            }
        }
    },
    sectionWithL10nAndWithoutAnswer: {
        l10n: {
            vars: {
                lng: 'en',
                context: {
                    $data:
                        '/answers/p-applicant-who-are-you-applying-for/q-applicant-who-are-you-applying-for'
                },
                ns: 'p-applicant-british-citizen-or-eu-national'
            },
            translations: [
                {
                    language: 'en',
                    namespace: 'p-applicant-british-citizen-or-eu-national',
                    resources: {
                        'q-applicant-british-citizen-or-eu-national': {
                            title: 'Are you a British citizen or EU national?',
                            'title_someone-else': 'Are they a British citizen or EU national?',
                            error: {
                                required: 'Select yes if you are a British citizen or EU national',
                                'required_someone-else':
                                    'Select yes if they are a British citizen or EU national'
                            }
                        }
                    }
                }
            ]
        },
        schema: {
            $schema: 'http://json-schema.org/draft-07/schema#',
            type: 'object',
            required: ['q-applicant-british-citizen-or-eu-national'],
            additionalProperties: false,
            properties: {
                'q-applicant-british-citizen-or-eu-national': {
                    title:
                        'l10nt:q-applicant-british-citizen-or-eu-national.title{?lng,context,ns}',
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
                    ]
                }
            }
        }
    },
    sectionWithoutL10nAndWithAnswer: {
        schema: {
            $schema: 'http://json-schema.org/draft-07/schema#',
            type: 'object',
            required: ['q-applicant-british-citizen-or-eu-national'],
            additionalProperties: false,
            properties: {
                'q-applicant-british-citizen-or-eu-national': {
                    title:
                        'l10nt:q-applicant-british-citizen-or-eu-national.title{?lng,context,ns}',
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
                    ]
                }
            }
        }
    },
    sectionWithL10nAndWithAnswer: {
        l10n: {
            vars: {
                lng: 'en',
                context: {
                    $data:
                        '/answers/p-applicant-who-are-you-applying-for/q-applicant-who-are-you-applying-for'
                },
                ns: 'p-applicant-british-citizen-or-eu-national'
            },
            translations: [
                {
                    language: 'en',
                    namespace: 'p-applicant-british-citizen-or-eu-national',
                    resources: {
                        'q-applicant-british-citizen-or-eu-national': {
                            title: 'Are you a British citizen or EU national?',
                            'title_someone-else': 'Are they a British citizen or EU national?',
                            error: {
                                required: 'Select yes if you are a British citizen or EU national',
                                'required_someone-else':
                                    'Select yes if they are a British citizen or EU national'
                            }
                        }
                    }
                }
            ]
        },
        schema: {
            $schema: 'http://json-schema.org/draft-07/schema#',
            type: 'object',
            required: ['q-applicant-british-citizen-or-eu-national'],
            additionalProperties: false,
            properties: {
                'q-applicant-british-citizen-or-eu-national': {
                    title:
                        'l10nt:q-applicant-british-citizen-or-eu-national.title{?lng,context,ns}',
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
                    ]
                }
            }
        }
    }
};

module.exports = {
    questionnaire: {
        sections: {
            'p-section': attributes.sectionWithoutL10nAndWithoutAnswer,
            'p-section-l10n': attributes.sectionWithL10nAndWithoutAnswer,
            'p-section-answer': attributes.sectionWithoutL10nAndWithAnswer,
            'p-section-l10n-answer': attributes.sectionWithL10nAndWithAnswer
        },
        answers: {
            'p-applicant-who-are-you-applying-for': {
                'q-applicant-who-are-you-applying-for': 'someone-else'
            },
            'p-section-answer': {
                'q-applicant-british-citizen-or-eu-national': true
            },
            'p-section-l10n-answer': {
                'q-applicant-british-citizen-or-eu-national': false
            }
        }
    }
};
