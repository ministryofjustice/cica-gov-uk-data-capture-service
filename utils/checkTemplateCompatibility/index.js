'use strict';

const semverSatisfies = require('semver/functions/satisfies');

module.exports = (instanceVersionArray, routerCompatibility) => {
    if (
        Array.isArray(instanceVersionArray) &&
        instanceVersionArray.every(item => typeof item === 'string')
    ) {
        instanceVersionArray.forEach(version => {
            const isCompatible = Object.values(routerCompatibility).some(({versionRange}) =>
                semverSatisfies(version, versionRange)
            );

            if (!isCompatible) {
                throw new Error(`Incompatible instance found with version ${version}`);
            }
        });
    }
    throw new Error('instanceVersionArray must be an array of strings');
};
