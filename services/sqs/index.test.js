'use strict';

const {mockClient} = require('aws-sdk-client-mock');
const {SQSClient} = require('@aws-sdk/client-sqs');
const createSqsService = require('./index.js');

const mockLogger = {
    info: jest.fn(),
    error: jest.fn()
};

const options = {logger: mockLogger};

describe('SQS Service', () => {
    const sqsService = createSqsService(options);
    const sqsClientMock = mockClient(SQSClient);

    beforeEach(() => {
        sqsClientMock.reset();
    });

    const payload = {Test: 'foo', Test2: 'bar'};

    const queueUrl = 'some-url';

    it('Should successfully send a message to the sqs queue', async () => {
        await sqsService.send(payload, queueUrl);
        expect(sqsClientMock.call(0).args[0].input).toEqual({
            QueueUrl: queueUrl,
            MessageBody: JSON.stringify(payload)
        });
    });

    const wrongTestPayload = 9007199254740991n;

    it('Should error gracefully', async () => {
        await expect(() => sqsService.send(wrongTestPayload, queueUrl)).rejects.toThrowError(
            'Message failed to send with the following error: TypeError: Do not know how to serialize a BigInt'
        );
    });
});
