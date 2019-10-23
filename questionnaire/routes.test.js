'use strict';

const request = require('supertest');

const tokens = {
    'create:questionnaires':
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJkYXRhLWNhcHR1cmUtc2VydmljZSIsImlzcyI6IiQuYXVkIiwianRpIjoiZGJkOTFkMTUtYTQwZC00ZGFhLWI5ODAtYmZjMGVjZmUzMDNmIiwic3ViIjoiY2ljYS13ZWIiLCJzY29wZSI6ImNyZWF0ZTpxdWVzdGlvbm5haXJlcyIsImlhdCI6MTU3MDAyNjEyNX0.iiyP58R5WRJ6nqjlkxqp8XsCu3IXKA1-DnJ8JLNJHQU',
    'read:progress-entries':
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJkYXRhLWNhcHR1cmUtc2VydmljZSIsImlzcyI6IiQuYXVkIiwianRpIjoiNDUwMzE2ZTYtNDFhNS00MGRjLWI3NTUtMzA2ZGQ2M2FlMDhiIiwic3ViIjoiY2ljYS13ZWIiLCJzY29wZSI6InJlYWQ6cHJvZ3Jlc3MtZW50cmllcyIsImlhdCI6MTU2NTc5NzE1MH0.fF6Ln7GZmq-R36N-Avuo_a_8Jj5-wla17x0552XnMbE',
    'read:questionnaires':
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJkYXRhLWNhcHR1cmUtc2VydmljZSIsImlzcyI6IiQuYXVkIiwianRpIjoiYzVjNzc4ZWQtNTg4NC00N2YwLWFiYzctZTQ1MmZiYWRlYTcyIiwic3ViIjoiJC5hdWQiLCJzY29wZSI6ImNyZWF0ZTpxdWVzdGlvbm5haXJlcyByZWFkOnF1ZXN0aW9ubmFpcmVzIHVwZGF0ZTpxdWVzdGlvbm5haXJlcyBkZWxldGU6cXVlc3Rpb25uYWlyZXMiLCJpYXQiOjE1NjQwNTgyNTF9.Adv1qgj-HiNGxw_0cdYpPO8Fbw12rgJTTqMReJUmFBs',
    'update:questionnaires':
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJkYXRhLWNhcHR1cmUtc2VydmljZSIsImlzcyI6IiQuYXVkIiwianRpIjoiYzVjNzc4ZWQtNTg4NC00N2YwLWFiYzctZTQ1MmZiYWRlYTcyIiwic3ViIjoiJC5hdWQiLCJzY29wZSI6ImNyZWF0ZTpxdWVzdGlvbm5haXJlcyByZWFkOnF1ZXN0aW9ubmFpcmVzIHVwZGF0ZTpxdWVzdGlvbm5haXJlcyBkZWxldGU6cXVlc3Rpb25uYWlyZXMiLCJpYXQiOjE1NjQwNTgyNTF9.Adv1qgj-HiNGxw_0cdYpPO8Fbw12rgJTTqMReJUmFBs'
};

const getQuestionnaireResponse = require('./test-fixtures/res/questionnaireCompleteWithCRN.json');

describe('/questionnaires/{questionnaireId}/progress-entries?filter[position]=current', () => {
    let app;
    beforeAll(() => {
        // mock the DAL db integration
        jest.doMock('./questionnaire-dal.js', () =>
            // return a modified factory function, that returns an object with a method, that returns a valid created response
            jest.fn(() => ({
                getQuestionnaire: () => getQuestionnaireResponse
            }))
        );

        // app has an indirect dependency on questionnaire-dal.js, require it after
        // the mock so that it references the mocked version
        // eslint-disable-next-line global-require
        app = require('../app');
    });
    describe('get', () => {
        describe('200', () => {
            it('should replace JSON Pointers with the value they reference', async () => {
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

describe('/questionnaires/{questionnaireId}/submissions', () => {
    let app;
    describe('get', () => {
        beforeAll(() => {
            jest.resetModules();
            // mock the DAL db integration
            jest.doMock('./questionnaire-dal.js', () =>
                // return a modified factory function, that returns an object with a method, that returns a valid created response
                jest.fn(() => ({
                    getQuestionnaire: () => getQuestionnaireResponse,
                    getQuestionnaireSubmissionStatus: () => undefined
                }))
            );
            // eslint-disable-next-line global-require
            app = require('../app');
        });
        describe('404', () => {
            it('should error if questionnaire is not found', async () => {
                const res = await request(app)
                    .get('/api/v1/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/submissions')
                    .set('Content-Type', 'application/vnd.api+json')
                    .set('Authorization', `Bearer ${tokens['read:questionnaires']}`);
                expect(res.status).toEqual(404);
            });
        });
    });
    describe('post', () => {
        beforeAll(() => {
            jest.resetModules();
            jest.doMock('./questionnaire-dal.js', () =>
                jest.fn(() => ({
                    getQuestionnaire: () => undefined,
                    getQuestionnaireSubmissionStatus: () => 'NOT_STARTED'
                }))
            );
            // eslint-disable-next-line global-require
            app = require('../app');
        });
        describe('404', () => {
            it('should error if submission status is not found', async () => {
                const res = await request(app)
                    .post('/api/v1/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/submissions')
                    .set('Content-Type', 'application/vnd.api+json')
                    .set('Authorization', `Bearer ${tokens['update:questionnaires']}`)
                    .send({
                        data: {
                            type: 'submissions',
                            attributes: {questionnaireId: '285cb104-0c15-4a9c-9840-cb1007f098fb'}
                        }
                    });
                expect(res.status).toEqual(404);
            });
        });
    });
});

describe('/:questionnaireId/sections/:sectionId/answers', () => {
    let app;
    describe('post', () => {
        beforeAll(() => {
            jest.resetModules();
            jest.doMock('./questionnaire-dal.js', () =>
                // return a modified factory function, that returns an object with a method, that returns a valid created response
                jest.fn(() => ({
                    getQuestionnaire: () => getQuestionnaireResponse,
                    getQuestionnaireSubmissionStatus: () => 'NOT_STARTED',
                    updateQuestionnaire: () => undefined
                }))
            );
            // eslint-disable-next-line global-require
            app = require('../app');
        });
        describe('201', () => {
            it('should create answers', async () => {
                const res = await request(app)
                    .post(
                        '/api/v1/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/sections/p-applicant-enter-your-email-address/answers'
                    )
                    .set('Content-Type', 'application/vnd.api+json')
                    .set('Authorization', `Bearer ${tokens['update:questionnaires']}`)
                    .send({
                        data: {
                            type: 'answers',
                            attributes: {
                                'q-applicant-enter-your-email-address': 'Barry.foo@foo.com'
                            }
                        }
                    });
                expect(res.body.data.attributes).toEqual({
                    'q-applicant-enter-your-email-address': 'Barry.foo@foo.com'
                });
            });
            it('should return a 201 response', async () => {
                const res = await request(app)
                    .post(
                        '/api/v1/questionnaires/285cb104-0c15-4a9c-9840-cb1007f098fb/sections/p-applicant-enter-your-email-address/answers'
                    )
                    .set('Content-Type', 'application/vnd.api+json')
                    .set('Authorization', `Bearer ${tokens['update:questionnaires']}`)
                    .send({
                        data: {
                            type: 'answers',
                            attributes: {
                                'q-applicant-enter-your-email-address': 'Barry.foo@foo.com'
                            }
                        }
                    });
                expect(res.status).toEqual(201);
            });
        });
    });
});

describe('/', () => {
    let app;
    describe('post', () => {
        beforeAll(() => {
            jest.resetModules();
            jest.doMock('./questionnaire-dal.js', () =>
                // return a modified factory function, that returns an object with a method, that returns a valid created response
                jest.fn(() => ({
                    createQuestionnaire: () => getQuestionnaireResponse
                }))
            );
            // eslint-disable-next-line global-require
            app = require('../app');
        });
        describe('201', () => {
            it('should create questionnaire', async () => {
                const res = await request(app)
                    .post('/api/v1/questionnaires')
                    .set('Content-Type', 'application/vnd.api+json')
                    .set('Authorization', `Bearer ${tokens['create:questionnaires']}`)
                    .send({
                        data: {
                            type: 'questionnaires',
                            attributes: {
                                templateName: 'sexual-assault'
                            }
                        }
                    });
                expect(res.body.data.attributes.type).toEqual('apply-for-compensation');
            });
            // it('should return a bad request response', async () => {
            //     const res = await request(app)
            //         .post('/api/v1/questionnaires')
            //         .set('Content-Type', 'application/vnd.api+json')
            //         .set('Authorization', `Bearer ${tokens['create:questionnaires']}`)
            //         .send({
            //             data: {
            //                 type: 'questionnaires',
            //                 attributes: {
            //                     templateName: 'BAD_TEMPLATE_NAME_%£)(^$£(&$^£'
            //                 }
            //             }
            //         });
            //     expect(res.status).toEqual(400);
            // });
        });
    });
});
