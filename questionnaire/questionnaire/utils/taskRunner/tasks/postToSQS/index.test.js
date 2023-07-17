'use strict';

const VError = require('verror');
const {buildMessageBody, sendSubmissionMessageToSQS} = require('.');
const questionnaireFixture = require('../../../../../test-fixtures/res/questionnaireCompleteForCheckYourAnswers');
const mockSqsService = require('../../../../../../services/sqs');

const mockLogger = {
    info: jest.fn(),
    error: jest.fn()
};

const mockSendSqsResponse = require('../../../../../test-fixtures/res/post_submissionQueue.json');

jest.mock('../../../../../../services/sqs');

describe('Post To SQS Task', () => {
    beforeEach(() => {
        jest.resetModules();
    });

    it('Should create the correct message body.', () => {
        const messageBody = buildMessageBody(questionnaireFixture.id);
        expect(messageBody).toEqual(
            `{"applicationJSONDocumentSummaryKey": "test/${questionnaireFixture.id}.json"}`
        );
    });

    it('Should send message to SQS', async () => {
        mockSqsService.mockImplementation(() => ({
            send: () => mockSendSqsResponse
        }));
        const data = {
            questionnaire: questionnaireFixture,
            logger: mockLogger
        };
        const messageResult = await sendSubmissionMessageToSQS(data);

        expect(messageResult).toEqual({MessageId: '1247575728746', body: 'Message sent'});
    });

    it('Should error if message fails to send', async () => {
        mockSqsService.mockImplementation(() => ({
            send: () => {
                'message failed to send';
            }
        }));
        const data = {
            questionnaire: questionnaireFixture,
            logger: mockLogger
        };

        await expect(sendSubmissionMessageToSQS(data)).rejects.toThrow(VError);
    });
});
