'use strict';

const slackWebhook = require('@slack/webhook');

async function handleWebhook(webhookUrl, requestBody) {
    try {
        const {IncomingWebhook} = slackWebhook;
        const webhook = new IncomingWebhook(webhookUrl);
        return await webhook.send(requestBody);
    } catch (error) {
        const err = Error(`Bad request`);
        err.name = 'HTTPError';
        err.statusCode = 400;
        err.error = '400 Bad Request';
        throw err;
    }
}

module.exports = handleWebhook;
