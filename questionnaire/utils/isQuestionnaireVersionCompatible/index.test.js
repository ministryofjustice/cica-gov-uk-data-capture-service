'use strict';

const baseVersion = '1.0.0';
const majorVersionBump = '2.0.0';
const minorVersionBump = '1.1.0';
const patchVersionBump = '1.0.1';

beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
});

jest.doMock('../getInstalledModuleVersion', () => () => baseVersion);
const isVersionValid = require('.');

describe('VersionComparison', () => {
    describe("There's a major semver difference", () => {
        it('Should return false', () => {
            const actual = isVersionValid(majorVersionBump);
            expect(actual).toBe(false);
        });
    });

    describe("There's a minor semver difference", () => {
        it('Should return false', () => {
            const actual = isVersionValid(minorVersionBump);
            expect(actual).toBe(false);
        });
    });

    describe("There's a patch semver difference", () => {
        it('Should return true', () => {
            const actual = isVersionValid(patchVersionBump);
            expect(actual).toBe(true);
        });
    });

    describe("There's no semver difference", () => {
        it('Should return true', () => {
            const actual = isVersionValid(baseVersion);
            expect(actual).toBe(true);
        });
    });
});
