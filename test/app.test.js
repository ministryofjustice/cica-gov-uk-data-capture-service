'use strict';

const request = require('supertest');
const getQuestionnaireResponse = require('./test-fixtures/res/questionnaireCompleteWithCRN.json');

// mock the DAL db integration
jest.doMock('../questionnaire/questionnaire-dal.js', () =>
    // return a modified factory function, that returns an object with a method, that returns a valid created response
    jest.fn(() => ({
        getQuestionnaire: () => getQuestionnaireResponse
    }))
);

const app = require('../app');

describe('App', () => {
    describe('404', () => {
        it('should error', async () => {
            const response = await request(app).get('/thisurldoesntexist');
            expect(response.statusCode).toEqual(404);
        });
    });
});
