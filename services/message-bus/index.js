'use strict';

const createRequestService = require('../request-service');

function createMessageBusCaller(opts) {
    const {logger} = opts;
    const requestService = createRequestService();
    async function post(queueName, payload) {
        const hrstart = process.hrtime();

        const options = {
            url: `${process.env.MESSAGE_BUS_SERVICE}/api/message/?destination=queue://${queueName}`, // SubmissionQueue
            headers: {
                Authorization: `Basic ${Buffer.from(process.env.MB_AUTH).toString('base64')}`,
                accept: 'text/html', // the response at the moment is the string 'Message sent'.
                'Content-Type': 'application/json'
            },
            json: false,
            body: JSON.stringify(payload)
        };

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
