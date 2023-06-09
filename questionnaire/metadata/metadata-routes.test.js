/* eslint-disable global-require */

'use strict';

const request = require('supertest');
const VError = require('verror');

const errorQuestionnaireId = '11111111-0c15-4a9c-9840-cb1007f098fb';

beforeEach(() => {
    jest.resetModules();
    jest.unmock('./metadata-service.js');
});

describe('Openapi version 2023-05-17 validation - Metadata', () => {
    jest.doMock('./metadata-service.js', () => {
        const questionnaireServiceMock = {
            getMetadata: jest.fn(() => {
                return 'ok';
            }),
            getMetadataByQuestionnaire: jest.fn(questionniareId => {
                if (questionniareId === errorQuestionnaireId) {
                    throw new VError(
                        {
                            name: 'ResourceNotFound'
                        },
                        `Resource /api/questionnaires/${questionniareId} does not exist`
                    );
                }
                return 'ok';
            })
        };

        return () => questionnaireServiceMock;
    });
    // app has an indirect dependency on questionnaire-service.js, require it after
    // the mock so that it references the mocked version
    const app = require('../../app');

    const token =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJkYXRhLWNhcHR1cmUtc2VydmljZSIsImlzcyI6IiQuYXVkIiwianRpIjoiODU4NDFhMTAtYjdlMS00OTA4LThkYTUtN2QwMjcxNGY0ZDZkIiwic3ViIjoiY2ljYS13ZWIiLCJzY29wZSI6ImNyZWF0ZTpzeXN0ZW0tYW5zd2VycyBjcmVhdGU6cXVlc3Rpb25uYWlyZXMgcmVhZDpxdWVzdGlvbm5haXJlcyB1cGRhdGU6cXVlc3Rpb25uYWlyZXMgZGVsZXRlOnF1ZXN0aW9ubmFpcmVzIHJlYWQ6cHJvZ3Jlc3MtZW50cmllcyIsImlhdCI6MTY4NjA2Mjk3M30.Z29MVERMyNTriszNJyPXx4n-sUFZMNCFSH1eQ74d8bI';

    describe('GET /questionnaires/metadata', () => {
        it('should return status code 401 if bearer token is NOT valid', async () => {
            const response = await request(app)
                .get('/api/questionnaires/metadata')
                .set('Authorization', `Bearer I-AM-INVALID`)
                .set('Content-Type', 'application/vnd.api+json')
                .set('On-Behalf-Of', `urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6`)
                .set('Dcs-Api-Version', '2023-05-17');
            expect(response.body).toHaveProperty('errors');
            expect(response.body.errors[0].status).toEqual(401);
            expect(response.body.errors[0].detail).toEqual('jwt malformed');
        });

        it('should return status code 403 if the bearer token has insufficient scope', async () => {
            // THIS IS A TOKEN WITH A DUMMY SCOPE
            const dummyToken =
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJkYXRhLWNhcHR1cmUtc2VydmljZSIsImlzcyI6IiQuYXVkIiwianRpIjoiNTFhODljYWUtM2Q1MC00ZDc1LTliMmEtMjU2NzliODgwMTkxIiwic3ViIjoiY2ljYS13ZWIiLCJzY29wZSI6ImNyZWF0ZTpub3RoaW5nIiwiaWF0IjoxNjgwNzk4NDU5fQ.97LgtlW_dcAV0Xno6BsbVmuyhLtq4gCoVWGQ56_VmEk';
            const response = await request(app)
                .get('/api/questionnaires/metadata')
                .set('Authorization', `Bearer ${dummyToken}`)
                .set('Content-Type', 'application/vnd.api+json')
                .set('On-Behalf-Of', `urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6`)
                .set('Dcs-Api-Version', '2023-05-17');
            expect(response.body).toHaveProperty('errors');
            expect(response.body.errors[0].status).toEqual(403);
            expect(response.body.errors[0].detail).toEqual('Insufficient scope');
        });

        describe('Requests made MUST include owner data', () => {
            it('should return status code 400 if owner data is NOT included in the request body', async () => {
                const response = await request(app)
                    .get('/api/questionnaires/metadata')
                    .set('Authorization', `Bearer ${token}`)
                    .set('Content-Type', 'application/vnd.api+json')
                    .set('Dcs-Api-Version', '2023-05-17');
                expect(response.body).toHaveProperty('errors');
                expect(response.body.errors[0].status).toEqual(400);
                expect(response.body.errors[0].detail).toEqual(
                    "should have required property 'on-behalf-of'"
                );
            });

            it('should return status code 200 if owner data is included in the header', async () => {
                const response = await request(app)
                    .get('/api/questionnaires/metadata')
                    .set('Authorization', `Bearer ${token}`)
                    .set('Content-Type', 'application/vnd.api+json')
                    .set('On-Behalf-Of', `urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6`)
                    .set('Dcs-Api-Version', '2023-05-17');
                expect(response.statusCode).toEqual(200);
            });
        });

        describe('Requests made MUST include "Dcs-Api-Version" header', () => {
            it('should return status code 400 if "Dcs-Api-Version" is NOT included in the header', async () => {
                const response = await request(app)
                    .get('/api/questionnaires/metadata')
                    .set('Authorization', `Bearer ${token}`)
                    .set('Content-Type', 'application/vnd.api+json')
                    .set('On-Behalf-Of', `urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6`);
                expect(response.body).toHaveProperty('errors');
                expect(response.body.errors[0].status).toEqual(400);
                expect(response.body.errors[0].detail).toEqual(
                    "should have required property 'dcs-api-version'"
                );
            });

            it('should return status code 200 if "Dcs-Api-Version" is included in the header', async () => {
                const response = await request(app)
                    .get('/api/questionnaires/metadata')
                    .set('Authorization', `Bearer ${token}`)
                    .set('Content-Type', 'application/vnd.api+json')
                    .set('On-Behalf-Of', `urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6`)
                    .set('Dcs-Api-Version', '2023-05-17');
                expect(response.statusCode).toEqual(200);
            });
        });
    });

    describe('GET /questionnaires/:questionnaireId/metadata', () => {
        it('should return status code 401 if bearer token is NOT valid', async () => {
            const response = await request(app)
                .get('/api/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/metadata')
                .set('Authorization', `Bearer I-AM-INVALID`)
                .set('Content-Type', 'application/vnd.api+json')
                .set('On-Behalf-Of', `urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6`)
                .set('Dcs-Api-Version', '2023-05-17');
            expect(response.body).toHaveProperty('errors');
            expect(response.body.errors[0].status).toEqual(401);
            expect(response.body.errors[0].detail).toEqual('jwt malformed');
        });

        it('should return status code 403 if the bearer token has insufficient scope', async () => {
            // THIS IS A TOKEN WITH A DUMMY SCOPE
            const dummyToken =
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJkYXRhLWNhcHR1cmUtc2VydmljZSIsImlzcyI6IiQuYXVkIiwianRpIjoiNTFhODljYWUtM2Q1MC00ZDc1LTliMmEtMjU2NzliODgwMTkxIiwic3ViIjoiY2ljYS13ZWIiLCJzY29wZSI6ImNyZWF0ZTpub3RoaW5nIiwiaWF0IjoxNjgwNzk4NDU5fQ.97LgtlW_dcAV0Xno6BsbVmuyhLtq4gCoVWGQ56_VmEk';
            const response = await request(app)
                .get('/api/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/metadata')
                .set('Authorization', `Bearer ${dummyToken}`)
                .set('Content-Type', 'application/vnd.api+json')
                .set('On-Behalf-Of', `urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6`)
                .set('Dcs-Api-Version', '2023-05-17');
            expect(response.body).toHaveProperty('errors');
            expect(response.body.errors[0].status).toEqual(403);
            expect(response.body.errors[0].detail).toEqual('Insufficient scope');
        });

        it('should return status code 404 if the questionnaireId is malformed', async () => {
            const response = await request(app)
                .get(`/api/questionnaires/${errorQuestionnaireId}/metadata`)
                .set('Authorization', `Bearer ${token}`)
                .set('Content-Type', 'application/vnd.api+json')
                .set('On-Behalf-Of', `urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6`)
                .set('Dcs-Api-Version', '2023-05-17');
            expect(response.body).toHaveProperty('errors');
            expect(response.body.errors[0].status).toEqual(404);
            expect(response.body.errors[0].detail).toEqual(
                `Resource /api/questionnaires/${errorQuestionnaireId} does not exist`
            );
        });

        describe('Requests made MUST include owner data', () => {
            it('should return status code 400 if owner data is NOT included in the request body', async () => {
                const response = await request(app)
                    .get('/api/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/metadata')
                    .set('Authorization', `Bearer ${token}`)
                    .set('Content-Type', 'application/vnd.api+json')
                    .set('Dcs-Api-Version', '2023-05-17');
                expect(response.body).toHaveProperty('errors');
                expect(response.body.errors[0].status).toEqual(400);
                expect(response.body.errors[0].detail).toEqual(
                    "should have required property 'on-behalf-of'"
                );
            });

            it('should return status code 200 if owner data is included in the header', async () => {
                const response = await request(app)
                    .get('/api/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/metadata')
                    .set('Authorization', `Bearer ${token}`)
                    .set('Content-Type', 'application/vnd.api+json')
                    .set('On-Behalf-Of', `urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6`)
                    .set('Dcs-Api-Version', '2023-05-17');
                expect(response.statusCode).toEqual(200);
            });
        });

        describe('Requests made MUST include "Dcs-Api-Version" header', () => {
            it('should return status code 400 if "Dcs-Api-Version" is NOT included in the header', async () => {
                const response = await request(app)
                    .get('/api/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/metadata')
                    .set('Authorization', `Bearer ${token}`)
                    .set('Content-Type', 'application/vnd.api+json')
                    .set('On-Behalf-Of', `urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6`);
                expect(response.body).toHaveProperty('errors');
                expect(response.body.errors[0].status).toEqual(400);
                expect(response.body.errors[0].detail).toEqual(
                    "should have required property 'dcs-api-version'"
                );
            });

            it('should return status code 200 if "Dcs-Api-Version" is included in the header', async () => {
                const response = await request(app)
                    .get('/api/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/metadata')
                    .set('Authorization', `Bearer ${token}`)
                    .set('Content-Type', 'application/vnd.api+json')
                    .set('On-Behalf-Of', `urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6`)
                    .set('Dcs-Api-Version', '2023-05-17');
                expect(response.statusCode).toEqual(200);
            });
        });
    });
});
