'use strict';

const AWS = require('aws-sdk');

AWS.config = new AWS.Config();
AWS.config.update({
    region: 'eu-west-2',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

function createSqsService(opts) {
    const {logger} = opts;
    delete opts.logger;

    async function post(payload) {
        let sqs;
        const msgParams = {
            QueueUrl: process.env.AWS_QUEUE_ID,
            MessageBody: JSON.stringify(payload)
        };

        if (!sqs) {
            sqs = new AWS.SQS({apiVersion: '2012-11-05'});
        }

        const response = await sqs.sendMessage(msgParams).promise();

        logger.info(response, 'MESSAGE BUS CALLED');
        return response;
    }

    return Object.freeze({
        post
    });
}

module.exports = createSqsService;
