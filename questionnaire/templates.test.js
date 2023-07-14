'use strict';

jest.doMock('q-templates-application-release', () => {
    return {
        name: 'q-templates-app-release'
    };
});
jest.doMock('q-templates-application-feature', () => {
    return {
        name: 'q-templates-app-feature'
    };
});

const templates = require('./templates');

const uuid = '12345678-7dec-11d0-a765-00a0c91e6bf6';

describe('Templates', () => {
    it('should return the installed release template with the supplied ID', () => {
        const actual = templates['release-questionnaire'](uuid);

        expect(actual).toMatchObject({
            id: uuid,
            name: 'q-templates-app-release'
        });
    });

    it('should return the installed feature template with the supplied ID', () => {
        const actual = templates['feature-questionnaire'](uuid);

        expect(actual).toMatchObject({
            id: uuid,
            name: 'q-templates-app-feature'
        });
    });
});
