/* eslint-disable global-require */

'use strict';

const request = require('supertest');
const VError = require('verror');

beforeEach(() => {
    jest.resetModules();
});

jest.doMock('./questionnaire-service.js', () =>
    jest.fn(() => ({
        createQuestionnaire: templateName => {
            if (templateName === 'this-does-not-exist') {
                throw new VError(
                    {
                        name: 'ResourceNotFound'
                    },
                    `Template "${templateName}" does not exist`
                );
            }

            return {
                type: 'questionnaires',
                id: '285cb104-0c15-4a9c-9840-cb1007f098fb',
                attributes: {
                    id: '285cb104-0c15-4a9c-9840-cb1007f098fb',
                    type: 'questionnaire',
                    version: '0.0.0',
                    routes: {
                        initial: 'a route'
                    }
                }
            };
        },
        getProgressEntries: (id, query) => {
            if (query.filter.sectionId === 'p--not-a-valid-section') {
                throw new VError(
                    {
                        name: 'ResourceNotFound'
                    },
                    `ProgressEntry "${query.filter.sectionId}" does not exist`
                );
            }
            return {
                type: 'progress-entries',
                id: '285cb104-0c15-4a9c-9840-cb1007f098fb',
                attributes: {
                    sectionId: 'p--some-section',
                    url: 'questionnaire'
                }
            };
        }
    }))
);

// app has an indirect dependency on questionnaire-service.js, require it after
// the mock so that it references the mocked version
const app = require('../app');

describe('POST /questionnaires', () => {
    const token =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJkYXRhLWNhcHR1cmUtc2VydmljZSIsImlzcyI6IiQuYXVkIiwianRpIjoiYWE3Nzk1ZmItNDg2Yy00NWEwLWJkNGMtZTMwNjFlNmNjNDk2Iiwic3ViIjoiY2ljYS13ZWIiLCJzY29wZSI6ImNyZWF0ZTpxdWVzdGlvbm5haXJlcyByZWFkOnF1ZXN0aW9ubmFpcmVzIHVwZGF0ZTpxdWVzdGlvbm5haXJlcyBkZWxldGU6cXVlc3Rpb25uYWlyZXMgcmVhZDpwcm9ncmVzcy1lbnRyaWVzIHJlYWQ6YW5zd2VycyIsImlhdCI6MTY4MDcwNTI3N30.OFXEk5CjaMZJVmS8Ioke2l2AlffayMCvIWZ2DwJCu2o';

    it('should return status code 400 if the template name is a bad format', async () => {
        const response = await request(app)
            .post('/api/v1/questionnaires')
            .set('Authorization', `Bearer ${token}`)
            .set('Content-Type', 'application/vnd.api+json')
            .send({
                data: {
                    type: 'questionnaires',
                    attributes: {
                        templateName: '!!!not-a-valid-format!!!',
                        owner: {
                            id: 'urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6',
                            isAuthenticated: true
                        }
                    }
                }
            });
        expect(response.body).toHaveProperty('errors');
        expect(response.body.errors[0].status).toEqual(400);
        expect(response.body.errors[0].detail).toEqual(
            'should match pattern "^[a-z]{1,20}(?:-[a-z]{1,20}){0,10}$"'
        );
    });

    it('should return status code 401 if bearer token is NOT valid', async () => {
        const response = await request(app)
            .post('/api/v1/questionnaires')
            .set('Authorization', `Bearer I-AM-INVALID`)
            .set('Content-Type', 'application/vnd.api+json')
            .send({
                data: {
                    type: 'questionnaires',
                    attributes: {
                        templateName: 'sexual-assault',
                        owner: {
                            id: 'urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6',
                            isAuthenticated: true
                        }
                    }
                }
            });
        expect(response.body).toHaveProperty('errors');
        expect(response.body.errors[0].status).toEqual(401);
        expect(response.body.errors[0].detail).toEqual('jwt malformed');
    });

    it('should return status code 403 if the bearer token has insufficient scope', async () => {
        // THIS IS A TOKEN WITH A DUMMY SCOPE
        const dummyToken =
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJkYXRhLWNhcHR1cmUtc2VydmljZSIsImlzcyI6IiQuYXVkIiwianRpIjoiNTFhODljYWUtM2Q1MC00ZDc1LTliMmEtMjU2NzliODgwMTkxIiwic3ViIjoiY2ljYS13ZWIiLCJzY29wZSI6ImNyZWF0ZTpub3RoaW5nIiwiaWF0IjoxNjgwNzk4NDU5fQ.97LgtlW_dcAV0Xno6BsbVmuyhLtq4gCoVWGQ56_VmEk';
        const response = await request(app)
            .post('/api/v1/questionnaires')
            .set('Authorization', `Bearer ${dummyToken}`)
            .set('Content-Type', 'application/vnd.api+json')
            .send({
                data: {
                    type: 'questionnaires',
                    attributes: {
                        templateName: 'sexual-assault',
                        owner: {
                            id: 'urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6',
                            isAuthenticated: true
                        }
                    }
                }
            });
        expect(response.body).toHaveProperty('errors');
        expect(response.body.errors[0].status).toEqual(403);
        expect(response.body.errors[0].detail).toEqual('Insufficient scope');
    });

    it('should return status code 404 if the request body contains incorrect data', async () => {
        const response = await request(app)
            .post('/api/v1/questionnaires')
            .set('Authorization', `Bearer ${token}`)
            .set('Content-Type', 'application/vnd.api+json')
            .send({
                data: {
                    type: 'questionnaires',
                    attributes: {
                        templateName: 'this-does-not-exist',
                        owner: {
                            id: 'urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6',
                            isAuthenticated: true
                        }
                    }
                }
            });
        expect(response.body).toHaveProperty('errors');
        expect(response.body.errors[0].status).toEqual(404);
        expect(response.body.errors[0].detail).toEqual(
            'Template "this-does-not-exist" does not exist'
        );
    });

    describe('Requests made MUST include owner data', () => {
        it('should return status code 400 if owner data is NOT included in the request body', async () => {
            const response = await request(app)
                .post('/api/v1/questionnaires')
                .set('Authorization', `Bearer ${token}`)
                .set('Content-Type', 'application/vnd.api+json')
                .send({
                    data: {
                        type: 'questionnaires',
                        attributes: {
                            templateName: 'sexual-assault'
                        }
                    }
                });
            expect(response.body).toHaveProperty('errors');
            expect(response.body.errors[0].status).toEqual(400);
            expect(response.body.errors[0].detail).toEqual("should have required property 'owner'");
        });

        it('should return status code 201 if owner data is included in the request body', async () => {
            const response = await request(app)
                .post('/api/v1/questionnaires')
                .set('Authorization', `Bearer ${token}`)
                .set('Content-Type', 'application/vnd.api+json')
                .send({
                    data: {
                        type: 'questionnaires',
                        attributes: {
                            templateName: 'sexual-assault',
                            owner: {
                                id: 'urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6',
                                isAuthenticated: true
                            }
                        }
                    }
                });
            expect(response.statusCode).toEqual(201);
        });
    });
});

describe('GET /questionnaires/:questionnaireId/progress-entries', () => {
    const token =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJkYXRhLWNhcHR1cmUtc2VydmljZSIsImlzcyI6IiQuYXVkIiwianRpIjoiYWE3Nzk1ZmItNDg2Yy00NWEwLWJkNGMtZTMwNjFlNmNjNDk2Iiwic3ViIjoiY2ljYS13ZWIiLCJzY29wZSI6ImNyZWF0ZTpxdWVzdGlvbm5haXJlcyByZWFkOnF1ZXN0aW9ubmFpcmVzIHVwZGF0ZTpxdWVzdGlvbm5haXJlcyBkZWxldGU6cXVlc3Rpb25uYWlyZXMgcmVhZDpwcm9ncmVzcy1lbnRyaWVzIHJlYWQ6YW5zd2VycyIsImlhdCI6MTY4MDcwNTI3N30.OFXEk5CjaMZJVmS8Ioke2l2AlffayMCvIWZ2DwJCu2o';

    it('should return status code 401 if bearer token is NOT valid', async () => {
        const response = await request(app)
            .get('/api/v1/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/progress-entries')
            .set('Authorization', `Bearer I-AM-INVALID`)
            .set('on-behalf-of', `urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6`)
            .set('Content-Type', 'application/vnd.api+json');
        expect(response.body).toHaveProperty('errors');
        expect(response.body.errors[0].status).toEqual(401);
        expect(response.body.errors[0].detail).toEqual('jwt malformed');
    });

    it('should return status code 403 if the bearer token has insufficient scope', async () => {
        // THIS IS A TOKEN WITH A DUMMY SCOPE
        const dummyToken =
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJkYXRhLWNhcHR1cmUtc2VydmljZSIsImlzcyI6IiQuYXVkIiwianRpIjoiNTFhODljYWUtM2Q1MC00ZDc1LTliMmEtMjU2NzliODgwMTkxIiwic3ViIjoiY2ljYS13ZWIiLCJzY29wZSI6ImNyZWF0ZTpub3RoaW5nIiwiaWF0IjoxNjgwNzk4NDU5fQ.97LgtlW_dcAV0Xno6BsbVmuyhLtq4gCoVWGQ56_VmEk';
        const response = await request(app)
            .get('/api/v1/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/progress-entries')
            .set('Authorization', `Bearer ${dummyToken}`)
            .set('on-behalf-of', `urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6`)
            .set('Content-Type', 'application/vnd.api+json');
        expect(response.body).toHaveProperty('errors');
        expect(response.body.errors[0].status).toEqual(403);
        expect(response.body.errors[0].detail).toEqual('Insufficient scope');
    });

    it('should return status code 404 if the query string contains incorrect data', async () => {
        const response = await request(app)
            .get(
                '/api/v1/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/progress-entries?filter[sectionId]=p--not-a-valid-section'
            )
            .set('Authorization', `Bearer ${token}`)
            .set('on-behalf-of', `urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6`)
            .set('Content-Type', 'application/vnd.api+json');
        expect(response.body).toHaveProperty('errors');
        expect(response.body.errors[0].status).toEqual(404);
        expect(response.body.errors[0].detail).toEqual(
            'ProgressEntry "p--not-a-valid-section" does not exist'
        );
    });

    describe('Requests made MUST include owner data', () => {
        it('should return status code 400 if owner data is NOT included in the request body', async () => {
            const response = await request(app)
                .get('/api/v1/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/progress-entries')
                .set('Authorization', `Bearer ${token}`)
                .set('Content-Type', 'application/vnd.api+json');
            expect(response.body).toHaveProperty('errors');
            expect(response.body.errors[0].status).toEqual(400);
            expect(response.body.errors[0].detail).toEqual(
                "should have required property 'on-behalf-of'"
            );
        });

        it('should return status code 200 if owner data is included in the header', async () => {
            const response = await request(app)
                .get('/api/v1/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/progress-entries')
                .set('Authorization', `Bearer ${token}`)
                .set('on-behalf-of', `urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6`)
                .set('Content-Type', 'application/vnd.api+json');
            expect(response.statusCode).toEqual(200);
        });
    });
});
