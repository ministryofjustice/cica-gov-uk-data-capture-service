'use strict';

const VError = require('verror');
const createDatasetService = require('./dataset-service');
const templates = require('../templates');

const templateInstance = templates['sexual-assault']('648f4664-7233-4b66-89f3-ef6e1d2f5fa8');
const questionnaireVersion = templateInstance.version;

const truncatedQuestionnaireInstance = {
    answers: {
        'p-applicant-infections': {'q-applicant-infections': 'not-sure'},
        'p-applicant-pregnancy': {'q-applicant-pregnancy': 'no'},
        'p-applicant-pregnancy-loss': {'q-applicant-pregnancy-loss': 'yes'}
    },
    progress: ['p-applicant-infections', 'p-applicant-pregnancy', 'p-applicant-pregnancy-loss'],
    sections: {
        'p-applicant-infections': {
            schema: {
                type: 'object',
                $schema: 'http://json-schema.org/draft-07/schema#',
                required: ['q-applicant-infections'],
                properties: {
                    'q-applicant-infections': {
                        meta: {
                            summary: {title: 'Did you get any infections?'},
                            classifications: {theme: 'injuries'}
                        },
                        type: 'string',
                        oneOf: [
                            {const: 'yes', title: 'Yes'},
                            {const: 'no', title: 'No'},
                            {const: 'not-sure', title: "I'm not sure"}
                        ],
                        title: 'Did you get an infection as a result of the crime?'
                    }
                },
                errorMessage: {
                    required: {
                        'q-applicant-infections':
                            'Select yes if you got an infection as a result of the crime'
                    }
                },
                additionalProperties: false
            }
        },
        'p-applicant-pregnancy': {
            schema: {
                type: 'object',
                $schema: 'http://json-schema.org/draft-07/schema#',
                required: ['q-applicant-pregnancy'],
                properties: {
                    'q-applicant-pregnancy': {
                        meta: {
                            summary: {title: 'Did you become pregnant?'},
                            classifications: {theme: 'pregnancy'}
                        },
                        type: 'string',
                        oneOf: [
                            {const: 'yes', title: 'Yes'},
                            {const: 'no', title: 'No'},
                            {const: 'not-sure', title: "I'm not sure"}
                        ],
                        title: 'Did you become pregnant as a result of the crime?'
                    }
                },
                errorMessage: {
                    required: {
                        'q-applicant-pregnancy':
                            'Select yes if you became pregnant as a result of the crime'
                    }
                },
                additionalProperties: false
            }
        },
        'p-applicant-pregnancy-loss': {
            schema: {
                type: 'object',
                $schema: 'http://json-schema.org/draft-07/schema#',
                required: ['q-applicant-pregnancy-loss'],
                properties: {
                    'q-applicant-pregnancy-loss': {
                        meta: {
                            summary: {title: 'Did you lose a pregnancy?'},
                            classifications: {theme: 'pregnancy'}
                        },
                        type: 'string',
                        oneOf: [
                            {const: 'yes', title: 'Yes'},
                            {const: 'no', title: 'No'},
                            {const: 'not-sure', title: "I'm not sure"}
                        ],
                        title: 'Did you lose a pregnancy as a result of the crime?'
                    }
                },
                errorMessage: {
                    required: {
                        'q-applicant-pregnancy-loss':
                            'Select yes if you lost a pregnancy as a result of the crime'
                    }
                },
                additionalProperties: false
            }
        }
    }
};

const datasetService = createDatasetService({
    logger: () => 'Logged from dataset test',
    createQuestionnaireDAL: () => ({
        getQuestionnaire: questionnaireId => {
            if (questionnaireId === '8e1494ef-7c57-459d-81db-2aa110bfcdf5') {
                const questionnaire = JSON.parse(JSON.stringify(truncatedQuestionnaireInstance));
                questionnaire.version = questionnaireVersion;
                return questionnaire;
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

describe('Dataset service', () => {
    describe('Dataset resource v2.0.0', () => {
        it('should transform attributes with strings in to booleans', async () => {
            const dataset = await datasetService.getResource(
                '8e1494ef-7c57-459d-81db-2aa110bfcdf5',
                '2.0.0'
            );
            expect(dataset).toEqual([
                {
                    attributes: {
                        values: [
                            {
                                id: 'q-applicant-infections',
                                label: 'Did you get an infection as a result of the crime?',
                                type: 'simple',
                                value: false,
                                valueLabel: 'no'
                            },
                            {
                                id: 'q-applicant-pregnancy',
                                label: 'Did you become pregnant as a result of the crime?',
                                type: 'simple',
                                value: false,
                                valueLabel: 'no'
                            },
                            {
                                id: 'q-applicant-pregnancy-loss',
                                label: 'Did you lose a pregnancy as a result of the crime?',
                                type: 'simple',
                                value: true,
                                valueLabel: 'yes'
                            }
                        ]
                    },
                    id: '0',
                    type: 'dataset'
                }
            ]);
        });
    });
});
