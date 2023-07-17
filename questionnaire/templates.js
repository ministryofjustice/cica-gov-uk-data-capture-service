'use strict';

const releaseApplicationTemplate = require('q-templates-application-release');
const featureApplicationTemplate = require('q-templates-application-feature');

const releaseApplicationTemplateAsJson = JSON.stringify(releaseApplicationTemplate);
const featureApplicationTemplateAsJson = JSON.stringify(featureApplicationTemplate);

function getReleaseApplicationTemplateCopy() {
    return JSON.parse(releaseApplicationTemplateAsJson);
}

function getFeatureApplicationTemplateCopy() {
    return JSON.parse(featureApplicationTemplateAsJson);
}

module.exports = {
    'release-questionnaire': id => ({
        id,
        ...getReleaseApplicationTemplateCopy()
    }),
    'feature-questionnaire': id => ({
        id,
        ...getFeatureApplicationTemplateCopy()
    })
};
