/* eslint-disable global-require, no-unused-vars */

'use strict';

let createSlackService;
const fixtureMessageBodyTemplates = require('./fixtures/message-body-templates');

describe('Message Body Templates', () => {
    let messageBodyTemplates;
    beforeEach(() => {
        messageBodyTemplates = require('./message-body-templates');
    });

    it('should replace dynamic content', () => {
        const result = messageBodyTemplates['message-bus-down']({
            timeStamp: 1637396430480
        });

        expect(result).toEqual(fixtureMessageBodyTemplates);
    });
});

describe('Slack Service', () => {
    beforeEach(() => {
        jest.mock('./message-body-templates', () => ({
            'message-bus-down': () => 'message-bus-down-body',
            'jest-test-fail-body': () => 'testfail'
        }));
        jest.mock('@slack/webhook', () => {
            function IncomingWebhook() {
                this.send = requestBody => {
                    if (requestBody === 'testfail') {
                        const err = Error(`Bad request`);
                        err.name = 'HTTPError';
                        err.statusCode = 400;
                        err.error = '400 Bad Request';
                        return Promise.reject(err);
                    }
                    return {text: 'ok'};
                };
            }

            return {IncomingWebhook};
        });

        const slackWebhook = require('@slack/webhook');
        createSlackService = require('./index');
    });

    it('should error if message template is not found', async () => {
        const slackService = createSlackService();
        await expect(
            slackService.sendMessage({
                appReference: 'dev.reporter.webhook',
                messageBodyId: 'this-template-doesnt-exist',
                templateParameters: {
                    timeStamp: new Date().getTime()
                }
            })
        ).rejects.toThrow('Message body id "this-template-doesnt-exist" not found');
    });

    it('should error if app reference prefix is not found', async () => {
        const slackService = createSlackService();
        await expect(
            slackService.sendMessage({
                appReference: 'doesnt-exist.reporter.webhook',
                messageBodyId: 'message-bus-down',
                templateParameters: {
                    timeStamp: new Date().getTime()
                }
            })
        ).rejects.toThrow('Slack app reference id "doesnt-exist.reporter.webhook" not found');
    });

    it('should error if app reference suffix is not found', async () => {
        const slackService = createSlackService();
        await expect(
            slackService.sendMessage({
                appReference: 'dev.reporter.doesnt-exist',
                messageBodyId: 'message-bus-down',
                templateParameters: {
                    timeStamp: new Date().getTime()
                }
            })
        ).rejects.toThrow('Slack app reference id "dev.reporter.doesnt-exist" not found');
    });

    it('should send a Slack message', async () => {
        const slackService = createSlackService();
        const response = await slackService.sendMessage({
            appReference: 'dev.reporter.webhook',
            messageBodyId: 'message-bus-down',
            templateParameters: {
                timeStamp: new Date().getTime()
            }
        });
        expect(response).toEqual({text: 'ok'});
    });

    it('should not send a Slack message', async () => {
        const slackService = createSlackService();
        await expect(
            slackService.sendMessage({
                appReference: 'dev.reporter.webhook',
                messageBodyId: 'jest-test-fail-body',
                templateParameters: {
                    timeStamp: new Date().getTime()
                }
            })
        ).rejects.toThrow('Bad request');
    });
});
