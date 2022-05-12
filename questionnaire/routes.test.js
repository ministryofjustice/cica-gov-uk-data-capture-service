'use strict';

const request = require('supertest');

beforeEach(() => {
    jest.resetModules();
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
                        getQuestionnaire: () => mockResponse
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
                    }
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
    describe('Back link should work with buggy implementation', () => {
        it('should return the previous section', async () => {
            // eslint-disable-next-line global-require
            const mockResponse = require('./test-fixtures/res/questionnaireCompleteWithCRN.json');

            // mock the DAL db integration
            jest.doMock('./questionnaire-dal.js', () =>
                // return a modified factory function, that returns an object with a method, that returns a valid created response
                jest.fn(() => ({
                    getQuestionnaire: () => mockResponse,
                    updateQuestionnaire: () => undefined
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
