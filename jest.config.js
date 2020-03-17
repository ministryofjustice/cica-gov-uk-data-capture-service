/*! m0-start */

'use strict';

const config = {
    testEnvironment: 'node'
};
/*! m0-end */

process.env.DCS_JWT_SECRET = '123';
process.env.DCS_LOG_LEVEL = 'silent';
process.env.NOTIFY_API_KEY = '123apiKey';

/*! m0-start */
module.exports = config;
/*! m0-end */

