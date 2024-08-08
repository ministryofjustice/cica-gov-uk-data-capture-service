'use strict';

const VError = require('verror');

const {transformQuestionnaire, transformAndUpload, mergeArrays, getDeclaration} = require('.');
const questionnaireFixture = require('../test-fixtures/questionnaireCompleteForCheckYourAnswers');
const questionnaireFixtureNoDeclaration = require('../test-fixtures/questionnaireCompleteForCheckYourAnswersNoDeclaration');
const questionnaireFixtureWithOrigin = require('../test-fixtures/questionnaireCompleteForCheckYourAnswersWithOrigin');
const questionnaireFixtureAuthenticatedFalse = require('../test-fixtures/questionnaireCompleteForCheckYourAnswersIsAuthnticatedFalse');
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
        jest.resetModules();
        jest.resetAllMocks();
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
        result = transformQuestionnaire(questionnaireObj);
        expect(result.meta.caseReference).toBe('19\\751194');
    });

    it('Should transform correctly and include the correct channel in the metadata.', () => {
        const questionnaireObjWithOrigin = questionnaire({
            questionnaireDefinition: questionnaireFixtureWithOrigin
        });

        const transformedQuestionnaire = transformQuestionnaire(questionnaireObjWithOrigin);
        expect(transformedQuestionnaire).toHaveProperty('meta');
        expect(transformedQuestionnaire.meta).toHaveProperty('channel');
        expect(transformedQuestionnaire.meta.channel).toBe('dashboard');
    });

    it('Should transform correctly if no origin is present in the answers', () => {
        result = transformQuestionnaire(questionnaireObj);
        expect(result).toHaveProperty('meta');
        expect(result.meta).not.toHaveProperty('channel');
    });

    it('Should transform correctly with amalgamated injury codes and labels.', () => {
        result = transformQuestionnaire(questionnaireObj);
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
            'Head injuries - Quadriplegia or tetraplegia (paralysis of all 4 limbs)',
            'Head injuries - Other',
            'Eye injuries - Damaged or detached retina',
            'Ear injuries - Broken ear bone',
            'Arm injuries - Hemiplegia (paralysis of one side of the the body)',
            'Arm or hand skin injuries - Scars',
            'Arm or hand tissue injuries - Cartilage'
        ]);
    });

    it('Should transform correctly with the correct declaration.', () => {
        result = transformQuestionnaire(questionnaireObj);
        expect(result.declaration.id).toBe('p-applicant-declaration');
        expect(result.declaration.label).toContain('<div id="declaration">');
        expect(result.declaration.value).toBe('i-agree');
        expect(result.declaration.valueLabel).toBe('I have read and understood the declaration');
    });

    it('Should keep hideOnSummary flags.', () => {
        result = transformQuestionnaire(questionnaireObj);
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
            questionnaireDef: questionnaireFixture,
            logger: loggerMock
        });

        expect(result).toEqual('Success');
    });

    it('Should throw an error for unknown AWS communication failure ', async () => {
        const error = new VError('Failed to retrieve modified date');
        mockDb.mockImplementation(() => ({
            getQuestionnaireModifiedDate: () => new Date('July 20, 2023 00:00:00')
        }));

        mockS3.mockImplementation(() => ({
            uploadFile: () => {
                throw error;
            }
        }));

        await expect(async () => {
            await transformAndUpload({
                questionnaireDef: questionnaireFixture,
                logger: loggerMock
            });
        }).rejects.toThrow(error);
    });

    it('Should throw an error for db communication failure ', async () => {
        const error = new VError('Failed to retrieve modified date');
        mockDb.mockImplementation(() => ({
            getQuestionnaireModifiedDate: () => {
                throw error;
            }
        }));

        await expect(async () => {
            await transformAndUpload({
                questionnaireDef: questionnaireFixture,
                logger: loggerMock
            });
        }).rejects.toThrow(error);
    });

    it('Should transform correctly and set isAuthenticated to true within in the metadata.', () => {
        const questionnaireObjWithOrigin = questionnaire({
            questionnaireDefinition: questionnaireFixtureWithOrigin
        });

        const transformedQuestionnaire = transformQuestionnaire(questionnaireObjWithOrigin);
        expect(transformedQuestionnaire).toHaveProperty('meta');
        expect(transformedQuestionnaire.meta).toHaveProperty('owner');
        expect(transformedQuestionnaire.meta.owner).toHaveProperty('ownerId');
        expect(transformedQuestionnaire.meta.owner.ownerId).toBe(
            'urn:abc:test.uk:2001:A3vCv24d7c8mBNs'
        );
        expect(transformedQuestionnaire.meta.owner).toHaveProperty('isAuthenticated');
        expect(transformedQuestionnaire.meta.owner.isAuthenticated).toBe(true);
    });

    it('Should transform correctly and set isAuthenticated to false within in the metadata.', () => {
        const questionnaireObjWithOrigin = questionnaire({
            questionnaireDefinition: questionnaireFixtureAuthenticatedFalse
        });

        const transformedQuestionnaire = transformQuestionnaire(questionnaireObjWithOrigin);
        expect(transformedQuestionnaire).toHaveProperty('meta');
        expect(transformedQuestionnaire.meta).toHaveProperty('owner');
        expect(transformedQuestionnaire.meta.owner).toHaveProperty('ownerId');
        expect(transformedQuestionnaire.meta.owner.ownerId).toBe('urn:A3vCv24d7c8mBNs');
        expect(transformedQuestionnaire.meta.owner).toHaveProperty('isAuthenticated');
        expect(transformedQuestionnaire.meta.owner.isAuthenticated).toBe(false);
    });

    it('Should transform correctly when owner is not present', () => {
        const transformedQuestionnaire = transformQuestionnaire(questionnaireObj);
        expect(transformedQuestionnaire).toHaveProperty('meta');
        expect(transformedQuestionnaire.meta).not.toHaveProperty('owner');
    });
});
