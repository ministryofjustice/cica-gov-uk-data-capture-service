'use strict';

/*! m0-start */
const config = {
    testEnvironment: 'node'
};
/*! m0-end */

process.env.DCS_JWT_SECRET = '123';
process.env.DCS_LOG_LEVEL = 'silent';
process.env.MESSAGE_BUS_CREDENTIALS = 'somecredentials123';

/*! m0-start */
module.exports = config;
/*! m0-end */
