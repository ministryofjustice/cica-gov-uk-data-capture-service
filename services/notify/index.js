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
                    case_reference: options.personalisation.caseReference
                },
                reference: null
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
                case_reference: options.personalisation.caseReference
            },
            reference: null
        });
    }

    return Object.freeze({
        sendSms,
        sendEmail
    });
}

module.exports = createNotifyService;
