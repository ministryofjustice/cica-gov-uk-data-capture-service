/* eslint-disable global-require */
/* eslint-disable no-shadow */

'use strict';

jest.doMock('../../../package-lock', () => {
    return {
        packages: {
            'node_modules/module1': {
                version: '1.0.0'
            },
            'node_modules/module3': {
                'no-version': undefined
            }
        }
    };
});

const getVersion = require('.');

describe('getInstalledModuleVersion', () => {
    describe('No package-lock file is found', () => {
        jest.clearAllMocks();
        jest.resetModules();
        jest.unmock('../../../package-lock');
        jest.doMock('../../../package-lock', () => {
            return undefined;
        });

        const getVersion = require('.');
        it('Should error gracefully', () => {
            expect(() => {
                getVersion('module1');
            }).toThrow('Failed to find valid package-lock.json');
        });
    });

    describe('Package not installed in node_modules', () => {
        it('Should error gracefully', () => {
            expect(() => {
                getVersion('module-not-exist');
            }).toThrow(`Couldn't find installed version of "node_modules/module-not-exist"`);
        });
    });

    describe('Package.json is malformed', () => {
        it('Should error gracefully', () => {
            expect(() => {
                getVersion('module3');
            }).toThrow(`Failed to read/parse package-lock.json for "node_modules/module3"`);
        });
    });

    describe('Package is installed', () => {
        it('Should return the installed version', () => {
            const actual = getVersion('module1');
            expect(actual).toEqual('1.0.0');
        });
    });
});
