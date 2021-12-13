'use strict';

const attributes = {
    simple: {
        singleValue: {
            'q-applicant-enter-your-email-address': {
                type: 'string',
                title: 'Enter your email address',
                description:
                    'We may use this to contact you if we need to clarify something on your application form (optional).',
                maxLength: 50,
                format: 'email'
            }
        },
        singlePredefinedValue: {
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
        },
        multiplePredefinedValues: {
            'q-applicant-physical-injury-upper': {
                title: 'What parts of the head, face or neck was injured?',
                type: 'array',
                items: {
                    anyOf: [
                        {
                            title: 'Head or brain',
                            const: 'head'
                        },
                        {
                            title: 'Face or jaw',
                            const: 'face'
                        },
                        {
                            title: 'Eye or eyesight',
                            const: 'eye'
                        },
                        {
                            title: 'Ear or hearing',
                            const: 'ear'
                        },
                        {
                            title: 'Nose',
                            const: 'nose'
                        },
                        {
                            title: 'Mouth',
                            const: 'mouth'
                        },
                        {
                            title: 'Neck',
                            const: 'neck'
                        },
                        {
                            title: 'Skin',
                            const: 'skin',
                            description: 'Including cuts, bruises, burns and scars'
                        },
                        {
                            title: 'Tissue',
                            const: 'muscle',
                            description: 'Including muscles, ligaments, tendons or cartilage'
                        }
                    ]
                }
            }
        }
    },
    composite: {
        title: 'Enter your name',
        required: ['q-applicant-title', 'q-applicant-first-name', 'q-applicant-last-name'],
        propertyNames: {
            enum: ['q-applicant-title', 'q-applicant-first-name', 'q-applicant-last-name']
        },
        meta: {
            compositeId: 'q-fullname'
        },
        allOf: [
            {
                properties: {
                    'q-applicant-title': {
                        title: 'Title',
                        type: 'string',
                        maxLength: 6,
                        errorMessage: {
                            maxLength: 'Title must be 6 characters or less'
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
                            maxLength: 'First name must be 70 characters or less'
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
                        }
                    }
                }
            }
        ]
    }
};

const sections = {
    simpleAttributeSingleValue: {
        schema: {
            $schema: 'http://json-schema.org/draft-07/schema#',
            type: 'object',
            properties: {
                ...attributes.simple.singleValue
            }
        }
    },
    simpleAttributeSinglePredefinedValue: {
        schema: {
            $schema: 'http://json-schema.org/draft-07/schema#',
            type: 'object',
            properties: {
                ...attributes.simple.singlePredefinedValue
            }
        }
    },
    simpleAttributeMultiplePredefinedValues: {
        schema: {
            $schema: 'http://json-schema.org/draft-07/schema#',
            type: 'object',
            properties: {
                ...attributes.simple.multiplePredefinedValues
            }
        }
    },
    singleCompositeAttribute: {
        schema: {
            $schema: 'http://json-schema.org/draft-07/schema#',
            type: 'object',
            allOf: [attributes.composite]
        }
    }
};

const questionnaires = {
    getUniqueAttributeIds: () => ({
        sections: {
            'p-applicant-enter-your-email-address': sections.simpleAttributeSingleValue,
            'p-applicant-british-citizen-or-eu-national':
                sections.simpleAttributeSinglePredefinedValue
        },
        progress: [
            'p-applicant-enter-your-email-address',
            'p-applicant-british-citizen-or-eu-national'
        ],
        answers: {
            'p-applicant-enter-your-email-address': {
                'q-applicant-enter-your-email-address':
                    'bar@9f7b855e-586b-49f0-ac7a-026919732b06.gov.uk'
            },
            'p-applicant-british-citizen-or-eu-national': {
                'q-applicant-british-citizen-or-eu-national': true
            }
        }
    }),
    getDuplicateAttributeIds: () => ({
        sections: {
            'p-applicant-physical-injury-upper': sections.simpleAttributeMultiplePredefinedValues,
            'p-applicant-physical-injury-upper-2': sections.simpleAttributeMultiplePredefinedValues
        },
        progress: ['p-applicant-physical-injury-upper', 'p-applicant-physical-injury-upper-2'],
        answers: {
            'p-applicant-physical-injury-upper': {
                'q-applicant-physical-injury-upper': ['head', 'ear']
            },
            'p-applicant-physical-injury-upper-2': {
                'q-applicant-physical-injury-upper': ['skin', 'muscle']
            }
        },
        meta: {
            attributes: {
                'q-applicant-physical-injury-upper': {title: 'What was injured?'}
            }
        }
    }),
    getDuplicateAttributeIdsDifferentDataTypes: () => {
        const q = questionnaires.getDuplicateAttributeIds();

        q.answers = {
            'p-applicant-physical-injury-upper': {
                'q-applicant-physical-injury-upper': ['head', 'ear']
            },
            'p-applicant-physical-injury-upper-2': {
                'q-applicant-physical-injury-upper': 'skin'
            }
        };

        return q;
    },
    getDuplicateAttributeIdsNonArrayDataTypes: () => {
        const q = questionnaires.getDuplicateAttributeIds();

        q.answers = {
            'p-applicant-physical-injury-upper': {
                'q-applicant-physical-injury-upper': 'ear'
            },
            'p-applicant-physical-injury-upper-2': {
                'q-applicant-physical-injury-upper': 'skin'
            }
        };

        return q;
    },
    getSimpleAndCompositeAttributes: () => ({
        sections: {
            'p-applicant-enter-your-email-address': sections.simpleAttributeSingleValue,
            'p-applicant-enter your-name': sections.singleCompositeAttribute,
            'p-applicant-british-citizen-or-eu-national': sections.simpleAttributeSingleValue
        },
        progress: [
            'p-applicant-enter-your-email-address',
            'p-applicant-enter your-name',
            'p-applicant-british-citizen-or-eu-national'
        ],
        answers: {
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
            }
        }
    })
};

module.exports = questionnaires;
