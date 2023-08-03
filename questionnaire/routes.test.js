/* eslint-disable global-require */

'use strict';

const request = require('supertest');
const VError = require('verror');

const completeQuestionnaireWithoutCRN = require('./test-fixtures/res/questionnaireCompleteWithoutCRN');
const incompleteQuestionnaireWithoutCRN = require('./test-fixtures/res/questionnaireIncompleteWithoutCRN');

beforeEach(() => {
    jest.resetModules();
    jest.unmock('./questionnaire-service.js');
});

describe('/questionnaires/{questionnaireId}/progress-entries?filter[position]=current', () => {
    describe('get', () => {
        describe('200', () => {
            it('should replace JSON Pointers with the value they reference', async () => {
                // eslint-disable-next-line global-require
                const mockResponse = require('./test-fixtures/res/questionnaireCompleteWithCRN.json');

                // mock the DAL db integration
                jest.doMock('./questionnaire-dal.js', () =>
                    // return a modified factory function, that returns an object with a method, that returns a valid created response
                    jest.fn(() => ({
                        getQuestionnaire: () => mockResponse,
                        getQuestionnaireModifiedDate: () => undefined
                    }))
                );

                const tokens = {
                    'read:progress-entries':
                        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJkYXRhLWNhcHR1cmUtc2VydmljZSIsImlzcyI6IiQuYXVkIiwianRpIjoiNDUwMzE2ZTYtNDFhNS00MGRjLWI3NTUtMzA2ZGQ2M2FlMDhiIiwic3ViIjoiY2ljYS13ZWIiLCJzY29wZSI6InJlYWQ6cHJvZ3Jlc3MtZW50cmllcyIsImlhdCI6MTU2NTc5NzE1MH0.fF6Ln7GZmq-R36N-Avuo_a_8Jj5-wla17x0552XnMbE'
                };
                // app has an indirect dependency on questionnaire-dal.js, require it after
                // the mock so that it references the mocked version
                // eslint-disable-next-line global-require
                const app = require('../app');
                const res = await request(app)
                    .get(
                        '/api/v1/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/progress-entries?filter[position]=current'
                    )
                    .set('Authorization', `Bearer ${tokens['read:progress-entries']}`);
                const confirmation =
                    res.body.included[0].attributes.properties.confirmation.description;

                expect(confirmation).toMatch(/19\\751194/);
                expect(confirmation).toMatch(/Barry\.foo@foo\.com/);
                expect(res.statusCode).toBe(200);
                expect(res.type).toBe('application/vnd.api+json');
            });
        });
    });
});

describe('Answering and retrieving the next section', () => {
    describe('Given a valid answer', () => {
        it('should coerce answer values', async () => {
            // eslint-disable-next-line global-require
            const mockQuestionnaire = require('./test-fixtures/res/transition-check.json');

            // mock the DAL db integration
            jest.doMock('./questionnaire-dal.js', () =>
                // return a modified factory function, that returns an object with a method, that returns a valid created response
                jest.fn(() => ({
                    getQuestionnaire: () => mockQuestionnaire,
                    updateQuestionnaire: () => undefined
                }))
            );

            const tokens = {
                'update:questionnaires':
                    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJkYXRhLWNhcHR1cmUtc2VydmljZSIsImlzcyI6IiQuYXVkIiwianRpIjoiYzVjNzc4ZWQtNTg4NC00N2YwLWFiYzctZTQ1MmZiYWRlYTcyIiwic3ViIjoiJC5hdWQiLCJzY29wZSI6ImNyZWF0ZTpxdWVzdGlvbm5haXJlcyByZWFkOnF1ZXN0aW9ubmFpcmVzIHVwZGF0ZTpxdWVzdGlvbm5haXJlcyBkZWxldGU6cXVlc3Rpb25uYWlyZXMiLCJpYXQiOjE1NjQwNTgyNTF9.Adv1qgj-HiNGxw_0cdYpPO8Fbw12rgJTTqMReJUmFBs'
            };
            // app has an indirect dependency on questionnaire-dal.js, require it after
            // the mock so that it references the mocked version
            // eslint-disable-next-line global-require
            const app = require('../app');

            function submitSectionAnswer(answer) {
                return request(app)
                    .post(
                        `/api/v1/questionnaires/1b7c6441-00ed-48c2-8c46-00bc90d446ec/sections/p-applicant-fatal-claim/answers`
                    )
                    .set('Authorization', `Bearer ${tokens['update:questionnaires']}`)
                    .set('Content-Type', 'application/vnd.api+json')
                    .send({data: {type: 'answers', attributes: answer}});
            }

            const booleanValueAsString = 'false';
            const submitAnswerRes = await submitSectionAnswer({
                'q-applicant-fatal-claim': booleanValueAsString
            });
            const coercedType = typeof submitAnswerRes.body.data.attributes[
                'q-applicant-fatal-claim'
            ];

            expect(submitAnswerRes.statusCode).toBe(201);
            expect(coercedType).toEqual('boolean');
        });

        it('should return the next section', async () => {
            // eslint-disable-next-line global-require
            let mockQuestionnaire = require('./test-fixtures/res/transition-check.json');

            // mock the DAL db integration
            jest.doMock('./questionnaire-dal.js', () =>
                // return a modified factory function, that returns an object with a method, that returns a valid created response
                jest.fn(() => ({
                    getQuestionnaire: () => mockQuestionnaire,
                    updateQuestionnaire: (id, updatedQuestionnaire) => {
                        mockQuestionnaire = updatedQuestionnaire;
                    },
                    getQuestionnaireModifiedDate: () => undefined
                }))
            );

            const tokens = {
                'read:progress-entries':
                    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJkYXRhLWNhcHR1cmUtc2VydmljZSIsImlzcyI6IiQuYXVkIiwianRpIjoiNDUwMzE2ZTYtNDFhNS00MGRjLWI3NTUtMzA2ZGQ2M2FlMDhiIiwic3ViIjoiY2ljYS13ZWIiLCJzY29wZSI6InJlYWQ6cHJvZ3Jlc3MtZW50cmllcyIsImlhdCI6MTU2NTc5NzE1MH0.fF6Ln7GZmq-R36N-Avuo_a_8Jj5-wla17x0552XnMbE',
                'update:questionnaires':
                    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJkYXRhLWNhcHR1cmUtc2VydmljZSIsImlzcyI6IiQuYXVkIiwianRpIjoiYzVjNzc4ZWQtNTg4NC00N2YwLWFiYzctZTQ1MmZiYWRlYTcyIiwic3ViIjoiJC5hdWQiLCJzY29wZSI6ImNyZWF0ZTpxdWVzdGlvbm5haXJlcyByZWFkOnF1ZXN0aW9ubmFpcmVzIHVwZGF0ZTpxdWVzdGlvbm5haXJlcyBkZWxldGU6cXVlc3Rpb25uYWlyZXMiLCJpYXQiOjE1NjQwNTgyNTF9.Adv1qgj-HiNGxw_0cdYpPO8Fbw12rgJTTqMReJUmFBs'
            };
            // app has an indirect dependency on questionnaire-dal.js, require it after
            // the mock so that it references the mocked version
            // eslint-disable-next-line global-require
            const app = require('../app');

            async function getCurrentSectionId() {
                const res = await request(app)
                    .get(
                        '/api/v1/questionnaires/1b7c6441-00ed-48c2-8c46-00bc90d446ec/progress-entries?filter[position]=current'
                    )
                    .set('Authorization', `Bearer ${tokens['read:progress-entries']}`);

                return res.body.data[0].id;
            }

            function submitSectionAnswer(answer) {
                return request(app)
                    .post(
                        `/api/v1/questionnaires/1b7c6441-00ed-48c2-8c46-00bc90d446ec/sections/p-applicant-fatal-claim/answers`
                    )
                    .set('Authorization', `Bearer ${tokens['update:questionnaires']}`)
                    .set('Content-Type', 'application/vnd.api+json')
                    .send({data: {type: 'answers', attributes: answer}});
            }

            const currentSectionId = await getCurrentSectionId();
            const submitAnswerRes = await submitSectionAnswer({
                'q-applicant-fatal-claim': 'false'
            });
            const newSectionId = await getCurrentSectionId();

            expect(submitAnswerRes.statusCode).toBe(201);
            expect(currentSectionId === newSectionId).toEqual(false);
            expect(newSectionId).toEqual('p--was-the-crime-reported-to-police');
        });
    });
});

describe('Issue: https://github.com/cdimascio/express-openapi-validator/issues/734', () => {
    describe('Back link should work with broken implementation', () => {
        it('should return the previous section', async () => {
            // eslint-disable-next-line global-require
            const mockResponse = require('./test-fixtures/res/questionnaireCompleteWithCRN.json');

            // mock the DAL db integration
            jest.doMock('./questionnaire-dal.js', () =>
                // return a modified factory function, that returns an object with a method, that returns a valid created response
                jest.fn(() => ({
                    getQuestionnaire: () => mockResponse,
                    updateQuestionnaire: () => undefined,
                    getQuestionnaireModifiedDate: () => undefined
                }))
            );

            const tokens = {
                'read:progress-entries':
                    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJkYXRhLWNhcHR1cmUtc2VydmljZSIsImlzcyI6IiQuYXVkIiwianRpIjoiNDUwMzE2ZTYtNDFhNS00MGRjLWI3NTUtMzA2ZGQ2M2FlMDhiIiwic3ViIjoiY2ljYS13ZWIiLCJzY29wZSI6InJlYWQ6cHJvZ3Jlc3MtZW50cmllcyIsImlhdCI6MTU2NTc5NzE1MH0.fF6Ln7GZmq-R36N-Avuo_a_8Jj5-wla17x0552XnMbE'
            };
            // app has an indirect dependency on questionnaire-dal.js, require it after
            // the mock so that it references the mocked version
            // eslint-disable-next-line global-require
            const app = require('../app');
            const res = await request(app)
                .get(
                    '/api/v1/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/progress-entries?page[before]=p--check-your-answers'
                )
                .set('Authorization', `Bearer ${tokens['read:progress-entries']}`);
            const previousSectionId = res.body.data[0].id;

            expect(previousSectionId).toEqual('p-applicant-enter-your-telephone-number');
        });
    });
});

describe('Openapi version 2023-05-17 validation', () => {
    jest.doMock('./questionnaire-service.js', () => {
        const questionnaireServiceMock = {
            createQuestionnaire: jest.fn(templateName => {
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
            }),
            getQuestionnaireSubmissionStatus: jest.fn(questionnaireId => {
                if (questionnaireId === '11111111-0c15-4a9c-9840-cb1007f098fb') {
                    return undefined;
                }
                if (questionnaireId === '44444444-0c15-4a9c-9840-cb1007f098fb') {
                    return 'IN_PROGRESS';
                }
                return 'NOT_STARTED';
            }),
            getSubmissionResponseData: jest.fn(() => {
                return 'ok';
            }),
            getProgressEntries: jest.fn((id, query) => {
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
            }),
            createAnswers: jest.fn((id, section) => {
                if (section === 'p-not-a-section') {
                    throw new VError(
                        {
                            name: 'ResourceNotFound'
                        },
                        `Resource /api/questionnaires/${id}/sections/${section}/answers does not exist`
                    );
                }
                return 'ok';
            }),
            updateQuestionnaireSubmissionStatus: jest.fn(() => {
                return 'ok';
            }),
            getQuestionnaire: jest.fn(questionnaireId => {
                if (questionnaireId === '00000000-0c15-4a9c-9840-cb1007f098fb') {
                    return undefined;
                }
                if (
                    questionnaireId === '22222222-0c15-4a9c-9840-cb1007f098fb' ||
                    questionnaireId === '44444444-0c15-4a9c-9840-cb1007f098fb'
                ) {
                    return completeQuestionnaireWithoutCRN;
                }
                if (questionnaireId === '33333333-0c15-4a9c-9840-cb1007f098fb') {
                    return incompleteQuestionnaireWithoutCRN;
                }
                return 'ok';
            }),

            getAnswersBySectionId: jest.fn((questionnaireId, sectionId) => {
                if (sectionId === 'p-not-a-section') {
                    throw new VError(
                        {
                            name: 'ResourceNotFound'
                        },
                        `Section "${sectionId}" does not exist`
                    );
                }
                return 'ok';
            }),
            updateExpiryForAuthenticatedOwner: jest.fn(() => {
                return 'ok';
            }),
            updateQuestionnaireModifiedDate: jest.fn(questionnaireId => {
                if (questionnaireId === '11111111-0c15-4a9c-9840-cb1007f098fb') {
                    throw new VError(
                        {
                            name: 'ResourceNotFound'
                        },
                        `Questionnaire "${questionnaireId}" was not found`
                    );
                }
                return 'ok';
            }),
            getSessionResource: jest.fn(() => {
                return 'ok';
            }),
            validateAllAnswers: jest.fn(() => {
                return 'ok';
            })
        };

        return () => questionnaireServiceMock;
    });

    const mockQuestionnaireService = require('./questionnaire-service.js')();
    // app has an indirect dependency on questionnaire-service.js, require it after
    // the mock so that it references the mocked version
    const app = require('../app');

    const token =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJkYXRhLWNhcHR1cmUtc2VydmljZSIsImlzcyI6IiQuYXVkIiwianRpIjoiODU4NDFhMTAtYjdlMS00OTA4LThkYTUtN2QwMjcxNGY0ZDZkIiwic3ViIjoiY2ljYS13ZWIiLCJzY29wZSI6ImNyZWF0ZTpzeXN0ZW0tYW5zd2VycyBjcmVhdGU6cXVlc3Rpb25uYWlyZXMgcmVhZDpxdWVzdGlvbm5haXJlcyB1cGRhdGU6cXVlc3Rpb25uYWlyZXMgZGVsZXRlOnF1ZXN0aW9ubmFpcmVzIHJlYWQ6cHJvZ3Jlc3MtZW50cmllcyIsImlhdCI6MTY4NjA2Mjk3M30.Z29MVERMyNTriszNJyPXx4n-sUFZMNCFSH1eQ74d8bI';

    describe('POST /questionnaires', () => {
        it('should return status code 401 if bearer token is NOT valid', async () => {
            const response = await request(app)
                .post('/api/questionnaires')
                .set('Authorization', `Bearer I-AM-INVALID`)
                .set('Content-Type', 'application/vnd.api+json')
                .set('Dcs-Api-Version', '2023-05-17')
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
                .post('/api/questionnaires')
                .set('Authorization', `Bearer ${dummyToken}`)
                .set('Content-Type', 'application/vnd.api+json')
                .set('Dcs-Api-Version', '2023-05-17')
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
                .post('/api/questionnaires')
                .set('Authorization', `Bearer ${token}`)
                .set('Content-Type', 'application/vnd.api+json')
                .set('Dcs-Api-Version', '2023-05-17')
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
                    .post('/api/questionnaires')
                    .set('Authorization', `Bearer ${token}`)
                    .set('Content-Type', 'application/vnd.api+json')
                    .set('Dcs-Api-Version', '2023-05-17')
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
                expect(response.body.errors[0].detail).toEqual(
                    "should have required property 'owner'"
                );
            });

            it('should return status code 201 if owner data is included in the request body', async () => {
                const response = await request(app)
                    .post('/api/questionnaires')
                    .set('Authorization', `Bearer ${token}`)
                    .set('Content-Type', 'application/vnd.api+json')
                    .set('Dcs-Api-Version', '2023-05-17')
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

        describe('Requests made MUST include "Dcs-Api-Version" header', () => {
            it('should return status code 400 if "Dcs-Api-Version" is NOT included in the header', async () => {
                const response = await request(app)
                    .post('/api/questionnaires')
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
                expect(response.body).toHaveProperty('errors');
                expect(response.body.errors[0].status).toEqual(400);
                expect(response.body.errors[0].detail).toEqual(
                    "should have required property 'dcs-api-version'"
                );
            });

            it('should return status code 400 if "Dcs-Api-Version" is malformed', async () => {
                const response = await request(app)
                    .post('/api/questionnaires')
                    .set('Authorization', `Bearer ${token}`)
                    .set('Content-Type', 'application/vnd.api+json')
                    .set('Dcs-Api-Version', 'not-a-version')
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
                expect(response.body.errors[0].status).toEqual(400);
                expect(response.body.errors[0].detail).toEqual(
                    'should be equal to one of the allowed values: 2023-05-17'
                );
            });

            it('should return status code 201 if "Dcs-Api-Version" is included in the header', async () => {
                const response = await request(app)
                    .post('/api/questionnaires')
                    .set('Authorization', `Bearer ${token}`)
                    .set('Content-Type', 'application/vnd.api+json')
                    .set('Dcs-Api-Version', '2023-05-17')
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

    describe('GET /questionnaires/{questionnaireId}/progress-entries', () => {
        it('should return status code 401 if bearer token is NOT valid', async () => {
            const response = await request(app)
                .get('/api/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/progress-entries')
                .set('Authorization', `Bearer I-AM-INVALID`)
                .set('Content-Type', 'application/vnd.api+json')
                .set('Dcs-Api-Version', '2023-05-17')
                .set('On-Behalf-Of', `urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6`);
            expect(response.body).toHaveProperty('errors');
            expect(response.body.errors[0].status).toEqual(401);
            expect(response.body.errors[0].detail).toEqual('jwt malformed');
        });

        it('should return status code 403 if the bearer token has insufficient scope', async () => {
            // THIS IS A TOKEN WITH A DUMMY SCOPE
            const dummyToken =
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJkYXRhLWNhcHR1cmUtc2VydmljZSIsImlzcyI6IiQuYXVkIiwianRpIjoiNTFhODljYWUtM2Q1MC00ZDc1LTliMmEtMjU2NzliODgwMTkxIiwic3ViIjoiY2ljYS13ZWIiLCJzY29wZSI6ImNyZWF0ZTpub3RoaW5nIiwiaWF0IjoxNjgwNzk4NDU5fQ.97LgtlW_dcAV0Xno6BsbVmuyhLtq4gCoVWGQ56_VmEk';
            const response = await request(app)
                .get('/api/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/progress-entries')
                .set('Authorization', `Bearer ${dummyToken}`)
                .set('Content-Type', 'application/vnd.api+json')
                .set('Dcs-Api-Version', '2023-05-17')
                .set('On-Behalf-Of', `urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6`);
            expect(response.body).toHaveProperty('errors');
            expect(response.body.errors[0].status).toEqual(403);
            expect(response.body.errors[0].detail).toEqual('Insufficient scope');
        });

        it('should return status code 404 if the query string contains incorrect data', async () => {
            const response = await request(app)
                .get(
                    '/api/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/progress-entries?filter[sectionId]=p--not-a-valid-section'
                )
                .set('Authorization', `Bearer ${token}`)
                .set('Content-Type', 'application/vnd.api+json')
                .set('Dcs-Api-Version', '2023-05-17')
                .set('On-Behalf-Of', `urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6`);
            expect(response.body).toHaveProperty('errors');
            expect(response.body.errors[0].status).toEqual(404);
            expect(response.body.errors[0].detail).toEqual(
                'ProgressEntry "p--not-a-valid-section" does not exist'
            );
        });

        describe('Requests made MUST include owner data', () => {
            it('should return status code 400 if owner data is NOT included in the request header', async () => {
                const response = await request(app)
                    .get(
                        '/api/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/progress-entries'
                    )
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
                    .get(
                        '/api/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/progress-entries'
                    )
                    .set('Authorization', `Bearer ${token}`)
                    .set('On-Behalf-Of', `urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6`)
                    .set('Content-Type', 'application/vnd.api+json')
                    .set('Dcs-Api-Version', '2023-05-17');
                expect(response.statusCode).toEqual(200);
            });
        });

        describe('Requests made MUST include "Dcs-Api-Version" header', () => {
            it('should return status code 400 if "Dcs-Api-Version" is NOT included in the header', async () => {
                const response = await request(app)
                    .get(
                        '/api/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/progress-entries'
                    )
                    .set('Authorization', `Bearer ${token}`)
                    .set('On-Behalf-Of', `urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6`)
                    .set('Content-Type', 'application/vnd.api+json');
                expect(response.body).toHaveProperty('errors');
                expect(response.body.errors[0].status).toEqual(400);
                expect(response.body.errors[0].detail).toEqual(
                    "should have required property 'dcs-api-version'"
                );
            });

            it('should return status code 400 if "Dcs-Api-Version" is malformed', async () => {
                const response = await request(app)
                    .get(
                        '/api/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/progress-entries'
                    )
                    .set('Authorization', `Bearer ${token}`)
                    .set('On-Behalf-Of', `urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6`)
                    .set('Content-Type', 'application/vnd.api+json')
                    .set('Dcs-Api-Version', 'not-a-version');
                expect(response.body).toHaveProperty('errors');
                expect(response.body.errors[0].status).toEqual(400);
                expect(response.body.errors[0].detail).toEqual(
                    'should be equal to one of the allowed values: 2023-05-17'
                );
            });

            it('should return status code 200 if "Dcs-Api-Version" is included in the header', async () => {
                const response = await request(app)
                    .get(
                        '/api/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/progress-entries'
                    )
                    .set('Authorization', `Bearer ${token}`)
                    .set('On-Behalf-Of', `urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6`)
                    .set('Content-Type', 'application/vnd.api+json')
                    .set('Dcs-Api-Version', '2023-05-17');
                expect(response.statusCode).toEqual(200);
            });
        });
    });

    describe('POST /questionnaires/:questionnaireId/sections/:sectionId/answers', () => {
        it('should return status code 401 if bearer token is NOT valid', async () => {
            const response = await request(app)
                .post(
                    '/api/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/sections/p-some-section/answers'
                )
                .set('Authorization', `Bearer I-AM-INVALID`)
                .set('Content-Type', 'application/vnd.api+json')
                .set('On-Behalf-Of', `urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6`)
                .set('Dcs-Api-Version', '2023-05-17')
                .send({
                    data: {
                        type: 'answers',
                        attributes: {
                            'q-some-question': true
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
                .post(
                    '/api/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/sections/p-some-section/answers'
                )
                .set('Authorization', `Bearer ${dummyToken}`)
                .set('Content-Type', 'application/vnd.api+json')
                .set('On-Behalf-Of', `urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6`)
                .set('Dcs-Api-Version', '2023-05-17')
                .send({
                    data: {
                        type: 'answers',
                        attributes: {
                            'q-some-question': true
                        }
                    }
                });
            expect(response.body).toHaveProperty('errors');
            expect(response.body.errors[0].status).toEqual(403);
            expect(response.body.errors[0].detail).toEqual('Insufficient scope');
        });

        it('should return status code 404 if the query string contains incorrect data', async () => {
            const response = await request(app)
                .post(
                    '/api/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/sections/p-not-a-section/answers'
                )
                .set('Authorization', `Bearer ${token}`)
                .set('Content-Type', 'application/vnd.api+json')
                .set('On-Behalf-Of', `urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6`)
                .set('Dcs-Api-Version', '2023-05-17')
                .send({
                    data: {
                        type: 'answers',
                        attributes: {
                            'q-some-question': true
                        }
                    }
                });
            expect(response.body).toHaveProperty('errors');
            expect(response.body.errors[0].status).toEqual(404);
            expect(response.body.errors[0].detail).toEqual(
                'Resource /api/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/sections/p-not-a-section/answers does not exist'
            );
        });

        describe('Requests made MUST include owner data', () => {
            it('should return status code 400 if owner data is NOT included in the request body', async () => {
                const response = await request(app)
                    .post(
                        '/api/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/sections/p-some-section/answers'
                    )
                    .set('Authorization', `Bearer ${token}`)
                    .set('Content-Type', 'application/vnd.api+json')
                    .set('Dcs-Api-Version', '2023-05-17')
                    .send({
                        data: {
                            type: 'answers',
                            attributes: {
                                'q-some-question': true
                            }
                        }
                    });
                expect(response.body).toHaveProperty('errors');
                expect(response.body.errors[0].status).toEqual(400);
                expect(response.body.errors[0].detail).toEqual(
                    "should have required property 'on-behalf-of'"
                );
            });

            it('should return status code 201 if owner data is included in the header', async () => {
                const response = await request(app)
                    .post(
                        '/api/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/sections/p-some-section/answers'
                    )
                    .set('Authorization', `Bearer ${token}`)
                    .set('Content-Type', 'application/vnd.api+json')
                    .set('On-Behalf-Of', `urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6`)
                    .set('Dcs-Api-Version', '2023-05-17')
                    .send({
                        data: {
                            type: 'answers',
                            attributes: {
                                'q-some-question': true
                            }
                        }
                    });
                expect(response.statusCode).toEqual(201);
            });
        });

        describe('Requests made MUST include "Dcs-Api-Version" header', () => {
            it('should return status code 400 if "Dcs-Api-Version" is NOT included in the header', async () => {
                const response = await request(app)
                    .post(
                        '/api/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/sections/p-some-section/answers'
                    )
                    .set('Authorization', `Bearer ${token}`)
                    .set('Content-Type', 'application/vnd.api+json')
                    .set('On-Behalf-Of', `urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6`)
                    .send({
                        data: {
                            type: 'answers',
                            attributes: {
                                'q-some-question': true
                            }
                        }
                    });
                expect(response.body).toHaveProperty('errors');
                expect(response.body.errors[0].status).toEqual(400);
                expect(response.body.errors[0].detail).toEqual(
                    "should have required property 'dcs-api-version'"
                );
            });

            it('should return status code 201 if "Dcs-Api-Version" is included in the header', async () => {
                const response = await request(app)
                    .post(
                        '/api/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/sections/p-some-section/answers'
                    )
                    .set('Authorization', `Bearer ${token}`)
                    .set('Content-Type', 'application/vnd.api+json')
                    .set('On-Behalf-Of', `urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6`)
                    .set('Dcs-Api-Version', '2023-05-17')
                    .send({
                        data: {
                            type: 'answers',
                            attributes: {
                                'q-some-question': true
                            }
                        }
                    });
                expect(response.statusCode).toEqual(201);
            });
        });

        describe('POST answers to the "system" section', () => {
            it('should perform actions specific to the "system" section', async () => {
                const response = await request(app)
                    .post(
                        '/api/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/sections/system/answers'
                    )
                    .set('Authorization', `Bearer ${token}`)
                    .set('Content-Type', 'application/vnd.api+json')
                    .set('On-Behalf-Of', `urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6`)
                    .set('Dcs-Api-Version', '2023-05-17')
                    .send({
                        data: {
                            type: 'answers',
                            attributes: {
                                system: {
                                    'case-reference': '23/700000'
                                }
                            }
                        }
                    });
                expect(response.statusCode).toEqual(201);
                expect(
                    mockQuestionnaireService.updateQuestionnaireSubmissionStatus
                ).toBeCalledTimes(1);
            });
        });

        describe('POST answers to the "owner" section', () => {
            it('should perform actions specific to the "owner" section', async () => {
                const response = await request(app)
                    .post(
                        '/api/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/sections/owner/answers'
                    )
                    .set('Authorization', `Bearer ${token}`)
                    .set('Content-Type', 'application/vnd.api+json')
                    .set('On-Behalf-Of', `urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6`)
                    .set('Dcs-Api-Version', '2023-05-17')
                    .send({
                        data: {
                            type: 'answers',
                            attributes: {
                                owner: {
                                    id:
                                        'urn:fdc:gov.uk:2022:ZoTyx0owL1MYS-UkCwtQXbF2A-padOhdssGvXDfamws',
                                    isAuthenticated: true
                                }
                            }
                        }
                    });
                expect(response.statusCode).toEqual(201);
                expect(mockQuestionnaireService.updateExpiryForAuthenticatedOwner).toBeCalledTimes(
                    1
                );
            });
        });
    });

    describe('GET /questionnaires/:questionnaireId/sections/:sectionId/answers', () => {
        it('should return status code 401 if bearer token is NOT valid', async () => {
            const response = await request(app)
                .get(
                    '/api/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/sections/p-some-section/answers'
                )
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
                .get(
                    '/api/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/sections/p-some-section/answers'
                )
                .set('Authorization', `Bearer ${dummyToken}`)
                .set('Content-Type', 'application/vnd.api+json')
                .set('On-Behalf-Of', `urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6`)
                .set('Dcs-Api-Version', '2023-05-17');
            expect(response.body).toHaveProperty('errors');
            expect(response.body.errors[0].status).toEqual(403);
            expect(response.body.errors[0].detail).toEqual('Insufficient scope');
        });

        it('should return status code 404 if the query string contains incorrect data', async () => {
            const response = await request(app)
                .get(
                    '/api/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/sections/p-not-a-section/answers'
                )
                .set('Authorization', `Bearer ${token}`)
                .set('Content-Type', 'application/vnd.api+json')
                .set('On-Behalf-Of', `urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6`)
                .set('Dcs-Api-Version', '2023-05-17');
            expect(response.body).toHaveProperty('errors');
            expect(response.body.errors[0].status).toEqual(404);
            expect(response.body.errors[0].detail).toEqual(
                'Section "p-not-a-section" does not exist'
            );
        });

        describe('Requests made MUST include owner data', () => {
            it('should return status code 400 if owner data is NOT included in the request body', async () => {
                const response = await request(app)
                    .get(
                        '/api/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/sections/p-some-section/answers'
                    )
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
                    .get(
                        '/api/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/sections/p-some-section/answers'
                    )
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
                    .get(
                        '/api/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/sections/p-some-section/answers'
                    )
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
                    .get(
                        '/api/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/sections/p-some-section/answers'
                    )
                    .set('Authorization', `Bearer ${token}`)
                    .set('Content-Type', 'application/vnd.api+json')
                    .set('On-Behalf-Of', `urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6`)
                    .set('Dcs-Api-Version', '2023-05-17');
                expect(response.statusCode).toEqual(200);
            });
        });
    });

    describe('GET /:questionnaireId/session/keep-alive', () => {
        it('should return status code 401 if bearer token is NOT valid', async () => {
            const response = await request(app)
                .get('/api/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/session/keep-alive')
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
                .get('/api/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/session/keep-alive')
                .set('Authorization', `Bearer ${dummyToken}`)
                .set('Content-Type', 'application/vnd.api+json')
                .set('On-Behalf-Of', `urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6`)
                .set('Dcs-Api-Version', '2023-05-17');
            expect(response.body).toHaveProperty('errors');
            expect(response.body.errors[0].status).toEqual(403);
            expect(response.body.errors[0].detail).toEqual('Insufficient scope');
        });

        it('should return status code 404 if the query string contains incorrect data', async () => {
            const response = await request(app)
                .get('/api/questionnaires/11111111-0c15-4a9c-9840-cb1007f098fb/session/keep-alive')
                .set('Authorization', `Bearer ${token}`)
                .set('Content-Type', 'application/vnd.api+json')
                .set('On-Behalf-Of', `urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6`)
                .set('Dcs-Api-Version', '2023-05-17');
            expect(response.body).toHaveProperty('errors');
            expect(response.body.errors[0].status).toEqual(404);
        });

        describe('Requests made MUST include owner data', () => {
            it('should return status code 400 if owner data is NOT included in the request body', async () => {
                const response = await request(app)
                    .get(
                        '/api/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/session/keep-alive'
                    )
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
                    .get(
                        '/api/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/session/keep-alive'
                    )
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
                    .get(
                        '/api/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/session/keep-alive'
                    )
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
                    .get(
                        '/api/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/session/keep-alive'
                    )
                    .set('Authorization', `Bearer ${token}`)
                    .set('Content-Type', 'application/vnd.api+json')
                    .set('On-Behalf-Of', `urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6`)
                    .set('Dcs-Api-Version', '2023-05-17');
                expect(response.statusCode).toEqual(200);
            });
        });
    });

    describe('GET /questionnaires/:questionnaireId/submissions', () => {
        it('should return status code 401 if bearer token is NOT valid', async () => {
            const response = await request(app)
                .get('/api/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/submissions')
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
                .get('/api/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/submissions')
                .set('Authorization', `Bearer ${dummyToken}`)
                .set('Content-Type', 'application/vnd.api+json')
                .set('On-Behalf-Of', `urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6`)
                .set('Dcs-Api-Version', '2023-05-17');
            expect(response.body).toHaveProperty('errors');
            expect(response.body.errors[0].status).toEqual(403);
            expect(response.body.errors[0].detail).toEqual('Insufficient scope');
        });

        it('should return status code 404 if the query string contains incorrect data', async () => {
            const response = await request(app)
                .get('/api/questionnaires/11111111-0c15-4a9c-9840-cb1007f098fb/submissions')
                .set('Authorization', `Bearer ${token}`)
                .set('Content-Type', 'application/vnd.api+json')
                .set('On-Behalf-Of', `urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6`)
                .set('Dcs-Api-Version', '2023-05-17');
            expect(response.body).toHaveProperty('errors');
            expect(response.body.errors[0].status).toEqual(404);
            expect(response.body.errors[0].detail).toEqual(
                'Questionnaire with questionnaireId "11111111-0c15-4a9c-9840-cb1007f098fb" does not exist'
            );
        });

        describe('Requests made MUST include owner data', () => {
            it('should return status code 400 if owner data is NOT included in the request header', async () => {
                const response = await request(app)
                    .get('/api/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/submissions')
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
                    .get('/api/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/submissions')
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
                    .get('/api/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/submissions')
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
                    .get('/api/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/submissions')
                    .set('Authorization', `Bearer ${token}`)
                    .set('Content-Type', 'application/vnd.api+json')
                    .set('On-Behalf-Of', `urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6`)
                    .set('Dcs-Api-Version', '2023-05-17');
                expect(response.statusCode).toEqual(200);
            });
        });
    });

    describe('POST /questionnaires/:questionnaireId/submissions', () => {
        it('should return status code 401 if bearer token is NOT valid', async () => {
            const response = await request(app)
                .post('/api/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/submissions')
                .set('Authorization', `Bearer I-AM-INVALID`)
                .set('Content-Type', 'application/vnd.api+json')
                .set('On-Behalf-Of', `urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6`)
                .set('Dcs-Api-Version', '2023-05-17')
                .send({
                    data: {
                        type: 'submissions',
                        attributes: {
                            questionnaireId: '285cb104-0c15-4a9c-9840-cb1007f098fb'
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
                .post('/api/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/submissions')
                .set('Authorization', `Bearer ${dummyToken}`)
                .set('Content-Type', 'application/vnd.api+json')
                .set('On-Behalf-Of', `urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6`)
                .set('Dcs-Api-Version', '2023-05-17')
                .send({
                    data: {
                        type: 'submissions',
                        attributes: {
                            questionnaireId: '285cb104-0c15-4a9c-9840-cb1007f098fb'
                        }
                    }
                });
            expect(response.body).toHaveProperty('errors');
            expect(response.body.errors[0].status).toEqual(403);
            expect(response.body.errors[0].detail).toEqual('Insufficient scope');
        });

        it('should return status code 404 if the query string contains incorrect data', async () => {
            const response = await request(app)
                .post('/api/questionnaires/00000000-0c15-4a9c-9840-cb1007f098fb/submissions')
                .set('Authorization', `Bearer ${token}`)
                .set('Content-Type', 'application/vnd.api+json')
                .set('On-Behalf-Of', `urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6`)
                .set('Dcs-Api-Version', '2023-05-17')
                .send({
                    data: {
                        type: 'submissions',
                        attributes: {
                            questionnaireId: '00000000-0c15-4a9c-9840-cb1007f098fb'
                        }
                    }
                });
            expect(response.body).toHaveProperty('errors');
            expect(response.body.errors[0].status).toEqual(404);
            expect(response.body.errors[0].detail).toEqual(
                'Questionnaire with questionnaireId "00000000-0c15-4a9c-9840-cb1007f098fb" does not exist'
            );
        });

        it('should return status code 409 if the resource is not in a submittable state', async () => {
            const response = await request(app)
                .post('/api/questionnaires/33333333-0c15-4a9c-9840-cb1007f098fb/submissions')
                .set('Authorization', `Bearer ${token}`)
                .set('Content-Type', 'application/vnd.api+json')
                .set('On-Behalf-Of', `urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6`)
                .set('Dcs-Api-Version', '2023-05-17')
                .send({
                    data: {
                        type: 'submissions',
                        attributes: {
                            questionnaireId: '33333333-0c15-4a9c-9840-cb1007f098fb'
                        }
                    }
                });
            expect(response.body).toHaveProperty('errors');
            expect(response.body.errors[0].status).toEqual(409);
            expect(response.body.errors[0].detail).toEqual(
                'Questionnaire with ID "33333333-0c15-4a9c-9840-cb1007f098fb" is not in a submittable state'
            );
        });

        it('should return status code 409 if there is a resource conflict', async () => {
            const response = await request(app)
                .post('/api/questionnaires/44444444-0c15-4a9c-9840-cb1007f098fb/submissions')
                .set('Authorization', `Bearer ${token}`)
                .set('Content-Type', 'application/vnd.api+json')
                .set('On-Behalf-Of', `urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6`)
                .set('Dcs-Api-Version', '2023-05-17')
                .send({
                    data: {
                        type: 'submissions',
                        attributes: {
                            questionnaireId: '44444444-0c15-4a9c-9840-cb1007f098fb'
                        }
                    }
                });
            expect(response.body).toHaveProperty('errors');
            expect(response.body.errors[0].status).toEqual(409);
            expect(response.body.errors[0].detail).toEqual(
                'Submission resource with ID "44444444-0c15-4a9c-9840-cb1007f098fb" already exists'
            );
        });

        describe('Requests made MUST include owner data', () => {
            it('should return status code 400 if owner data is NOT included in the request header', async () => {
                const response = await request(app)
                    .post('/api/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/submissions')
                    .set('Authorization', `Bearer ${token}`)
                    .set('Content-Type', 'application/vnd.api+json')
                    .set('Dcs-Api-Version', '2023-05-17')
                    .send({
                        data: {
                            type: 'submissions',
                            attributes: {
                                questionnaireId: '285cb104-0c15-4a9c-9840-cb1007f098fb'
                            }
                        }
                    });
                expect(response.body).toHaveProperty('errors');
                expect(response.body.errors[0].status).toEqual(400);
                expect(response.body.errors[0].detail).toEqual(
                    "should have required property 'on-behalf-of'"
                );
            });

            it('should return status code 201 if owner data is included in the header', async () => {
                const response = await request(app)
                    .post('/api/questionnaires/22222222-0c15-4a9c-9840-cb1007f098fb/submissions')
                    .set('Authorization', `Bearer ${token}`)
                    .set('Content-Type', 'application/vnd.api+json')
                    .set('On-Behalf-Of', `urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6`)
                    .set('Dcs-Api-Version', '2023-05-17')
                    .send({
                        data: {
                            type: 'submissions',
                            attributes: {
                                questionnaireId: '22222222-0c15-4a9c-9840-cb1007f098fb'
                            }
                        }
                    });
                expect(response.statusCode).toEqual(201);
            });
        });

        describe('Requests made MUST include "Dcs-Api-Version" header', () => {
            it('should return status code 400 if "Dcs-Api-Version" is NOT included in the header', async () => {
                const response = await request(app)
                    .post('/api/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/submissions')
                    .set('Authorization', `Bearer ${token}`)
                    .set('Content-Type', 'application/vnd.api+json')
                    .set('On-Behalf-Of', `urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6`)
                    .send({
                        data: {
                            type: 'submissions',
                            attributes: {
                                questionnaireId: '285cb104-0c15-4a9c-9840-cb1007f098fb'
                            }
                        }
                    });
                expect(response.body).toHaveProperty('errors');
                expect(response.body.errors[0].status).toEqual(400);
                expect(response.body.errors[0].detail).toEqual(
                    "should have required property 'dcs-api-version'"
                );
            });

            it('should return status code 201 if "Dcs-Api-Version" is included in the header', async () => {
                const response = await request(app)
                    .post('/api/questionnaires/22222222-0c15-4a9c-9840-cb1007f098fb/submissions')
                    .set('Authorization', `Bearer ${token}`)
                    .set('Content-Type', 'application/vnd.api+json')
                    .set('On-Behalf-Of', `urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6`)
                    .set('Dcs-Api-Version', '2023-05-17')
                    .send({
                        data: {
                            type: 'submissions',
                            attributes: {
                                questionnaireId: '22222222-0c15-4a9c-9840-cb1007f098fb'
                            }
                        }
                    });
                expect(response.statusCode).toEqual(201);
            });
        });
    });
});
