'use strict';

const createCaseReferenceService = require('.');
const testQuestionare = require('./test-fixtures/example-answers.json');
const testQuestionareFatal = require('./test-fixtures/example-answers-made-fatal.json');

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
});
