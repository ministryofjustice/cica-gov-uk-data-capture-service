'use strict';

const packageObj = require('../../../package-lock');

function getInstalledModuleVersion(trackedPackage) {
    const packageKey = `node_modules/${trackedPackage}`;
    if (!packageObj) {
        throw new Error(`Failed to find valid package-lock.json`);
    }
    if (packageObj?.packages[packageKey]) {
        if (packageObj.packages[packageKey].version) {
            return packageObj?.packages[packageKey]?.version;
        }
        throw new Error(`Failed to read/parse package-lock.json for "${packageKey}"`);
    }
    throw new Error(`Couldn't find installed version of "${packageKey}"`);
}

module.exports = getInstalledModuleVersion;
