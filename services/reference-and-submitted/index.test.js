'use strict';

const createCaseReferenceService = require('.');
const testQuestionare = require('./test-fixtures/applicant-adult-email.json');
const testQuestionareFatal = require('./test-fixtures/made-fatal-for-test.json');

describe('createIdentifyQuestionareService', () => {
    describe('checkClaimType', () => {
        it('Should return a bool false when not fatal ', async () => {
            const caseReferenceService = createCaseReferenceService({logger: jest.fn()});
            await expect(caseReferenceService.checkClaimType(testQuestionare)).toEqual(
                Boolean(false)
            );
        });

        it('Should return a bool true when fatal', async () => {
            const caseReferenceService = createCaseReferenceService({logger: jest.fn()});
            await expect(caseReferenceService.checkClaimType(testQuestionareFatal)).toEqual(
                Boolean(true)
            );
        });
    });

    describe('questionnaireCustomFilter', () => {
        it('Should return an object with sectionId', async () => {
            const caseReferenceService = createCaseReferenceService({logger: jest.fn()});
            await expect(
                caseReferenceService.questionnaireCustomFilter(testQuestionare)
            ).toHaveProperty('sectionId');
        });

        it('Should return an object with a value property', async () => {
            const caseReferenceService = createCaseReferenceService({logger: jest.fn()});
            await expect(
                caseReferenceService.questionnaireCustomFilter(testQuestionare)
            ).toHaveProperty('value');
        });
    });
});
