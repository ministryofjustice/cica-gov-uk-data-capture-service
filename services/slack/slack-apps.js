'use strict';

module.exports = {
    dev: {
        reporter: {
            webhook: process.env.WEBHOOK_DEV_REPORTER_SLACK
        }
    },
    uat: {
        reporter: {
            webhook: process.env.WEBHOOK_TEAM_REPORTER_SLACK
        }
    },
    prod: {
        reporter: {
            webhook: process.env.WEBHOOK_SUPPORTTEAM_REPORTER_SLACK
        }
    }
};
