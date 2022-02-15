'use strict';

const sectionResource = require('./section-resource');
const fixtures = require('./test-fixtures');

describe('Section Resource', () => {
    describe('Given a section id and a questionnaire json', () => {
        it('should return a section resource', async () => {
            const result = await sectionResource({
                sectionId: 'p-section',
                questionnaire: fixtures.questionnaire
            });
            expect(result).toEqual({
                type: 'sections',
                id: 'p-section',
                attributes: {
                    $schema: 'http://json-schema.org/draft-07/schema#',
                    type: 'object',
                    required: ['q-applicant-british-citizen-or-eu-national'],
                    additionalProperties: false,
                    properties: {
                        'q-applicant-british-citizen-or-eu-national': {
                            type: 'boolean',
                            title: 'Are you a British citizen or EU national?',
                            oneOf: [
                                {
                                    const: true,
                                    title: 'Yes'
                                },
                                {
                                    const: false,
                                    title: 'No'
                                }
                            ]
                        }
                    }
                }
            });
        });

        describe('And has an l10n block and an no answer', () => {
            it('should return a contextualised section resource', async () => {
                const result = await sectionResource({
                    sectionId: 'p-section-l10n',
                    questionnaire: fixtures.questionnaire
                });
                expect(result).toEqual({
                    type: 'sections',
                    id: 'p-section-l10n',
                    attributes: {
                        $schema: 'http://json-schema.org/draft-07/schema#',
                        type: 'object',
                        required: ['q-applicant-british-citizen-or-eu-national'],
                        additionalProperties: false,
                        properties: {
                            'q-applicant-british-citizen-or-eu-national': {
                                type: 'boolean',
                                title: 'Are they a British citizen or EU national?',
                                oneOf: [
                                    {
                                        const: true,
                                        title: 'Yes'
                                    },
                                    {
                                        const: false,
                                        title: 'No'
                                    }
                                ]
                            }
                        }
                    }
                });
            });
        });

        describe('And has no l10n block and an answer', () => {
            it('should return a section resource with an answer relationship', async () => {
                const result = await sectionResource({
                    sectionId: 'p-section-answer',
                    questionnaire: fixtures.questionnaire
                });
                expect(result).toEqual({
                    type: 'sections',
                    id: 'p-section-answer',
                    attributes: {
                        $schema: 'http://json-schema.org/draft-07/schema#',
                        type: 'object',
                        required: ['q-applicant-british-citizen-or-eu-national'],
                        additionalProperties: false,
                        properties: {
                            'q-applicant-british-citizen-or-eu-national': {
                                type: 'boolean',
                                title:
                                    'l10nt:q-applicant-british-citizen-or-eu-national.title{?lng,context,ns}',
                                oneOf: [
                                    {
                                        const: true,
                                        title: 'Yes'
                                    },
                                    {
                                        const: false,
                                        title: 'No'
                                    }
                                ]
                            }
                        }
                    },
                    relationships: {
                        answer: {
                            data: {
                                type: 'answers',
                                id: 'p-section-answer'
                            }
                        }
                    }
                });
            });
        });

        describe('And has an l10n block and an answer', () => {
            it('should return a contextualised section resource with an answer relationship', async () => {
                const result = await sectionResource({
                    sectionId: 'p-section-l10n-answer',
                    questionnaire: fixtures.questionnaire
                });
                expect(result).toEqual({
                    type: 'sections',
                    id: 'p-section-l10n-answer',
                    attributes: {
                        $schema: 'http://json-schema.org/draft-07/schema#',
                        type: 'object',
                        required: ['q-applicant-british-citizen-or-eu-national'],
                        additionalProperties: false,
                        properties: {
                            'q-applicant-british-citizen-or-eu-national': {
                                type: 'boolean',
                                title: 'Are they a British citizen or EU national?',
                                oneOf: [
                                    {
                                        const: true,
                                        title: 'Yes'
                                    },
                                    {
                                        const: false,
                                        title: 'No'
                                    }
                                ]
                            }
                        }
                    },
                    relationships: {
                        answer: {
                            data: {
                                type: 'answers',
                                id: 'p-section-l10n-answer'
                            }
                        }
                    }
                });
            });
        });
    });
});
