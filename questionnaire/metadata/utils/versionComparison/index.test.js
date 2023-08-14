'use strict';

beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
});

jest.doMock('semver/functions/diff', () => version => {
    if (version === '2.0.0') {
        return 'major';
    }
    if (version === '1.1.0') {
        return 'minor';
    }
    if (version === '1.0.1') {
        return 'patch';
    }
    return null;
});
const isVersionValid = require('.');

describe('VersionComparison', () => {
    describe("There's a major semver difference", () => {
        it('Should return false', () => {
            const actual = isVersionValid('2.0.0');
            expect(actual).toBe(false);
        });
    });

    describe("There's a minor semver difference", () => {
        it('Should return false', () => {
            const actual = isVersionValid('1.1.0');
            expect(actual).toBe(false);
        });
    });

    describe("There's a patch semver difference", () => {
        it('Should return true', () => {
            const actual = isVersionValid('1.0.1');
            expect(actual).toBe(true);
        });
    });

    describe("There's no semver difference", () => {
        it('Should return true', () => {
            const actual = isVersionValid('1.0.0');
            expect(actual).toBe(true);
        });
    });
});
