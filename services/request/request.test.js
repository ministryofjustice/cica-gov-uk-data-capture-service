'use strict';

jest.mock('got');
const got = require('got');

const createRequestService = require('./index');

describe('Request', () => {
    const requestService = createRequestService();
    describe('POST', () => {
        it('should send a POST a request', async () => {
            const options = {
                url: 'https://mockwebsite.com/fakeurl.html',
                body: {foo: 'bar'}
            };

            const mergedOptions = {
                url: 'https://mockwebsite.com/fakeurl.html',
                method: 'POST',
                headers: {
                    accept: 'application/vnd.api+json',
                    'Content-Type': 'application/vnd.api+json'
                },
                json: true,
                body: {foo: 'bar'}
            };

            requestService.post(options);
            expect(got).toHaveBeenCalledWith(options.url, mergedOptions);
        });
    });

    describe('GET', () => {
        it('should send a GET a request', async () => {
            const options = {
                url: 'https://mockwebsite.com/fakeurl.html'
            };

            const mergedOptions = {
                url: 'https://mockwebsite.com/fakeurl.html',
                method: 'GET',
                headers: {
                    accept: 'application/json',
                    'Content-Type': 'application/json'
                },
                json: true
            };

            requestService.get(options);
            expect(got).toHaveBeenCalledWith(options.url, mergedOptions);
        });
    });

    describe('PATCH', () => {
        it('should send a PATCH a request', async () => {
            const options = {
                url: 'https://mockwebsite.com/fakeurl.html',
                body: {foo: 'bar'}
            };

            const mergedOptions = {
                url: 'https://mockwebsite.com/fakeurl.html',
                method: 'PATCH',
                headers: {
                    accept: 'application/vnd.api+json',
                    'Content-Type': 'application/vnd.api+json'
                },
                json: true,
                body: {foo: 'bar'}
            };

            requestService.patch(options);
            expect(got).toHaveBeenCalledWith(options.url, mergedOptions);
        });
    });
});
