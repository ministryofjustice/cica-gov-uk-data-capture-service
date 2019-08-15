'use strict';

const VError = require('verror');
const request = require('supertest');
const {matchersWithOptions} = require('jest-json-schema');

const tokens = {
    'create:questionnaires':
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJkYXRhLWNhcHR1cmUtc2VydmljZSIsImlzcyI6IiQuYXVkIiwianRpIjoiYzVjNzc4ZWQtNTg4NC00N2YwLWFiYzctZTQ1MmZiYWRlYTcyIiwic3ViIjoiJC5hdWQiLCJzY29wZSI6ImNyZWF0ZTpxdWVzdGlvbm5haXJlcyByZWFkOnF1ZXN0aW9ubmFpcmVzIHVwZGF0ZTpxdWVzdGlvbm5haXJlcyBkZWxldGU6cXVlc3Rpb25uYWlyZXMiLCJpYXQiOjE1NjQwNTgyNTF9.Adv1qgj-HiNGxw_0cdYpPO8Fbw12rgJTTqMReJUmFBs',
    'read:questionnaires':
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJkYXRhLWNhcHR1cmUtc2VydmljZSIsImlzcyI6IiQuYXVkIiwianRpIjoiYzVjNzc4ZWQtNTg4NC00N2YwLWFiYzctZTQ1MmZiYWRlYTcyIiwic3ViIjoiJC5hdWQiLCJzY29wZSI6ImNyZWF0ZTpxdWVzdGlvbm5haXJlcyByZWFkOnF1ZXN0aW9ubmFpcmVzIHVwZGF0ZTpxdWVzdGlvbm5haXJlcyBkZWxldGU6cXVlc3Rpb25uYWlyZXMiLCJpYXQiOjE1NjQwNTgyNTF9.Adv1qgj-HiNGxw_0cdYpPO8Fbw12rgJTTqMReJUmFBs',
    'update:questionnaires':
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJkYXRhLWNhcHR1cmUtc2VydmljZSIsImlzcyI6IiQuYXVkIiwianRpIjoiYzVjNzc4ZWQtNTg4NC00N2YwLWFiYzctZTQ1MmZiYWRlYTcyIiwic3ViIjoiJC5hdWQiLCJzY29wZSI6ImNyZWF0ZTpxdWVzdGlvbm5haXJlcyByZWFkOnF1ZXN0aW9ubmFpcmVzIHVwZGF0ZTpxdWVzdGlvbm5haXJlcyBkZWxldGU6cXVlc3Rpb25uYWlyZXMiLCJpYXQiOjE1NjQwNTgyNTF9.Adv1qgj-HiNGxw_0cdYpPO8Fbw12rgJTTqMReJUmFBs',
    'delete:questionnaires':
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJkYXRhLWNhcHR1cmUtc2VydmljZSIsImlzcyI6IiQuYXVkIiwianRpIjoiYzVjNzc4ZWQtNTg4NC00N2YwLWFiYzctZTQ1MmZiYWRlYTcyIiwic3ViIjoiJC5hdWQiLCJzY29wZSI6ImNyZWF0ZTpxdWVzdGlvbm5haXJlcyByZWFkOnF1ZXN0aW9ubmFpcmVzIHVwZGF0ZTpxdWVzdGlvbm5haXJlcyBkZWxldGU6cXVlc3Rpb25uYWlyZXMiLCJpYXQiOjE1NjQwNTgyNTF9.Adv1qgj-HiNGxw_0cdYpPO8Fbw12rgJTTqMReJUmFBs',
    'create:system-answers':
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJkYXRhLWNhcHR1cmUtc2VydmljZSIsImlzcyI6IiQuYXVkIiwianRpIjoiMDhhNTAyMWEtM2JmNC00OTBlLTkyMjAtYjJhN2Y3MGNmMTIzIiwic3ViIjoiYXBwbGljYXRpb24tc2VydmljZSIsInNjb3BlIjoiY3JlYXRlOnN5c3RlbS1hbnN3ZXJzIiwiaWF0IjoxNTY0MDU4MjUxfQ.fThAa30m5CvQRZKBb4Zm5c4wwCEK7k0bBq9MX7Fbfgs',
    'create:dummy-resource':
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJkYXRhLWNhcHR1cmUtc2VydmljZSIsImlzcyI6IiQuYXVkIiwianRpIjoiYzFhMzJiOTUtNGQxMi00YzVlLWI4MGQtNWUyZTk2ZDU1MmNmIiwic3ViIjoiJC5hdWQiLCJzY29wZSI6ImNyZWF0ZTpkdW1teS1yZXNvdXJjZSIsImlhdCI6MTU2NDA1ODI1MX0.J-WxYzHK2rGJlmtmvhwQBrYFvmIpVeIQWAntDo6HJ-4',
    'read:progress-entries':
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJkYXRhLWNhcHR1cmUtc2VydmljZSIsImlzcyI6IiQuYXVkIiwianRpIjoiNDUwMzE2ZTYtNDFhNS00MGRjLWI3NTUtMzA2ZGQ2M2FlMDhiIiwic3ViIjoiY2ljYS13ZWIiLCJzY29wZSI6InJlYWQ6cHJvZ3Jlc3MtZW50cmllcyIsImlhdCI6MTU2NTc5NzE1MH0.fF6Ln7GZmq-R36N-Avuo_a_8Jj5-wla17x0552XnMbE'
};

const createQuestionnaireResponse = require('./test-fixtures/res/post_questionnaire.json');
const getQuestionnaireResponse = require('./test-fixtures/res/get_questionnaire.json');
const postSubmissionQueueResponse = require('./test-fixtures/res/post_submissionQueue.json');

// mock the DAL db integration
jest.doMock('./questionnaire-dal.js', () =>
    // return a modified factory function, that returns an object with a method, that returns a valid created response
    jest.fn(() => ({
        createQuestionnaire: () => createQuestionnaireResponse,
        getQuestionnaire(questionnaireId) {
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
        getQuestionnaireSubmissionStatus(questionnaireId) {
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
        retrieveCaseReferenceNumber: () => '12345678'
    }))
);

jest.doMock('../services/message-bus/index.js', () =>
    jest.fn(() => ({
        post: () => postSubmissionQueueResponse
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
                        data: {type: 'questionnaires', attributes: {templateName: 'sexual-assault'}}
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
                            required: ['type', 'id', 'attributes'],
                            properties: {
                                type: {const: 'questionnaires'},
                                id: {
                                    type: 'string',
                                    pattern:
                                        '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
                                },
                                attributes: {
                                    type: 'object',
                                    additionalProperties: false,
                                    required: ['id', 'type', 'sections', 'routes'],
                                    properties: {
                                        id: {
                                            type: 'string',
                                            pattern:
                                                '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
                                        },
                                        type: {type: 'string', pattern: '^[a-zA-Z0-9-]{1,30}$'},
                                        version: {type: 'string'},
                                        sections: {type: 'object'},
                                        routes: {type: 'object'},
                                        answers: {type: 'object'},
                                        progress: {type: 'array'},
                                        meta: {type: 'object'}
                                    }
                                }
                            }
                        }
                    }
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
                            'THIS-IS-NOT-A-VALID-PROPERTY-NAME': {templateName: 'sexual-assault'}
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
                        data: {type: 'questionnaires', attributes: {templateName: 'sexual-assault'}}
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
                        data: {type: 'questionnaires', attributes: {templateName: 'sexual-assault'}}
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
                    .send({data: {type: 'answers', attributes: {'case-reference': '11\\111111'}}});

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
                            required: ['type', 'id', 'attributes'],
                            properties: {
                                type: {const: 'answers'},
                                id: {type: 'string', pattern: '^[a-z0-9]{1,30}(-[a-z0-9]{1,30})*$'},
                                attributes: {
                                    type: 'object',
                                    additionalProperties: false,
                                    properties: {
                                        'case-reference': {
                                            type: 'string',
                                            pattern: '^[0-9]{2}\\\\[0-9]{6}$'
                                        }
                                    }
                                }
                            }
                        }
                    }
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
                    .send({data: {type: 'answers', attributes: {'case-reference': '11\\111111'}}});

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
                    .send({data: {type: 'answers', attributes: {'case-reference': '11\\111111'}}});

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
                    .send({data: {type: 'answers', attributes: {'case-reference': '11\\111111'}}});

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
                    type: 'object',
                    required: ['data'],
                    properties: {
                        data: {
                            type: 'array',
                            items: {
                                type: 'object',
                                required: ['type', 'id', 'attributes'],
                                properties: {
                                    type: {const: 'answers'},
                                    id: {
                                        type: 'string',
                                        pattern:
                                            '^[a-z0-9]{1,30}(--[a-z0-9]{1,30})?(-[a-z0-9]{1,30})*$'
                                    },
                                    attributes: {type: 'object'}
                                }
                            }
                        }
                    }
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
                            required: ['type', 'attributes'],
                            properties: {
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
                            attributes: {questionnaireId: '285cb104-0c15-4a9c-9840-cb1007f098fb'}
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
                            required: ['type', 'attributes'],
                            properties: {
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
                            attributes: {questionnaireId: '285cb104-0c15-4a9c-9840-cb1007f098fb'},
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
                            attributes: {questionnaireId: '285cb104-0c15-4a9c-9840-cb1007f098fb'}
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
                            attributes: {questionnaireId: '285cb104-0c15-4a9c-9840-cb1007f098fb'}
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
                            attributes: {questionnaireId: '285cb104-0c15-4a9c-9840-cb1007f098fb'}
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
                        '/api/v1/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/progress-entries?filter%5Bposition%5D=current'
                    )
                    .set('Authorization', `Bearer ${tokens['read:progress-entries']}`);

                expect(res.statusCode).toBe(200);
                expect(res.type).toBe('application/vnd.api+json');
                expect(res.body).toMatchSchema({
                    $schema: 'http://json-schema.org/draft-07/schema#',
                    type: 'object',
                    additionalProperties: false,
                    required: ['data'],
                    properties: {
                        data: {
                            type: 'array',
                            items: {
                                type: 'object',
                                additionalProperties: false,
                                required: ['type', 'id', 'attributes', 'relationships'],
                                properties: {
                                    type: {const: 'progress-entries'},
                                    id: {
                                        type: 'string',
                                        pattern:
                                            '^[a-z0-9]{1,30}(--[a-z0-9]{1,30})?(-[a-z0-9]{1,30})*$'
                                    },
                                    attributes: {
                                        type: 'object',
                                        additionalProperties: false,
                                        required: ['sectionId'],
                                        properties: {
                                            sectionId: {
                                                type: 'string',
                                                pattern: '^[a-z0-9]{1,30}(-[a-z0-9]{1,30})*$'
                                            }
                                        }
                                    },
                                    relationships: {
                                        type: 'object',
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
                                                            type: {type: 'string'},
                                                            id: {
                                                                type: 'string',
                                                                pattern:
                                                                    '^[a-z0-9]{1,30}(--[a-z0-9]{1,30})?(-[a-z0-9]{1,30})*$'
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        included: {type: 'array'},
                        links: {type: 'object'},
                        meta: {type: 'object'}
                    }
                });
            });
        });
    });
});
