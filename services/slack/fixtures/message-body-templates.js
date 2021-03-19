'use strict';

module.exports = {
    text: 'Test Message Bus connectivity issue!',
    blocks: [
        {
            type: 'header',
            text: {
                type: 'plain_text',
                text: 'Test Message Bus connectivity issue!'
            }
        },
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text:
                    '<!channel>\nUnable to connect to the *Test environment Message Bus*. Please investigate and *notify the relevant staff*.'
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
                        text:
                            'Error: Unable to create case.\nThe *Test Message Bus is currently not contactable* from the Data Capture Service.\n Unable to add message to the `SubmissionQueue`.'
                    }
                },
                {
                    type: 'divider'
                },
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text:
                            '*Environment:* Test \n *Datetime:* 20/11/2021 08:20:30.480 \n *Datetime ISO:* 2021-11-20T08:20:30.480+00:00'
                    }
                }
            ]
        }
    ]
};
