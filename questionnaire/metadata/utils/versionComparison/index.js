'use strict';

const versionDiff = require('semver/functions/diff');

const allowedVersionDifference = [null, 'patch']; // versionDiff returns null if versions are equal

function getValidVersion(questionnaireVersion) {
    const latestVersion = process.env.LATEST_QUESTIONNAIRE_VERSION;
    return allowedVersionDifference.includes(versionDiff(questionnaireVersion, latestVersion));
}

module.exports = getValidVersion;
