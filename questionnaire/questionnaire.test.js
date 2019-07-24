'use strict';

const VError = require('verror');
const request = require('supertest');
const {matchersWithOptions} = require('jest-json-schema');

const tokens = {
    'read-write:questionnaires':
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJkYXRhLWNhcHR1cmUtc2VydmljZSIsImlzcyI6IiQuYXVkIiwianRpIjoiOWQ0MWM4ZTQtOWZkMC00YjdiLWE2YmUtY2U3ODFhZDcwMDlmIiwic3ViIjoiY2ljYS13ZWIiLCJzY29wZSI6InJlYWQtd3JpdGU6cXVlc3Rpb25uYWlyZXMiLCJpYXQiOjE1NjI4NTUxODF9.y01j7qY_SS2ZrtYa60C48In7F3atHYbl8C0XFFah5YU',
    'create:system-answers':
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJkYXRhLWNhcHR1cmUtc2VydmljZSIsImlzcyI6IiQuYXVkIiwianRpIjoiYzg3YTU3OWMtN2FkNS00MjNhLWEzZTQtYjhlOWM5NmY3MmJjIiwic3ViIjoiYXBwbGljYXRpb24tc2VydmljZSIsInNjb3BlIjoiY3JlYXRlOnN5c3RlbS1hbnN3ZXJzIiwiaWF0IjoxNTYyNzQ4NjY5fQ.SflL5A9JCayd-F3D3Zxoop2I2upttPbfs-L_lCFqMJM',
    'read:answers':
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJkYXRhLWNhcHR1cmUtc2VydmljZSIsImlzcyI6IiQuYXVkIiwianRpIjoiYTZmYjI1MWUtOTFlNS00Njk4LWExYzAtZWQ2YjI0NmNiZjJkIiwic3ViIjoiYXBwbGljYXRpb24tc2VydmljZSIsInNjb3BlIjoicmVhZDphbnN3ZXJzIiwiaWF0IjoxNTYyNzQ4NjY5fQ.-RPu0O9UYAumxInfFMt2L8CdhpJEZfh_lGBQTptBH1k',
    'create:questionnaires':
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJkYXRhLWNhcHR1cmUtc2VydmljZSIsImlzcyI6IiQuYXVkIiwianRpIjoiNmIwODg4MWItODFkNy00MDhhLWJhZmMtOGNkMjhjNmUxZjU4Iiwic3ViIjoiY2ljYS13ZWIiLCJzY29wZSI6ImNyZWF0ZTpxdWVzdGlvbm5haXJlcyIsImlhdCI6MTU2Mjc0ODY2OX0.Dj-tsFSJ3KmJ1qI4mV7qcvREkUV5MnsIgutJP_if2i0',
    'create:answers':
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJkYXRhLWNhcHR1cmUtc2VydmljZSIsImlzcyI6IiQuYXVkIiwianRpIjoiYWMwNjRkZTctZGYwZC00MjhhLWE2ZTEtMTgwMzU3NjUzZmIxIiwic3ViIjoiY2ljYS13ZWIiLCJzY29wZSI6ImNyZWF0ZTphbnN3ZXJzIiwiaWF0IjoxNTYyNzQ4NjY5fQ.Mts9vViskvVsKzrbEc0ycKesiSa7C2NyZq_Akpq4ga4',
    'read:sections':
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJkYXRhLWNhcHR1cmUtc2VydmljZSIsImlzcyI6IiQuYXVkIiwianRpIjoiNGU1MWM3ZGMtMDdiYy00YTBmLThhMWQtM2Q5MTFhYjcwMzk5Iiwic3ViIjoiYXBwbGljYXRpb24tc2VydmljZSIsInNjb3BlIjoicmVhZDpzZWN0aW9ucyIsImlhdCI6MTU2Mjc0ODY2OX0.bkbtf71_GrMaWkNEEGZkakBCROFIZaVNAOxYSz0J93M',
    'read:progress':
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJkYXRhLWNhcHR1cmUtc2VydmljZSIsImlzcyI6IiQuYXVkIiwianRpIjoiY2VkZTk5ZmEtZTFlMy00ZWEwLWE3MTAtMjVmZWUxN2Y4NjNmIiwic3ViIjoiYXBwbGljYXRpb24tc2VydmljZSIsInNjb3BlIjoicmVhZDpwcm9ncmVzcyIsImlhdCI6MTU2Mjc0ODY2OX0.IQ1xILHZsifjao5814Z1FrHp0r6ZEThQE7yI2YNNxt8',
    'read:questionnaires':
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJkYXRhLWNhcHR1cmUtc2VydmljZSIsImlzcyI6IiQuYXVkIiwianRpIjoiZmJkNDk0ODgtYWVmMC00MmEzLTk1MzgtOTVkNjE5MTBiMGFjIiwic3ViIjoiYXBwbGljYXRpb24tc2VydmljZSIsInNjb3BlIjoicmVhZDpxdWVzdGlvbm5haXJlcyIsImlhdCI6MTU2Mjc0ODY2OX0.CnrbLcgo6a9noIqi4Ra9VLJtqL9KuPr0fO6Ajw09Zr4',
    'create:dummy-resource':
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJkYXRhLWNhcHR1cmUtc2VydmljZSIsImlzcyI6IiQuYXVkIiwianRpIjoiZTAxMWI2NTAtMzA3MC00ZTVkLTk4NTQtMTU2NDI4Y2VkYTQ1Iiwic3ViIjoiJC5hdWQiLCJzY29wZSI6ImNyZWF0ZTpkdW1teS1yZXNvdXJjZSIsImlhdCI6MTU2MzMwOTQyOH0.4MsH7CpH8fGjb3x2qIOQOSYyYjOKBXNTa9yG9y5wpNc'
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

describe('/questionnaires/progress-entries', () => {
    describe('get', () => {
        describe('200', () => {
            it('should Success', async () => {
                const res = await request(app)
                    .get(
                        '/api/v1/questionnaires/progress-entries?questionnaireId=285cb104-0c15-4a9c-9840-cb1007f098fb&progressEntryId=0&progressEntryBefore=p-applicant-british-citizen-or-eu-national&sectionId=p-applicant-declaration'
                    )
                    .set('Authorization', `Bearer ${tokens['read-write:questionnaires']}`);

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
                                required: ['type', 'id', 'attributes', 'relationships', 'links'],
                                properties: {
                                    type: {const: 'progress-entries'},
                                    id: {type: 'integer', minimum: 0},
                                    attributes: {
                                        type: 'object',
                                        additionalProperties: false,
                                        properties: {
                                            sectionId: {
                                                type: 'string',
                                                pattern: '^p--?([a-z0-9-]+)$'
                                            }
                                        }
                                    },
                                    relationships: {
                                        type: 'object',
                                        properties: {
                                            section: {
                                                type: 'object',
                                                properties: {links: {type: 'object'}}
                                            }
                                        }
                                    },
                                    links: {
                                        type: 'object',
                                        additionalProperties: false,
                                        properties: {
                                            self: {type: 'string', format: 'uri-reference'},
                                            first: {type: 'string', format: 'uri-reference'},
                                            prev: {type: 'string', format: 'uri-reference'},
                                            next: {type: 'string', format: 'uri-reference'},
                                            last: {type: 'string', format: 'uri-reference'}
                                        }
                                    }
                                }
                            }
                        },
                        included: {
                            type: 'array',
                            items: {
                                type: 'object',
                                additionalProperties: false,
                                required: ['type', 'id'],
                                properties: {
                                    type: {type: 'string', enum: ['sections', 'answers']},
                                    id: {type: 'string', pattern: '^p--?([a-z0-9-]+)$'},
                                    attributes: {type: 'object'}
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
                    .get(
                        '/api/v1/questionnaires/progress-entries?questionnaireId=NOT-A-UUID&progressEntryId=0&progressEntryBefore=p-applicant-british-citizen-or-eu-national&sectionId=p-applicant-declaration'
                    )
                    .set('Authorization', `Bearer ${tokens['read-write:questionnaires']}`);

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
                    '/api/v1/questionnaires/progress-entries?questionnaireId=285cb104-0c15-4a9c-9840-cb1007f098fb&progressEntryId=0&progressEntryBefore=p-applicant-british-citizen-or-eu-national&sectionId=p-applicant-declaration'
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
                        '/api/v1/questionnaires/progress-entries?questionnaireId=285cb104-0c15-4a9c-9840-cb1007f098fb&progressEntryId=0&progressEntryBefore=p-applicant-british-citizen-or-eu-national&sectionId=p-applicant-declaration'
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
                        '/api/v1/questionnaires/progress-entries?questionnaireId=c85cb104-0c15-4a9c-9840-cb1007f098fb&progressEntryId=0&progressEntryBefore=p-applicant-british-citizen-or-eu-national&sectionId=p-applicant-declaration'
                    )
                    .set('Authorization', `Bearer ${tokens['read-write:questionnaires']}`);

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
describe('/questionnaires', () => {
    describe('post', () => {
        describe('201', () => {
            it('should Created', async () => {
                const res = await request(app)
                    .post('/api/v1/questionnaires')
                    .set('Authorization', `Bearer ${tokens['read-write:questionnaires']}`)
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
                    .set('Authorization', `Bearer ${tokens['read-write:questionnaires']}`)
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
                    .set('Authorization', `Bearer ${tokens['read-write:questionnaires']}`)
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
describe('/questionnaires/{questionnaireId}', () => {
    describe('get', () => {
        describe('200', () => {
            it('should Success', async () => {
                const res = await request(app)
                    .get('/api/v1/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb')
                    .set('Authorization', `Bearer ${tokens['read-write:questionnaires']}`);

                expect(res.statusCode).toBe(200);
                expect(res.type).toBe('application/vnd.api+json');
                expect(res.body).toMatchSchema({
                    $schema: 'http://json-schema.org/draft-07/schema#',
                    type: 'object',
                    required: ['data'],
                    properties: {
                        data: {
                            type: 'object',
                            items: {
                                type: 'object',
                                required: ['type', 'id', 'attributes'],
                                properties: {
                                    type: {const: 'questionnaire'},
                                    id: {
                                        type: 'string',
                                        pattern:
                                            '^[a-z0-9]{1,30}(--[a-z0-9]{1,30})?(-[a-z0-9]{1,30})*$'
                                    },
                                    attributes: {
                                        type: 'object',
                                        items: {
                                            type: 'object',
                                            required: [
                                                'id',
                                                'type',
                                                'routes',
                                                'answers',
                                                'progress',
                                                'sections',
                                                'version'
                                            ],
                                            properties: {
                                                id: {
                                                    type: 'string',
                                                    pattern:
                                                        '^[a-z0-9]{1,30}(--[a-z0-9]{1,30})?(-[a-z0-9]{1,30})*$'
                                                },
                                                type: {type: 'string'},
                                                routes: {type: 'object'},
                                                answers: {type: 'object'},
                                                progress: {type: 'array'},
                                                sections: {type: 'object'},
                                                version: {type: 'string'}
                                            }
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
                    .get('/api/v1/questionnaires/NOT-A-UUID')
                    .set('Authorization', `Bearer ${tokens['read-write:questionnaires']}`);

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
                    '/api/v1/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb'
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
                    .get('/api/v1/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb')
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
                    .get('/api/v1/questionnaires/c85cb104-0c15-4a9c-9840-cb1007f098fb')
                    .set('Authorization', `Bearer ${tokens['read-write:questionnaires']}`);

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
describe('/questionnaires/{questionnaireId}/sections/{sectionName}/answers', () => {
    describe('get', () => {
        describe('200', () => {
            it('should Success', async () => {
                const res = await request(app)
                    .get(
                        '/api/v1/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/sections/applicant-british-citizen-or-eu-national/answers'
                    )
                    .set('Authorization', `Bearer ${tokens['read-write:questionnaires']}`);

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
                                    attributes: {
                                        type: 'object',
                                        patternProperties: {
                                            '^q-': {
                                                type: [
                                                    'string',
                                                    'number',
                                                    'object',
                                                    'array',
                                                    'boolean'
                                                ]
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        included: {type: 'array'}
                    }
                });
            });
        });
        describe('400', () => {
            it('should There is an issue with the request', async () => {
                const res = await request(app)
                    .get('/api/v1/questionnaires/NOT-A-UUID/sections/NOT-£_A_VALID@S3CTION/answers')
                    .set('Authorization', `Bearer ${tokens['read-write:questionnaires']}`);

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
                    '/api/v1/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/sections/applicant-british-citizen-or-eu-national/answers'
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
                        '/api/v1/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/sections/applicant-british-citizen-or-eu-national/answers'
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
                        '/api/v1/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/sections/applicant-what-is-your-favourite-colour/answers'
                    )
                    .set('Authorization', `Bearer ${tokens['read-write:questionnaires']}`);

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
        describe('200', () => {
            it('should Success', async () => {
                const res = await request(app)
                    .post(
                        '/api/v1/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/sections/applicant-british-citizen-or-eu-national/answers'
                    )
                    .set('Authorization', `Bearer ${tokens['read-write:questionnaires']}`)
                    .set('Content-Type', 'application/vnd.api+json')
                    .send({data: [{type: 'answers', attributes: {}}]});

                expect(res.statusCode).toBe(200);
                expect(res.type).toBe('application/vnd.api+json');
                expect(res.body).toMatchSchema({
                    $schema: 'http://json-schema.org/draft-07/schema#',
                    type: 'object',
                    required: ['data'],
                    additionalProperties: false,
                    properties: {
                        data: {
                            type: 'array',
                            items: {
                                type: 'object',
                                required: ['type', 'attributes'],
                                properties: {
                                    type: {const: 'answers'},
                                    attributes: {
                                        type: 'object',
                                        patternProperties: {
                                            '^q-': {
                                                type: [
                                                    'string',
                                                    'number',
                                                    'object',
                                                    'array',
                                                    'boolean'
                                                ]
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        included: {type: 'array'},
                        meta: {type: 'object'}
                    }
                });
            });
        });
        describe('400', () => {
            it('should There is an issue with the request', async () => {
                const res = await request(app)
                    .post(
                        '/api/v1/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/sections/applicant-british-citizen-or-eu-national/answers'
                    )
                    .set('Authorization', `Bearer ${tokens['read-write:questionnaires']}`)
                    .set('Content-Type', 'application/vnd.api+json')
                    .send({
                        data: [
                            {
                                type: 'THIS-IS-NOT-A-VALID-PROPERTY',
                                attributes: {'case-reference': '11\\111111'}
                            }
                        ]
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
                        '/api/v1/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/sections/applicant-british-citizen-or-eu-national/answers'
                    )
                    .set('Content-Type', 'application/vnd.api+json')
                    .send({data: [{type: 'answers', attributes: {}}]});

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
                        '/api/v1/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/sections/applicant-british-citizen-or-eu-national/answers'
                    )
                    .set('Authorization', `Bearer ${tokens['create:dummy-resource']}`)
                    .set('Content-Type', 'application/vnd.api+json')
                    .send({data: [{type: 'answers', attributes: {}}]});

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
                        '/api/v1/questionnaires/c85cb104-0c15-4a9c-9840-cb1007f098fb/sections/applicant-british-citizen-or-eu-national/answers'
                    )
                    .set('Authorization', `Bearer ${tokens['read-write:questionnaires']}`)
                    .set('Content-Type', 'application/vnd.api+json')
                    .send({data: [{type: 'answers', attributes: {}}]});

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
                    .set('Authorization', `Bearer ${tokens['read-write:questionnaires']}`);

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
                                    attributes: {
                                        type: 'object',
                                        patternProperties: {
                                            '^q-': {
                                                type: [
                                                    'string',
                                                    'number',
                                                    'object',
                                                    'array',
                                                    'boolean'
                                                ]
                                            }
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
                    .get('/api/v1/questionnaires/NOT-A-UUID/sections/answers')
                    .set('Authorization', `Bearer ${tokens['read-write:questionnaires']}`);

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
                        '/api/v1/questionnaires/c85cb104-0c15-4a9c-9840-cb1007f098fb/sections/answers'
                    )
                    .set('Authorization', `Bearer ${tokens['read-write:questionnaires']}`);

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
describe('/questionnaires/{questionnaireId}/sections/{sectionName}', () => {
    describe('get', () => {
        describe('200', () => {
            it('should Success', async () => {
                const res = await request(app)
                    .get(
                        '/api/v1/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/sections/applicant-british-citizen-or-eu-national'
                    )
                    .set('Authorization', `Bearer ${tokens['read-write:questionnaires']}`);

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
                                    type: {const: 'section'},
                                    id: {type: 'string', pattern: '^p--?([a-z0-9-]+)$'},
                                    attributes: {
                                        type: 'object',
                                        properties: {
                                            required: {
                                                type: 'array',
                                                items: {type: 'string', pattern: '^q([a-z0-9-]+)$'}
                                            },
                                            errorMessage: {type: 'object'},
                                            properties: {
                                                type: 'object',
                                                patternProperties: {
                                                    '^q-': {
                                                        type: [
                                                            'string',
                                                            'number',
                                                            'object',
                                                            'array',
                                                            'boolean'
                                                        ]
                                                    }
                                                }
                                            }
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
                    .get('/api/v1/questionnaires/NOT-A-UUID/sections/NOT-£_A_VALID@S3CTION')
                    .set('Authorization', `Bearer ${tokens['read-write:questionnaires']}`);

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
                    '/api/v1/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/sections/applicant-british-citizen-or-eu-national'
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
                        '/api/v1/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/sections/applicant-british-citizen-or-eu-national'
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
                        '/api/v1/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/sections/applicant-what-is-your-favourite-colour'
                    )
                    .set('Authorization', `Bearer ${tokens['read-write:questionnaires']}`);

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
describe('/questionnaires/{questionnaireId}/sections/{sectionName}/previous', () => {
    describe('get', () => {
        describe('200', () => {
            it('should Success', async () => {
                const res = await request(app)
                    .get(
                        '/api/v1/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/sections/applicant-british-citizen-or-eu-national/previous'
                    )
                    .set('Authorization', `Bearer ${tokens['read-write:questionnaires']}`);

                expect(res.statusCode).toBe(200);
                expect(res.type).toBe('application/vnd.api+json');
                expect(res.body).toMatchSchema({
                    $schema: 'http://json-schema.org/draft-07/schema#',
                    type: 'object',
                    required: ['data'],
                    properties: {
                        data: {
                            type: 'object',
                            items: {
                                type: 'object',
                                required: ['type', 'id', 'attributes'],
                                properties: {
                                    type: {const: 'sectionId'},
                                    id: {type: 'string', pattern: '^p--?([a-z0-9-]+)$'},
                                    attributes: {
                                        type: 'object',
                                        required: ['sectionId'],
                                        properties: {
                                            sectionId: {type: 'string', pattern: '^q([a-z0-9-]+)$'}
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
                    .get(
                        '/api/v1/questionnaires/NOT-A-UUID/sections/NOT-£_A_VALID@S3CTION/previous'
                    )
                    .set('Authorization', `Bearer ${tokens['read-write:questionnaires']}`);

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
                    '/api/v1/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/sections/applicant-british-citizen-or-eu-national/previous'
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
                        '/api/v1/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/sections/applicant-british-citizen-or-eu-national/previous'
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
                        '/api/v1/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/sections/applicant-what-is-your-favourite-colour/previous'
                    )
                    .set('Authorization', `Bearer ${tokens['read-write:questionnaires']}`);

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
