'use strict';

const VError = require('verror');
const request = require('supertest');
const {matchersWithOptions} = require('jest-json-schema');

const tokens = {
    'read:answers':
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJkYXRhLWNhcHR1cmUtc2VydmljZSIsImlzcyI6IiQuYXVkIiwianRpIjoiMjkyMTUwOTktZWVjZS00ZmY4LWFlNmItMTk1MzVmNTA5YjIwIiwic3ViIjoiYXBwbGljYXRpb24tc2VydmljZSIsInNjb3BlIjoicmVhZDphbnN3ZXJzIiwiaWF0IjoxNTU4NjI0NDE5fQ.WLmgv_tQ4yPVkqZce1q6wnMTfLj_UlFWyJvHpPKtBmk',
    'create:system-answers':
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJkYXRhLWNhcHR1cmUtc2VydmljZSIsImlzcyI6IiQuYXVkIiwianRpIjoiZjEzNzU0ZTAtNjQ0MS00NjA4LWIzNGMtM2ExOGJmNmYxYjY1Iiwic3ViIjoiYXBwbGljYXRpb24tc2VydmljZSIsInNjb3BlIjoiY3JlYXRlOnN5c3RlbS1hbnN3ZXJzIiwiaWF0IjoxNTU4NjI0NTM0fQ.yfN5_5QoOsfNmr4e9RqYkLKEswSpYxcdwNlM9rBfzh4',
    'create:questionnaires':
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJkYXRhLWNhcHR1cmUtc2VydmljZSIsImlzcyI6IiQuYXVkIiwianRpIjoiZTBhYTJjYWItZGE1ZC00MDc2LTlhNmItYzcxN2M2MzlmNmExIiwic3ViIjoiY2ljYS13ZWIiLCJzY29wZSI6ImNyZWF0ZTpxdWVzdGlvbm5haXJlcyIsImlhdCI6MTU1OTA0NzM0Nn0.dC7pwxcyjiBCT5jHX62BwZmc7W02tOkVV0MnLxE3QBQ',
    'create:dummy-resource':
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJkYXRhLWNhcHR1cmUtc2VydmljZSIsImlzcyI6IiQuYXVkIiwianRpIjoiMDdhMmNkNzYtNjMyNC00OTYwLTk2YTEtNTA3M2MxNDljZTQ5Iiwic3ViIjoiY2ljYS13ZWIiLCJzY29wZSI6ImNyZWF0ZTpkdW1teS1yZXNvdXJjZSIsImlhdCI6MTU2MDE3OTc2MH0.gfYTKMib2_Hu8WBYHl23vzptJTvV6jIDisiHKd0G-wA'
};
const createQuestionnaireResponse = require('./test-fixtures/res/post_questionnaire.json');
const getQuestionnaireResponse = require('./test-fixtures/res/get_questionnaire.json');

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
        updateQuestionnaire: () => undefined
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
                                        progress: {type: 'array'}
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
                    .set('Authorization', `Bearer ${tokens['read:answers']}`);

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
                    .set('Authorization', `Bearer ${tokens['read:answers']}`);

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
                    .set('Authorization', `Bearer ${tokens['read:answers']}`);

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
