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

// mock the DAL db integration
jest.doMock('../questionnaire-dal.js', () =>
    // return a modified factory function, that returns an object with a method, that returns a valid created response
    jest.fn(() => ({
        getQuestionnaire: questionnaireId => {
            if (questionnaireId === 'cb2eadc7-9189-4c4d-9eb3-896b72a1ed16') {
                return questionnaireFixtures.getSimpleAndCompositeAttributes();
            }

            throw new VError(
                {
                    name: 'ResourceNotFound'
                },
                `Questionnaire "${questionnaireId}" not found`
            );
        }
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

describe('/questionnaires/{questionnaireId}/dataset', () => {
    describe('Given the header "Accept-Version: 1.0.0"', () => {
        it('should return a corresponding "Content-Version: 1.0.0" header', async () => {
            const res = await request(app)
                .get('/api/v1/questionnaires/cb2eadc7-9189-4c4d-9eb3-896b72a1ed16/dataset')
                .set('Authorization', `Bearer ${tokens['read:questionnaires']}`)
                .set('Accept-Version', '1.0.0');

            expect(res.get('Content-Version')).toBe('1.0.0');
        });

        it('should return v1.0.0 of the dataset resource', async () => {
            const res = await request(app)
                .get('/api/v1/questionnaires/cb2eadc7-9189-4c4d-9eb3-896b72a1ed16/dataset')
                .set('Authorization', `Bearer ${tokens['read:questionnaires']}`)
                .set('Accept-Version', '1.0.0');
            const v1Schema = await $RefParser.dereference(v1SchemaFilepath);

            expect(res.status).toEqual(200);
            expect(res.body).toMatchSchema(v1Schema);
        });
    });

    describe('Given the header "Accept-Version: 2.0.0"', () => {
        it('should return a corresponding "Content-Version: 2.0.0" header', async () => {
            const res = await request(app)
                .get('/api/v1/questionnaires/cb2eadc7-9189-4c4d-9eb3-896b72a1ed16/dataset')
                .set('Authorization', `Bearer ${tokens['read:questionnaires']}`)
                .set('Accept-Version', '2.0.0');

            expect(res.get('Content-Version')).toBe('2.0.0');
        });

        it('should return v2.0.0 of the dataset resource', async () => {
            const res = await request(app)
                .get('/api/v1/questionnaires/cb2eadc7-9189-4c4d-9eb3-896b72a1ed16/dataset')
                .set('Authorization', `Bearer ${tokens['read:questionnaires']}`)
                .set('Accept-Version', '2.0.0');
            const v2Schema = await $RefParser.dereference(v2SchemaFilepath);

            expect(res.status).toEqual(200);
            expect(res.body).toMatchSchema(v2Schema);
        });
    });

    describe('Given no "Accept-Version" header', () => {
        it('should return the latest version in the "Content-Version" header', async () => {
            const res = await request(app)
                .get('/api/v1/questionnaires/cb2eadc7-9189-4c4d-9eb3-896b72a1ed16/dataset')
                .set('Authorization', `Bearer ${tokens['read:questionnaires']}`);

            expect(res.get('Content-Version')).toBe('2.0.0');
        });

        it('should default to the the latest dataset resource version', async () => {
            const res = await request(app)
                .get('/api/v1/questionnaires/cb2eadc7-9189-4c4d-9eb3-896b72a1ed16/dataset')
                .set('Authorization', `Bearer ${tokens['read:questionnaires']}`);
            const v2Schema = await $RefParser.dereference(v2SchemaFilepath);

            expect(res.status).toEqual(200);
            expect(res.body).toMatchSchema(v2Schema);
        });

        // TODO: Remove this test once legacy stack is in sync
        describe('And in a non-test environment', () => {
            const currentAppEnvironment = process.env.APP_ENV;

            beforeEach(() => {
                process.env.APP_ENV = 'dev';
            });

            afterEach(() => {
                process.env.APP_ENV = currentAppEnvironment;
            });

            it('should return a corresponding "Content-Version: 1.0.0" header', async () => {
                const res = await request(app)
                    .get('/api/v1/questionnaires/cb2eadc7-9189-4c4d-9eb3-896b72a1ed16/dataset')
                    .set('Authorization', `Bearer ${tokens['read:questionnaires']}`)
                    .set('Accept-Version', '1.0.0');

                expect(process.env.APP_ENV).toEqual('dev');
                expect(res.get('Content-Version')).toBe('1.0.0');
            });

            it('should return v1.0.0 of the dataset resource', async () => {
                const res = await request(app)
                    .get('/api/v1/questionnaires/cb2eadc7-9189-4c4d-9eb3-896b72a1ed16/dataset')
                    .set('Authorization', `Bearer ${tokens['read:questionnaires']}`)
                    .set('Accept-Version', '1.0.0');
                const v1Schema = await $RefParser.dereference(v1SchemaFilepath);

                expect(process.env.APP_ENV).toEqual('dev');
                expect(res.status).toEqual(200);
                expect(res.body).toMatchSchema(v1Schema);
            });
        });
    });
});
