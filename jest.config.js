/*! m0-start */

'use strict';

const config = {
    testEnvironment: 'node'
};
/*! m0-end */

process.env.DCS_JWT_SECRET = '123';
process.env.DCS_LOG_LEVEL = 'silent';
process.env.NOTIFY_API_KEY = '123apiKey';

config.coverageThreshold = {
    './*/!(message-bus|notify|request)/**/*.js': {
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
    }
};

/*! m0-start */
module.exports = config;
/*! m0-end */
