'use strict';

const versionDiff = require('semver/functions/diff');
const getInstalledModuleVersion = require('../getInstalledModuleVersion');

const allowedVersionDifference = [null, 'patch', 'minor']; // versionDiff returns null if versions are equal

function isQuestionnaireVersionValid(questionnaireVersion, packageName) {
    const installedQuestionnaireVersion = getInstalledModuleVersion(packageName);
    return allowedVersionDifference.includes(
        versionDiff(questionnaireVersion, installedQuestionnaireVersion)
    );
}

module.exports = isQuestionnaireVersionValid;
