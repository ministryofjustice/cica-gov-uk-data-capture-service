'use strict';

// const notificationNodeClient = require('notifications-node-client');
const createSqsNotifyService = require('../sqs');

// const {NotifyClient} = notificationNodeClient;
// const apiKey = process.env.NOTIFY_API_KEY;
// const sharedNotifyClient = new NotifyClient(apiKey);

function createNotifyService(spec) {
    // const {logger, notifyClient = sharedNotifyClient} = spec;
    const {logger} = spec;

    // https://github.com/axios/axios/issues/4080
    /*  function normaliseSmsSendRequestError(error) {
        const isApiResponseError = error.response !== undefined;

        if (isApiResponseError) {
            return error.response.data.errors;
        }

        const requestError = [
            {
                error: error.code,
                message: error.message
            }
        ];

        return requestError;
    } */

    async function sendSms(options) {
        let response;
        try {
            /* const smsSendRequest = await notifyClient.sendSms(
                options.templateId,
                options.phoneNumber,
                {
                    personalisation: {
                        caseReference: options.personalisation.caseReference
                    },
                    reference: null
                }
            ); */

            // sqs service
            const sqsNotifyQueue = createSqsNotifyService(spec);

            response = await sqsNotifyQueue.post({
                templateId: options.templateId,
                phoneNumber: options.phoneNumber,
                personalisation: {
                    caseReference: options.personalisation.caseReference
                },
                reference: null
            });
            logger.info({response}, 'SEND NOTIFY SUCCESS');

            // This DOES NOT indicate that the sms was successfully delivered,
            // only that the request to send the sms was successful. In future, the id
            // could be used to further query the status of the request.
            /* return {
                id: smsSendRequest.data.id
            }; */
        } catch (err) {
            /* const normalisedError = normaliseSmsSendRequestError(err);

            logger.error(normalisedError, 'SMS SEND FAILURE'); */

            logger.info(err, 'SMS SEND FAILURE');
            logger.info(response);
        }

        return response;
    }

    async function sendEmail(options) {
        let response;
        try {
            // message bus service
            // const messageBus = createMessageBusCaller(spec);

            // sqs service
            const sqsNotifyQueue = createSqsNotifyService(spec);

            response = await sqsNotifyQueue.post({
                templateId: options.templateId,
                emailAddress: options.emailAddress,
                personalisation: {
                    caseReference: options.personalisation.caseReference
                },
                reference: null
            });
            logger.info({response}, 'SEND NOTIFY SUCCESS');
        } catch (err) {
            logger.info({code: err.code}, 'EMAIL SEND FAILURE');
            logger.info(response);
        }
        return response;
    }

    return Object.freeze({
        sendSms,
        sendEmail
    });
}

module.exports = createNotifyService;
