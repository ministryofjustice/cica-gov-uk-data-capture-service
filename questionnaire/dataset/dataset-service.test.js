'use strict';

const VError = require('verror');

const questionnaireFixtures = require('./test-fixtures');
const createDatasetService = require('./dataset-service');

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function errorMessageToRegExp(errorMessage) {
    return new RegExp(`^${escapeRegExp(errorMessage)}$`);
}

const QUESTIONNAIRE_UNIQUE_ATTRIBUTE_IDS = '3094f910-62d0-4698-9409-387320b7004b';
const QUESTIONNAIRE_DUPLICATE_ATTRIBUTE_IDS = '55376963-0675-4ee9-a184-d6858ec0cf33';
const QUESTIONNAIRE_DUPLICATE_ATTRIBUTE_IDS_DIFFERENT_DATA_TYPES =
    '292cd67f-8ff8-4b04-a29c-a1b8c2231ed5';
const QUESTIONNAIRE_DUPLICATE_ATTRIBUTE_IDS_NON_ARRAY_DATA_TYPES =
    '7f3eec38-1e5f-4806-b8ea-99bbf8918665';

const datasetService = createDatasetService({
    logger: () => 'Logged from dataset test',
    createQuestionnaireDAL: () => ({
        getQuestionnaire: questionnaireId => {
            if (questionnaireId === QUESTIONNAIRE_UNIQUE_ATTRIBUTE_IDS) {
                return questionnaireFixtures.getUniqueAttributeIds();
            }

            if (questionnaireId === QUESTIONNAIRE_DUPLICATE_ATTRIBUTE_IDS) {
                return questionnaireFixtures.getDuplicateAttributeIds();
            }

            if (questionnaireId === QUESTIONNAIRE_DUPLICATE_ATTRIBUTE_IDS_DIFFERENT_DATA_TYPES) {
                return questionnaireFixtures.getDuplicateAttributeIdsDifferentDataTypes();
            }

            if (questionnaireId === QUESTIONNAIRE_DUPLICATE_ATTRIBUTE_IDS_NON_ARRAY_DATA_TYPES) {
                return questionnaireFixtures.getDuplicateAttributeIdsNonArrayDataTypes();
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
    it('should throw is the requested resource version does not exist', async () => {
        const rxExpectedError = errorMessageToRegExp(
            'Dataset resource version "1.2.3" is unsupported'
        );

        await expect(
            datasetService.getResource(QUESTIONNAIRE_UNIQUE_ATTRIBUTE_IDS, '1.2.3')
        ).rejects.toThrow(rxExpectedError);
    });

    describe('Dataset resource v1.0.0', () => {
        it('should return a dataset resource', async () => {
            const dataset = await datasetService.getResource(
                QUESTIONNAIRE_UNIQUE_ATTRIBUTE_IDS,
                '1.0.0'
            );

            expect(dataset[0]).toEqual({
                type: 'dataset',
                id: 0,
                attributes: {
                    'q-applicant-british-citizen-or-eu-national': true,
                    'q-applicant-enter-your-email-address':
                        'bar@9f7b855e-586b-49f0-ac7a-026919732b06.gov.uk'
                }
            });
        });

        describe('Given multiple sections with the same question id', () => {
            it('should combine answers agaist a single id instance', async () => {
                const dataset = await datasetService.getResource(
                    QUESTIONNAIRE_DUPLICATE_ATTRIBUTE_IDS,
                    '1.0.0'
                );

                expect(dataset[0]).toEqual({
                    type: 'dataset',
                    id: 0,
                    attributes: {
                        'q-applicant-physical-injury-upper': ['head', 'ear', 'skin', 'muscle']
                    }
                });
            });

            it('should throw if the answers to be combined are of different types', async () => {
                const rxExpectedError = errorMessageToRegExp(
                    'Target and Source must be arrays. Target type: "array". Source type: "string"'
                );

                await expect(
                    datasetService.getResource(
                        QUESTIONNAIRE_DUPLICATE_ATTRIBUTE_IDS_DIFFERENT_DATA_TYPES,
                        '1.0.0'
                    )
                ).rejects.toThrow(rxExpectedError);
            });

            it('should throw if the answers to be combined are not arrays', async () => {
                const rxExpectedError = errorMessageToRegExp(
                    'Target and Source must be arrays. Target type: "string". Source type: "string"'
                );

                await expect(
                    datasetService.getResource(
                        QUESTIONNAIRE_DUPLICATE_ATTRIBUTE_IDS_NON_ARRAY_DATA_TYPES,
                        '1.0.0'
                    )
                ).rejects.toThrow(rxExpectedError);
            });
        });
    });

    describe('Dataset resource v2.0.0', () => {
        it('should return a dataset resource', async () => {
            const dataset = await datasetService.getResource(
                QUESTIONNAIRE_UNIQUE_ATTRIBUTE_IDS,
                '2.0.0'
            );

            expect(dataset[0]).toEqual({
                type: 'dataset',
                id: 0,
                attributes: {
                    values: [
                        {
                            id: 'q-applicant-enter-your-email-address',
                            type: 'simple',
                            label: 'Enter your email address',
                            value: 'bar@9f7b855e-586b-49f0-ac7a-026919732b06.gov.uk',
                            format: {
                                value: 'email'
                            }
                        },
                        {
                            id: 'q-applicant-british-citizen-or-eu-national',
                            type: 'simple',
                            label: 'Are you a British citizen or EU national?',
                            value: true,
                            valueLabel: 'Yes'
                        }
                    ]
                }
            });
        });

        describe('Given multiple sections with the same question id', () => {
            it('should combine answers agaist a single id instance', async () => {
                const dataset = await datasetService.getResource(
                    QUESTIONNAIRE_DUPLICATE_ATTRIBUTE_IDS,
                    '2.0.0'
                );

                expect(dataset[0]).toEqual({
                    type: 'dataset',
                    id: 0,
                    attributes: {
                        values: [
                            {
                                id: 'q-applicant-physical-injury-upper',
                                type: 'simple',
                                label: 'What was injured?',
                                value: ['head', 'ear', 'skin', 'muscle'],
                                valueLabel: ['Head or brain', 'Ear or hearing', 'Skin', 'Tissue']
                            }
                        ]
                    }
                });
            });
        });
    });
});
