'use strict';

const createMessageBusCaller = require('./index');

describe('Message Bus', () => {
    let messageBus;
    beforeEach(async () => {
        messageBus = createMessageBusCaller({logger: {info: x => x}});
    });
    describe('Submission Queue', () => {
        it('should submit to queue', async () => {
            const response = await messageBus.post('SubmissionQueue', {
                applicationId: 'valid-application-id'
            });
            expect(response.body).toBe('Message sent');
        });

        it('should fail with an invalid application ID', async () => {
            const response = await messageBus.post('SubmissionQueue', {
                applicationId: 'invalid-application-id'
            });
            expect(response.body).toBe('FAIL invalid app id');
        });

        it('should fail with a duplicate application ID', async () => {
            const response = await messageBus.post('SubmissionQueue', {
                applicationId: 'duplicate-application-id'
            });
            expect(response.body).toBe('FAIL duplicate  app id');
        });
    });

    describe('Notification Queue', () => {
        it('should submit to queue', async () => {
            const response = await messageBus.post('NotificationQueue', {
                templateId: 'valid-template-id'
            });
            expect(response.body).toBe('Message sent');
        });

        it('should fail with an invalid template ID', async () => {
            const response = await messageBus.post('SubmissionQueue', {
                templateId: 'invalid-template-id'
            });
            expect(response.body).toBe('FAIL invalid template id');
        });

        it('should allow extra properties to be passed to queue', async () => {
            const response = await messageBus.post('SubmissionQueue', {
                templateId: 'valid-template-id',
                needed1: true,
                needed2: 'foo',
                optionalParam: 'hello',
                notNeeded: 'bar'
            });
            expect(response.body).toBe('Message sent');
        });
    });
});
