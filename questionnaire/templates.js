'use strict';

const applicationTemplate = require('q-templates-application');

const letterTemplates = require('q-templates-actions');

const applicationTemplateAsJson = JSON.stringify(applicationTemplate);

const tcqeTemplateAsJson = JSON.stringify(letterTemplates.tcqe);

const decisionLetterTemplateAsJson = JSON.stringify(letterTemplates.decisionletter);

function getApplicationTemplateCopy() {
    return JSON.parse(applicationTemplateAsJson);
}

function getTcqeTemplateCopy() {
    return JSON.parse(tcqeTemplateAsJson);
}

function getDecisionLetterTemplateCopy() {
    return JSON.parse(decisionLetterTemplateAsJson);
}

module.exports = {
    'sexual-assault': id => ({
        id,
        ...getApplicationTemplateCopy()
    }),
    tcqe: id => ({
        id,
        ...getTcqeTemplateCopy()
    }),
    decisionletter: id => ({
        id,
        ...getDecisionLetterTemplateCopy()
    })
};
