'use strict';

const {getIsFatal, getIsSplit, updateCaseReferenceWithYear, setCaseReference} = require('.');
const questionnaireFixture = require('../../../../../test-fixtures/res/questionnaireCompleteForCheckYourAnswers');
const fatalFixture = require('../../../../../test-fixtures/res/questionnaireCompleteForCheckYourAnswersSplitFatal');

const dbMock = {
    getReferenceNumber: jest.fn(() => '123456'),
    getQuestionnaireModifiedDate: jest.fn(() => new Date('July 20, 2023 00:00:00'))
};
const loggerMock = {
    info: jest.fn()
};

describe('Generate Case reference', () => {
    it('Should get false for isFatal if not fatal', () => {
        const isFatal = getIsFatal(questionnaireFixture);
        expect(isFatal).toBeFalsy();
    });

    it('Should get true for isFatal if fatal', () => {
        const isFatal = getIsFatal(fatalFixture);
        expect(isFatal).toBeTruthy();
    });

    it('Should get false for isSplit if not fatal', () => {
        const isFatal = getIsSplit(questionnaireFixture);
        expect(isFatal).toBeFalsy();
    });

    it('Should get true for isSplit if fatal and split', () => {
        const isFatal = getIsSplit(fatalFixture);
        expect(isFatal).toBeTruthy();
    });

    it('Should format the case reference correctly', () => {
        const referenceNumber = '123456';
        const dateModified = new Date(2022, 1, 1);

        const caseReference = updateCaseReferenceWithYear(referenceNumber, dateModified);

        expect(caseReference).toBe('22\\123456');
    });

    it('Should skip generation as already exists', async () => {
        const result = await setCaseReference(
            {questionnaire: questionnaireFixture, logger: loggerMock},
            dbMock,
            'case-reference'
        );
        expect(result.answers.system['case-reference']).toBe('19\\751194');
    });

    it('Should generate correct case reference and add it to asnwers object', async () => {
        // Reset existing CRN
        questionnaireFixture.answers.system['case-reference'] = undefined;

        const result = await setCaseReference(
            {questionnaire: questionnaireFixture, logger: loggerMock},
            dbMock,
            'case-reference'
        );

        expect(result.answers.system['case-reference']).toBe('23\\123456');
    });

    it('Should generate secondary reference as split fatal/funeral', async () => {
        const result = await setCaseReference(
            {questionnaire: fatalFixture, logger: loggerMock},
            dbMock,
            'secondary-reference'
        );
        expect(result.answers.system['secondary-reference']).toBe('23\\123456');
    });
});
