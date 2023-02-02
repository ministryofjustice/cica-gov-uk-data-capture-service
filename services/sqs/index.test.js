'use strict';

describe('AWS-SQS', () => {
    beforeEach(() => {
        jest.resetModules();
    });

    const mockLogger = {
        info: jest.fn(),
        error: jest.fn()
    };

    it('Should successfully send a message to the sqs queue', async () => {
        jest.mock('aws-sdk', () => {
            return {
                SQS: jest.fn().mockImplementation(() => {
                    return {
                        sendMessage: jest.fn().mockReturnThis(),
                        promise: jest.fn(() => {
                            return 'OK!';
                        })
                    };
                }),
                Config: jest.fn().mockImplementation(() => {
                    return {
                        update() {
                            return {};
                        }
                    };
                })
            };
        });
        // eslint-disable-next-line global-require
        const createSqsService = require('.');
        const options = {
            logger: mockLogger
        };

        const sqsService = createSqsService(options);
        const response = await sqsService.send({test: 'sqs.test.js'}, 'some-url');

        expect(response).toEqual('OK!');
    });

    it('Should error gracefully', async () => {
        jest.mock('aws-sdk', () => {
            return {
                SQS: jest.fn().mockImplementation(() => {
                    return {
                        sendMessage: jest.fn().mockReturnThis(),
                        promise: jest.fn(() => {
                            throw new Error('TEST ERROR');
                        })
                    };
                }),
                Config: jest.fn().mockImplementation(() => {
                    return {
                        update() {
                            return {};
                        }
                    };
                })
            };
        });
        // eslint-disable-next-line global-require
        const createSqsService = require('.');
        const options = {
            logger: mockLogger
        };

        const sqsService = createSqsService(options);
        await expect(sqsService.send({test: 'sqs.test.js'}, 'some-url')).rejects.toThrow(
            'TEST ERROR'
        );
    });
});
