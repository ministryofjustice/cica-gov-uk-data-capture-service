/*! m0-start */

'use strict';

const config = {
    testEnvironment: 'node'
};
/*! m0-end */

process.env.DCS_JWT_SECRET = '123';
process.env.DCS_LOG_LEVEL = 'silent';
process.env.NOTIFY_API_KEY = '123apiKey';
process.env.WEBHOOK_DEV_REPORTER_SLACK = 'webhook-url';
process.env.APP_ENV = 'test';
process.env.MESSAGE_BUS_CREDENTIALS = 'some-credentials';

config.coverageThreshold = {
    './!(db)/!(questionnaire-dal).js': {
        branches: 60,
        functions: 60,
        lines: 60,
        statements: 60
    },
    './db/*.js': {
        branches: 50,
        functions: 0,
        lines: 35,
        statements: 35
    },
    './questionnaire/questionnaire-dal.js': {
        branches: 0,
        functions: 0,
        lines: 9,
        statements: 9
    },
    './*/!(message-bus|notify|request|resources)/**/*.js': {
        statements: 54,
        branches: 60,
        functions: 50,
        lines: 56
    },
    './*/message-bus/**/*.js': {
        statements: 15,
        branches: 60,
        functions: 0,
        lines: 15
    },
    './*/notify/**/*.js': {
        statements: 42,
        branches: 60,
        functions: 0,
        lines: 42
    },
    './*/request/**/*.js': {
        statements: 23,
        branches: 60,
        functions: 0,
        lines: 23
    },
    './questionnaire/resources/section-resource.js': {
        statements: 80,
        branches: 50,
        functions: 100,
        lines: 80
    }
};

/*! m0-start */
module.exports = config;
/*! m0-end */
