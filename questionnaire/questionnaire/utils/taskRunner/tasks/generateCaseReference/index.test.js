'use strict';

const {getIsFatal, updateCaseReferenceWithYear} = require('.');
const questionnaireFixture = require('../../../../../test-fixtures/res/questionnaireCompleteForCheckYourAnswers');

describe('Integration Service', () => {
    it('Should get false for isFatal if not fatal', () => {
        const isFatal = getIsFatal(questionnaireFixture);
        expect(isFatal).toBeFalsy();
    });

    it('Should format the case reference correctly', () => {
        const referenceNumber = '123456';
        const dateModified = new Date(2022, 1, 1);

        const caseReference = updateCaseReferenceWithYear(referenceNumber, dateModified);

        expect(caseReference).toBe('22\\123456');
    });
});
