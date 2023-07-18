'use strict';

const VError = require('verror');

const {transformQuestionnaire, transformAndUpload, mergeArrays, getDeclaration} = require('.');
const questionnaireFixture = require('../test-fixtures/questionnaireCompleteForCheckYourAnswers');
const questionnaireFixtureNoDeclaration = require('../test-fixtures/questionnaireCompleteForCheckYourAnswersNoDeclaration');
const questionnaire = require('../../../../questionnaire');
const mockDb = require('../../../../../questionnaire-dal');
const mockS3 = require('../../../../../../services/s3');

jest.mock('../../../../../questionnaire-dal');
jest.mock('../../../../../../services/s3');

const loggerMock = {
    info: jest.fn()
};

describe('Transform and Upload task', () => {
    // Arrange
    const questionnaireObj = questionnaire({questionnaireDefinition: questionnaireFixture});

    // Act
    let result;

    beforeEach(() => {
        result = transformQuestionnaire(questionnaireObj);
    });

    it('Should error if input parameters are not arrays', () => {
        expect(() => {
            mergeArrays('3454', 'this is a string not an array');
        }).toThrow(VError);
    });

    it('Should return undefined if declaration does not exist', () => {
        const questionnaireObjNoDeclaration = questionnaire({
            questionnaireDefinition: questionnaireFixtureNoDeclaration
        });
        expect(getDeclaration(questionnaireObjNoDeclaration)).toBeUndefined();
    });

    it('Should transform correctly and include the correct CRN in the metadata.', () => {
        expect(result.meta.caseReference).toBe('19\\751194');
    });

    it('Should transform correctly with amalgamated injury codes and labels.', () => {
        const injuries = result.themes
            .find(theme => {
                return theme.id === 'injuries';
            })
            .values.find(question => {
                return question.id === 'q-applicant-physical-injuries';
            });

        expect(injuries.value).toStrictEqual([
            'phyinj-139',
            'phyinj-149',
            'phyinj-026',
            'phyinj-006',
            'phyinj-137',
            'phyinj-083',
            'phyinj-161'
        ]);

        expect(injuries.valueLabel).toStrictEqual([
            'Quadriplegia or tetraplegia (paralysis of all 4 limbs)',
            'Other',
            'Damaged or detached retina',
            'Broken ear bone',
            'Hemiplegia (paralysis of one side of the the body)',
            'Scars',
            'Cartilage'
        ]);
    });

    it('Should transform correctly with the correct declaration.', () => {
        expect(result.declaration.id).toBe('p-applicant-declaration');
        expect(result.declaration.label).toContain('<div id="declaration">');
        expect(result.declaration.value).toBe('i-agree');
        expect(result.declaration.valueLabel).toBe('I have read and understood the declaration');
    });

    it('Should keep hideOnSummary flags.', () => {
        const newOrExistingQuestion = result.themes
            .find(theme => {
                return theme.id === 'about-application';
            })
            .values.find(question => {
                return question.id === 'q--new-or-existing-application';
            });
        expect(newOrExistingQuestion.meta.integration.hideOnSummary).toEqual(true);
    });

    it('Should transform and upload.', async () => {
        mockDb.mockImplementation(() => ({
            getQuestionnaireModifiedDate: () => new Date('July 20, 2023 00:00:00')
        }));

        mockS3.mockImplementation(() => ({
            uploadFile: () => 'Success'
        }));

        result = await transformAndUpload({
            questionnaireDefinition: questionnaireFixture,
            logger: loggerMock
        });

        expect(result).toEqual('Success');
    });
});
