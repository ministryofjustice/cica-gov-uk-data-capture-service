'use strict';

const VError = require('verror');
const request = require('supertest');
const {matchersWithOptions} = require('jest-json-schema');
const $RefParser = require('json-schema-ref-parser');
const questionnaireFixtures = require('./test-fixtures');

const tokens = {
    'read:questionnaires':
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJkYXRhLWNhcHR1cmUtc2VydmljZSIsImlzcyI6IiQuYXVkIiwianRpIjoiN2YwYjAxOTktMjcxOS00ZGUxLWE1MjgtY2RmMjZkNmM3YTU5Iiwic3ViIjoiJC5hdWQiLCJzY29wZSI6InJlYWQ6cXVlc3Rpb25uYWlyZXMiLCJpYXQiOjE1NzAxODE2NDB9.uoGJM6snG6pd51UMbf7k86_1ACIrGdEJBRjlEv0twIQ'
};
const filepath = 'openapi/src/json-schemas/api/_questionnaires_{questionnaireId}_dataset/get/res';
const v1SchemaFilepath = `${filepath}/200-v1.0.0.json`;
const v2SchemaFilepath = `${filepath}/200-v2.0.0.json`;

// // mock the DAL db integration
// jest.doMock('../questionnaire-dal.js', () =>
//     // return a modified factory function, that returns an object with a method, that returns a valid created response
//     jest.fn(() => ({
//         getQuestionnaire: questionnaireId => {
//             if (questionnaireId === 'cb2eadc7-9189-4c4d-9eb3-896b72a1ed16') {
//                 return questionnaireFixtures.getSimpleAndCompositeAttributes();
//             }

//             throw new VError(
//                 {
//                     name: 'ResourceNotFound'
//                 },
//                 `Questionnaire "${questionnaireId}" not found`
//             );
//         }
//     }))
// );

// mock the DAL db integration
jest.doMock('../questionnaire-dal.js', () =>
    // return a modified factory function, that returns an object with a method, that returns a valid created response
    jest.fn(() => ({
        // createQuestionnaire: () => {},
        getQuestionnaireByOwner: questionnaireId => {
            // if (questionnaireId === '285cb104-0c15-4a9c-9840-cb1007f098fb') {
            //     return getQuestionnaireResponse;
            // }

            throw new VError(
                {
                    name: 'ResourceNotFound'
                },
                `Questionnaire "${questionnaireId}" not found`
            );
        }
        // updateQuestionnaire: () => undefined,
        // getQuestionnaireSubmissionStatus: questionnaireId => {
        //     if (questionnaireId === '285cb104-0c15-4a9c-9840-cb1007f098fb') {
        //         return 'NOT_STARTED';
        //     }

        //     throw new VError(
        //         {
        //             name: 'ResourceNotFound'
        //         },
        //         `Questionnaire "${questionnaireId}" not found`
        //     );
        // },
        // updateQuestionnaireSubmissionStatus: () => undefined,
        // createQuestionnaireSubmission: () => true,
        // retrieveCaseReferenceNumber: () => '12345678',
        // getQuestionnaireModifiedDate: questionnaireId => {
        //     if (questionnaireId === '285cb104-0c15-4a9c-9840-cb1007f098fb') {
        //         return '2022-08-16T21:52:29Z';
        //     }

        //     throw new VError(
        //         {
        //             name: 'ResourceNotFound'
        //         },
        //         `Questionnaire "${questionnaireId}" not found`
        //     );
        // },
        // updateQuestionnaireModifiedDate: () => undefined
    }))
);

// app has an indirect dependency on questionnaire-dal.js, require it after
// the mock so that it references the mocked version
const app = require('../../app');

expect.extend(
    matchersWithOptions({
        allErrors: true,
        jsonPointers: true,
        format: 'full',
        coerceTypes: false
    })
);

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

    it.only('should return status code 404 if the query string contains incorrect data', async () => {
        const token =
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJkYXRhLWNhcHR1cmUtc2VydmljZSIsImlzcyI6IiQuYXVkIiwianRpIjoiMTBjYmM3Y2MtOWQ4YS00ZmQwLTkzNGUtYzU4OTViYWIzMDdlIiwic3ViIjoiY3JvbmpvYiIsInNjb3BlIjoiY3JlYXRlOnN5c3RlbS1hbnN3ZXJzIGNyZWF0ZTpxdWVzdGlvbm5haXJlcyByZWFkOnF1ZXN0aW9ubmFpcmVzIHVwZGF0ZTpxdWVzdGlvbm5haXJlcyBkZWxldGU6cXVlc3Rpb25uYWlyZXMgcmVhZDpwcm9ncmVzcy1lbnRyaWVzIGFkbWluIiwiaWF0IjoxNjkxNDE4Nzg2fQ.08pWJBlgEc7EjCv6z8LbKXQTiE9Ga-az0v7fLiuvI5Y';

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

            console.log(response.body);

        expect(response.body).toHaveProperty('errors');
        expect(response.body.errors[0].status).toEqual(404);
        expect(response.body.errors[0].detail).toEqual(
            'Questionnaire with questionnaireId "00000000-0c15-4a9c-9840-cb1007f098fb" does not exist'
        );
    });
});

// describe('/questionnaires/{questionnaireId}/dataset', () => {
//     describe('Given the header "Accept-Version: 1.0.0"', () => {
//         it('should return a corresponding "Content-Version: 1.0.0" header', async () => {
//             const res = await request(app)
//                 .get('/api/v1/questionnaires/cb2eadc7-9189-4c4d-9eb3-896b72a1ed16/dataset')
//                 .set('Authorization', `Bearer ${tokens['read:questionnaires']}`)
//                 .set('Accept-Version', '1.0.0');

//             expect(res.get('Content-Version')).toBe('1.0.0');
//         });

//         it('should return v1.0.0 of the dataset resource', async () => {
//             const res = await request(app)
//                 .get('/api/v1/questionnaires/cb2eadc7-9189-4c4d-9eb3-896b72a1ed16/dataset')
//                 .set('Authorization', `Bearer ${tokens['read:questionnaires']}`)
//                 .set('Accept-Version', '1.0.0');
//             const v1Schema = await $RefParser.dereference(v1SchemaFilepath);

//             expect(res.status).toEqual(200);
//             expect(res.body).toMatchSchema(v1Schema);
//         });
//     });

//     describe('Given the header "Accept-Version: 2.0.0"', () => {
//         it('should return a corresponding "Content-Version: 2.0.0" header', async () => {
//             const res = await request(app)
//                 .get('/api/v1/questionnaires/cb2eadc7-9189-4c4d-9eb3-896b72a1ed16/dataset')
//                 .set('Authorization', `Bearer ${tokens['read:questionnaires']}`)
//                 .set('Accept-Version', '2.0.0');

//             expect(res.get('Content-Version')).toBe('2.0.0');
//         });

//         it('should return v2.0.0 of the dataset resource', async () => {
//             const res = await request(app)
//                 .get('/api/v1/questionnaires/cb2eadc7-9189-4c4d-9eb3-896b72a1ed16/dataset')
//                 .set('Authorization', `Bearer ${tokens['read:questionnaires']}`)
//                 .set('Accept-Version', '2.0.0');
//             const v2Schema = await $RefParser.dereference(v2SchemaFilepath);

//             expect(res.status).toEqual(200);
//             expect(res.body).toMatchSchema(v2Schema);
//         });
//     });

//     describe('Given no "Accept-Version" header', () => {
//         it('should return the latest version in the "Content-Version" header', async () => {
//             const res = await request(app)
//                 .get('/api/v1/questionnaires/cb2eadc7-9189-4c4d-9eb3-896b72a1ed16/dataset')
//                 .set('Authorization', `Bearer ${tokens['read:questionnaires']}`);

//             expect(res.get('Content-Version')).toBe('2.0.0');
//         });

//         it('should default to the the latest dataset resource version', async () => {
//             const res = await request(app)
//                 .get('/api/v1/questionnaires/cb2eadc7-9189-4c4d-9eb3-896b72a1ed16/dataset')
//                 .set('Authorization', `Bearer ${tokens['read:questionnaires']}`);
//             const v2Schema = await $RefParser.dereference(v2SchemaFilepath);

//             expect(res.status).toEqual(200);
//             expect(res.body).toMatchSchema(v2Schema);
//         });
//     });
// });
