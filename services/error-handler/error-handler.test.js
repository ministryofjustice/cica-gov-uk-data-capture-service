'use strict';

const VError = require('verror');
const createErrorHandler = require('./index');

const errorHandler = createErrorHandler();
const JSONSchemaValidationErrorsData = require('./test-fixtures/JSONSchemaValidationErrorsData');
const JSONSchemaValidationErrorsExpected = require('./test-fixtures/JSONSchemaValidationErrorsExpected');

describe('Error Handler Service', () => {
    describe('entity.parse.failed', () => {
        it('should return status, and JSON', async () => {
            const err = new Error('Request JSON is malformed');
            err.type = 'entity.parse.failed';
            const result = errorHandler.processError(err);
            const expected = {
                status: 400,
                json: {
                    errors: [
                        {
                            status: 400,
                            title: 'Bad Request',
                            detail: 'Request JSON is malformed'
                        }
                    ]
                }
            };
            expect(result).toStrictEqual(expected);
        });
    });

    // describe('status 400', () => {
    //     it('should return status, and JSON', async () => {
    //         const err = Error(`Bad request`);
    //         err.name = 'HTTPError';
    //         err.status = 400;
    //         err.error = '400 Bad Request';
    //         const result = errorHandler.processError(err);
    //         const expected = {
    //             status: 400,
    //             json: {
    //                 errors: [
    //                     {
    //                         status: 400,
    //                         title: '400 Bad Request',
    //                         detail: 'Request JSON is malformed'
    //                     }
    //                 ]
    //             }
    //         };
    //         expect(result).toStrictEqual(expected);
    //     });
    // });

    describe('JSONSchemaValidationError', () => {
        it('should return status, and JSON', async () => {
            const err = new VError({
                name: 'JSONSchemaValidationError',
                info: {
                    schema: {
                        type: 'object',
                        $schema: 'http://json-schema.org/draft-07/schema#',
                        required: ['q-applicant-british-citizen-or-eu-national'],
                        properties: {
                            'q-applicant-british-citizen-or-eu-national': {
                                type: 'boolean',
                                title: 'Are you a British citizen or EU national?'
                            }
                        },
                        errorMessage: {
                            required: {
                                'q-applicant-british-citizen-or-eu-national':
                                    'Select yes if you are a British citizen or EU national'
                            }
                        },
                        additionalProperties: false
                    },
                    answers: {},
                    coercedAnswers: {},
                    schemaErrors: [
                        {
                            keyword: 'errorMessage',
                            dataPath: '',
                            schemaPath: '#/errorMessage',
                            params: {
                                errors: [
                                    {
                                        keyword: 'required',
                                        dataPath: '',
                                        schemaPath: '#/required',
                                        params: {
                                            missingProperty:
                                                'q-applicant-british-citizen-or-eu-national'
                                        },
                                        message:
                                            "should have required property 'q-applicant-british-citizen-or-eu-national'"
                                    }
                                ]
                            },
                            message: 'Select yes if you are a British citizen or EU national'
                        }
                    ]
                }
            });

            const result = errorHandler.processError(err);
            const expected = {
                status: 400,
                json: {
                    errors: [
                        {
                            status: 400,
                            title: '400 Bad Request',
                            detail: 'Select yes if you are a British citizen or EU national',
                            code: 'errorMessage',
                            source: {
                                pointer: '/data/attributes'
                            },
                            meta: {
                                raw: {
                                    keyword: 'errorMessage',
                                    dataPath: '',
                                    schemaPath: '#/errorMessage',
                                    params: {
                                        errors: [
                                            {
                                                keyword: 'required',
                                                dataPath: '',
                                                schemaPath: '#/required',
                                                params: {
                                                    missingProperty:
                                                        'q-applicant-british-citizen-or-eu-national'
                                                },
                                                message:
                                                    "should have required property 'q-applicant-british-citizen-or-eu-national'"
                                            }
                                        ]
                                    },
                                    message:
                                        'Select yes if you are a British citizen or EU national'
                                }
                            }
                        }
                    ],
                    meta: {
                        schema: {
                            type: 'object',
                            $schema: 'http://json-schema.org/draft-07/schema#',
                            required: ['q-applicant-british-citizen-or-eu-national'],
                            properties: {
                                'q-applicant-british-citizen-or-eu-national': {
                                    type: 'boolean',
                                    title: 'Are you a British citizen or EU national?'
                                }
                            },
                            errorMessage: {
                                required: {
                                    'q-applicant-british-citizen-or-eu-national':
                                        'Select yes if you are a British citizen or EU national'
                                }
                            },
                            additionalProperties: false
                        },
                        answers: {}
                    }
                }
            };
            expect(result).toStrictEqual(expected);
        });
    });

    describe('JSONSchemaValidationErrors', () => {
        it('should return status, and JSON', async () => {
            const err = new VError(JSONSchemaValidationErrorsData);

            const result = errorHandler.processError(err);
            const expected = {
                status: 200,
                json: JSONSchemaValidationErrorsExpected
            };
            expect(result).toStrictEqual(expected);
        });
    });

    describe('UpdateNotSuccessful', () => {
        it('should return status, and JSON', async () => {
            const err = Error('Questionnaire "QUESTIONNAIRE_ID" was not updated successfully');
            err.name = 'UpdateNotSuccessful';
            err.statusCode = 500;
            err.error = '500 Internal Server Error';
            const result = errorHandler.processError(err);
            const expected = {
                status: 404,
                json: {
                    errors: [
                        {
                            status: 500,
                            title: 'UpdateNotSuccessful',
                            detail: 'Questionnaire "QUESTIONNAIRE_ID" was not updated successfully'
                        }
                    ]
                }
            };
            expect(result).toStrictEqual(expected);
        });
    });

    describe('400', () => {
        it('should return status, and JSON', async () => {
            const err = Error(`The request was not malformed`);
            err.name = 'HTTPError';
            err.statusCode = 400;
            err.error = '400 Bad Request';
            const result = errorHandler.processError(err);
            const expected = {
                status: 400,
                json: {
                    errors: [
                        {
                            status: 400,
                            title: '400 Bad Request',
                            detail: 'The request was not malformed'
                        }
                    ]
                }
            };
            expect(result).toStrictEqual(expected);
        });
    });

    describe('403', () => {
        it('should return status, and JSON', async () => {
            const err = Error(`Not allowed`);
            err.name = 'HTTPError';
            err.statusCode = 403;
            err.error = '400 Bad Request';
            const result = errorHandler.processError(err);
            const expected = {
                status: 403,
                json: {
                    errors: [
                        {
                            status: 403,
                            title: '403 Forbidden',
                            detail: 'Not allowed'
                        }
                    ]
                }
            };
            expect(result).toStrictEqual(expected);
        });
    });

    describe('404', () => {
        it('should return status, and JSON', async () => {
            const err = Error(`Resource not found`);
            err.name = 'HTTPError';
            err.statusCode = 404;
            err.error = '404 Not Found';
            const result = errorHandler.processError(err);
            const expected = {
                status: 404,
                json: {
                    errors: [
                        {
                            status: 404,
                            title: '404 Not Found',
                            detail: 'Resource not found'
                        }
                    ]
                }
            };
            expect(result).toStrictEqual(expected);
        });
    });

    describe('409', () => {
        it('should return status, and JSON', async () => {
            const err = Error(`Resource already exists`);
            err.name = 'HTTPError';
            err.statusCode = 409;
            err.error = '409 Conflict';
            const result = errorHandler.processError(err);
            const expected = {
                status: 409,
                json: {
                    errors: [
                        {
                            status: 409,
                            title: '409 Conflict',
                            detail: 'Resource already exists'
                        }
                    ]
                }
            };
            expect(result).toStrictEqual(expected);
        });
    });
});
