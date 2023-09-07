'use strict';

const request = require('supertest');

jest.doMock('../questionnaire-dal.js', () =>
    jest.fn(() => ({
        getQuestionnaireIdsBySubmissionStatus: () => []
    }))
);

const app = require('../../app');

describe('Submission service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /resubmit-failed', () => {
        it('should return status code 401 if bearer token is NOT valid', async () => {
            const response = await request(app)
                .post('/api/admin/questionnaires/resubmit-failed')
                .set('Authorization', `Bearer I-AM-INVALID`)
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
                .post('/api/admin/questionnaires/resubmit-failed')
                .set('Authorization', `Bearer ${dummyToken}`)
                .set('Content-Type', 'application/vnd.api+json');
            expect(response.body).toHaveProperty('errors');
            expect(response.body.errors[0].status).toEqual(403);
            expect(response.body.errors[0].detail).toEqual('Insufficient scope');
        });

        it('should return status code 200 if successful', async () => {
            const token =
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJkYXRhLWNhcHR1cmUtc2VydmljZSIsImlzcyI6IiQuYXVkIiwianRpIjoiZDhhMTYzODMtMWVmNC00YmY5LWI1MDAtNzIyZDI1YTg4ODM5Iiwic3ViIjoiY3JvbmpvYiIsInNjb3BlIjoiYWRtaW4iLCJpYXQiOjE2OTQwODAzNTh9.br25YBOEg0y88aJGLAnIjQkFjcuKqnvmEzXWku0pKb0';
            const response = await request(app)
                .post('/api/admin/questionnaires/resubmit-failed')
                .set('Authorization', `Bearer ${token}`)
                .set('Content-Type', 'application/vnd.api+json');
            expect(response.statusCode).toEqual(200);
        });
    });
});
