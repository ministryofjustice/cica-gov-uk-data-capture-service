'use strict';

jest.mock('got');

const got = require('got');

got.mockImplementation((url, options) => {
    if (options.method === 'POST') {
        return Promise.resolve('Message sent');
    }
    return Promise.resolve('Message sent');
});

const createMessageBusService = require('./index');

const messageBusService = createMessageBusService({logger: {info: () => {}}});

describe('Message Bus Service', () => {
    describe('post', () => {
        process.env.MESSAGE_BUS_CREDENTIALS = 'authstring';
        it('should send post request to message bus', async () => {
            const response = await messageBusService.post('NotificationQueue', {
                templateId: 'some-template-id',
                emailAddress: 'email@domain.com',
                personalisation: {
                    case_reference: 'case-reference-number'
                },
                reference: null
            });
            expect(response).toBe('Message sent');
        });
    });
});
