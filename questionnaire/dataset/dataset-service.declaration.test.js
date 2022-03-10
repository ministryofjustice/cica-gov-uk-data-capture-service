'use strict';

// TODO: Remove this test file on next major template release

const VError = require('verror');
const templates = require('../templates');
const questionnaireFixtures = require('./test-fixtures');
const createDatasetService = require('./dataset-service');

const templateInstance = templates['sexual-assault']('648f4664-7233-4b66-89f3-ef6e1d2f5fa8');
const declarationSectionDefinition = templateInstance.sections['p-applicant-declaration'];
const questionnaireVersion = templateInstance.version;

const datasetService = createDatasetService({
    logger: () => 'Logged from dataset test',
    createQuestionnaireDAL: () => ({
        getQuestionnaire: questionnaireId => {
            if (questionnaireId === '8e1494ef-7c57-459d-81db-2aa110bfcdf5') {
                const questionnaire = questionnaireFixtures.getSimpleAndCompositeAttributes();

                questionnaire.version = questionnaireVersion;
                questionnaire.sections['p-applicant-declaration'] = declarationSectionDefinition;
                questionnaire.progress.push('p-applicant-declaration');
                questionnaire.answers['p-applicant-declaration'] = {};

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
    it('should be using template version 5.2.2', () => {
        expect(templateInstance.version).toEqual('5.2.2');
    });

    describe('Dataset resource v1.0.0', () => {
        it('should NOT include an attribute for the applicant declaration', async () => {
            const dataset = await datasetService.getResource(
                '8e1494ef-7c57-459d-81db-2aa110bfcdf5',
                '1.0.0'
            );

            expect(dataset[0]).toEqual({
                type: 'dataset',
                id: '0',
                attributes: {
                    'q-applicant-enter-your-email-address':
                        'bar@9f7b855e-586b-49f0-ac7a-026919732b06.gov.uk',
                    'q-applicant-title': 'Mr',
                    'q-applicant-first-name': 'Foo',
                    'q-applicant-last-name': 'Bar',
                    'q-applicant-british-citizen-or-eu-national': true
                }
            });
        });
    });

    describe('Dataset resource v2.0.0', () => {
        it('should include an attribute for the applicant declaration', async () => {
            const dataset = await datasetService.getResource(
                '8e1494ef-7c57-459d-81db-2aa110bfcdf5',
                '2.0.0'
            );

            expect(dataset[0]).toEqual({
                type: 'dataset',
                id: '0',
                attributes: {
                    values: [
                        {
                            id: 'q-applicant-enter-your-email-address',
                            type: 'simple',
                            label: 'Enter your email address',
                            value: 'bar@9f7b855e-586b-49f0-ac7a-026919732b06.gov.uk'
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
                        },
                        {
                            id: 'q-applicant-british-citizen-or-eu-national',
                            type: 'simple',
                            label: 'Are you a British citizen or EU national?',
                            value: true,
                            valueLabel: 'Yes'
                        },
                        {
                            id: 'q-applicant-declaration',
                            label:
                                '<p class="govuk-body">By submitting the application I, Mr Foo Bar, agree that:</p><ul class="govuk-list govuk-list--bullet"><li>the information I’ve given here is true as far as I know</li><li>CICA can share the information I’ve given in this claim with:</li><ul><li>police, prosecutors and ACRO Criminal Records Office</li><li>medical organisations and staff, including police medical staff</li><li>any other individuals or organisations needed to process my application (including medical or other experts)</li></ul><li>CICA can receive information from the organisations and individuals described above</li><li>If I deliberately provide information that I know is false or misleading, I may be prosecuted and my application for compensation may be refused.</li></ul><p class="govuk-body">We often have to ask your GP or other health service provider for evidence about your injuries and treatment. We will let you know if we need to do this.</p><p class="govuk-body">Read our privacy notice to see <a class="govuk-link" href="https://www.gov.uk/guidance/cica-privacy-notice">how we use your data</a>.</p>',
                            type: 'simple',
                            value: 'i-agree',
                            valueLabel: 'Agree and submit'
                        }
                    ]
                }
            });
        });
    });
});
