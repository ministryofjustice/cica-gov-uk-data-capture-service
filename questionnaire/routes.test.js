'use strict';

const request = require('supertest');

const tokens = {
    'read:progress-entries':
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJkYXRhLWNhcHR1cmUtc2VydmljZSIsImlzcyI6IiQuYXVkIiwianRpIjoiNDUwMzE2ZTYtNDFhNS00MGRjLWI3NTUtMzA2ZGQ2M2FlMDhiIiwic3ViIjoiY2ljYS13ZWIiLCJzY29wZSI6InJlYWQ6cHJvZ3Jlc3MtZW50cmllcyIsImlhdCI6MTU2NTc5NzE1MH0.fF6Ln7GZmq-R36N-Avuo_a_8Jj5-wla17x0552XnMbE'
};

const getQuestionnaireResponse = require('./test-fixtures/res/questionnaireCompleteWithCRN.json');

// mock the DAL db integration
jest.doMock('./questionnaire-dal.js', () =>
    // return a modified factory function, that returns an object with a method, that returns a valid created response
    jest.fn(() => ({
        getQuestionnaire: () => getQuestionnaireResponse
    }))
);

// app has an indirect dependency on questionnaire-dal.js, require it after
// the mock so that it references the mocked version
const app = require('../app');

describe('/questionnaires/{questionnaireId}/progress-entries?filter[position]=current', () => {
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
