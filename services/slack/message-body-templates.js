'use strict';

const moment = require('moment-timezone');

moment.tz.setDefault('Europe/London');

module.exports = {
    'message-bus-down': templateParams => {
        const environmentSentenceCase = `${process.env.APP_ENV.charAt(
            0
        ).toUpperCase()}${process.env.APP_ENV.substr(1).toLowerCase()}`;

        return {
            text: `${environmentSentenceCase} Message Bus connectivity issue!`,
            blocks: [
                {
                    type: 'header',
                    text: {
                        type: 'plain_text',
                        text: `${environmentSentenceCase} Message Bus connectivity issue!`
                    }
                },
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: `<!channel>\nUnable to connect to the *${environmentSentenceCase} environment Message Bus*. Please investigate and *notify the relevant staff*.`
                    }
                }
            ],
            attachments: [
                {
                    color: '#ff3e3e',
                    blocks: [
                        {
                            type: 'section',
                            text: {
                                type: 'mrkdwn',
                                text: `Error: Unable to create case.\nThe *${environmentSentenceCase} Message Bus is currently not contactable* from the Data Capture Service.\n Unable to add message to the \`SubmissionQueue\`.`
                            }
                        },
                        {
                            type: 'divider'
                        },
                        {
                            type: 'section',
                            text: {
                                type: 'mrkdwn',
                                text: `*Environment:* ${environmentSentenceCase} \n *Datetime:* ${moment(
                                    templateParams.timeStamp
                                ).format('DD/MM/YYYY HH:mm:ss.SSS')} \n *Datetime ISO:* ${moment(
                                    templateParams.timeStamp
                                ).toISOString(true)}`
                            }
                        }
                    ]
                }
            ]
        };
    }
};
