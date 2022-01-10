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

module.exports = {
    sectionWithSimpleAttributeSingleValue: {
        schema: {
            $schema: 'http://json-schema.org/draft-07/schema#',
            type: 'object',
            properties: {
                ...attributes.simple.singleValue
            }
        }
    },
    sectionWithSimpleAttributeSinglePredefinedValue: {
        schema: {
            $schema: 'http://json-schema.org/draft-07/schema#',
            type: 'object',
            properties: {
                ...attributes.simple.singlePredefinedValue
            }
        }
    },
    sectionWithSimpleAttributeMultiplePredefinedValues: {
        schema: {
            $schema: 'http://json-schema.org/draft-07/schema#',
            type: 'object',
            properties: {
                ...attributes.simple.multiplePredefinedValues
            }
        }
    },
    sectionWithSingleCompositeAttribute: {
        schema: {
            $schema: 'http://json-schema.org/draft-07/schema#',
            type: 'object',
            allOf: [attributes.composite]
        }
    },
    sectionWithDeclaration: {
        schema: {
            $schema: 'http://json-schema.org/draft-07/schema#',
            type: 'object',
            title: 'Declaration',
            allOf: [
                {
                    properties: {
                        'applicant-declaration': {
                            $id: '#applicant-declaration',
                            description:
                                'By submitting the application I, ||/answers/p-applicant-enter-your-name/q-applicant-title|| ||/answers/p-applicant-enter-your-name/q-applicant-first-name|| ||/answers/p-applicant-enter-your-name/q-applicant-last-name||, agree that:'
                        }
                    }
                },
                {
                    properties: {
                        'q-applicant-declaration': {
                            type: 'string',
                            title:
                                'I have read and understood the <a href="#declaration" class="govuk-link">information and declaration</a>',
                            const: 'i-agree',
                            meta: {
                                describedBy: {
                                    $ref: '#/allOf/0/properties/applicant-declaration/description'
                                }
                            }
                        }
                    }
                }
            ]
        }
    }
};
