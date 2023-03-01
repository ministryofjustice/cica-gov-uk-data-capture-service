'use strict';

const AWS = require('aws-sdk');

AWS.config = new AWS.Config();
AWS.config.update({
    region: 'eu-west-2',
    accessKeyId: process.env.DCS_SQS_ACCESS_KEY_ID,
    secretAccessKey: process.env.DCS_SQS_SECRET_ACCESS_KEY
});

function createSqsNotifyService(opts) {
    const {logger} = opts;
    delete opts.logger;

    async function post(payload) {
        try {
            let sqs;

            const msgParams = {
                QueueUrl: process.env.NOTIFY_AWS_SQS_ID,
                MessageBody: JSON.stringify(payload)
            };

            if (!sqs) {
                sqs = new AWS.SQS({apiVersion: '2012-11-05'});
            }

            const response = await sqs.sendMessage(msgParams).promise();
            logger.info(response, 'NOTIFICATION SQS SERVICE CALLED');
            return response;
        } catch (err) {
            logger.error({code: err.code}, 'EMAIL SEND FAILURE');
            return null;
        }
    }

    return Object.freeze({
        post
    });
}

module.exports = createSqsNotifyService;
