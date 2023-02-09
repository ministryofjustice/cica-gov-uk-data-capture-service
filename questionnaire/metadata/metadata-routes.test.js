'use strict';

const request = require('supertest');

const tokens = {
    'read:questionnaires':
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJkYXRhLWNhcHR1cmUtc2VydmljZSIsImlzcyI6IiQuYXVkIiwianRpIjoiN2YwYjAxOTktMjcxOS00ZGUxLWE1MjgtY2RmMjZkNmM3YTU5Iiwic3ViIjoiJC5hdWQiLCJzY29wZSI6InJlYWQ6cXVlc3Rpb25uYWlyZXMiLCJpYXQiOjE1NzAxODE2NDB9.uoGJM6snG6pd51UMbf7k86_1ACIrGdEJBRjlEv0twIQ'
};

// mock the DAL db integration
jest.doMock('./metadata-service.js', () =>
    // return a modified factory function, that returns an object with a method, that returns a valid created response
    jest.fn(() => ({
        getMetadata: () => {
            return {foo: 'bar'};
        }
    }))
);

// app has an indirect dependency on questionnaire-dal.js, require it after
// the mock so that it references the mocked version
const app = require('../../app');

describe('/questionnaires/metadata', () => {
    it('should return metadata', async () => {
        const res = await request(app)
            .get('/api/v1/questionnaires/metadata')
            .set('Authorization', `Bearer ${tokens['read:questionnaires']}`);

        const expected = {foo: 'bar'};

        expect(res.status).toEqual(200);
        expect(res.body).toEqual(expected);
    });
});
