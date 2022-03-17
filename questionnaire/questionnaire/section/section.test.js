'use strict';

const fixtures = require('./test-fixtures');
const createSection = require('./index');

describe('Section', () => {
    describe('getAttributesByData', () => {
        describe('Given a section definition containing a schema', () => {
            describe('And the schema contains an attribute that can accept a single value', () => {
                it('should return a simple attribute with a label and single value', async () => {
                    const section = createSection({
                        sectionDefinition: fixtures.sectionWithSimpleAttributeSingleValue
                    });
                    const data = {
                        'q-applicant-enter-your-email-address':
                            'bar@9f7b855e-586b-49f0-ac7a-026919732b06.gov.uk'
                    };
                    const sectionAttributes = section.getAttributesByData({data});

                    expect(sectionAttributes).toEqual([
                        {
                            id: 'q-applicant-enter-your-email-address',
                            type: 'simple',
                            label: 'Enter your email address',
                            value: 'bar@9f7b855e-586b-49f0-ac7a-026919732b06.gov.uk'
                        }
                    ]);
                });

                describe('Given the supplied data has no corresponding keys in the section schema', () => {
                    it('should return an empty list of attributes', async () => {
                        const section = createSection({
                            sectionDefinition: fixtures.sectionWithSimpleAttributeSingleValue
                        });
                        const data = {
                            'this-key-does-not-exist-in-the-section-schema': 'dummy value'
                        };
                        const sectionAttributes = section.getAttributesByData({data});

                        expect(sectionAttributes).toEqual([]);
                    });
                });
            });

            describe('And the schema contains an attribute that can accept a single predefined value', () => {
                it('should return a simple attribute with a label and single value label', async () => {
                    const section = createSection({
                        sectionDefinition: fixtures.sectionWithSimpleAttributeSinglePredefinedValue
                    });
                    const data = {
                        'q-applicant-british-citizen-or-eu-national': true
                    };
                    const sectionAttributes = section.getAttributesByData({data});

                    expect(sectionAttributes).toEqual([
                        {
                            id: 'q-applicant-british-citizen-or-eu-national',
                            type: 'simple',
                            label: 'Are you a British citizen or EU national?',
                            value: true,
                            valueLabel: 'Yes'
                        }
                    ]);
                });
            });

            describe('And the schema contains an attribute that can accept multiple predefined values', () => {
                it('should return a simple attribute with a label and multiple value labels', async () => {
                    const section = createSection({
                        sectionDefinition:
                            fixtures.sectionWithSimpleAttributeMultiplePredefinedValues
                    });
                    const data = {
                        'q-applicant-physical-injury-upper': ['head', 'eye', 'nose']
                    };
                    const sectionAttributes = section.getAttributesByData({data});

                    expect(sectionAttributes).toEqual([
                        {
                            id: 'q-applicant-physical-injury-upper',
                            type: 'simple',
                            label: 'What parts of the head, face or neck was injured?',
                            value: ['head', 'eye', 'nose'],
                            valueLabel: ['Head or brain', 'Eye or eyesight', 'Nose']
                        }
                    ]);
                });
            });

            describe('And the schema contains a single composite attribute', () => {
                it('should return a composite attribute', async () => {
                    const section = createSection({
                        sectionDefinition: fixtures.sectionWithSingleCompositeAttribute
                    });
                    const data = {
                        'q-applicant-title': 'Mr',
                        'q-applicant-first-name': 'Foo',
                        'q-applicant-last-name': 'Bar'
                    };
                    const sectionAttributes = section.getAttributesByData({data});

                    expect(sectionAttributes).toEqual([
                        {
                            id: 'q-fullname',
                            type: 'composite',
                            label: 'Enter your name',
                            values: [
                                {
                                    id: 'q-applicant-title',
                                    type: 'simple',
                                    label: 'Title',
                                    value: 'Mr'
                                },
                                {
                                    id: 'q-applicant-first-name',
                                    type: 'simple',
                                    label: 'First name',
                                    value: 'Foo'
                                },
                                {
                                    id: 'q-applicant-last-name',
                                    type: 'simple',
                                    label: 'Last name',
                                    value: 'Bar'
                                }
                            ]
                        }
                    ]);
                });

                describe('Given the supplied data has two of the three corresponding composite attribute keys', () => {
                    it('should return a composite attribute with two corresponding attributes', async () => {
                        const section = createSection({
                            sectionDefinition: fixtures.sectionWithSingleCompositeAttribute
                        });
                        const data = {
                            'q-applicant-title': 'Mr',
                            'q-applicant-last-name': 'Bar'
                        };
                        const sectionAttributes = section.getAttributesByData({data});

                        expect(sectionAttributes).toEqual([
                            {
                                id: 'q-fullname',
                                type: 'composite',
                                label: 'Enter your name',
                                values: [
                                    {
                                        id: 'q-applicant-title',
                                        type: 'simple',
                                        label: 'Title',
                                        value: 'Mr'
                                    },
                                    {
                                        id: 'q-applicant-last-name',
                                        type: 'simple',
                                        label: 'Last name',
                                        value: 'Bar'
                                    }
                                ]
                            }
                        ]);
                    });
                });
            });

            describe('And the schema contains attributes with metadata', () => {
                function getSectionDefinition() {
                    return {
                        schema: {
                            type: 'object',
                            properties: {
                                'q-applicant-when-did-the-crime-start': {
                                    title: 'When did it start?',
                                    meta: {
                                        keywords: {
                                            format: {
                                                precision: 'YYYY-MM',
                                                defaults: {
                                                    DD: '01'
                                                }
                                            }
                                        },
                                        classifications: {
                                            theme: 'crime-details'
                                        },
                                        summary: {
                                            title: 'Crime start date'
                                        }
                                    },
                                    type: 'string',
                                    format: 'date-time',
                                    description:
                                        'For example, 02 2020. You can enter an approximate date.'
                                }
                            }
                        }
                    };
                }

                it('should default to exclude metadata', () => {
                    const sectionDefinition = getSectionDefinition();
                    const section = createSection({
                        id: 'p-some-section',
                        sectionDefinition
                    });
                    const data = {
                        'q-applicant-when-did-the-crime-start': '2021-01-01T00:00:00.000Z'
                    };
                    const sectionAttributes = section.getAttributesByData({data});

                    expect(sectionAttributes).toEqual([
                        {
                            id: 'q-applicant-when-did-the-crime-start',
                            type: 'simple',
                            label: 'When did it start?',
                            value: '2021-01-01T00:00:00.000Z'
                        }
                    ]);
                });

                it('should allow metatdata to be optionally included', () => {
                    const sectionDefinition = getSectionDefinition();
                    const section = createSection({
                        id: 'p-some-section',
                        sectionDefinition
                    });
                    const data = {
                        'q-applicant-when-did-the-crime-start': '2021-01-01T00:00:00.000Z'
                    };
                    const sectionAttributes = section.getAttributesByData({
                        data,
                        includeMetadata: true
                    });

                    expect(sectionAttributes).toEqual([
                        {
                            id: 'q-applicant-when-did-the-crime-start',
                            type: 'simple',
                            label: 'When did it start?',
                            value: '2021-01-01T00:00:00.000Z',
                            meta: {
                                sectionId: 'p-some-section',
                                keywords: {
                                    format: {
                                        value: 'date-time',
                                        precision: 'YYYY-MM',
                                        defaults: {
                                            DD: '01'
                                        }
                                    }
                                },
                                classifications: {
                                    theme: 'crime-details'
                                },
                                summary: {
                                    title: 'Crime start date'
                                }
                            }
                        }
                    ]);
                });
            });

            describe('And a mapping function is supplied', () => {
                it('should return the result of the mapping function', () => {
                    const sectionDefinition = {
                        schema: {
                            type: 'object',
                            properties: {
                                'q-applicant-when-did-the-crime-start': {
                                    title: 'When did it start?',
                                    meta: {
                                        keywords: {
                                            format: {
                                                precision: 'YYYY-MM',
                                                defaults: {
                                                    DD: '01'
                                                }
                                            }
                                        },
                                        classifications: {
                                            theme: 'crime-details'
                                        },
                                        summary: {
                                            title: 'Crime start date'
                                        }
                                    },
                                    type: 'string',
                                    format: 'date-time',
                                    description:
                                        'For example, 02 2020. You can enter an approximate date.'
                                }
                            }
                        }
                    };
                    const section = createSection({
                        id: 'p-some-section',
                        sectionDefinition
                    });
                    const sectionAttributes = section.getAttributesByData({
                        data: {
                            'q-applicant-when-did-the-crime-start': '2021-01-01T00:00:00.000Z'
                        },
                        mapAttribute: dataAttribute => {
                            dataAttribute.id = 'some-new-id';
                            dataAttribute.someNewProperty = true;
                            return dataAttribute;
                        }
                    });

                    expect(sectionAttributes).toEqual([
                        {
                            id: 'some-new-id',
                            type: 'simple',
                            label: 'When did it start?',
                            value: '2021-01-01T00:00:00.000Z',
                            someNewProperty: true
                        }
                    ]);
                });
            });
        });
    });

    it("should return the section's schema", async () => {
        const section = createSection({
            sectionDefinition: fixtures.sectionWithSimpleAttributeSingleValue
        });
        const sectionSchema = section.getSchema();

        expect(sectionSchema).toEqual({
            $schema: 'http://json-schema.org/draft-07/schema#',
            type: 'object',
            properties: {
                'q-applicant-enter-your-email-address': {
                    description:
                        'We may use this to contact you if we need to clarify something on your application form (optional).',
                    format: 'email',
                    maxLength: 50,
                    title: 'Enter your email address',
                    type: 'string'
                }
            }
        });
    });
});
