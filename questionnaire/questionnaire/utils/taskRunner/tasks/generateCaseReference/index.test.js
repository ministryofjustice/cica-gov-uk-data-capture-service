'use strict';

const {getIsFatal, getIsSplit, updateCaseReferenceWithYear} = require('.');
const questionnaireFixture = require('../../../../../test-fixtures/res/questionnaireCompleteForCheckYourAnswers');

describe('Generate Case reference', () => {
    it('Should get false for isFatal if not fatal', () => {
        const isFatal = getIsFatal(questionnaireFixture);
        expect(isFatal).toBeFalsy();
    });

    it('Should get false for isSplit if not fatal', () => {
        const isFatal = getIsSplit(questionnaireFixture);
        expect(isFatal).toBeFalsy();
    });

    it('Should format the case reference correctly', () => {
        const referenceNumber = '123456';
        const dateModified = new Date(2022, 1, 1);

        const caseReference = updateCaseReferenceWithYear(referenceNumber, dateModified);

        expect(caseReference).toBe('22\\123456');
    });
});
