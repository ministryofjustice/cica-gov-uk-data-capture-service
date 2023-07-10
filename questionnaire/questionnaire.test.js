'use strict';

const VError = require('verror');
const request = require('supertest');
const {matchersWithOptions} = require('jest-json-schema');

const tokens = {
    'create:questionnaires':
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJkYXRhLWNhcHR1cmUtc2VydmljZSIsImlzcyI6IiQuYXVkIiwianRpIjoiZGJkOTFkMTUtYTQwZC00ZGFhLWI5ODAtYmZjMGVjZmUzMDNmIiwic3ViIjoiY2ljYS13ZWIiLCJzY29wZSI6ImNyZWF0ZTpxdWVzdGlvbm5haXJlcyIsImlhdCI6MTU3MDAyNjEyNX0.iiyP58R5WRJ6nqjlkxqp8XsCu3IXKA1-DnJ8JLNJHQU',
    'create:system-answers':
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJkYXRhLWNhcHR1cmUtc2VydmljZSIsImlzcyI6IiQuYXVkIiwianRpIjoiNzg3YTA3MzItNDNhNi00MjYwLThlMmItNWM1NzhkODRjODk0Iiwic3ViIjoiYXBwbGljYXRpb24tc2VydmljZSIsInNjb3BlIjoiY3JlYXRlOnN5c3RlbS1hbnN3ZXJzIiwiaWF0IjoxNTcwMDI2MTI1fQ.EMY98p1PfnYD_WxAXd7d_jvoqrv7F8QQg1TLNRn-ZHw',
    'create:answers':
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJkYXRhLWNhcHR1cmUtc2VydmljZSIsImlzcyI6IiQuYXVkIiwianRpIjoiM2JhMWQyYmUtOWVhZi00MTZjLTkxMTktZjZjM2RkMzI3OTYxIiwic3ViIjoiY2ljYS13ZWIiLCJzY29wZSI6ImNyZWF0ZTphbnN3ZXJzIiwiaWF0IjoxNTcwMDI2MTI1fQ.-qwJjKKdcgn12zjyL1Yu4SPcpoT3PIXSUJnjeYFTM2k',
    'read:answers':
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJkYXRhLWNhcHR1cmUtc2VydmljZSIsImlzcyI6IiQuYXVkIiwianRpIjoiM2UwN2RjNmUtYmZhNy00ZjBiLTk1ZGEtM2M5YzllODBlMDU1Iiwic3ViIjoiYXBwbGljYXRpb24tc2VydmljZSIsInNjb3BlIjoicmVhZDphbnN3ZXJzIiwiaWF0IjoxNTcwMDI2MTI1fQ.rITJZJgFKkByxA7IRoVdKlc6vgmzw4Xv57PqXqKuSaw',
    'read:progress-entries':
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJkYXRhLWNhcHR1cmUtc2VydmljZSIsImlzcyI6IiQuYXVkIiwianRpIjoiYjc0MzQ4NjAtYTQzMy00NmZkLTg1MjYtNzdjOTY4ZmFmNTY0Iiwic3ViIjoiJC5hdWQiLCJzY29wZSI6InJlYWQ6cHJvZ3Jlc3MtZW50cmllcyIsImlhdCI6MTU3MDAyNjEyNX0.m7YNquCSFPQlxL2H1T-vzrM4pY9wJ_LLDNwipZUkags',
    'create:submissions':
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJkYXRhLWNhcHR1cmUtc2VydmljZSIsImlzcyI6IiQuYXVkIiwianRpIjoiZmVhMmViZDctMjVhMC00ZGY1LTg3MzctMzQzZDBiN2RkNThmIiwic3ViIjoiY2ljYS13ZWIiLCJzY29wZSI6ImNyZWF0ZTpzdWJtaXNzaW9ucyIsImlhdCI6MTU3MDAyNjEyNX0.EXbQFz3NEyDFztY91UUbj0VYeNaouUv4o7q56QASBsk',
    'read:submissions':
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJkYXRhLWNhcHR1cmUtc2VydmljZSIsImlzcyI6IiQuYXVkIiwianRpIjoiODE0OGE4NjktNzExMC00OTRjLWI0MDUtMDViOWQyMjNlMGUwIiwic3ViIjoiY2ljYS13ZWIiLCJzY29wZSI6InJlYWQ6c3VibWlzc2lvbnMiLCJpYXQiOjE1NzAwMjYxMjV9.eMTuExNfxLZj_kM-IW4OEXLkAxPFbbiYzWhn4ZYxkUU',
    'create:dummy-resource':
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJkYXRhLWNhcHR1cmUtc2VydmljZSIsImlzcyI6IiQuYXVkIiwianRpIjoiZTAwNGFiMWQtMjM2MC00YzVkLWE5NzktMGIzMDhiYmJkNTJlIiwic3ViIjoiJC5hdWQiLCJzY29wZSI6ImNyZWF0ZTpkdW1teS1yZXNvdXJjZSIsImlhdCI6MTU3MDAyNjEyNX0.CzoMlipu8aqqwN10KTlsiYABnyOiMC4UJ6dHfugTt3U',
    'read:questionnaires':
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJkYXRhLWNhcHR1cmUtc2VydmljZSIsImlzcyI6IiQuYXVkIiwianRpIjoiN2YwYjAxOTktMjcxOS00ZGUxLWE1MjgtY2RmMjZkNmM3YTU5Iiwic3ViIjoiJC5hdWQiLCJzY29wZSI6InJlYWQ6cXVlc3Rpb25uYWlyZXMiLCJpYXQiOjE1NzAxODE2NDB9.uoGJM6snG6pd51UMbf7k86_1ACIrGdEJBRjlEv0twIQ',
    'update:questionnaires':
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJkYXRhLWNhcHR1cmUtc2VydmljZSIsImlzcyI6IiQuYXVkIiwianRpIjoiYzVjNzc4ZWQtNTg4NC00N2YwLWFiYzctZTQ1MmZiYWRlYTcyIiwic3ViIjoiJC5hdWQiLCJzY29wZSI6ImNyZWF0ZTpxdWVzdGlvbm5haXJlcyByZWFkOnF1ZXN0aW9ubmFpcmVzIHVwZGF0ZTpxdWVzdGlvbm5haXJlcyBkZWxldGU6cXVlc3Rpb25uYWlyZXMiLCJpYXQiOjE1NjQwNTgyNTF9.Adv1qgj-HiNGxw_0cdYpPO8Fbw12rgJTTqMReJUmFBs'
};

const getQuestionnaireResponse = require('./test-fixtures/res/get_questionnaire.js');
const sendSqsResponse = require('./test-fixtures/res/post_submissionQueue.json');

// mock the DAL db integration
jest.doMock('./questionnaire-dal.js', () =>
    // return a modified factory function, that returns an object with a method, that returns a valid created response
    jest.fn(() => ({
        createQuestionnaire: () => {},
        getQuestionnaire: questionnaireId => {
            if (questionnaireId === '285cb104-0c15-4a9c-9840-cb1007f098fb') {
                return getQuestionnaireResponse;
            }

            throw new VError(
                {
                    name: 'ResourceNotFound'
                },
                `Questionnaire "${questionnaireId}" not found`
            );
        },
        updateQuestionnaire: () => undefined,
        getQuestionnaireSubmissionStatus: questionnaireId => {
            if (questionnaireId === '285cb104-0c15-4a9c-9840-cb1007f098fb') {
                return 'NOT_STARTED';
            }

            throw new VError(
                {
                    name: 'ResourceNotFound'
                },
                `Questionnaire "${questionnaireId}" not found`
            );
        },
        updateQuestionnaireSubmissionStatus: () => undefined,
        createQuestionnaireSubmission: () => true,
        retrieveCaseReferenceNumber: () => '12345678',
        getQuestionnaireModifiedDate: questionnaireId => {
            if (questionnaireId === '285cb104-0c15-4a9c-9840-cb1007f098fb') {
                return new Date(2022, 1, 1);
            }

            throw new VError(
                {
                    name: 'ResourceNotFound'
                },
                `Questionnaire "${questionnaireId}" not found`
            );
        },
        updateQuestionnaireModifiedDate: () => undefined,
        getReferenceNumber: () => '1234567'
    }))
);

jest.doMock('../services/sqs/index.js', () =>
    jest.fn(() => ({
        send: () => sendSqsResponse
    }))
);

jest.doMock('../services/slack/index.js', () =>
    jest.fn(() => ({
        sendMessage: jest.fn()
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

describe('/questionnaires', () => {
    describe('post', () => {
        describe('201', () => {
            it('should Created', async () => {
                const res = await request(app)
                    .post('/api/v1/questionnaires')
                    .set('Authorization', `Bearer ${tokens['create:questionnaires']}`)
                    .set('Content-Type', 'application/vnd.api+json')
                    .send({
                        data: {
                            type: 'questionnaires',
                            attributes: {templateName: 'sexual-assault'}
                        }
                    });

                expect(res.statusCode).toBe(201);
                expect(res.type).toBe('application/vnd.api+json');
                expect(res.body).toMatchSchema({
                    $schema: 'http://json-schema.org/draft-07/schema#',
                    title: 'Questionnaires document',
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
                                    type: 'object',
                                    $schema: 'http://json-schema.org/draft-07/schema#',
                                    title: 'Questionnaire resource',
                                    allOf: [
                                        {
                                            $schema: 'http://json-schema.org/draft-07/schema#',
                                            title: 'Loosely describes the JSON:API resource format',
                                            type: 'object',
                                            additionalProperties: false,
                                            required: ['type', 'id', 'attributes'],
                                            properties: {
                                                type: {type: 'string'},
                                                id: {
                                                    type: 'string',
                                                    anyOf: [
                                                        {
                                                            $schema:
                                                                'http://json-schema.org/draft-07/schema#',
                                                            title: 'Section Id',
                                                            type: 'string',
                                                            pattern:
                                                                '^(?:p-?(?:-[a-z0-9]{1,20}){1,20}|system|referrer)$'
                                                        },
                                                        {
                                                            $schema:
                                                                'http://json-schema.org/draft-07/schema#',
                                                            title: 'UUID v4',
                                                            type: 'string',
                                                            pattern:
                                                                '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
                                                        },
                                                        {
                                                            const: '0',
                                                            description: 'Used by dataset endpoint'
                                                        }
                                                    ]
                                                },
                                                attributes: {
                                                    type: 'object',
                                                    title: 'Any valid resource'
                                                },
                                                relationships: {type: 'object'}
                                            }
                                        },
                                        {
                                            properties: {
                                                type: {const: 'questionnaires'},
                                                attributes: {
                                                    type: 'object',
                                                    required: ['id', 'type', 'version', 'routes'],
                                                    additionalProperties: false,
                                                    properties: {
                                                        id: {
                                                            $schema:
                                                                'http://json-schema.org/draft-07/schema#',
                                                            title: 'UUID v4',
                                                            type: 'string',
                                                            pattern:
                                                                '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
                                                        },
                                                        type: {
                                                            $schema:
                                                                'http://json-schema.org/draft-07/schema#',
                                                            title: 'Questionnaire template name',
                                                            type: 'string',
                                                            pattern:
                                                                '^[a-z]{1,20}(?:-[a-z]{1,20}){0,10}$'
                                                        },
                                                        version: {
                                                            $schema:
                                                                'http://json-schema.org/draft-07/schema#',
                                                            title: 'semver',
                                                            type: 'string',
                                                            pattern:
                                                                '^[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}$'
                                                        },
                                                        routes: {
                                                            type: 'object',
                                                            required: ['initial'],
                                                            properties: {
                                                                initial: {
                                                                    $schema:
                                                                        'http://json-schema.org/draft-07/schema#',
                                                                    title: 'Section Id',
                                                                    type: 'string',
                                                                    pattern:
                                                                        '^(?:p-?(?:-[a-z0-9]{1,20}){1,20}|system|referrer)$'
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
                    ]
                });
            });
        });
        describe('400', () => {
            it('should There is an issue with the request', async () => {
                const res = await request(app)
                    .post('/api/v1/questionnaires')
                    .set('Authorization', `Bearer ${tokens['create:questionnaires']}`)
                    .set('Content-Type', 'application/vnd.api+json')
                    .send({
                        data: {
                            type: 'questionnaires',
                            attributes: {templateName: 'sexual-assault'},
                            'THIS-IS-NOT-A-VALID-PROPERTY-NAME': {
                                templateName: 'sexual-assault'
                            }
                        }
                    });

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
                const res = await request(app)
                    .post('/api/v1/questionnaires')
                    .set('Content-Type', 'application/vnd.api+json')
                    .send({
                        data: {
                            type: 'questionnaires',
                            attributes: {templateName: 'sexual-assault'}
                        }
                    });

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
                    .post('/api/v1/questionnaires')
                    .set('Authorization', `Bearer ${tokens['create:dummy-resource']}`)
                    .set('Content-Type', 'application/vnd.api+json')
                    .send({
                        data: {
                            type: 'questionnaires',
                            attributes: {templateName: 'sexual-assault'}
                        }
                    });

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
        describe('404', () => {
            it('should The specified resource was not found', async () => {
                const res = await request(app)
                    .post('/api/v1/questionnaires')
                    .set('Authorization', `Bearer ${tokens['create:questionnaires']}`)
                    .set('Content-Type', 'application/vnd.api+json')
                    .send({
                        data: {
                            type: 'questionnaires',
                            attributes: {templateName: 'this-does-not-exist'}
                        }
                    });

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
describe('/questionnaires/{questionnaireId}/sections/{sectionId}/answers', () => {
    describe('post', () => {
        describe('201', () => {
            it('should Created', async () => {
                const res = await request(app)
                    .post(
                        '/api/v1/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/sections/system/answers'
                    )
                    .set('Authorization', `Bearer ${tokens['create:system-answers']}`)
                    .set('Content-Type', 'application/vnd.api+json')
                    .send({
                        data: {type: 'answers', attributes: {'case-reference': '11\\111111'}}
                    });

                expect(res.statusCode).toBe(201);
                expect(res.type).toBe('application/vnd.api+json');
                expect(res.body).toMatchSchema({
                    $schema: 'http://json-schema.org/draft-07/schema#',
                    title: 'Single answers document',
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
                                    type: 'object',
                                    $schema: 'http://json-schema.org/draft-07/schema#',
                                    title: 'Answer resource',
                                    allOf: [
                                        {
                                            $schema: 'http://json-schema.org/draft-07/schema#',
                                            title: 'Loosely describes the JSON:API resource format',
                                            type: 'object',
                                            additionalProperties: false,
                                            required: ['type', 'id', 'attributes'],
                                            properties: {
                                                type: {type: 'string'},
                                                id: {
                                                    type: 'string',
                                                    anyOf: [
                                                        {
                                                            $schema:
                                                                'http://json-schema.org/draft-07/schema#',
                                                            title: 'Section Id',
                                                            type: 'string',
                                                            pattern:
                                                                '^(?:p-?(?:-[a-z0-9]{1,20}){1,20}|system|referrer)$'
                                                        },
                                                        {
                                                            $schema:
                                                                'http://json-schema.org/draft-07/schema#',
                                                            title: 'UUID v4',
                                                            type: 'string',
                                                            pattern:
                                                                '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
                                                        },
                                                        {
                                                            const: '0',
                                                            description: 'Used by dataset endpoint'
                                                        }
                                                    ]
                                                },
                                                attributes: {
                                                    type: 'object',
                                                    title: 'Any valid resource'
                                                },
                                                relationships: {type: 'object'}
                                            }
                                        },
                                        {properties: {type: {const: 'answers'}}}
                                    ]
                                }
                            }
                        }
                    ]
                });
            });
        });
        describe('400', () => {
            it('should There is an issue with the request', async () => {
                const res = await request(app)
                    .post(
                        '/api/v1/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/sections/system/answers'
                    )
                    .set('Authorization', `Bearer ${tokens['create:system-answers']}`)
                    .set('Content-Type', 'application/vnd.api+json')
                    .send({
                        data: {
                            type: 'answers',
                            attributes: {'case-reference': '11\\111111'},
                            'THIS-IS-NOT-A-VALID-PROPERTY-NAME': 'answers'
                        }
                    });

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
                const res = await request(app)
                    .post(
                        '/api/v1/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/sections/system/answers'
                    )
                    .set('Content-Type', 'application/vnd.api+json')
                    .send({
                        data: {type: 'answers', attributes: {'case-reference': '11\\111111'}}
                    });

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
                    .post(
                        '/api/v1/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/sections/system/answers'
                    )
                    .set('Authorization', `Bearer ${tokens['create:dummy-resource']}`)
                    .set('Content-Type', 'application/vnd.api+json')
                    .send({
                        data: {type: 'answers', attributes: {'case-reference': '11\\111111'}}
                    });

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
        describe('404', () => {
            it('should The specified resource was not found', async () => {
                const res = await request(app)
                    .post(
                        '/api/v1/questionnaires/68653be7-877f-4106-b91e-4ba8dac883f4/sections/system/answers'
                    )
                    .set('Authorization', `Bearer ${tokens['create:system-answers']}`)
                    .set('Content-Type', 'application/vnd.api+json')
                    .send({
                        data: {type: 'answers', attributes: {'case-reference': '11\\111111'}}
                    });

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
describe('/questionnaires/{questionnaireId}/sections/answers', () => {
    describe('get', () => {
        describe('200', () => {
            it('should Success', async () => {
                const res = await request(app)
                    .get(
                        '/api/v1/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/sections/answers'
                    )
                    .set('Authorization', `Bearer ${tokens['read:questionnaires']}`);

                expect(res.statusCode).toBe(200);
                expect(res.type).toBe('application/vnd.api+json');
                expect(res.body).toMatchSchema({
                    $schema: 'http://json-schema.org/draft-07/schema#',
                    title: 'Answers document',
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
                                        title: 'Answer resource',
                                        allOf: [
                                            {
                                                $schema: 'http://json-schema.org/draft-07/schema#',
                                                title:
                                                    'Loosely describes the JSON:API resource format',
                                                type: 'object',
                                                additionalProperties: false,
                                                required: ['type', 'id', 'attributes'],
                                                properties: {
                                                    type: {type: 'string'},
                                                    id: {
                                                        type: 'string',
                                                        anyOf: [
                                                            {
                                                                $schema:
                                                                    'http://json-schema.org/draft-07/schema#',
                                                                title: 'Section Id',
                                                                type: 'string',
                                                                pattern:
                                                                    '^(?:p-?(?:-[a-z0-9]{1,20}){1,20}|system|referrer)$'
                                                            },
                                                            {
                                                                $schema:
                                                                    'http://json-schema.org/draft-07/schema#',
                                                                title: 'UUID v4',
                                                                type: 'string',
                                                                pattern:
                                                                    '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
                                                            },
                                                            {
                                                                const: '0',
                                                                description:
                                                                    'Used by dataset endpoint'
                                                            }
                                                        ]
                                                    },
                                                    attributes: {
                                                        type: 'object',
                                                        title: 'Any valid resource'
                                                    },
                                                    relationships: {type: 'object'}
                                                }
                                            },
                                            {properties: {type: {const: 'answers'}}}
                                        ]
                                    }
                                }
                            }
                        }
                    ]
                });
            });
        });
        describe('400', () => {
            it('should There is an issue with the request', async () => {
                const res = await request(app)
                    .get('/api/v1/questionnaires/NOT-A-UUID/sections/answers')
                    .set('Authorization', `Bearer ${tokens['read:questionnaires']}`);

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
                    '/api/v1/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/sections/answers'
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
        describe('404', () => {
            it('should The specified resource was not found', async () => {
                const res = await request(app)
                    .get(
                        '/api/v1/questionnaires/68653be7-877f-4106-b91e-4ba8dac883f4/sections/answers'
                    )
                    .set('Authorization', `Bearer ${tokens['read:questionnaires']}`);

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
describe('/questionnaires/{questionnaireId}/submissions', () => {
    describe('get', () => {
        describe('200', () => {
            it('should Success', async () => {
                const res = await request(app)
                    .get('/api/v1/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/submissions')
                    .set('Authorization', `Bearer ${tokens['read:questionnaires']}`);

                expect(res.statusCode).toBe(200);
                expect(res.type).toBe('application/vnd.api+json');
                expect(res.body).toMatchSchema({
                    $schema: 'http://json-schema.org/draft-07/schema#',
                    type: 'object',
                    additionalProperties: false,
                    required: ['data'],
                    properties: {
                        data: {
                            type: 'object',
                            additionalProperties: false,
                            required: ['id', 'type', 'attributes'],
                            properties: {
                                id: {
                                    type: 'string',
                                    pattern:
                                        '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
                                },
                                type: {const: 'submissions'},
                                attributes: {
                                    type: 'object',
                                    additionalProperties: false,
                                    required: [
                                        'questionnaireId',
                                        'submitted',
                                        'status',
                                        'caseReferenceNumber'
                                    ],
                                    properties: {
                                        questionnaireId: {
                                            type: 'string',
                                            pattern:
                                                '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
                                        },
                                        submitted: {type: 'boolean'},
                                        status: {
                                            enum: [
                                                'NOT_STARTED',
                                                'IN_PROGRESS',
                                                'COMPLETED',
                                                'FAILED'
                                            ]
                                        },
                                        caseReferenceNumber: {
                                            type: ['string', 'null'],
                                            pattern: '^[0-9]{2}\\\\[0-9]{6}$'
                                        }
                                    }
                                }
                            }
                        },
                        meta: {type: 'object'}
                    }
                });
            });
        });
        describe('400', () => {
            it('should There is an issue with the request', async () => {
                const res = await request(app)
                    .get('/api/v1/questionnaires/NOT-A-UUID/submissions')
                    .set('Authorization', `Bearer ${tokens['read:questionnaires']}`);

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
                    '/api/v1/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/submissions'
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
        describe('404', () => {
            it('should The specified resource was not found', async () => {
                const res = await request(app)
                    .get('/api/v1/questionnaires/68653be7-877f-4106-b91e-4ba8dac883f4/submissions')
                    .set('Authorization', `Bearer ${tokens['read:questionnaires']}`);

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
    describe('post', () => {
        describe('201', () => {
            it('should Created', async () => {
                const res = await request(app)
                    .post('/api/v1/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/submissions')
                    .set('Authorization', `Bearer ${tokens['update:questionnaires']}`)
                    .set('Content-Type', 'application/vnd.api+json')
                    .send({
                        data: {
                            type: 'submissions',
                            attributes: {
                                questionnaireId: '285cb104-0c15-4a9c-9840-cb1007f098fb'
                            }
                        }
                    });

                expect(res.statusCode).toBe(201);
                expect(res.type).toBe('application/vnd.api+json');
                expect(res.body).toMatchSchema({
                    $schema: 'http://json-schema.org/draft-07/schema#',
                    type: 'object',
                    additionalProperties: false,
                    required: ['data'],
                    properties: {
                        data: {
                            type: 'object',
                            additionalProperties: false,
                            required: ['id', 'type', 'attributes'],
                            properties: {
                                id: {
                                    type: 'string',
                                    pattern:
                                        '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
                                },
                                type: {const: 'submissions'},
                                attributes: {
                                    type: 'object',
                                    additionalProperties: false,
                                    required: [
                                        'questionnaireId',
                                        'submitted',
                                        'status',
                                        'caseReferenceNumber'
                                    ],
                                    properties: {
                                        questionnaireId: {
                                            type: 'string',
                                            pattern:
                                                '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
                                        },
                                        submitted: {type: 'boolean'},
                                        status: {
                                            enum: [
                                                'NOT_STARTED',
                                                'IN_PROGRESS',
                                                'COMPLETED',
                                                'FAILED'
                                            ]
                                        },
                                        caseReferenceNumber: {
                                            type: ['string', 'null'],
                                            pattern: '^[0-9]{2}\\\\[0-9]{6}$'
                                        }
                                    }
                                }
                            }
                        },
                        meta: {type: 'object'}
                    }
                });
            });
        });
        describe('400', () => {
            it('should There is an issue with the request', async () => {
                const res = await request(app)
                    .post('/api/v1/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/submissions')
                    .set('Authorization', `Bearer ${tokens['update:questionnaires']}`)
                    .set('Content-Type', 'application/vnd.api+json')
                    .send({
                        data: {
                            type: 'submissions',
                            attributes: {
                                questionnaireId: '285cb104-0c15-4a9c-9840-cb1007f098fb'
                            },
                            'THIS-IS-NOT-A-VALID-PROPERTY-NAME': 'submissions'
                        }
                    });

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
                const res = await request(app)
                    .post('/api/v1/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/submissions')
                    .set('Content-Type', 'application/vnd.api+json')
                    .send({
                        data: {
                            type: 'submissions',
                            attributes: {
                                questionnaireId: '285cb104-0c15-4a9c-9840-cb1007f098fb'
                            }
                        }
                    });

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
                    .post('/api/v1/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/submissions')
                    .set('Authorization', `Bearer ${tokens['create:dummy-resource']}`)
                    .set('Content-Type', 'application/vnd.api+json')
                    .send({
                        data: {
                            type: 'submissions',
                            attributes: {
                                questionnaireId: '285cb104-0c15-4a9c-9840-cb1007f098fb'
                            }
                        }
                    });

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
        describe('404', () => {
            it('should The specified resource was not found', async () => {
                const res = await request(app)
                    .post('/api/v1/questionnaires/68653be7-877f-4106-b91e-4ba8dac883f4/submissions')
                    .set('Authorization', `Bearer ${tokens['update:questionnaires']}`)
                    .set('Content-Type', 'application/vnd.api+json')
                    .send({
                        data: {
                            type: 'submissions',
                            attributes: {
                                questionnaireId: '285cb104-0c15-4a9c-9840-cb1007f098fb'
                            }
                        }
                    });

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
describe('/questionnaires/{questionnaireId}/progress-entries', () => {
    describe('get', () => {
        describe('200', () => {
            it('should Success', async () => {
                const res = await request(app)
                    .get(
                        '/api/v1/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/progress-entries?filter%5Bposition%5D=current&page%5Bbefore%5D=p-applicant-declaration'
                    )
                    .set('Authorization', `Bearer ${tokens['read:progress-entries']}`);

                expect(res.statusCode).toBe(200);
                expect(res.type).toBe('application/vnd.api+json');
                expect(res.body).toMatchSchema({
                    $schema: 'http://json-schema.org/draft-07/schema#',
                    title: 'Progress entries document',
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
                                        title: 'Progress entry resource',
                                        allOf: [
                                            {
                                                $schema: 'http://json-schema.org/draft-07/schema#',
                                                title:
                                                    'Loosely describes the JSON:API resource format',
                                                type: 'object',
                                                additionalProperties: false,
                                                required: ['type', 'id', 'attributes'],
                                                properties: {
                                                    type: {type: 'string'},
                                                    id: {
                                                        type: 'string',
                                                        anyOf: [
                                                            {
                                                                $schema:
                                                                    'http://json-schema.org/draft-07/schema#',
                                                                title: 'Section Id',
                                                                type: 'string',
                                                                pattern:
                                                                    '^(?:p-?(?:-[a-z0-9]{1,20}){1,20}|system|referrer)$'
                                                            },
                                                            {
                                                                $schema:
                                                                    'http://json-schema.org/draft-07/schema#',
                                                                title: 'UUID v4',
                                                                type: 'string',
                                                                pattern:
                                                                    '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
                                                            },
                                                            {
                                                                const: '0',
                                                                description:
                                                                    'Used by dataset endpoint'
                                                            }
                                                        ]
                                                    },
                                                    attributes: {
                                                        type: 'object',
                                                        title: 'Any valid resource'
                                                    },
                                                    relationships: {type: 'object'}
                                                }
                                            },
                                            {
                                                required: ['relationships'],
                                                properties: {
                                                    type: {const: 'progress-entries'},
                                                    attributes: {
                                                        additionalProperties: false,
                                                        required: ['sectionId', 'url'],
                                                        properties: {
                                                            sectionId: {
                                                                anyOf: [
                                                                    {type: 'null'},
                                                                    {
                                                                        $schema:
                                                                            'http://json-schema.org/draft-07/schema#',
                                                                        title: 'Section Id',
                                                                        type: 'string',
                                                                        pattern:
                                                                            '^(?:p-?(?:-[a-z0-9]{1,20}){1,20}|system|referrer)$'
                                                                    }
                                                                ]
                                                            },
                                                            url: {type: ['string', 'null']}
                                                        }
                                                    },
                                                    relationships: {
                                                        additionalProperties: false,
                                                        required: ['section'],
                                                        properties: {
                                                            section: {
                                                                type: 'object',
                                                                additionalProperties: false,
                                                                required: ['data'],
                                                                properties: {
                                                                    data: {
                                                                        type: 'object',
                                                                        additionalProperties: false,
                                                                        required: ['type', 'id'],
                                                                        properties: {
                                                                            type: {
                                                                                type: 'string'
                                                                            },
                                                                            id: {
                                                                                $schema:
                                                                                    'http://json-schema.org/draft-07/schema#',
                                                                                title: 'Section Id',
                                                                                type: 'string',
                                                                                pattern:
                                                                                    '^(?:p-?(?:-[a-z0-9]{1,20}){1,20}|system|referrer)$'
                                                                            }
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
                                },
                                included: {
                                    items: {
                                        anyOf: [
                                            {
                                                $schema: 'http://json-schema.org/draft-07/schema#',
                                                title: 'Section resource',
                                                allOf: [
                                                    {
                                                        $schema:
                                                            'http://json-schema.org/draft-07/schema#',
                                                        title:
                                                            'Loosely describes the JSON:API resource format',
                                                        type: 'object',
                                                        additionalProperties: false,
                                                        required: ['type', 'id', 'attributes'],
                                                        properties: {
                                                            type: {type: 'string'},
                                                            id: {
                                                                type: 'string',
                                                                anyOf: [
                                                                    {
                                                                        $schema:
                                                                            'http://json-schema.org/draft-07/schema#',
                                                                        title: 'Section Id',
                                                                        type: 'string',
                                                                        pattern:
                                                                            '^(?:p-?(?:-[a-z0-9]{1,20}){1,20}|system|referrer)$'
                                                                    },
                                                                    {
                                                                        $schema:
                                                                            'http://json-schema.org/draft-07/schema#',
                                                                        title: 'UUID v4',
                                                                        type: 'string',
                                                                        pattern:
                                                                            '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
                                                                    },
                                                                    {
                                                                        const: '0',
                                                                        description:
                                                                            'Used by dataset endpoint'
                                                                    }
                                                                ]
                                                            },
                                                            attributes: {
                                                                type: 'object',
                                                                title: 'Any valid resource'
                                                            },
                                                            relationships: {type: 'object'}
                                                        }
                                                    },
                                                    {
                                                        properties: {
                                                            type: {const: 'sections'},
                                                            attributes: {
                                                                $schema:
                                                                    'http://json-schema.org/draft-07/schema#',
                                                                title: 'Section',
                                                                type: 'object',
                                                                required: ['$schema'],
                                                                properties: {
                                                                    $schema: {
                                                                        enum: [
                                                                            'http://json-schema.org/draft-07/schema#'
                                                                        ]
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                ]
                                            },
                                            {
                                                $schema: 'http://json-schema.org/draft-07/schema#',
                                                title: 'Answer resource',
                                                allOf: [
                                                    {
                                                        $schema:
                                                            'http://json-schema.org/draft-07/schema#',
                                                        title:
                                                            'Loosely describes the JSON:API resource format',
                                                        type: 'object',
                                                        additionalProperties: false,
                                                        required: ['type', 'id', 'attributes'],
                                                        properties: {
                                                            type: {type: 'string'},
                                                            id: {
                                                                type: 'string',
                                                                anyOf: [
                                                                    {
                                                                        $schema:
                                                                            'http://json-schema.org/draft-07/schema#',
                                                                        title: 'Section Id',
                                                                        type: 'string',
                                                                        pattern:
                                                                            '^(?:p-?(?:-[a-z0-9]{1,20}){1,20}|system|referrer)$'
                                                                    },
                                                                    {
                                                                        $schema:
                                                                            'http://json-schema.org/draft-07/schema#',
                                                                        title: 'UUID v4',
                                                                        type: 'string',
                                                                        pattern:
                                                                            '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
                                                                    },
                                                                    {
                                                                        const: '0',
                                                                        description:
                                                                            'Used by dataset endpoint'
                                                                    }
                                                                ]
                                                            },
                                                            attributes: {
                                                                type: 'object',
                                                                title: 'Any valid resource'
                                                            },
                                                            relationships: {type: 'object'}
                                                        }
                                                    },
                                                    {properties: {type: {const: 'answers'}}}
                                                ]
                                            }
                                        ]
                                    }
                                }
                            }
                        }
                    ]
                });
            });
        });
        describe('400', () => {
            it('should There is an issue with the request', async () => {
                const res = await request(app)
                    .get(
                        '/api/v1/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/progress-entries?filter%5BNOT-A-VALID-FILTER%5D=FOO'
                    )
                    .set('Authorization', `Bearer ${tokens['read:progress-entries']}`);

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
                    '/api/v1/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/progress-entries?filter%5Bposition%5D=current&page%5Bbefore%5D=p-applicant-declaration'
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
                        '/api/v1/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/progress-entries?filter%5Bposition%5D=current&page%5Bbefore%5D=p-applicant-declaration'
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
        describe('404', () => {
            it('should The specified resource was not found', async () => {
                const res = await request(app)
                    .get(
                        '/api/v1/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/progress-entries?filter%5BsectionId%5D=p--not-a-valid-section'
                    )
                    .set('Authorization', `Bearer ${tokens['read:progress-entries']}`);

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
describe('/questionnaires/{questionnaireId}/dataset', () => {
    describe('get', () => {
        describe('200', () => {
            it('should Success', async () => {
                const res = await request(app)
                    .get('/api/v1/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/dataset')
                    .set('Authorization', `Bearer ${tokens['read:questionnaires']}`);

                expect(res.statusCode).toBe(200);
                expect(res.type).toBe('application/vnd.api+json');
                expect(res.body).toMatchSchema({
                    anyOf: [
                        {
                            $schema: 'http://json-schema.org/draft-07/schema#',
                            title: 'Dataset document v1.0.0',
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
                                                title: 'Dataset resource v1.0.0',
                                                allOf: [
                                                    {
                                                        $schema:
                                                            'http://json-schema.org/draft-07/schema#',
                                                        title:
                                                            'Loosely describes the JSON:API resource format',
                                                        type: 'object',
                                                        additionalProperties: false,
                                                        required: ['type', 'id', 'attributes'],
                                                        properties: {
                                                            type: {type: 'string'},
                                                            id: {
                                                                type: 'string',
                                                                anyOf: [
                                                                    {
                                                                        $schema:
                                                                            'http://json-schema.org/draft-07/schema#',
                                                                        title: 'Section Id',
                                                                        type: 'string',
                                                                        pattern:
                                                                            '^(?:p-?(?:-[a-z0-9]{1,20}){1,20}|system|referrer)$'
                                                                    },
                                                                    {
                                                                        $schema:
                                                                            'http://json-schema.org/draft-07/schema#',
                                                                        title: 'UUID v4',
                                                                        type: 'string',
                                                                        pattern:
                                                                            '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
                                                                    },
                                                                    {
                                                                        const: '0',
                                                                        description:
                                                                            'Used by dataset endpoint'
                                                                    }
                                                                ]
                                                            },
                                                            attributes: {
                                                                type: 'object',
                                                                title: 'Any valid resource'
                                                            },
                                                            relationships: {type: 'object'}
                                                        }
                                                    },
                                                    {
                                                        properties: {
                                                            type: {const: 'dataset'},
                                                            id: {type: 'string', const: '0'},
                                                            attributes: {
                                                                type: 'object',
                                                                additionalProperties: false,
                                                                patternProperties: {
                                                                    '^q-?(?:-[a-z0-9]{1,20}){1,20}$': {
                                                                        type: [
                                                                            'string',
                                                                            'number',
                                                                            'boolean',
                                                                            'array'
                                                                        ]
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
                        },
                        {
                            $schema: 'http://json-schema.org/draft-07/schema#',
                            title: 'Dataset document v2.0.0',
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
                                                title: 'Dataset resource v2.0.0',
                                                allOf: [
                                                    {
                                                        $schema:
                                                            'http://json-schema.org/draft-07/schema#',
                                                        title:
                                                            'Loosely describes the JSON:API resource format',
                                                        type: 'object',
                                                        additionalProperties: false,
                                                        required: ['type', 'id', 'attributes'],
                                                        properties: {
                                                            type: {type: 'string'},
                                                            id: {
                                                                type: 'string',
                                                                anyOf: [
                                                                    {
                                                                        $schema:
                                                                            'http://json-schema.org/draft-07/schema#',
                                                                        title: 'Section Id',
                                                                        type: 'string',
                                                                        pattern:
                                                                            '^(?:p-?(?:-[a-z0-9]{1,20}){1,20}|system|referrer)$'
                                                                    },
                                                                    {
                                                                        $schema:
                                                                            'http://json-schema.org/draft-07/schema#',
                                                                        title: 'UUID v4',
                                                                        type: 'string',
                                                                        pattern:
                                                                            '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
                                                                    },
                                                                    {
                                                                        const: '0',
                                                                        description:
                                                                            'Used by dataset endpoint'
                                                                    }
                                                                ]
                                                            },
                                                            attributes: {
                                                                type: 'object',
                                                                title: 'Any valid resource'
                                                            },
                                                            relationships: {type: 'object'}
                                                        }
                                                    },
                                                    {
                                                        properties: {
                                                            type: {const: 'dataset'},
                                                            id: {type: 'string', const: '0'},
                                                            attributes: {
                                                                type: 'object',
                                                                required: ['values'],
                                                                additionalProperties: false,
                                                                properties: {
                                                                    values: {
                                                                        type: 'array',
                                                                        items: {
                                                                            anyOf: [
                                                                                {
                                                                                    title:
                                                                                        'Simple closed question',
                                                                                    type: 'object',
                                                                                    required: [
                                                                                        'type',
                                                                                        'id',
                                                                                        'label',
                                                                                        'value',
                                                                                        'valueLabel'
                                                                                    ],
                                                                                    properties: {
                                                                                        type: {
                                                                                            const:
                                                                                                'simple'
                                                                                        },
                                                                                        id: {
                                                                                            $schema:
                                                                                                'http://json-schema.org/draft-07/schema#',
                                                                                            title:
                                                                                                'Question Id',
                                                                                            type:
                                                                                                'string',
                                                                                            pattern:
                                                                                                '^q-?(?:-[a-z0-9]{1,20}){1,20}$'
                                                                                        },
                                                                                        label: {
                                                                                            type:
                                                                                                'string'
                                                                                        },
                                                                                        closedQuestion: {
                                                                                            enum: [
                                                                                                true
                                                                                            ]
                                                                                        },
                                                                                        value: {
                                                                                            anyOf: [
                                                                                                {
                                                                                                    type:
                                                                                                        'string'
                                                                                                },
                                                                                                {
                                                                                                    type:
                                                                                                        'number'
                                                                                                },
                                                                                                {
                                                                                                    type:
                                                                                                        'boolean'
                                                                                                },
                                                                                                {
                                                                                                    type:
                                                                                                        'array'
                                                                                                }
                                                                                            ]
                                                                                        },
                                                                                        valueLabel: {
                                                                                            anyOf: [
                                                                                                {
                                                                                                    type:
                                                                                                        'string'
                                                                                                },
                                                                                                {
                                                                                                    type:
                                                                                                        'array'
                                                                                                }
                                                                                            ]
                                                                                        }
                                                                                    }
                                                                                },
                                                                                {
                                                                                    title:
                                                                                        'Simple open question',
                                                                                    type: 'object',
                                                                                    required: [
                                                                                        'type',
                                                                                        'id',
                                                                                        'label',
                                                                                        'value'
                                                                                    ],
                                                                                    properties: {
                                                                                        type: {
                                                                                            const:
                                                                                                'simple'
                                                                                        },
                                                                                        id: {
                                                                                            $schema:
                                                                                                'http://json-schema.org/draft-07/schema#',
                                                                                            title:
                                                                                                'Question Id',
                                                                                            type:
                                                                                                'string',
                                                                                            pattern:
                                                                                                '^q-?(?:-[a-z0-9]{1,20}){1,20}$'
                                                                                        },
                                                                                        label: {
                                                                                            type:
                                                                                                'string'
                                                                                        },
                                                                                        value: {
                                                                                            anyOf: [
                                                                                                {
                                                                                                    type:
                                                                                                        'string'
                                                                                                },
                                                                                                {
                                                                                                    type:
                                                                                                        'number'
                                                                                                },
                                                                                                {
                                                                                                    type:
                                                                                                        'boolean'
                                                                                                }
                                                                                            ]
                                                                                        }
                                                                                    }
                                                                                },
                                                                                {
                                                                                    title:
                                                                                        'Composite question',
                                                                                    type: 'object',
                                                                                    required: [
                                                                                        'type',
                                                                                        'id',
                                                                                        'label',
                                                                                        'values'
                                                                                    ],
                                                                                    properties: {
                                                                                        type: {
                                                                                            const:
                                                                                                'composite'
                                                                                        },
                                                                                        id: {
                                                                                            $schema:
                                                                                                'http://json-schema.org/draft-07/schema#',
                                                                                            title:
                                                                                                'Composite question Id',
                                                                                            description:
                                                                                                'Allows for questions with multiple parts e.g. fullname consists of title, firstname, lastname.',
                                                                                            type:
                                                                                                'string',
                                                                                            pattern:
                                                                                                '^[a-z][a-z0-9]{0,19}(?:-[a-z0-9]{1,20}){0,20}$'
                                                                                        },
                                                                                        label: {
                                                                                            type:
                                                                                                'string'
                                                                                        },
                                                                                        values: {
                                                                                            type:
                                                                                                'array',
                                                                                            items: {
                                                                                                anyOf: [
                                                                                                    {
                                                                                                        title:
                                                                                                            'Simple closed question',
                                                                                                        type:
                                                                                                            'object',
                                                                                                        required: [
                                                                                                            'type',
                                                                                                            'id',
                                                                                                            'label',
                                                                                                            'value',
                                                                                                            'valueLabel'
                                                                                                        ],
                                                                                                        properties: {
                                                                                                            type: {
                                                                                                                const:
                                                                                                                    'simple'
                                                                                                            },
                                                                                                            id: {
                                                                                                                $schema:
                                                                                                                    'http://json-schema.org/draft-07/schema#',
                                                                                                                title:
                                                                                                                    'Question Id',
                                                                                                                type:
                                                                                                                    'string',
                                                                                                                pattern:
                                                                                                                    '^q-?(?:-[a-z0-9]{1,20}){1,20}$'
                                                                                                            },
                                                                                                            label: {
                                                                                                                type:
                                                                                                                    'string'
                                                                                                            },
                                                                                                            closedQuestion: {
                                                                                                                enum: [
                                                                                                                    true
                                                                                                                ]
                                                                                                            },
                                                                                                            value: {
                                                                                                                anyOf: [
                                                                                                                    {
                                                                                                                        type:
                                                                                                                            'string'
                                                                                                                    },
                                                                                                                    {
                                                                                                                        type:
                                                                                                                            'number'
                                                                                                                    },
                                                                                                                    {
                                                                                                                        type:
                                                                                                                            'boolean'
                                                                                                                    },
                                                                                                                    {
                                                                                                                        type:
                                                                                                                            'array'
                                                                                                                    }
                                                                                                                ]
                                                                                                            },
                                                                                                            valueLabel: {
                                                                                                                anyOf: [
                                                                                                                    {
                                                                                                                        type:
                                                                                                                            'string'
                                                                                                                    },
                                                                                                                    {
                                                                                                                        type:
                                                                                                                            'array'
                                                                                                                    }
                                                                                                                ]
                                                                                                            }
                                                                                                        }
                                                                                                    },
                                                                                                    {
                                                                                                        title:
                                                                                                            'Simple open question',
                                                                                                        type:
                                                                                                            'object',
                                                                                                        required: [
                                                                                                            'type',
                                                                                                            'id',
                                                                                                            'label',
                                                                                                            'value'
                                                                                                        ],
                                                                                                        properties: {
                                                                                                            type: {
                                                                                                                const:
                                                                                                                    'simple'
                                                                                                            },
                                                                                                            id: {
                                                                                                                $schema:
                                                                                                                    'http://json-schema.org/draft-07/schema#',
                                                                                                                title:
                                                                                                                    'Question Id',
                                                                                                                type:
                                                                                                                    'string',
                                                                                                                pattern:
                                                                                                                    '^q-?(?:-[a-z0-9]{1,20}){1,20}$'
                                                                                                            },
                                                                                                            label: {
                                                                                                                type:
                                                                                                                    'string'
                                                                                                            },
                                                                                                            value: {
                                                                                                                anyOf: [
                                                                                                                    {
                                                                                                                        type:
                                                                                                                            'string'
                                                                                                                    },
                                                                                                                    {
                                                                                                                        type:
                                                                                                                            'number'
                                                                                                                    },
                                                                                                                    {
                                                                                                                        type:
                                                                                                                            'boolean'
                                                                                                                    }
                                                                                                                ]
                                                                                                            }
                                                                                                        }
                                                                                                    }
                                                                                                ]
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                }
                                                                            ]
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
                        }
                    ]
                });
            });
        });
        describe('400', () => {
            it('should There is an issue with the request', async () => {
                const res = await request(app)
                    .get('/api/v1/questionnaires/NOT-A-UUID/dataset')
                    .set('Authorization', `Bearer ${tokens['read:questionnaires']}`);

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
                    '/api/v1/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/dataset'
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
        describe('404', () => {
            it('should The specified resource was not found', async () => {
                const res = await request(app)
                    .get('/api/v1/questionnaires/68653be7-877f-4106-b91e-4ba8dac883f4/dataset')
                    .set('Authorization', `Bearer ${tokens['read:questionnaires']}`);

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
