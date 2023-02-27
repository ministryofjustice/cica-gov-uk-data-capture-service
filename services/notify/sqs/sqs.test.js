'use strict';

const createSqsNotifyService = require('./index');

describe('AWS-SQS-NOTIFY', () => {
    it('Should successfully send a message to the notify sqs queue', async () => {
        const mockLogger = {info: jest.fn()};

        const testMessage = {
            templateId: '6a2d8cdf-c799-4e3b-967a-278e59cffbd6',
            emailAddress: 'foo@fbd962de-628b-4087-b452-410a36d00fef.gov.uk',
            personalisation: {
                caseReference: '21\\456789'
            },
            reference: null
        };
        const options = {
            logger: mockLogger
        };

        const sqsNotifyService = createSqsNotifyService(options);
        const response = await sqsNotifyService.post(testMessage);

        console.log(response);
        expect(response.MessageId).toBeDefined();
    });
});
