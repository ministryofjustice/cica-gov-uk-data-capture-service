'use strict';

jest.mock('got');

const got = require('got');

got.mockImplementation((url, options) => {
    if (options.method === 'POST') {
        return Promise.resolve({
            body: {
                data: {
                    product: options.body.data.attributes.operand * 2
                }
            }
        });
    }
    if (options.method === 'PATCH') {
        return Promise.resolve({
            body: {
                data: [
                    {
                        type: 'answers',
                        id: 'p-applicant-british-citizen-or-eu-national',
                        attributes: {
                            'q-applicant-british-citizen-or-eu-national': true
                        }
                    },
                    {
                        type: 'answers',
                        id: 'p-applicant-are-you-18-or-over',
                        attributes: {
                            'q-applicant-are-you-18-or-over': true
                        }
                    }
                ]
            }
        });
    }
    if (options.method === 'GET') {
        return Promise.resolve({
            body: {
                data: [
                    {
                        type: 'answers',
                        id: 'p-applicant-british-citizen-or-eu-national',
                        attributes: {
                            'q-applicant-british-citizen-or-eu-national': true
                        }
                    },
                    {
                        type: 'answers',
                        id: 'p-applicant-are-you-18-or-over',
                        attributes: {
                            'q-applicant-are-you-18-or-over': true
                        }
                    }
                ]
            }
        });
    }

    return Promise.resolve({
        body: '<html>this is a html string!!</html>'
    });
});

const createRequestService = require('./index');

const requestService = createRequestService();

describe('Request Service', () => {
    describe('post', () => {
        it('should patch a web resource', async () => {
            const response = await requestService.post({
                url: 'http://localhost:3100/some-url/',
                body: {
                    data: {
                        type: 'multiplication',
                        attributes: {
                            operand: 4
                        }
                    }
                }
            });
            expect(response.body.data.product).toBe(8);
        });
    });

    describe('get', () => {
        it('should get a response from a web resource', async () => {
            const response = await requestService.get({
                url: 'http://localhost:3100/some-url/'
            });
            expect(response.body).toStrictEqual({
                data: [
                    {
                        type: 'answers',
                        id: 'p-applicant-british-citizen-or-eu-national',
                        attributes: {
                            'q-applicant-british-citizen-or-eu-national': true
                        }
                    },
                    {
                        type: 'answers',
                        id: 'p-applicant-are-you-18-or-over',
                        attributes: {
                            'q-applicant-are-you-18-or-over': true
                        }
                    }
                ]
            });
        });
    });

    describe('patch', () => {
        it('should post a response to a web resource', async () => {
            const response = await requestService.patch({
                url: 'http://localhost:3100/some-url/',
                body: {
                    data: [
                        {
                            type: 'answers',
                            id: 'p-applicant-british-citizen-or-eu-national',
                            attributes: {
                                'q-applicant-british-citizen-or-eu-national': true
                            }
                        },
                        {
                            type: 'answers',
                            id: 'p-applicant-are-you-18-or-over',
                            attributes: {
                                'q-applicant-are-you-18-or-over': true
                            }
                        }
                    ]
                }
            });
            expect(response.body).toStrictEqual({
                data: [
                    {
                        type: 'answers',
                        id: 'p-applicant-british-citizen-or-eu-national',
                        attributes: {
                            'q-applicant-british-citizen-or-eu-national': true
                        }
                    },
                    {
                        type: 'answers',
                        id: 'p-applicant-are-you-18-or-over',
                        attributes: {
                            'q-applicant-are-you-18-or-over': true
                        }
                    }
                ]
            });
        });
    });
});
