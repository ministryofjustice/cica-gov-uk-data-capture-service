'use strict';

const AWS = require('aws-sdk');
const VError = require('verror');

AWS.config = new AWS.Config();
AWS.config.update({
    region: process.env.AWS_DEFAULT_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

function createSqsService(opts) {
    const {logger} = opts;
    delete opts.logger;

    async function send(payload, queueUrl) {
        let sqs;
        try {
            const msgParams = {
                QueueUrl: queueUrl,
                MessageBody: JSON.stringify(payload)
            };

            if (!sqs) {
                sqs = new AWS.SQS({apiVersion: '2012-11-05'});
            }

            const response = await sqs.sendMessage(msgParams).promise();
            logger.info(response, 'MESSAGE SENT');
            return response;
        } catch (err) {
            logger.error({code: err.code}, 'MESSAGE FAILED TO SEND');
            throw new VError(
                {
                    name: 'SendMessageFailed'
                },
                `Message failed to send with the following error: ${err}`
            );
        }
    }

    return Object.freeze({
        send
    });
}

module.exports = createSqsService;
