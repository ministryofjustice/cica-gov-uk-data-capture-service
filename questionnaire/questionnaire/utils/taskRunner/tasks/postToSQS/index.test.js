'use strict';

const {buildMessageBody} = require('.');
const questionnaireFixture = require('../../../../../test-fixtures/res/questionnaireCompleteForCheckYourAnswers');

describe('Post To SQS Task', () => {
    it('Should create the correct message body.', () => {
        const messageBody = buildMessageBody(questionnaireFixture.id);
        expect(messageBody).toEqual(
            `{"applicationJSONDocumentSummaryKey": "${questionnaireFixture.id}.json"`
        );
    });
});
