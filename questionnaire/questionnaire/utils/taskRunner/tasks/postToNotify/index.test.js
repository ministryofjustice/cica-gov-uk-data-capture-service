'use strict';

const VError = require('verror');
const questionnaireWithEmail = require('../test-fixtures/questionnaireCompleteForCheckYourAnswers');
const questionnaireWithSMS = require('../test-fixtures/questionnaireCompleteWithSMS.json');
const mockSqsService = require('../../../../../../services/sqs');
const sendNotifyMessageToSQS = require('.');

const mockLogger = {
    info: jest.fn(),
    error: jest.fn()
};

const mockSendSqsResponse = require('../../../../../test-fixtures/res/post_submissionQueue.json');

jest.mock('../../../../../../services/sqs');
describe('Post to Notify task', () => {
    let sendMock;
    beforeEach(() => {
        jest.resetModules();
        jest.resetAllMocks();
    });
    it('Should send an email if q-applicant-confirmation-method is email', async () => {
        sendMock = mockSqsService.mockImplementation(() => ({
            send: () => mockSendSqsResponse
        }));
        const data = {
            questionnaire: questionnaireWithEmail,
            logger: mockLogger
        };
        const messageResult = await sendNotifyMessageToSQS(data);
        expect(sendMock).toHaveBeenCalledTimes(1);
        expect(messageResult).toEqual({
            MessageId: '741d63a9-8883-4d3b-a6d1-5b93d4709854',
            body: 'Message sent'
        });
    });

    it('Should send an SMS if q-applicant-confirmation-method is SMS', async () => {
        sendMock = mockSqsService.mockImplementation(() => ({
            send: () => mockSendSqsResponse
        }));
        const data = {
            questionnaire: questionnaireWithSMS,
            logger: mockLogger
        };
        const messageResult = await sendNotifyMessageToSQS(data);
        expect(sendMock).toHaveBeenCalledTimes(1);
        expect(messageResult).toEqual({
            MessageId: '741d63a9-8883-4d3b-a6d1-5b93d4709854',
            body: 'Message sent'
        });
    });

    it('Should send an throw an error if the message fails to send', async () => {
        sendMock = mockSqsService.mockImplementation(() => ({
            send: () => {
                throw new Error('Failed to send message to Notify SQS');
            }
        }));
        const data = {
            questionnaire: questionnaireWithSMS,
            logger: mockLogger
        };

        const expectedError = new VError(`Failed to send message to Notify SQS`);
        await expect(sendNotifyMessageToSQS(data)).rejects.toThrow(expectedError);
        expect(sendMock).toHaveBeenCalledTimes(1);
        expect(mockLogger.info).toHaveBeenCalledTimes(1);
    });

    it('Should complete onCreate actions if the type is onCreate', async () => {
        sendMock = mockSqsService.mockImplementation(() => ({
            send: payload => payload
        }));
        const data = {
            questionnaire: questionnaireWithEmail,
            logger: mockLogger,
            type: 'onCreate'
        };
        const messageResult = await sendNotifyMessageToSQS(data);
        expect(sendMock).toHaveBeenCalledTimes(1);
        expect(messageResult).toEqual({
            reference: null,
            templateId: '00000000-aaaa-0000-aaaa-000000000000',
            emailAddress: 'foo@bar.com',
            personalisation: {
                caseReference: '12/34567',
                content: undefined
            }
        });
    });
});
