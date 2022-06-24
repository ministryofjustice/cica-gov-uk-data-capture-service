'use strict';

const got = require('got');
const merge = require('lodash.merge');

function createRequestService() {
    function post(options) {
        let opts = {
            method: 'POST',
            headers: {
                accept: 'application/vnd.api+json',
                'Content-Type': 'application/vnd.api+json'
            },
            responseType: 'json'
        };
        opts = merge(opts, options);
        return got(opts);
    }

    function get(options) {
        let opts = {
            method: 'GET',
            headers: {
                accept: 'application/vnd.api+json',
                'Content-Type': 'application/vnd.api+json'
            },
            responseType: 'json'
        };
        opts = merge(opts, options);
        return got(opts);
    }

    function patch(options) {
        let opts = {
            method: 'PATCH',
            headers: {
                accept: 'application/vnd.api+json',
                'Content-Type': 'application/vnd.api+json'
            },
            responseType: 'json'
        };
        opts = merge(opts, options);
        return got(opts);
    }

    return Object.freeze({
        post,
        get,
        patch
    });
}

module.exports = createRequestService;
