'use strict';

const merge = require('lodash.merge');
const createRequestService = require('../request');

function createMessageBusCaller(opts) {
    const {logger} = opts;
    delete opts.logger;
    // removing the logger from the opts as its unnecessary we are passing in the opts here in order
    // to test this functionality
    const requestService = createRequestService();

    async function post(queueName, payload) {
        const hrstart = process.hrtime();

        let options = {
            url: `${process.env.MESSAGE_BUS_URL}/api/message/?destination=queue://${queueName}`, // SubmissionQueue
            headers: {
                Authorization: `Basic ${Buffer.from(process.env.MESSAGE_BUS_CREDENTIALS).toString(
                    'base64'
                )}`,
                accept: 'text/plain', // the response at the moment is the string 'Message sent'.
                'Content-Type': 'application/json'
            },
            responseType: 'text',
            json: JSON.stringify(payload)
        };
        options = merge(options, opts);
        const response = await requestService.post(options);

        const hrend = process.hrtime(hrstart);
        const executionTime = {
            seconds: hrend[0],
            milliseconds: hrend[1] / 1000000
        };
        const duration = `${executionTime.seconds}s ${executionTime.milliseconds}ms`;

        logger.info(
            {request: {duration, executionTime, url: options.url, body: options.body}},
            'MESSAGE BUS CALLED'
        );
        return response;
    }

    return Object.freeze({
        post
    });
}

module.exports = createMessageBusCaller;
