'use strict';

const getRouterInstance = require('.');
const legacyRouter = require('./fixtures/q-router');
const linearRouter = require('./fixtures/q-router-2');
const taskListRouter = require('./fixtures/q-router-3');

const routerCompatibility = {
    legacyRouter: {
        versionRange: '>=1.5.0 <2.0.0',
        router: legacyRouter
    },
    linearRouter: {
        versionRange: '>=2.0.0 <3.0.0',
        router: linearRouter
    },
    taskListRouter: {
        versionRange: '>=3.0.0',
        router: taskListRouter
    }
};

describe('getRouterInstance', () => {
    it('should return q-router given a version in the range >=1.5.0 <2.0.0', () => {
        const questionnaireDefinition = {
            version: '1.6.0'
        };
        expect(getRouterInstance(questionnaireDefinition, routerCompatibility)).toEqual('foo');
    });

    it('should return q-router-2 given a version in the range >=2.0.0 <3.0.0', () => {
        const questionnaireDefinition = {
            version: '2.6.0'
        };
        expect(getRouterInstance(questionnaireDefinition, routerCompatibility)).toEqual('bar');
    });

    it('should return q-router-3 given a version in the range >=3.0.0', () => {
        const questionnaireDefinition = {
            version: '3.6.0'
        };
        expect(getRouterInstance(questionnaireDefinition, routerCompatibility)).toEqual('biz');
    });

    it('should throw an error if questionnaire version is outwith any available range', () => {
        const questionnaireDefinition = {
            version: '0.6.0'
        };
        expect(() => {
            getRouterInstance(questionnaireDefinition, routerCompatibility);
        }).toThrow(`Questionnaire version "0.6.0" is not supported by any available router`);
    });
});
