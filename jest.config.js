'use strict';

/*! m0-start */
const config = {
    testEnvironment: 'node'
};
/*! m0-end */

process.env.SECRET = '123';
process.env.DCS_LOG_LEVEL = 'silent';

/*! m0-start */
module.exports = config;
/*! m0-end */
