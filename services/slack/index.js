'use strict';

const messageBodies = require('./message-body-templates');
const slackApps = require('./slack-apps');
const webhook = require('./lib/webhook');

function createSlackService() {
    async function sendMessage({
        appReference = 'dev.reporter.webhook',
        messageBodyId,
        templateParameters = {}
    }) {
        if (!(messageBodyId in messageBodies)) {
            throw Error(`Message body id "${messageBodyId}" not found`);
        }

        let appReferenceValue = slackApps;
        const appReferenceSplit = appReference.split('.');
        const method = appReferenceSplit[appReferenceSplit.length - 1];
        try {
            for (let i = 0, keys = appReferenceSplit, len = keys.length; i < len; i += 1) {
                appReferenceValue = appReferenceValue[keys[i]];
            }
        } catch (err) {
            // example `aaa.bbb.ccc`.
            // thrown if `aaa` (or any other "non-trailing" property) doesn't resolve within the object.
            throw Error(`Slack app reference id "${appReference}" not found`);
        }

        if (method === 'webhook') {
            return webhook(appReferenceValue, messageBodies[messageBodyId](templateParameters));
        }

        // example `aaa.bbb.ccc`.
        // thrown if `ccc` (the "trailing" property) doesn't resolve within the object.
        // i.e. if the `method` variable oes not satisfy any of the if conditions above.
        throw Error(`Slack app reference id "${appReference}" not found`);
    }

    return Object.freeze({
        sendMessage
    });
}

module.exports = createSlackService;
