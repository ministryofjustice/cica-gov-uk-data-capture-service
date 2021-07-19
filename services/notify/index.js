'use strict';

const notificationNodeClient = require('notifications-node-client');
const createMessageBusCaller = require('../message-bus');

const {NotifyClient} = notificationNodeClient;
const apiKey = process.env.NOTIFY_API_KEY;
const notifyClient = new NotifyClient(apiKey);

function createNotifyService(spec) {
    const {logger} = spec;
    async function sendSms(options) {
        let response;
        try {
            response = notifyClient.sendSms(options.templateId, options.phoneNumber, {
                personalisation: {
                    body: options.personalisation.body
                },
                reference: options.reference
            });
        } catch (err) {
            logger.error({err}, 'SMS SEND FAILURE');
        }

        return response;
    }

    async function sendEmail(options) {
        const messageBus = createMessageBusCaller(spec);
        return messageBus.post('NotificationQueue', {
            templateId: options.templateId,
            emailAddress: options.emailAddress,
            personalisation: {
                subject: options.personalisation.subject,
                body: options.personalisation.body
            },
            reference: options.reference
        });
    }

    return Object.freeze({
        sendSms,
        sendEmail
    });
}

module.exports = createNotifyService;
