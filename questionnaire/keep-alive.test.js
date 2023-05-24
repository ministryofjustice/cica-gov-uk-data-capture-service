'use strict';

const VError = require('verror');
const request = require('supertest');
const {matchersWithOptions} = require('jest-json-schema');

const tokens = {
    'create:dummy-resource':
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJkYXRhLWNhcHR1cmUtc2VydmljZSIsImlzcyI6IiQuYXVkIiwianRpIjoiZTAwNGFiMWQtMjM2MC00YzVkLWE5NzktMGIzMDhiYmJkNTJlIiwic3ViIjoiJC5hdWQiLCJzY29wZSI6ImNyZWF0ZTpkdW1teS1yZXNvdXJjZSIsImlhdCI6MTU3MDAyNjEyNX0.CzoMlipu8aqqwN10KTlsiYABnyOiMC4UJ6dHfugTt3U',
    'update:questionnaires':
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJkYXRhLWNhcHR1cmUtc2VydmljZSIsImlzcyI6IiQuYXVkIiwianRpIjoiYzVjNzc4ZWQtNTg4NC00N2YwLWFiYzctZTQ1MmZiYWRlYTcyIiwic3ViIjoiJC5hdWQiLCJzY29wZSI6ImNyZWF0ZTpxdWVzdGlvbm5haXJlcyByZWFkOnF1ZXN0aW9ubmFpcmVzIHVwZGF0ZTpxdWVzdGlvbm5haXJlcyBkZWxldGU6cXVlc3Rpb25uYWlyZXMiLCJpYXQiOjE1NjQwNTgyNTF9.Adv1qgj-HiNGxw_0cdYpPO8Fbw12rgJTTqMReJUmFBs'
};

const getQuestionnaireResponse = require('./test-fixtures/res/get_questionnaire.js');

const questionnaires = [
    '285cb104-0c15-4a9c-9840-cb1007f098fb',
    '385cb104-0c15-4a9c-9840-cb1007f098fb'
];

// mock the DAL db integration
jest.doMock('./questionnaire-dal.js', () =>
    // return a modified factory function, that returns an object with a method, that returns a valid created response
    jest.fn(() => ({
        getQuestionnaire: questionnaireId => {
            if (questionnaires.includes(questionnaireId)) {
                return getQuestionnaireResponse;
            }

            throw new VError(
                {
                    name: 'ResourceNotFound'
                },
                `Questionnaire "${questionnaireId}" not found`
            );
        },
        getQuestionnaireSubmissionStatus: questionnaireId => {
            if (questionnaireId === '285cb104-0c15-4a9c-9840-cb1007f098fb') {
                return 'NOT_STARTED';
            }

            if (questionnaireId === '385cb104-0c15-4a9c-9840-cb1007f098fb') {
                return 'IN_PROGRESS';
            }

            throw new VError(
                {
                    name: 'ResourceNotFound'
                },
                `Questionnaire "${questionnaireId}" not found`
            );
        },
        getQuestionnaireModifiedDate: questionnaireId => {
            if (questionnaires.includes(questionnaireId)) {
                return new Date().toISOString();
            }

            throw new VError(
                {
                    name: 'ResourceNotFound'
                },
                `Questionnaire "${questionnaireId}" not found`
            );
        },
        updateQuestionnaireModifiedDate: () => undefined
    }))
);

// app has an indirect dependency on questionnaire-dal.js, require it after
// the mock so that it references the mocked version
const app = require('../app');

expect.extend(
    matchersWithOptions({
        allErrors: true,
        jsonPointers: true,
        format: 'full',
        coerceTypes: true
    })
);

const sessionResourceSchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'Sessions resource',
    allOf: [
        {
            $schema: 'http://json-schema.org/draft-07/schema#',
            title: 'Loosely describes the JSON:API document format',
            type: 'object',
            additionalProperties: false,
            required: ['data'],
            properties: {
                data: {anyOf: [{type: 'object'}, {type: 'array'}]},
                included: {type: 'array'},
                links: {type: 'object'},
                meta: {type: 'object'}
            }
        },
        {
            properties: {
                data: {
                    type: 'array',
                    items: {
                        $schema: 'http://json-schema.org/draft-07/schema#',
                        title: 'Session resource',
                        allOf: [
                            {
                                properties: {
                                    data: {
                                        type: 'array',
                                        items: {
                                            properties: {
                                                type: {const: 'sessions'},
                                                id: {
                                                    type: 'string',
                                                    pattern:
                                                        '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
                                                },
                                                attributes: {
                                                    type: 'object',
                                                    additionalProperties: false,
                                                    required: [
                                                        'alive',
                                                        'duration',
                                                        'created',
                                                        'expires'
                                                    ],
                                                    properties: {
                                                        alive: {
                                                            type: 'boolean'
                                                        },
                                                        duration: {
                                                            type: 'integer',
                                                            minimum: 1
                                                        },
                                                        created: {
                                                            type: 'integer'
                                                        },
                                                        expires: {
                                                            type: 'integer'
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        ]
                    }
                }
            }
        }
    ]
};
const sessionDuration = 1800000;
describe('/questionnaires/{questionnaireId}/session/keep-alive', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        // Override process.env object before each test case:
        process.env = {
            DCS_SESSION_DURATION: 1800000 //
        };
    });

    afterEach(() => {
        // Reset process.env value after each test case
        process.env = originalEnv;
    });

    describe('get', () => {
        describe('200', () => {
            it('should return extended session resource for an active in session unsubmitted application', async () => {
                const res = await request(app)
                    .get(
                        '/api/v1/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/session/keep-alive'
                    )
                    .set('Authorization', `Bearer ${tokens['update:questionnaires']}`);

                expect(res.statusCode).toBe(200);
                expect(res.type).toBe('application/vnd.api+json');
                const sessionResource = res.body.data[0].attributes;
                expect(sessionResource.alive).toBe(true);
                expect(sessionResource.duration).toBe(sessionDuration);
                expect(Date.now() > sessionResource.created).toBe(true);
                expect(Date.now() < sessionResource.expires).toBe(true);
                expect(res.body).toMatchSchema(sessionResourceSchema);
            });

            it('should return expired session resource for an IN_PROGRESS submitted application', async () => {
                const res = await request(app)
                    .get(
                        '/api/v1/questionnaires/385cb104-0c15-4a9c-9840-cb1007f098fb/session/keep-alive'
                    )
                    .set('Authorization', `Bearer ${tokens['update:questionnaires']}`);

                expect(res.statusCode).toBe(200);
                expect(res.type).toBe('application/vnd.api+json');
                const sessionResource = res.body.data[0].attributes;
                expect(sessionResource.alive).toBe(false);
                expect(sessionResource.duration).toBe(0);
                expect(Date.now() > sessionResource.created).toBe(true);
                expect(Date.now() > sessionResource.expires).toBe(true);
                expect(res.body).toMatchSchema(sessionResourceSchema);
            });
        });
        describe('400', () => {
            it('should There is an issue with the request', async () => {
                const res = await request(app)
                    .get('/api/v1/questionnaires/NOT-A-UUID/session/keep-alive')
                    .set('Authorization', `Bearer ${tokens['update:questionnaires']}`);

                expect(res.statusCode).toBe(400);
                expect(res.type).toBe('application/vnd.api+json');
                expect(res.body).toMatchSchema({
                    $schema: 'http://json-schema.org/draft-07/schema#',
                    type: 'object',
                    required: ['errors'],
                    properties: {
                        errors: {
                            type: 'array',
                            items: {
                                type: 'object',
                                required: ['status', 'title', 'detail'],
                                properties: {
                                    status: {const: 400},
                                    title: {const: '400 Bad Request'},
                                    detail: {type: 'string'}
                                }
                            }
                        }
                    }
                });
            });
        });
        describe('401', () => {
            it('should Access token is missing or invalid', async () => {
                const res = await request(app).get(
                    '/api/v1/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/session/keep-alive'
                );

                expect(res.statusCode).toBe(401);
                expect(res.type).toBe('application/vnd.api+json');
                expect(res.body).toMatchSchema({
                    $schema: 'http://json-schema.org/draft-07/schema#',
                    type: 'object',
                    required: ['errors'],
                    properties: {
                        errors: {
                            type: 'array',
                            items: {
                                type: 'object',
                                required: ['status', 'title', 'detail'],
                                properties: {
                                    status: {const: 401},
                                    title: {const: '401 Unauthorized'},
                                    detail: {type: 'string'}
                                }
                            }
                        }
                    }
                });
            });
        });
        describe('403', () => {
            it("should The JWT doesn't permit access to this endpoint", async () => {
                const res = await request(app)
                    .get(
                        '/api/v1/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/session/keep-alive'
                    )
                    .set('Authorization', `Bearer ${tokens['create:dummy-resource']}`);

                expect(res.statusCode).toBe(403);
                expect(res.type).toBe('application/vnd.api+json');
                expect(res.body).toMatchSchema({
                    $schema: 'http://json-schema.org/draft-07/schema#',
                    type: 'object',
                    required: ['errors'],
                    properties: {
                        errors: {
                            type: 'array',
                            items: {
                                type: 'object',
                                required: ['status', 'title', 'detail'],
                                properties: {
                                    status: {const: 403},
                                    title: {const: '403 Forbidden'},
                                    detail: {type: 'string'}
                                }
                            }
                        }
                    }
                });
            });
        });

        // TODO this one actually hits the kepp-alive endpoint
        describe('404', () => {
            it('should The specified resource was not found', async () => {
                const res = await request(app)
                    .get(
                        '/api/v1/questionnaires/68653be7-877f-4106-b91e-4ba8dac883f4/session/keep-alive'
                    )
                    .set('Authorization', `Bearer ${tokens['update:questionnaires']}`);

                expect(res.statusCode).toBe(404);
                expect(res.type).toBe('application/vnd.api+json');
                expect(res.body).toMatchSchema({
                    $schema: 'http://json-schema.org/draft-07/schema#',
                    type: 'object',
                    required: ['errors'],
                    properties: {
                        errors: {
                            type: 'array',
                            items: {
                                type: 'object',
                                required: ['status', 'title', 'detail'],
                                properties: {
                                    status: {const: 404},
                                    title: {const: '404 Not Found'},
                                    detail: {type: 'string'}
                                }
                            }
                        }
                    }
                });
            });
        });
    });
});
